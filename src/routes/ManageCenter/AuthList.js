import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Table,
  Card,
  Popconfirm,
  Modal,
  Button,
  Input,
  Select,
  Spin,
  message,
  Form,
  Avatar,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AuthList.less';

const ButtonGroup = Button.Group;
const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
@connect(({ authList, loading }) => ({
  authList,
  loading: loading.models.decoration,
}))
export default class AuthList extends PureComponent {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.input = {};
  }

  state = {
    name: '',
    description: '',
    module_id: '',
    controller_id: '',
    action_id: '',
    isEdit: false
  };

  componentWillMount() {
    this.getList()
  }

  getList(page = 1, status = -1, keyword = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'authList/getList',
      payload: { page }
    })
  }


  cancel() {
    this.setState({
      modalVisiale: false,
    });
  }
  openModal() {
    this.setState({
      modalVisiale: true,
      isEdit: false,
      name: '',
      description: '',
      module_id: '',
      controller_id: '',
      action_id: ''
    });
  }

  comfirmAuth() {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.props.dispatch({
        type: 'authList/editAuth',
        payload: values
      }).then((res) => {
        if (res.code == 200) {
          this.setState({
            modalVisiale: false
          })
          this.getList()
          message.success(res.message)
        }
      })
    })
  }

  search () {
    this.props.form.validateFields((err, values) => {
      console.info(values)
    })
  }
  doNotDel() {

  }

  del(name) {
    this.props.dispatch({
      type: 'authList/removeAuth',
      payload: { name }
    }).then((res) => {
      if (res.code == 200) {
        message.success(res.message)
        this.getList()
      } else {
        message.error(res.message)
      }
    })
  }
  edit(e) {
    this.setState({
      modalVisiale: true,
      isEdit: true,
      ...e
    })
  }

  lengthCheck = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value.length > 20) {
      callback('长度不能超过20');
    } else {
      callback();
    }
  }

  render() {
    const { modalVisiale, name, description, module_id, controller_id, action_id, isEdit } = this.state
    const { getFieldDecorator } = this.props.form;
    const { authList } = this.props
    const data = authList.list
    const total = authList.total
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'module_id',
        dataIndex: 'module_id',
        key: 'module_id',
        render: (text, record) => (
          <span>{record.module_id ? record.module_id : ''}</span>
        )
      },
      {
        title: 'controller_id',
        dataIndex: 'controller_id',
        key: 'controller_id',
        render: (text, record) => (
          <span>{record.controller_id ? record.controller_id : ''}</span>
        )
      },
      {
        title: 'action_id',
        dataIndex: 'action_id',
        key: 'action_id',
        render: (text, record) => (
          <span>{record.action_id ? record.action_id : ''}</span>
        )
      },
      {
        title: '操作',
        render: (text, record) => (
          <ButtonGroup size="small">
            <Button onClick={() => this.edit(record)}>编辑</Button>
            <Popconfirm title="确定要删除这个权限吗?" onConfirm={() => this.del(record)} onCancel={() => this.doNotDel()} okText="是的" cancelText="不了">
              <Button type="danger"  >
                {'删除'}
              </Button>
            </Popconfirm>

          </ButtonGroup >
        ),
      },
    ];

    const nameConfig = {
      rules: [{ required: true, type: 'string', message: '权限名称不能为空' }],
      initialValue: name || ''
    }
    const descriptionConfig = {
      rules: [{ required: true, type: 'string', message: '权限描述不能为空' }, { validator: this.lengthCheck }],
      initialValue: description || ''
    }
    const moduleIdConfig = {
      rules: [{ required: true, type: 'string', message: '权限module_id不能为空' }],
      initialValue: module_id || ''
    }
    const controllerIdConfig = {
      rules: [{ required: true, type: 'string', message: '权限controller_id不能为空' }],
      initialValue: controller_id || ''
    }
    const actionIdConfig = {
      rules: [{ required: true, type: 'string', message: '权限action_id不能为空' }],
      initialValue: action_id || ''
    }
    const paginationProps = {
      pageSize: 10,
      total: total,
      onChange: page => {
        this.setState({
          currentPage: page,
        });
        this.getList(page);
      },
    }

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="权限列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={<Button type="primary" onClick={() => this.openModal()}>新建权限</Button>}
          >
            <Form className={styles.inputArea}>
              <FormItem className={styles.inputItem}>
                {
                  getFieldDecorator('module_id_search', {
                    rules: [{ required: false, type: 'string' }],
                    initialValue: ''
                  })(
                    <Input placeholder="输入权限module_id" />
                  )
                }
              </FormItem>
              <FormItem className={styles.inputItem}>
                {
                  getFieldDecorator('controller_id_search', {
                    rules: [{ required: false, type: 'string' }],
                    initialValue: ''
                  })(
                    <Input placeholder="输入权限controller_id" />
                  )
                }
              </FormItem>
              <FormItem className={styles.inputItem}>
                {
                  getFieldDecorator('action_id_search', {
                    rules: [{ required: false, type: 'string' }],
                    initialValue: ''
                  })(
                    <Input placeholder="输入权限action_id" />
                  )
                }
              </FormItem>
              <Button onClick={() => this.search()}>搜索</Button>

            </Form>
            <Table dataSource={data} pagination={paginationProps} columns={columns} className={styles.table} />
          </Card>
        </div>
        {
          modalVisiale &&
          <Modal
            title={isEdit ? '编辑权限' : '新增权限'}
            wrapClassName="vertical-center-modal"
            visible={modalVisiale}
            footer={[
              <Button key="back" onClick={() => this.cancel(false)}>
                取消
            </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() => this.comfirmAuth()}
              >
                确认
              </Button>,
            ]}
            onCancel={() => this.cancel(false)}
          >
            <Form>
              <FormItem>
                {
                  getFieldDecorator('name', nameConfig)(
                    <Input placeholder="输入权限名称" disabled={isEdit} />
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('description', descriptionConfig)(
                    <Input placeholder="输入权限描述" />
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('module_id', moduleIdConfig)(
                    <Input placeholder="输入权限module_id" />
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('controller_id', controllerIdConfig)(
                    <Input placeholder="输入权限controller_id" />
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('action_id', actionIdConfig)(
                    <Input placeholder="输入权限action_id" />
                  )
                }
              </FormItem>
            </Form>
          </Modal>
        }
      </PageHeaderLayout >
    );
  }
}
