import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  message,
  Card,
  Form,
  Upload,
  Tooltip,
  Button,
  Checkbox,
  Radio,
  Icon,
  List,
  Modal,
  Input,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import GdMap from 'components/GdMap';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Label.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;
const Amapkey = '3a4baeadc9b22277350cf0b667c6bc67';

@connect(({ label, global = {}, loading }) => ({
  label,
  uploadToken: global.uploadToken,
  loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    addTitle: '添加标签',
    show_addLabel: false,
    show_map: false,
    id: '',
    order: '',
    labelName: '',
    fileList: [],
    position: {},
    location_detail: '',
    describe: '',
    type_location: 0,
    type_brand: 0,
    location_name: '',
  };

  componentDidMount() {
    this.getList();
  }

  getList(page = 1, SearchText = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'label/getList',
      payload: {
        page,
        label_name: SearchText,
        type_location: this.state.type_location,
        type_brand: this.state.type_brand,
      },
    });
    this.refreshUploadToken();
  }

  refreshUploadToken() {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
    });
  }

  // 显示添加标签弹窗
  show_Label() {
    this.setState({
      show_addLabel: true,
      addTitle: '添加标签',
    });
  }

  // 添加或修改标签提交
  submitCategory = e => {
    const _this = this;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      // console.log(fieldsValue);
      const postObj = {
        label_name: fieldsValue.labelName,
        label_desc: fieldsValue.describe,
        label_cover: _this.state.label_cover,
        location_name: fieldsValue.location_name,
        location_detail: fieldsValue.location_detail,
        latitude: fieldsValue.position.latitude,
        longitude: fieldsValue.position.longitude,
      };
      let url = 'label/addLabel';
      if (fieldsValue.id) {
        postObj.label_id = fieldsValue.id;
        url = 'label/editLabel';
      }
      this.props
        .dispatch({
          type: url,
          payload: postObj,
        })
        .then(res => {
          if (res.code == 200) {
            this.setState({
              show_addLabel: false,
            });
            message.success(res.message);
            this.getList();
          } else {
            message.error(res.message);
          }
        });
    });
  };
  // //添加标签
  // submitLabel = (e) => {
  //     this.props.form.validateFields((err, fieldsValue) => {
  //         if (err) {
  //             return;
  //         }
  //         this.props.dispatch({
  //             type: 'topic/addTopic',
  //             payload: {
  //                 id: fieldsValue.id,
  //                 title: fieldsValue.topic,
  //                 remark: fieldsValue.remark,
  //                 path: fieldsValue.path,
  //             }
  //         }).then((res) => {
  //             if (res.code == 200) {
  //                 this.setState({
  //                     modalVisiale: false
  //                 })
  //                 message.success(res.message)
  //                 this.getList()
  //             } else {
  //                 message.error(res.message)
  //             }
  //         })
  //     })
  // }

  handleChange(e) {
    const { fileList, file } = e;
    let label_cover = '';
    if (fileList.length && file.status == 'done') {
      label_cover = fileList[0].response.base_url;
      fileList[0].url = fileList[0].response.full_url;
    }

    this.setState({ fileList, label_cover });
  }

  // 关闭弹窗
  handleCancel = e => {
    this.setState({
      show_addLabel: false,
      labelName: '',
      describe: '',
      label_cover: '',
      location_name: '',
      id: '',
      location_detail: '',
      position: {},
      fileList: [],
    });
  };

  mapCancel = e => {
    this.setState({
      show_map: false,
    });
  };

  // 编辑标签
  edit(e) {
    const data = e.data;
    const obj = {
      uid: '-1',
      status: 'done',
      url: this.props.label.domain + data.label_cover,
    };
    const fileList = [obj];
    this.setState({
      show_addLabel: true,
      addTitle: '修改标签',
      labelName: data.label_name,
      describe: data.label_desc,
      label_cover: data.label_cover,
      fileList,
      location_name: data.location_name,
      id: data.label_id,
      location_detail: data.location_detail,
      position: { longitude: data.longitude, latitude: data.latitude },
    });
  }

  // 添加标签
  addLabel(e) {
    this.setState({
      show_addLabel: true,
    });
  }

  // 下线标签
  // 下线分类
  downline(id, status) {
    status = status == '0' ? '1' : '0';
    this.props
      .dispatch({
        type: 'label/statusLabel',
        payload: { label_id: id, status },
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

  // 认证标签
  auth = id => {
    Confirm({
      title: `是否认证标签`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
      },
      onCancel() {},
    });
  };

  // 删除标签
  del(id) {
    const _this = this;
    Confirm({
      title: `删除会把该信息下全部内容标签置为空确定删除吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        _this.props
          .dispatch({
            type: 'label/delLabel',
            payload: { label_id: id },
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
      onCancel() {},
    });
  }

  screenBrand = e => {
    if (e.target.checked) {
      this.state.type_brand = 1;
    } else {
      this.state.type_brand = 0;
    }
    this.setState({
      type_brand: this.state.type_brand,
    });
    this.getList();
  };

  screenLocation = e => {
    if (e.target.checked) {
      this.state.type_location = 1;
    } else {
      this.state.type_location = 0;
    }
    this.setState({
      type_location: this.state.type_location,
    });
    this.getList();
  };

  searchFun = val => {
    // console.log(val)
    this.getList(1, val);
  };

  addAddress = () => {
    this.setState({
      show_map: true,
    });
  };

  setAddress = (address, position) => {
    this.setState({
      location_detail: address,
      position,
    });
  };

  delAddress = () => {
    this.setState({
      location_detail: '',
      position: {},
    });
  };

  beforeUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 4;
    if (!isLt2M) {
      message.error('图片上传不能超过4M！');
    }
    return isLt2M;
  };

  render() {
    const { total, list, domain } = this.props.label;
    const { uploadToken } = this.props;
    const {
      fileList,
      order,
      id,
      labelName,
      location_detail,
      position,
      describe,
      location_name,
    } = this.state;

    const { getFieldDecorator } = this.props.form;
    const RadioGroup = Radio.Group;
    const Search = Input.Search;

    const FormCheck = {
      idConfig: {
        initialValue: id || 0,
      },
      orderConfig: {
        rules: [
          { type: 'number', required: true, message: '输入的排序不能为空哦' },
          { type: 'number', required: true, message: '排序一定要为数字哦' },
        ],
        initialValue: order || '',
      },
      labelNameConfig: {
        rules: [{ type: 'string', required: true, message: '输入的标签名称不能为空哦' }],
        initialValue: labelName || '',
      },
    };

    const paginationProps = {
      pageSize: 10,
      total,
      onChange: page => {
        this.setState({
          currentPage: page,
        });
        this.getList(page);
      },
    };

    const ListHeader = () => (
      <div className={styles.flexHeader}>
        <div className={styles.listHeader}>
          <span className={styles.listContentItem}>序号</span>
          <span className={styles.listContentItem}>标签名称</span>
          <span className={styles.listContentItem}>LOGO</span>
          <span className={styles.listContentItem}>标签描述</span>
          <span className={styles.listContentItem}>位置</span>
          {/* <span className={styles.listContentItem}>是否认证</span> */}
          <span className={styles.listContentItem}>操作</span>
        </div>
      </div>
    );

    const OperationBtn = item => (
      <div className={styles.listContentItem}>
        <Button className={styles.listBtn} onClick={() => this.edit(item)}>
          编辑
        </Button>
        {/* <Button className={styles.listBtn} onClick={() => this.auth(item.id)}>认证</Button> */}
        {/* <Button className={styles.listBtn} onClick={() => this.addLabel(item)}>关联分类</Button> */}
        <Button
          type={item.data.status == '0' ? 'danger' : 'primary'}
          className={styles.listBtn}
          onClick={() => this.downline(item.data.label_id, item.data.status)}
        >
          {item.data.status == '0' ? '上线' : '下线'}
        </Button>
        <Button className={styles.listBtn} onClick={() => this.del(item.data.label_id)}>
          删除
        </Button>
      </div>
    );

    const ListContent = ({ data }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>{data.order}</p>
        </div>
        <div className={styles.listContentItem}>
          <p lines={2}>{data.label_name}</p>
        </div>
        <div className={styles.listContentItem}>
          {data.label_cover ? (
            <img src={domain + data.label_cover} className={styles.logoUrl} />
          ) : (
            '无'
          )}
        </div>
        <div className={styles.listContentItem}>
          <Tooltip title={data.label_desc}>
            <Ellipsis lines={2}>{data.label_desc ? data.label_desc : '无'}</Ellipsis>
          </Tooltip>
        </div>
        <div className={styles.listContentItem}>
          <Tooltip title={data.location_detail}>
            <Ellipsis lines={2}>{data.location_name ? data.location_name : '无'}</Ellipsis>
          </Tooltip>
        </div>
        {/* <div className={styles.listContentItem}>
                    <p lines={2}>{data.ifAuth ? '是' : '否'}</p>
                </div> */}
        <OperationBtn data={data} />
      </div>
    );

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
            title="标签列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <Button
              type="dashed"
              onClick={() => this.show_Label()}
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
            >
              添加标签
            </Button>
            <div className={styles.menubox}>
              <Search
                className={styles.SearchBox}
                placeholder="标签名字"
                onSearch={this.searchFun}
                enterButton
              />
              <Checkbox onChange={this.screenBrand}>品牌标签</Checkbox>
              <Checkbox onChange={this.screenLocation}>位置信息</Checkbox>
              {/* <CheckboxGroup options={['', '']} value={this.state.screenList} style={{ margin: '15px 0' }}  /> */}
              <p className={styles.totalnum}>标签总数：{total}</p>
            </div>
            <ListHeader />
            <List
              rowKey="id"
              pagination={paginationProps}
              dataSource={list}
              renderItem={item => (
                <List.Item>
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        {/* 添加或修改标签弹窗 */}
        <Modal
          title={this.state.addTitle}
          visible={this.state.show_addLabel}
          zIndex="1"
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitCategory()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <Form>
            {this.state.addTitle == '添加标签' ? (
              ''
            ) : (
              <FormItem className={styles.hidden}>
                {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input />)}
              </FormItem>
            )}
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="标签名称">
              {getFieldDecorator('labelName', FormCheck.labelNameConfig, {
                initialValue: labelName,
              })(<Input placeholder="请输入标签名称" />)}
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="标签描述">
              {getFieldDecorator('describe', { initialValue: describe })(
                <Input placeholder="请输入标签描述，可不填" />
              )}
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="地址简介">
              {getFieldDecorator('location_name', { initialValue: location_name })(
                <Input placeholder="请输入地址简介，可不填" />
              )}
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="logo图片">
              <Upload
                action="http://upload.qiniup.com"
                listType="picture-card"
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange.bind(this)}
                data={{ token: uploadToken }}
                beforeUpload={this.beforeUpload}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </FormItem>
            <FormItem className={styles.margin_Bottom} label="标签位置">
              {getFieldDecorator('location_detail', { initialValue: location_detail })(
                <Input disabled />
              )}
              <Button onClick={() => this.addAddress()}>添加位置</Button>
              <Button onClick={() => this.delAddress()}>清空位置</Button>
            </FormItem>
            <FormItem className={styles.hidden}>
              {getFieldDecorator('position', { initialValue: position })(<Input disabled />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 关联分类弹窗 */}
        {/* <Modal
                    title='关联分类'
                    visible={this.state.show_addLabel}
                    footer={[
                        <Button key="back" onClick={() => this.handleCancel(false)}>取消</Button>,
                        <Button key="submit" type="primary" onClick={() => this.submitLabel()}>确定添加</Button>,]}
                    onCancel={() => this.handleCancel(false)}
                >
                    <Form>
                        <FormItem
                            className={styles.hidden}
                        >
                            {getFieldDecorator('id', FormCheck.idConfig)(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            label="分类名称"
                        >
                            <CheckboxGroup options={category_list} value={this.state.checkedList} onChange={this.checkBoxChange} />
                        </FormItem>
                    </Form>

                </Modal> */}
        <Modal
          title="选择位置"
          visible={this.state.show_map}
          maskClosable
          zIndex="2"
          footer={[
            <Button key="back" onClick={() => this.mapCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.mapCancel()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.mapCancel(false)}
        >
          <p />
          <div style={{ width: '100%', height: 360 }}>
            <GdMap
              position={this.state.position}
              amapkey={Amapkey}
              setFun={this.setAddress.bind(this)}
            />
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
