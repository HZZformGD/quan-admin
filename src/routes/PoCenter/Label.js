import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
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
  Select,
  Menu,
  Dropdown
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
    fileList1: [],
    label_icon: '',
    label_cover: '',
    position: {},
    location_detail: '',
    pois: [],
    describe: '',
    type_location: 0,
    type_recommend: 0,
    type_Top: 0,
    type_Goods: 0,
    location_name: '',
    label_type: 0,
    label_sort: "",
  };

  componentDidMount() {
    this.getList();
  }

  getList(page = 1, SearchText = '') {
    // console.info(this.state)
    const { dispatch } = this.props;
    let { type_location, type_brand, label_type, type_top, type_Goods, type_recommend, label_sort } = this.state
    dispatch({
      type: 'label/getList',
      payload: {
        page,
        size: 10,
        label_name: SearchText,
        type_location: type_location,
        type_goods: type_Goods,
        type_top: type_top,
        type_recommend: type_recommend,
        label_type: label_type,
        label_sort: label_sort
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
      let { label_cover, label_icon } = this.state;
      let { name: label_name, describe: label_desc, location_name, location_detail, position: { latitude, longitude } } = fieldsValue
      const postObj = {
        label_name,
        label_desc,
        label_cover,
        label_icon,
        location_name,
        label_desc,
        location_detail,
        latitude,
        longitude,
        source: 3,
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
            this.handleCancel();
            this.getList();
          } else {
            message.error(res.message);
          }
        });
    });
  };

  handleChange(e) {
    const { fileList, file } = e;
    let label_cover = '';
    if (fileList.length && file.status == 'done') {
      label_cover = fileList[0].response.base_url;
      fileList[0].url = fileList[0].response.full_url;
    }

    this.setState({ fileList, label_cover });
  }
  handleChange1(e) {
    const { fileList: fileList1, file } = e;
    let label_icon = '';
    if (fileList1.length && file.status == 'done') {
      label_icon = fileList1[0].response.base_url;
      fileList1[0].url = fileList1[0].response.full_url;
    }

    this.setState({ fileList1, label_icon });
  }

  // 关闭弹窗
  handleCancel = e => {
    this.setState({
      show_addLabel: false,
      labelName: '',
      describe: '',
      label_cover: '',
      label_icon: '',
      location_name: '',
      id: '',
      location_detail: '',
      position: {},
      fileList: [],
      fileList1: []
    });
  };

  mapCancel = e => {
    this.setState({
      show_map: false,
    });
  };

  // 编辑标签
  edit(e) {

    let { data: { label_name: labelName, label_desc: describe, label_cover, label_icon, location_name, label_id: id, location_detail, longitude, latitude } } = e;
    const obj = {
      uid: '-1',
      status: 'done',
      url: this.props.label.domain + label_cover,
    };
    const icon_obj = {
      uid: '-1',
      status: 'done',
      url: this.props.label.domain + label_icon,
    }
    const fileList = [obj];
    const fileList1 = [icon_obj]
    this.setState({
      show_addLabel: true,
      addTitle: '修改标签',
      labelName,
      describe,
      label_cover,
      label_icon,
      fileList,
      fileList1,
      location_name,
      id,
      location_detail,
      position: { longitude, latitude },
      poi_list: []
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
  //推荐
  remcommend = (id, status) => {
    status = status == '0' ? '1' : '0';
    // console.info(id, status)
    this.props
      .dispatch({
        type: 'label/statusRecommend',
        payload: { label_id: id, recommend: status },
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

  //切换普通和品牌
  setLabel = (id, status) => {
    status = status == '1' ? '2' : '1';
    // console.info(id, status)
    this.props
      .dispatch({
        type: 'label/labelType',
        payload: { label_id: id, type: status },
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
  //切换排行
  setTop = (id, status) => {
    status = status == '0' ? '1' : '0';
    // console.info(id, status)
    this.props
      .dispatch({
        type: 'label/labelRank',
        payload: { label_id: id, status: status },
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
      onCancel() { },
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
      onCancel() { },
    });
  }
  screenTop = e => {
    let { type_top } = this.state;
    if (e.target.checked) {
      type_top = 1;
    } else {
      type_top = 0;
    }
    this.setState({
      type_top: type_top,
    }, () => this.getList());
  }
  screenGoods = e => {
    let { type_Goods } = this.state;
    if (e.target.checked) {
      type_Goods = 1;
    } else {
      type_Goods = 0;
    }
    this.setState({
      type_Goods: type_Goods,
    }, () => this.getList());
  }
  screenBrand = e => {
    let { type_brand } = this.state;
    if (e.target.checked) {
      this.state.type_recommend = 1;
    } else {
      this.state.type_recommend = 0;
    }
    this.setState({
      type_recommend: this.state.type_recommend,
    }, () => this.getList());
  };

  screenLocation = e => {
    let { type_location } = this.state;
    if (e.target.checked) {
      type_location = 1;
    } else {
      type_location = 0;
    }
    this.setState({
      type_location
    }, () => this.getList())
      ;
  };

  searchFun = val => {
    // console.log(val)
    this.getList(1, val);
  };
  selectPosition = (val) => {
    let index = val.target.value;
    let obj = this.state.pois[index];
    const position = {
      longitude: obj.location.lng,
      latitude: obj.location.lat,
    };
    this.setState({
      location_name: obj.name,
      location_detail: obj.address,
      position
    })
    this.refs.Amap.setPosition(position)
  }
  addAddress = () => {
    this.setState({
      show_map: true,
    });
  };

  setAddress = (res, position) => {
    this.setState({
      location_detail: res.formattedAddress,
      position,
    });
  };
  getPois = (pois) => {
    this.setState({
      pois,
    })
  }
  delAddress = () => {
    this.setState({
      location_detail: '',
      position: {},
      location_name: '',
    });
  };

  beforeUpload = file => {
    const isLt4M = file.size / 1024 / 1024 < 4;
    if (!isLt4M) {
      message.error('图片上传不能超过4M！');
    }
    return isLt4M;
  };
  typeChange = (e) => {
    console.info(e)
    this.setState({
      label_type: e,
    }, () => this.getList(1, ''));

  }
  getList_sort = e => {
    this.setState({
      label_sort: e,
    }, () => this.getList(1, ''));
  }

  render() {
    const { total, list, domain } = this.props.label;
    const { uploadToken } = this.props;
    const {
      fileList,
      fileList1,
      order,
      id,
      labelName,
      location_detail,
      position,
      describe,
      location_name,
      label_sort
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
          <span className={styles.listContentItem}>使用次数<Icon type="up" style={{ color: label_sort == 'asc' ? '#1890ff' : '', cursor: 'pointer' }} onClick={() => this.getList_sort('asc')} /><Icon style={{ color: label_sort == 'desc' ? '#1890ff' : '', cursor: 'pointer' }} onClick={() => this.getList_sort('desc')} type="down" /></span>
          <span className={styles.listContentItem}>背景图</span>
          <span className={styles.listContentItem}>标签描述</span>
          <span className={styles.listContentItem}>位置</span>
          {/* <span className={styles.listContentItem}>是否认证</span> */}
          <span className={styles.listContentItem}>操作</span>
        </div>
      </div>
    );
    const OperationBtn = item => (
      <div className={styles.listContentItem}>
        <Link className={styles.goodsLink} to={{ pathname: '/po-center/po-manage', query: { label_id: item.data.label_id } }}>Po内容</Link>
        <Link className={styles.goodsLink} to={{ pathname: '/po-center/goods-manage', query: { id: item.data.label_id, name: item.data.label_name } }}>商品{item.data.goodsNum == "0" ? '' : `(${item.data.goodsNum})`}</Link>
        <Button className={styles.listBtn} onClick={() => this.edit(item)}>
          编辑
        </Button>
        {/* <Button className={styles.listBtn} onClick={() => this.auth(item.id)}>认证</Button> */}
        {/* <Button className={styles.listBtn} onClick={() => this.addLabel(item)}>关联分类</Button> */}

        <Dropdown trigger={['click']} overlay={<Menu style={{textAlign:'center'}}>
          <Menu.Item>
            <Button
              className={styles.listBtn}
              onClick={() => this.remcommend(item.data.label_id, item.data.is_recommend)}
            >
              {item.data.is_recommend == '0' ? '推荐' : '取消推荐'}
            </Button>
          </Menu.Item>
          <Menu.Item>
            <Button
              type={item.data.status == '0' ? 'danger' : 'primary'}
              className={styles.listBtn}
              onClick={() => this.downline(item.data.label_id, item.data.status)}
            >
              {item.data.status == '0' ? '上线' : '下线'}
            </Button>
          </Menu.Item>
          <Menu.Item>
            <Button className={styles.listBtn} onClick={() => this.del(item.data.label_id)}>
              删除
    </Button>
          </Menu.Item>
          <Menu.Item>
            <Button
              className={styles.listBtn}
              onClick={() => this.setLabel(item.data.label_id, item.data.label_type)}
            >
              {item.data.label_type == '1' ? '普通' : '品牌'}
            </Button>
          </Menu.Item>
          <Menu.Item>
            <Button
              className={styles.listBtn}
              onClick={() => this.setTop(item.data.label_id, item.data.isRank)}
            >
              {item.data.isRank == '0' ? '排行榜' : '取消排行'}
            </Button>
          </Menu.Item>
        </Menu>} placement="bottomCenter">
          <Button>更多</Button>
        </Dropdown>
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
          {data.label_icon ? (
            <img src={domain + data.label_icon} className={styles.logoUrl} />
          ) : (
              '无'
            )}
        </div>
        <div className={styles.listContentItem}>
          {data.label_use_count}
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

    const typeArr = [
      { name: '全部标签', value: 0 },
      { name: '普通标签', value: 1 },
      { name: '品牌标签', value: 2 },

    ]

    const selectBefore = (
      <Select className={styles.beforeSearch} defaultValue="标签类型" onChange={this.typeChange} style={{ width: 120 }}>
        {typeArr.map((item) => <Option value={item.value} key={item.name}>{item.name}</Option>)}
      </Select>
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
                addonBefore={selectBefore}
                className={styles.SearchBox}
                placeholder="标签名字"
                onSearch={this.searchFun}
                enterButton
              />
              <Checkbox className={styles.check} onChange={this.screenTop}>排行榜</Checkbox>
              <Checkbox className={styles.check} onChange={this.screenGoods}>商品标签</Checkbox>
              <Checkbox className={styles.check} onChange={this.screenBrand}>推荐标签</Checkbox>
              <Checkbox className={styles.check} onChange={this.screenLocation}>位置信息</Checkbox>
              {/* <CheckboxGroup options={['', '']} value={this.state.screenList} style={{ margin: '15px 0' }}  /> */}
              <p className={styles.check} className={styles.totalnum}>标签总数：{total}</p>
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
          destroyOnClose
          zIndex="1"
          footer={[
            <Button key="back" onClick={() => this.handleCancel()}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitCategory()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel()}
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
              {getFieldDecorator('name', FormCheck.labelNameConfig)(<Input placeholder="请输入标签名称" />)}
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="标签描述">
              {getFieldDecorator('describe', { initialValue: describe })(
                <Input placeholder="请输入标签描述，可不填" />
              )}
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="logo图片">
              <Upload
                action="http://upload.qiniup.com"
                listType="picture-card"
                fileList={fileList1}
                onPreview={this.handlePreview}
                onChange={this.handleChange1.bind(this)}
                data={{ token: uploadToken }}
                beforeUpload={this.beforeUpload1}
              >
                {fileList1.length >= 1 ? null : uploadButton}
              </Upload>
            </FormItem>
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="背景图片">
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
            <FormItem className={styles.margin_Bottom} {...formItemLayout} label="地址简介">
              {getFieldDecorator('location_name', { initialValue: location_name })(
                <Input disabled />
              )}
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
          <Search
            placeholder="搜索地址"
            onSearch={value => this.refs.Amap.searchPoi(value)}
            enterButton
          />
          <div style={{ margin: '20px 0' }}>
            <RadioGroup
              className={styles.tagRadioBox}
              onChange={this.selectPosition}
            >
              {this.state.pois.length > 0
                ? this.state.pois.map((element, index) => (
                  <Radio
                    className={styles.tagRadio}
                    key={index}
                    name={element.name}
                    value={index}
                  >
                    {' '}
                    {element.name}
                  </Radio>
                ))
                : ''}
            </RadioGroup>
          </div>
          <div style={{ width: '100%', height: 360, margin_top: '20px' }}>
            <GdMap
              ref='Amap'
              position={this.state.position}
              amapkey={Amapkey}
              setFun={this.setAddress.bind(this)}
              getPois={this.getPois.bind(this)}
            />
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
