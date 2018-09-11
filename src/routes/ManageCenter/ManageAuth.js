import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Table,
  Card,
  Popconfirm,
  Modal,
  Button,
  Icon,
  Select,
  Spin,
  Input,
  Form,
  Avatar,
  message
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './ManageAuth.less';

const ButtonGroup = Button.Group;
const Option = Select.Option;
const FormItem = Form.Item;
const Search = Input.Search

@Form.create()
@connect(({ manageAuth, loading }) => ({
  manageAuth,
  loading: loading.models.decoration,
}))
export default class ManageAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.input = {};
  }

  state = {
    processId: 0,
    currentPage: 1
  };

  componentWillMount() {
    console.info(this.props);
    this.getList()
  }

  getList(page = 1, status = -1, keyword = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'manageAuth/getList',
      payload: { page, keyword }
    })
  }


  cancel() {
    this.setState({
      modalVisiale: false,
    });
  }
  openModal(e) {
    this.setState({
      modalVisiale: true,
      roleValue: e.role.name,
      uid: e.uid,
      username: e.username
    });
  }

  comfirmAuth() {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.props.dispatch({
        type: 'manageAuth/authEditor',
        payload: values
      }).then((res) => {
        if (res.code == 200) {
          this.setState({
            modalVisiale: false
          })
          message.success(res.message)
          this.getList()
        }
      })
    })
  }

  doNotDel() {

  }
  searchByWords(e) {
    this.setState({
      keyword: e,
      currentPage: 1
    })
    this.getList(1, -1, e)
  }
  delEditor(uid) {
    this.props.dispatch({
      type: 'manageAuth/delEditor',
      payload: { uid }
    }).then((res) => {
      if (res.code == 200) {
        message.success(res.message)
        this.getList()
      }
    })
  }

  render() {
    const { modalVisiale, roleValue, uid, username } = this.state
    const { getFieldDecorator } = this.props.form;
    const { manageAuth } = this.props
    const data = manageAuth.administrators
    const total = manageAuth.total
    const roles = manageAuth.roles

    const columns = [
      {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (text, record) => <Avatar shape="square" src={record.avatar} />,
      },
      {
        title: '昵称',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'uid',
        dataIndex: 'uid',
        key: 'uid',
      },
      {
        title: '当前角色',
        dataIndex: 'role',
        key: 'role',
        render: (text, record) => (
          <span>{record.role ? record.role.description : ''}</span>
        )
      },
      {
        title: '操作',

        render: (text, record) => (
          <ButtonGroup size="small">
            <Button onClick={() => this.openModal(record)}>角色管理</Button>
            <Popconfirm title="确定要删除这个小编吗?" onConfirm={() => this.delEditor(record.uid)} onCancel={() => this.doNotDel()} okText="是的" cancelText="不了">
              <Button type="danger">
                {'删除'}
              </Button>
            </Popconfirm>

          </ButtonGroup >
        ),
      },
    ];

    const validUid = {
      rules: [{ required: true, message: 'uid不能为空' }],
      initialValue: uid || ''
    }

    const validRole = {
      rules: [{ required: true, message: '请选择角色' }],
      initialValue: roleValue || null
    }

    const validUsername = {
      rules: [{ required: true, message: '请选择角色' }],
      initialValue: username || ''
    }

    const paginationProps = {
      pageSize: 10,
      total: total,
      current: this.state.currentPage,
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
            title="管理权限"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={<Search placeholder="输入uid或者用户名" onSearch={this.searchByWords.bind(this)} enterButton />}
          >
            <Table pagination={paginationProps} dataSource={data} columns={columns} className={styles.table} />
          </Card>
        </div>
        {
          modalVisiale &&
          <Modal
            title="角色授权"
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
                确认授权
                <Icon type="quanxianguanli"></Icon>
              </Button>,
            ]}
            onCancel={() => this.cancel(false)}
          >
            <Form>
              <FormItem>
                {getFieldDecorator('uid', validUid)(
                  <Input hidden={true} />
                )}

              </FormItem>
              <FormItem>
                {
                  getFieldDecorator('username', validUsername)(
                    <Input disabled={true} />
                  )
                }
              </FormItem>
              <FormItem>
                {getFieldDecorator('name', validRole)(
                  <Select>
                    {roles.map((item) => <Option value={item.name} key={item.name}>{item.description}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Form>
          </Modal>
        }
      </PageHeaderLayout >
    );
  }
}
