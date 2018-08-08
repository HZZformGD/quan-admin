import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Table,
  Card,
  Tooltip,
  Radio,
  Input,
  Modal,
  Button,
  message,
  Select,
  Spin,
  notification,
  Form,
  Avatar,
  Tabs,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './ManageAuth.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { Search } = Input;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
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
    keyword: '',
    modalVisiale: false,
    data: [],
    fetching: false,
    medal_id: 0,
    currentPage: 1,
    status: -1,
    checkType: 1,
    listString: '',
    remark: '',
    topicWords: '',
    path: 'pages/rank/rank',
    id: 0,
    title: '新增话题',
  };

  componentWillMount() {
    console.info(this.props);
  }

  getList(page = 1, status = -1, keyword = '') {
    const { dispatch } = this.props;
  }

  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  };
  areaChange(e) {
    console.info(this, e);
  }
  onSearchKeyword(e) {
    this.setState({
      keyword: e,
    });
    this.getDetail(1, -1, e);
  }
  onStatusChange(e) {
    let status = e.target.value;
    this.setState({
      status,
    });
    this.getDetail(1, status);
  }
  tabsChange(e) {
    this.setState({
      tabsKey: e,
    });
  }
  comfirm() {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.props
        .dispatch({
          type: 'topic/addTopic',
          payload: {
            id: fieldsValue.id,
            title: fieldsValue.topic,
            remark: fieldsValue.remark,
            path: fieldsValue.path,
          },
        })
        .then(res => {
          if (res.code == 200) {
            this.setState({
              modalVisiale: false,
            });
            message.success(res.message);
            this.getList();
          } else {
            message.error(res.message);
          }
        });
    });
  }
  cancel() {
    this.setState({
      modalVisiale: false,
    });
  }
  openModal() {
    this.setState({
      modalVisiale: true,
      topicWords: '',
      remark: '',
      id: 0,
      path: 'pages/rank/rank',
      title: '新增话题',
    });
  }

  authIt({ status, uid }) {
    if (status == 1) {
      Modal.warning({
        title: '警告',
        content: '确认要撤销该用户的勋章吗',
        onOk: () => {
          this.props
            .dispatch({
              type: 'topic/changeUserStatus',
              payload: {
                status,
                uid,
                medal_id: this.state.medal_id,
              },
            })
            .then(res => {
              if (res.code == 200) {
                message.success(res.message);
                this.getDetail();
              } else {
                message.error(res.message);
              }
            });
        },
      });
    } else {
      this.props
        .dispatch({
          type: 'topic/changeUserStatus',
          payload: {
            status,
            uid,
            medal_id: this.state.medal_id,
          },
        })
        .then(res => {
          if (res.code == 200) {
            message.success(res.message);
            this.getDetail();
          } else {
            message.error(res.message);
          }
        });
    }
  }

  edit(item) {
    this.setState({
      modalVisiale: true,
      topicWords: item.title,
      remark: item.remark,
      id: item.id,
      path: item.path,
      title: '编辑话题',
    });
  }
  pushIt(id) {
    this.props
      .dispatch({
        type: 'topic/pushIt',
        payload: { id: id },
      })
      .then(res => {
        if (res.code == 200) {
          this.getList();
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      });
  }

  render() {
    const columns = [
      {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (text, record) => <Avatar shape="square" src={record.avatar} />,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
        key: 'nickname',
      },
      {
        title: 'uid',
        dataIndex: 'uid',
        key: 'uid',
      },
      {
        title: '当前角色',
        dataIndex: 'roleName',
        key: 'roleName',
      },
      {
        title: '操作',
        key: 'id',
        render: (text, record) => (
          <span>
            <Button size="small">授权</Button>

            <Button type="danger" size="small">
              删除
            </Button>
          </span>
        ),
      },
    ];

    const data = [
      {
        id: 1,
        nickname: 'John',
        uid: '32123',
        avatar: 'http://uc.xizi.com/avatar.php?uid=2332222',
        roleName: '管理员',
      },
      {
        key: '2',
        nickname: 'Jim Green',
        uid: '42123',
        avatar: 'http://uc.xizi.com/avatar.php?uid=2332222',
        roleName: '普通小编',
      },
      {
        key: '3',
        nickname: 'Black',
        uid: '123123',
        avatar: 'http://uc.xizi.com/avatar.php?uid=2332222',
        roleName: '高级小编',
      },
    ];

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="管理权限"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <Table dataSource={data} columns={columns} />
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
