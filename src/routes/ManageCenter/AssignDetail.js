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
@connect(({ assignDetail, loading }) => ({
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


  componentDidMount() {
    this.getList()
  }

  getList() {
    const { dispatch, assignDetail } = this.props;
    dispatch({
      type: 'assignDetail/getList',
      payload: {
        name: assignDetail.name
      }
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
        type: 'assignDetail/editAuth',
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
      type: 'assignDetail/removeAuth',
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

    console.info(this.props)
    const { modalVisiale, isEdit } = this.state
    const { getFieldDecorator } = this.props.form;
    const { assignDetail } = this.props
    const name = assignDetail.name
    const description = assignDetail.description
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

            </Form>
          </Modal>
        }
      </PageHeaderLayout >
    );
  }
}
