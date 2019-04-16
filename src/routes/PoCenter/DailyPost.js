import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  Popconfirm,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './DailyPost.less';

const FormItem = Form.Item;
const { Option } = Select;
const ButtonGroup = Button.Group
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = ['未核销', '已核销'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, currentItem } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const data = {
        ...fieldsValue,
        address_id: currentItem.address_id
      }
      currentItem.storage = fieldsValue
      form.resetFields();
      handleAdd(data);
    });
  };



  const defaultExpressContacts = {
    initialValue: currentItem ? currentItem.contacts : '',
  }

  const defaultExpressAddress = {
    initialValue: currentItem ? currentItem.address : '',
  }

  const defaultExpressPhone = {
    initialValue: currentItem ? currentItem.phone : '',
  }

  const defaultExpressDecorator = {
    initialValue: currentItem ? currentItem.express : '',
    rules: [{ required: true, message: '快递公司不能为空', }],

  }
  const defaultExpressCodeDecorator = {
    initialValue: currentItem ? currentItem.express_code : '',
    rules: [{ required: true, message: '快递公司不能为空' }],
  }


  return (
    <Modal
      title="修改物流"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="联系人">
        {form.getFieldDecorator('contacts', defaultExpressContacts)(<Input placeholder="联系人" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="地址">
        {form.getFieldDecorator('address', defaultExpressAddress)(<Input placeholder="地址" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号码">
        {form.getFieldDecorator('phone', defaultExpressPhone)(<Input placeholder="手机号码" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="快递公司">
        {form.getFieldDecorator('express', defaultExpressDecorator)(<Input placeholder="快递公司" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="快递单号">
        {form.getFieldDecorator('express_code', defaultExpressCodeDecorator)(<Input placeholder="快递单号" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ dailyPost, loading }) => ({
  dailyPost,
  loading: loading.models.dailyPost,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    currentItem: '',
    currentIndex: -1
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dailyPost/fetch',
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'dailyPost/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });

  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'dailyPost/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.searchByCondition(fieldsValue, dispatch)
    });
  };

  searchByCondition = (payload = {}, selfPatch) => {
    const _dispatch = selfPatch ? selfPatch : dispatch
    _dispatch({
      type: 'dailyPost/fetch',
      payload
    })
  }

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = payload => {
    const { dispatch } = this.props;
    let data = this.state.currentItem.storage, currentIndex = this.state.currentIndex

    dispatch({
      type: 'dailyPost/editExpress',
      payload
    }).then(e => {
      message.success('修改成功');
      dispatch({
        type: 'dailyPost/updateItem',
        payload: { data, currentIndex }
      })
      // this.searchByCondition({}, dispatch)
    });
    this.setState({
      modalVisible: false,
    });

  };

  export = e => {
    const token = localStorage.getItem('token')
    let { phone, prize, status, verify_code } = (this.props.form.getFieldsValue())
    window.open(`http://ed-admin.xizi.com/poadmin/daily-post/export-confirm-list?token=${token}&phone=${phone}&prize=${prize}&status=${status}&verify_code=${verify_code}`)
  }

  handleVerify = e => {
    const { dispatch } = this.props;

    dispatch({
      type: 'dailyPost/change',
      payload: { prize_record_id: e },
    }).then((res) => {
      if (res) {
        this.searchByCondition({}, dispatch)
      }
    })
  }

  handleSetExpress = (currentItem, currentIndex) => {
    this.setState({
      modalVisible: true,
      currentItem,
      currentIndex
    });

  }

  handlePageChange = (pagination) => {
    const { dispatch } = this.props;
    let { phone, prize, status, verify_code } = this.props.form.getFieldsValue()
    this.searchByCondition({ page: pagination.current, phone, prize, status, verify_code }, dispatch)
  }

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>

              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ sm: 12, md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={12}>
            <FormItem label="奖品名" labelCol={{ span: 3 }}>
              {getFieldDecorator('prize', { initialValue: '' })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={12}>
            <FormItem label="手机号" labelCol={{ span: 3 }}>
              {getFieldDecorator('phone', { initialValue: '' })(<Input style={{ width: '100%' }} />)}
            </FormItem>
          </Col>


        </Row>
        <Row gutter={{ sm: 12, md: 8, lg: 24, xl: 48 }}>

          <Col md={12} sm={12}>
            <FormItem label="核销态" >
              {getFieldDecorator('status', { initialValue: '0' })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">全部</Option>
                  <Option value="2">已核销</Option>
                  <Option value="1">未核销</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={12}>
            <FormItem label="核销码" labelCol={{ span: 3 }}>
              {getFieldDecorator('verify_code', { initialValue: '' })(<Input style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>


        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <ButtonGroup>
              <Button type="primary" htmlType="submit">
                查询
            </Button>
              <Button type="dashed" onClick={this.export}>
                导出
              </Button>
            </ButtonGroup>

          </span>

        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return this.renderAdvancedForm();
  }

  render() {
    const {
      dailyPost: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, currentItem } = this.state;


    const columns = [
      {
        title: '奖品名',
        dataIndex: 'prize',
        fixed: 'left',
      },
      {
        title: '联系人',
        dataIndex: 'contacts',
      },
      {
        title: '联系地址',
        dataIndex: 'address',
      },
      {
        title: '联系电话',
        dataIndex: 'phone'
      },
      {
        title: '核销码',
        dataIndex: 'verify_code',
      },
      {
        title: '核销时间',
        dataIndex: 'created_at',
        // sorter: true,
        render: val => <span>{moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '快递公司',
        dataIndex: 'express',
      },
      {
        title: '快递单号',
        dataIndex: 'express_code',
      },
      // {
      //   title: '服务调用次数',
      //   dataIndex: 'callNo',
      //   sorter: true,
      //   align: 'right',
      //   render: val => `${val} 万`,
      //   // mark to display a total number
      //   needTotal: true,
      // },
      {
        title: '状态',
        dataIndex: 'status',
        render(val) {
          val = parseInt(val)
          return <Badge status={statusMap[val - 1]} text={status[val - 1]} />;
        },
      },

      {
        title: '操作',
        dataIndex: 'id',
        render: (id, item, index) => (
          <Fragment>
            {item.address_id ? <a onClick={() => this.handleSetExpress(item, index)}>编辑</a> : ''}
            {item.address_id ? <Divider type="vertical" /> : ''}
            {item.status == 1 ? <Popconfirm title="确认核销码" onConfirm={() => this.handleVerify(id)}><a>核销</a></Popconfirm> : '已核销'}
          </Fragment>
        ),
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="查询表格">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>

            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              rowKey='id'
              // onSelectRow={this.handleSelectRows}
              onChange={this.handlePageChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
      </PageHeaderLayout>
    );
  }
}
