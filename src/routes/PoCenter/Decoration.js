import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';

import { message, Card, Form, Upload, DatePicker, Button, Icon, List, Modal, Input } from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Decoration.less';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { TextArea } = Input;

@connect(({ decoration, global = {}, loading }) => ({
  decoration,
  uploadToken: global.uploadToken,
  loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    modalShow: false,
    modalTitle: '添加小红柚勋章',
    confirmText: '确定',
    rangeTime: [],
    title: '',
    cover: '',
    fileList: [],
    remark: '',
    id: 0,
    currentPage: 1,
  };

  componentWillMount() {
    this.getList();
  }

  getList(page = 1) {
    const { dispatch } = this.props;
    dispatch({
      type: 'decoration/getList',
      payload: {
        page,
      },
    });
    this.refreshUploadToken();
  }

  refreshUploadToken() {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
    });
  }

  edit(e) {
    this.refreshUploadToken();
    this.setState({
      modalShow: true,
      modalTitle: '编辑小红柚勋章',
      confirmText: '保存',
      title: e.medal_name,
      rangeTime: [e.granttime, e.deadline],
      cover: e.medal_icon,
      fileList: [
        {
          uid: -1,
          status: 'done',
          url: e.show_icon,
        },
      ],
      remark: e.remark,
      id: e.medal_id,
      notification: e.notification,
    });
  }

  create() {
    this.refreshUploadToken();
    this.setState({
      id: 0,
      modalShow: true,
      modalTitle: '添加小红柚勋章',
      confirmText: '新增',
      cover: '',
      rangeTime: new Array(),
      fileList: new Array(),
      title: '',
      remark: '',
    });
  }

  comfirm() {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      // Should format date value before submit.
      const rangeValue = fieldsValue['range-picker'];
      const values = {
        ...fieldsValue,
        'range-picker': [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')],
      };
      const cover = this.state.cover;

      this.props
        .dispatch({
          type: 'decoration/saveDecoration',
          payload: {
            Medal: {
              medal_name: values.name,
              medal_icon: cover,
              granttime: values['range-picker'][0],
              deadline: values['range-picker'][1],
              remark: values.remark,
              notification: values.notification,
            },
            medal_id: values.id,
          },
        })
        .then(res => {
          if (res.code == 200) {
            this.setState({ modalShow: false });
            message.success(res.message);
            this.getList(this.state.currentPage);
          } else if (res.code == 500) {
            message.error(res.message);
          } else {
            this.setState({ modalShow: false });

            message.error(res.message);
          }
        })
        .catch(err => {
          this.setState({ modalShow: false });
          message.error('保存出错');
        });
    });
  }

  changeStatus(e) {
    const { medal_id, status } = e;
    this.props
      .dispatch({
        type: 'decoration/changeStatus',
        payload: { medal_id, status },
      })
      .then(res => {
        if (res.code === 200) {
          message.success(res.message);
          this.getList();
        } else {
          message.error(res.message);
        }
      })
      .catch(err => {
        message.error('更改失败');
      });
  }

  cancel(modalShow) {
    this.setState({
      id: 0,
      modalShow,
      modalTitle: '添加小红柚勋章',
      confirmText: '新增',
      cover: '',
      rangeTime: new Array(),
      fileList: new Array(),
      title: '',
      remark: '',
    });
  }

  handleSubmit(e) {}

  handlePreview() {}

  handleChange(e) {
    const { fileList, file } = e;
    let cover = '';
    if (fileList.length && file.status == 'done') {
      cover = fileList[0].response.base_url;
      fileList[0].url = fileList[0].response.full_url;
    }

    this.setState({ fileList, cover });
  }

  lengthCheck = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value.length > 100) {
      callback('长度不能超过100');
    } else {
      callback();
    }
  };

  render() {
    const { list, total } = this.props.decoration;
    const { uploadToken } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { fileList, rangeTime, title, cover, remark, id, notification } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16, offset: 1 },
      },
    };

    const setRange = rangeTime.length
      ? [moment(rangeTime[0], 'YYYY-MM-DD'), moment(rangeTime[1], 'YYYY-MM-DD')]
      : '';

    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '记得选择生效日期啊！亲' }],
      initialValue: setRange,
    };
    const nameConfig = {
      rules: [{ type: 'string', required: true, message: '记得填写名字啊！亲' }],
      initialValue: title || '',
    };
    const remarkConfig = {
      rules: [
        { type: 'string', required: false, message: '记得填写备注啊！亲' },
        { validator: this.lengthCheck },
      ],
      initialValue: remark || '',
    };

    const notificationConfig = {
      rules: [{ type: 'string', required: true, message: '记得填写通知文案啊！' }],
      initialValue:
        notification ||
        '恭喜你获得小红柚勋章！在西子圈Po版块参与并通过“小红柚”评选，从此你将是Po里优质的年轻代表~请继续在Po分享优质内容哟。',
    };

    const idConfig = {
      initialValue: id || 0,
    };

    const paginationProps = {
      pageSize: 9,
      total,
      onChange: page => {
        this.setState({
          currentPage: page,
        });
        this.getList(page);
      },
    };

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    return (
      <PageHeaderLayout>
        <List
          rowKey="id"
          loading={false}
          pagination={paginationProps}
          grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={['', ...list]}
          renderItem={item =>
            item ? (
              <List.Item key={item.medal_id}>
                <div className={styles.cardHeader}>
                  <span>{item.medal_name}</span>
                  <Button.Group size="small">
                    <Button
                      type={item.status == 1 ? 'danger' : 'primary'}
                      className={styles.editBtn}
                      onClick={() => this.changeStatus(item)}
                    >
                      {item.status == 1 ? '下线' : '上线'}
                    </Button>

                    <Button className={styles.editBtn} onClick={() => this.edit(item)}>
                      编辑
                    </Button>
                  </Button.Group>
                </div>
                <Card hoverable className={styles.card}>
                  <Card.Meta
                    avatar={<img alt="" className={styles.cardAvatar} src={item.show_icon} />}
                    description={
                      <Ellipsis className={styles.item} lines={2}>
                        {item.remark}
                      </Ellipsis>
                    }
                  />
                  <div className={styles.details}>
                    <span className={styles.endTime}>到期时间：{item.deadline}</span>
                    <span className={styles.detailsLink}>
                      <Link to={`/po-center/decoration-detail/${item.medal_id}`}>详情></Link>
                    </span>
                  </div>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" className={styles.newButton} onClick={() => this.create()}>
                  <Icon type="plus" /> 新增勋章
                </Button>
              </List.Item>
            )
          }
        />
        {this.state.modalShow && (
          <Modal
            title={this.state.modalTitle}
            wrapClassName="vertical-center-modal"
            visible={this.state.modalShow}
            onOk={() => this.comfirm(false)}
            okText={this.state.confirmText}
            onCancel={() => this.cancel(false)}
          >
            <Form>
              <FormItem className={styles.hidden}>
                {getFieldDecorator('id', idConfig)(<Input placeholder="输入名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="勋章名称">
                {getFieldDecorator('name', nameConfig)(<Input placeholder="输入名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="生效时间">
                {getFieldDecorator('range-picker', rangeConfig)(<RangePicker />)}
              </FormItem>
              <FormItem {...formItemLayout} label="勋章说明">
                {getFieldDecorator('remark', remarkConfig)(<Input placeholder="请输入勋章说明" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="通知文案">
                {getFieldDecorator('notification', notificationConfig)(
                  <TextArea
                    autosize
                    className={styles.textArea}
                    placeholder="输入授权成功后的通知文案"
                  />
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="勋章图标">
                <Upload
                  action="http://upload.qiniup.com"
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange.bind(this)}
                  data={{ token: uploadToken }}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </FormItem>
            </Form>
          </Modal>
        )}
      </PageHeaderLayout>
    );
  }
}
