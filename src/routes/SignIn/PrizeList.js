import React, { Fragment, Component } from 'react';
import { Modal, Button, Notification, Upload, Icon, Card, Row, InputNumber, Input, Select, Col, Tooltip, Form, Table, Avatar, Switch } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {
  ChartCard,
  Field
} from 'components/Charts';
import styles from './PrizeList.less';
import RedBox from 'redbox-react';

const ButtonGroup = Button.Group
const FormItem = Form.Item
const Option = Select.Option






@Form.create()

@connect(({ prize, global = {}, loading }) => ({
  prize,
  uploadToken: global.uploadToken,
  loading: loading.models.prize,
}))


export default class PrizeList extends Component {

  state = {
    page: 1,
    formValues: {
      name: '',
      online: -1,
      scene: 0,
      type: 0
    },
    sort: 0,
    modalVisible: false,
    fileList: [],
    previewVisible: false,
    previewImage: '',
    currentItem: ''
  }

  componentWillMount() {
    this.getList()
  }

  getList() {
    const { dispatch } = this.props
    const { formValues, page, sort } = this.state
    const payload = {
      ...formValues,
      sort: 0,
      page: 1

    }
    dispatch({
      type: 'prize/query',
      payload
    })
  }

  handleTableChange = (pagination, filters, sorter) => {

    let sort = 0, { formValues } = this.state
    const { dispatch, form } = this.props;
    if (sorter.field == 'created_at') {
      if (sorter.order == 'ascend') {
        sort = 1
      }
    } else if (sorter.field == 'sort') {
      sort = 2
      if (sorter.order == 'ascend') {
        sort = 3
      }
    }
    this.setState({
      page: pagination.current,
      sort
    })
    let payload = {
      page: pagination.current,
      sort,
      ...formValues
    }
    console.info(payload)
    dispatch({
      type: 'prize/query',
      payload
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const { page, sort } = this.state
    form.validateFields((err, fieldsValue) => {
      const payload = {
        ...fieldsValue,
        page,
        sort
      };
      this.setState({
        formValues: fieldsValue,
      });
      console.info(payload)

      dispatch({
        type: 'prize/query',
        payload
      });
    });
  }

  renderAdvancedForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="奖品名称">
              {getFieldDecorator('name', { initialValue: '' })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="上线状态">
              {getFieldDecorator('online', { initialValue: -1 })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={-1}>全部</Option>
                  <Option value={1}>上线</Option>
                  <Option value={0}>下线</Option>
                </Select>
              )}
            </FormItem>
          </Col>

        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="应用场景">
              {getFieldDecorator('scene', { initialValue: 0 })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={0}>全部</Option>
                  <Option value={1}>签到</Option>
                  <Option value={2}>抽奖</Option>
                  <Option value={3}>宝箱</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="奖品类型">
              {getFieldDecorator('type', { initialValue: 0 })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={0}>全部</Option>
                  <Option value={1}>小红花</Option>
                  <Option value={2}>实物</Option>
                  <Option value={3}>微信红包</Option>
                </Select>
              )}
            </FormItem>
          </Col>

        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <ButtonGroup>
              <Button htmlType="submit">
                查询
              </Button>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
            </ButtonGroup>

          </span>
        </div>
      </Form>
    );
  }
  handleModalVisible = flag => {
    if (flag) {
      this.refreshUploadToken()

    }
    this.setState({
      modalVisible: !!flag,
    });
  };

  handlefileChange = ({ fileList }) => {
    // const { form: { setFieldsValue } } = this.props
    // console.info(form)

    this.setState({ fileList: [...fileList] })
  }



  refreshUploadToken() {
    const { dispatch } = this.props
    dispatch({
      type: 'global/fetchUploadToken',
      payload: {
        bucket: 'bbsimg'
      }
    });
  }


  CreateForm() {
    const { form, uploadToken, dispatch } = this.props;
    const { modalVisible, fileList, currentItem } = this.state
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        dispatch({
          type: 'prize/add',
          payload: { ...fieldsValue }
        }).then(res => {
          if (res.code == 200) {
            Notification.success(res.message)
            this.getList()
            form.resetFields();
          }


        })


      });
    };


    // if (currentItem) {
    //   let _fileList = [{
    //     file: {
    //       uid: '-1',
    //       status: 'done',
    //       response: {
    //         full_url: currentItem.image
    //       }
    //     }
    //   }]
    //   // this.setState({
    //   //   fileList: _fileList
    //   // })
    // }


    const normalFile = (e) => {
      return e && e.fileList;
    }

    const nameDecoration = {
      rules: [{ required: true, message: '名称必须填写' }],
      initialValue: currentItem ? currentItem.name : ''
    }
    const titleDecoration = {
      rules: [{ required: true, message: '详细名称必须填写' }],
      initialValue: currentItem ? currentItem.title : '',

    }
    const totalDecoration = {
      rules: [{ required: true, message: '总数不能为零' }],
      initialValue: currentItem ? currentItem.total : 10
    }
    const limitDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.max_num : 0
    }
    const typeDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.type : 1
    }
    const defaultDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.default : 0
    }
    const sortDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.sort : 10
    }

    const chanceDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.chance : 0.1
    }

    const onlineDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.online : 1
    }

    const sceneDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.scene : 2
    }

    const imageDecoration = {
      rules: [{ required: true }],
      valuePropName: 'fileList',
      getValueFromEvent: normalFile,
      initialValue: [
        {
          uid: "-1",
          name: "xxx.png",
          status: "done",
          response: {
            full_url: currentItem.image,

          },
          url: currentItem.image
        }
      ]
    }

    const idDecoration = {
      rules: [{ required: true }],
      initialValue: currentItem ? currentItem.id : 0
    }

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    // handlePreview = (file) => {
    //   this.setState({
    //     previewImage: file.url || file.thumbUrl,
    //     previewVisible: true,
    //   });
    // }

    return (
      <Modal
        title="新建奖品"
        onOk={okHandle}
        visible={modalVisible}
        onCancel={() => this.handleModalVisible()}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
          {form.getFieldDecorator('name', nameDecoration)(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="详细名称">
          {form.getFieldDecorator('title', titleDecoration)(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="总量">
          {form.getFieldDecorator('total', totalDecoration)(<InputNumber />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="每日限额">
          {form.getFieldDecorator('send_num', limitDecoration)(<InputNumber />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类型">
          {form.getFieldDecorator('type', typeDecoration)(
            <Select >
              <Option value={1}>小红花</Option>
              <Option value={2}>实物</Option>
              <Option value={3}>微信红包</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="是否默认">
          {form.getFieldDecorator('default', defaultDecoration)(
            <Select >
              <Option value={0}>否</Option>
              <Option value={1}>是</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="排序">
          {form.getFieldDecorator('sort', sortDecoration)(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="概率">
          {form.getFieldDecorator('chance', chanceDecoration)(<InputNumber step={0.1} placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="是否上线">
          {form.getFieldDecorator('online', onlineDecoration)(
            <Select >
              <Option value={0}>否</Option>
              <Option value={1}>是</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="场景">
          {form.getFieldDecorator('scene', sceneDecoration)(
            <Select >
              <Option value={1}>签到</Option>
              <Option value={2}>抽奖</Option>
              <Option value={3}>宝箱</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="封面">
          {form.getFieldDecorator('image', imageDecoration)(

            <Upload
              action="http://upload.qiniup.com"
              listType="picture-card"
              fileList={fileList}
              onPreview={this.handlePreview}
              onChange={this.handlefileChange}
              data={{ token: uploadToken }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>

          )}
        </FormItem>
        <FormItem style={{ display: 'none' }} labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="id">
          {form.getFieldDecorator('id', idDecoration)(<Input placeholder="请输入" />)}
        </FormItem>
      </Modal>
    );
  }
  handlePreview = (file) => {
    console.info(file)
    this.setState({
      previewImage: file.response.full_url,
      previewVisible: true,
    });
  }
  handleCancel = () => this.setState({ previewVisible: false })

  editItem = (item) => {
    this.setState({ currentItem: item })
    this.handleModalVisible(true)

  }

  render() {
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 8,
      style: { marginBottom: 24 },
    };
    const { loading, prize, uploadToken } = this.props;
    const { modalVisible, previewImage, previewVisible } = this.state
    // const { list, count } = datas.source
    const { datas } = prize
    const { list, count } = datas.source
    const { box, sign, lottery } = datas
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id'
      },
      {
        title: '排序',
        dataIndex: 'sort',
        sorter: true,

      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '详细名称',
        dataIndex: 'title',
      },
      {
        title: '图片',
        dataIndex: 'image',
        render: (record) => {
          return <Avatar shape="square" size={64} icon="user" src={record} />
        }
      },
      {
        title: '总数',
        dataIndex: 'total'
      },
      {
        title: '每日限额',
        dataIndex: 'max_num'
      },
      {
        title: '奖品类型',
        dataIndex: 'type',

        render: (rerord) => {
          return rerord == 1 ? '小红花' : (rerord == 2) ? '实物' : '红包'
        }
      },
      {
        title: '默认',
        dataIndex: 'default',

        render: (rerord) => {
          return rerord == 1 ? '是' : '否'
        }
      },
      {
        title: '概率',
        dataIndex: 'chance',
      },
      {
        title: '是否上线',
        render: (text, record, index) => {
          return (
            <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} defaultChecked />
          )
        }
      },
      {
        title: '场景',
        dataIndex: 'scene',
        render: (rerord) => {
          return rerord == 1 ? '签到' : (rerord == 2) ? '抽奖' : '宝箱'
        }
      },
      {
        title: '时间',
        dataIndex: 'created_at',
        render: val => <span>{moment(val * 1000).format('YYYY-MM-DD')}</span>,
        sorter: true
      },
      {
        title: '操作',
        render: (text, record, index) => {
          return (
            <Fragment>
              <ButtonGroup>
                <Button type='primary' onClick={() => this.editItem(text)}>编辑</Button>
              </ButtonGroup>
            </Fragment>
          )
        }
      }
    ];
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      fileChange: this.handlefileChange
    };
    const pagination = {
      pageSize: 10,
      total: parseInt(count)
    }






    return (
      <PageHeaderLayout>
        <Row gutter={24}>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              title="场景：每日签到"
              // loading={loading}
              action={
                <Tooltip title="指标说明">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={() => <Tooltip title="奖品总数量">
                <span>{sign.count}个</span>
              </Tooltip>}
              footer={<span style={sign.warning ? { color: '#f50' } : { color: '#52c41a' }}>{sign.warning ? sign.warning : '正常'}</span>}
              contentHeight={46}
            >
              <span >
                总概率
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {sign.chance * 100}%
                </span>
              </span>
              <span >
                是否设置默认奖品
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {sign.is_set_default == 1 ? '是' : '否'}

                </span>
              </span>
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              title="场景：抽奖"
              // loading={loading}
              action={
                <Tooltip title="指标说明">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={() => <Tooltip title="奖品总数量">
                <span>{lottery.count}个</span>
              </Tooltip>}
              footer={<span style={lottery.warning ? { color: '#f50' } : { color: '#52c41a' }}>{lottery.warning ? lottery.warning : '正常'}</span>}
              contentHeight={46}
            >
              <span >
                总概率
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {lottery.chance * 100}%
                </span>
              </span>
              <span >
                是否设置默认奖品
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {lottery.is_set_default == 1 ? '是' : '否'}
                </span>
              </span>
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              title="场景：宝箱"
              // loading={loading}
              action={
                <Tooltip title="指标说明">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={() => <Tooltip title="奖品总数量">
                <span>{box.count}个</span>
              </Tooltip>}
              footer={<span style={box.warning ? { color: '#f50' } : { color: '#52c41a' }}>{box.warning ? box.warning : '正常'}</span>}
              contentHeight={46}
            >
              <span >
                总概率
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {box.chance * 100}%
                </span>
              </span>
              <span >
                是否设置默认奖品
                <span className={styles.trendText} style={{ marginRight: 16, color: '#222' }}>
                  {box.is_set_default == 1 ? '是' : '否'}
                </span>
              </span>
            </ChartCard>
          </Col>
        </Row>
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          <div className={styles.table}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>

            <Table
              dataSource={list}
              columns={columns}
              rowKey={record => record.id}
              pagination={pagination}
              onChange={this.handleTableChange}
              loading={loading}
            >

            </Table>
          </div>

        </Card>

        {modalVisible ? this.CreateForm(uploadToken) : null}
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </PageHeaderLayout >
    )
  }
}
