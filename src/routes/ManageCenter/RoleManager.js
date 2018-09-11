import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import moment from 'moment'

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
@connect(({ roleManager, assignDetail, loading }) => ({
  roleManager,
  assignDetail,
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
      type: 'roleManager/getList',
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
      description: ''
    });
  }

  comfirmAuth() {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.props.dispatch({
        type: 'roleManager/editRole',
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

  doNotDel() {

  }

  del(name) {
    this.props.dispatch({
      type: 'roleManager/removeRole',
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
  assign(e) {
    const { dispatch } = this.props
    dispatch({
      type: 'assignDetail/setDetail',
      payload: {
        name: e.name,
        description: e.description
      }
    })
    dispatch(routerRedux.push('/manager-center/assign-detail'))
  }
  edit(e) {
    this.setState({
      modalVisiale: true,
      isEdit: true,
      name: e.name,
      description: e.description
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
    const { roleManager } = this.props
    const data = roleManager.list

    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '名称',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text, record) => (
          <span>{moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm')}</span>
        )
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (text, record) => (
          <span>{moment(record.updated_at * 1000).format('YYYY-MM-DD HH:mm')}</span>
        )
      },
      {
        title: '操作',
        render: (text, record) => (
          <ButtonGroup size="small">
            <Button type="primary" onClick={() => this.assign(record)}>授权管理</Button>
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
      rules: [{ required: true, type: 'string', message: '角色name不能为空' }],
      initialValue: name || ''
    }
    const descriptionConfig = {
      rules: [{ required: true, type: 'string', message: '角色名称不能为空' }, { validator: this.lengthCheck }],
      initialValue: description || ''
    }



    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="角色列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={<Button type="primary" onClick={() => this.openModal()}>新建角色</Button>}
          >

            <Table dataSource={data} columns={columns} className={styles.table} />
          </Card>
        </div>
        {
          modalVisiale &&
          <Modal
            title={isEdit ? '编辑角色' : '新增角色'}
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
                    <Input placeholder="输入权限name" disabled={isEdit} />
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('description', descriptionConfig)(
                    <Input placeholder="输入权限名称" />
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
