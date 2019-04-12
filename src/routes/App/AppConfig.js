import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';

import {
  message,
  Card,
  Form,
  Upload,
  DatePicker,
  Tooltip,
  Button,
  Radio,
  Icon,
  Tag,
  List,
  Modal,
  Input,
  Select,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './AppConfig.less';

const Option = Select.Option;
const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ appconfig, global = {}, loading }) => ({
  appconfig,
  loading: loading.models.test,
  uploadToken: global.uploadToken,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    addTitle: '添加配置',
    show_a_e_Category: false,
    show_addLabel: false,
    show_delCategory: false,
    id: '',
    config_key: '',
    config_value: '',
    config_desc: ''
  };

  componentDidMount() {
    this.getList();
    // console.log(this.props.decoration)
  }

  getList(page = 1, size = 10) {
    const { dispatch } = this.props;
    dispatch({
      type: 'appconfig/getList',
      payload: {
        page,
        size,
      },
    });
    this.refreshUploadToken()
  }

  refreshUploadToken() {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
      payload: {
        bucket: 'bbsimg'
      }
    });
  }

  // 显示添加配置配置
  show_Category() {
    this.setState({
      show_a_e_Category: true,
      addTitle: '添加配置',
    });
  }

  // 添加或修改配置提交
  submitCategory = e => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      console.log(fieldsValue);
      const postObj = {
        config_key: fieldsValue.config_key,
        config_value: fieldsValue.config_value,
        desc: fieldsValue.config_desc,
      };
      if (fieldsValue.id) {
        postObj.id = fieldsValue.id;
      }
      this.props
        .dispatch({
          type: 'appconfig/addConfig',
          payload: postObj,
        })
        .then(res => {
          if (res.code == 200) {
            this.setState({
              show_a_e_Category: false,
            });
            message.success(res.message);
            this.getList();
            this.handleCancel();
          } else {
            message.error(res.message);
          }
        });
    });
  };

  // 关闭配置
  handleCancel = e => {
    this.setState({
      show_a_e_Category: false,
      show_addLabel: false,
      show_delCategory: false,
      id: '',
      config_key: '',
      config_value: '',
      config_desc: ''
    });
  };

  // 编辑配置
  edit(e) {
    let { data: { id, config_key, config_value, desc } } = e;
    this.setState({
      show_a_e_Category: true,
      addTitle: '修改配置',
      id,
      config_key,
      config_value,
      config_desc: desc
    });
  }

  // 下线配置
  downline(id, status) {
    status = status == '1' ? '2' : '1';
    this.props
      .dispatch({
        type: 'notice/statusNotice',
        payload: { id, status },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList();
        } else {
          message.error(res.message);
        }
      });
  }

  // 删除配置
  del(id) {
    const _this = this;
    Confirm({
      title: `确定把该信息下全部配置内容删除吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        _this.props
          .dispatch({
            type: 'appconfig/delConfig',
            payload: { id },
          })
          .then(res => {
            if (res.code == 200) {
              message.success(res.message);
              _this.getList();
            } else {
              message.error(res.message);
            }
          });
      },
      onCancel() { },
    });
  }
  render() {
    const { uploadToken } = this.props;
    const { list } = this.props.appconfig;
    const { id, config_key, config_value, config_desc } = this.state;
    const { getFieldDecorator } = this.props.form;
    const RadioGroup = Radio.Group;
    const Search = Input.Search;
    const FormCheck = {
      idConfig: {
        initialValue: id || 0,
      },
      keyConfig: {
        rules: [{ type: 'string', required: true, message: '配置key不能为空哦' }],
        initialValue: config_key || '',
      },
      valueConfig: {
        rules: [{ required: true, message: '配置value不能为空哦' }],
        initialValue: config_value || '',
      },
      descConfig: {
        rules: [{ required: true, message: '配置描述不能为空哦' }],
        initialValue: config_desc || '',
      },
    };


    const ListHeader = () => (
      <div className={styles.flexHeader}>
        <div className={styles.listHeader}>
          <span className={styles.listContentItem}>key名</span>
          <span className={styles.listContentItem}>key内容</span>
          <span className={styles.listContentItem}>描述</span>
          <span className={styles.listContentItem}>操作</span>
        </div>
      </div>
    );

    const OperationBtn = item => (
      <div className={styles.listContentItem}>
        <Button className={styles.listBtn} onClick={() => this.edit(item)}>
          编辑
        </Button>
        {/* <Button
                    type={item.data.status == '2' ? 'danger' : 'primary'}
                    className={styles.listBtn}
                    onClick={() => this.downline(item.data.id, item.data.status)}
                >
                    {item.data.status == '2' ? '上线' : '下线'}
                </Button> */}
        <Button className={styles.listBtn} onClick={() => this.del(item.data.id)}>
          删除
        </Button>
      </div>
    );

    const ListContent = ({ data }) => (
      <div className={styles.listContent} key={data}>
        <div className={styles.listContentItem}>
          <p>{data.config_key}</p>
        </div>
        <Ellipsis className={styles.listContentItem}>
          {data.config_value}
        </Ellipsis>
        <div >
        </div>
        <div className={styles.listContentItem}>
          <p lines={2}>{data.desc}</p>
        </div>
        <OperationBtn data={data} />
      </div>
    );

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="App配置列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          // extra={extraContent}
          >
            <Button
              type="dashed"
              onClick={() => this.show_Category()}
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
            >
              添加配置
            </Button>
            <div className={styles.menubox}>
              {/* <p className={styles.check} className={styles.totalnum}>配置总数：{total}</p> */}
            </div>
            <ListHeader />
            <List
              rowKey="id"
              dataSource={list}
              renderItem={item => (
                <List.Item>
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        {/* 添加或修改配置配置 */}
        <Modal
          title={this.state.addTitle}
          visible={this.state.show_a_e_Category}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitCategory()}>
              提交
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <Form>
            {this.state.addTitle == '添加配置' ? (
              ''
            ) : (
                <FormItem className={styles.hidden} style={{ marginBottom: 0 }}>
                  {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input />)}
                </FormItem>
              )}

            <FormItem label="配置标题" style={{ marginBottom: 0 }}>
              {getFieldDecorator('config_key', FormCheck.keyConfig, { initialValue: config_key })(
                <Input disabled={this.state.addTitle == '添加配置' ? false : true} placeholder="配置标题" />
              )}
            </FormItem>
            <FormItem label="配置值" style={{ marginBottom: 0 }}>
              {getFieldDecorator('config_value', FormCheck.valueConfig, { initialValue: config_value })(
                <Input placeholder="配置值" />
              )}
            </FormItem>
            <FormItem label="配置描述" style={{ marginBottom: 0 }}>
              {getFieldDecorator('config_desc', FormCheck.descConfig, { initialValue: config_desc })(
                <Input disabled={this.state.addTitle == '添加配置' ? false : true} placeholder="请输入配置描述" />
              )}
            </FormItem>
          </Form>

        </Modal>
      </PageHeaderLayout>
    );
  }
}
