import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import {
  List,
  Card,
  Row,
  Col,
  Radio,
  Input,
  Modal,
  Button,
  message,
  Select,
  Table,
  Spin,
  notification,
  Form,
  Avatar,
  Tabs,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Detail.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { Search } = Input;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
@Form.create()
@connect(({ decoration, loading }) => ({
  decoration,
  loading: loading.models.decoration,
}))
export default class BasicList extends PureComponent {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.input = {};
    this.fetchUser = debounce(this.fetchUser, 800);
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
    checkStatus: false,
    listArr: [],
    value: [],
    tabsKey: 1,
  };

  componentDidMount() {
    const { match } = this.props;

    this.setState({
      medal_id: match.params.medal_id,
    });
    this.getDetail();
  }

  getDetail(page = 1, status = -1, keyword = '') {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'decoration/getDetailList',
      payload: { medal_id: match.params.medal_id, keyword, page, status },
    });
  }

  fetchUser = keyword => {
    console.log('fetching user', keyword);
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    this.props
      .dispatch({
        type: 'decoration/searchUser',
        payload: {
          keyword,
          medal_id: this.state.medal_id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          if (fetchId !== this.lastFetchId) {
            // for fetch callback order
            return;
          }
          let { user } = res.data;
          const data = [{ text: user.username, value: user.uid }];
          this.setState({ data, fetching: false });
        } else {
          message.error(res.message);
          this.setState({ fetching: false });
        }
      });
  };

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
    let user_list = [];

    if (this.state.tabsKey == 1) {
      this.state.listArr.map(item => {
        user_list.push(item.uid);
      });
    } else {
      this.state.value.map(item => {
        user_list.push(item.key);
      });
    }

    if (user_list.length == 0) {
      return;
    }
    this.props
      .dispatch({
        type: 'decoration/authMedal',
        payload: {
          medal_id: this.state.medal_id,
          user_list,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.setState({
            modalVisiale: false,
            value: [],
            data: [],
          });
          this.getDetail();
        } else {
          message.error(res.message);
        }
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
    });
  }

  authIt({ status, uid }) {
    if (status == 1) {
      Modal.warning({
        title: '警告',
        content: '确认要撤销该用户的勋章吗',
        okText: '是的',
        onOk: () => {
          this.props
            .dispatch({
              type: 'decoration/changeUserStatus',
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
          type: 'decoration/changeUserStatus',
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

  checkThem() {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({
        checkStatus: true,
      });

      this.props
        .dispatch({
          type: 'decoration/checkUser',
          payload: {
            medal_id: this.state.medal_id,
            user_list: fieldsValue.liststring,
          },
        })
        .then(res => {
          if (res.code == 200) {
            let words = '';
            if (res.data.auth_user.length || res.data.invalid_user.length) {
              if (res.data.auth_user.length) {
                words += `这些用户已经授权过了【${res.data.auth_user.join('，')}】。`;
              }
              if (res.data.invalid_user.length) {
                words += `这些用户是无效的【${res.data.invalid_user.join('，')}】`;
              }
              notification.info({
                description: words + '请核对好之后再检测',
                duration: 10,
                message: '注意注意',
              });
            }
            if (res.data.un_auth_user.length) {
              this.setState({
                listArr: res.data.un_auth_user,
              });
            }
          } else {
            message.error(res.message);
          }
          this.setState({
            checkStatus: false,
          });
        });
    });
  }

  render() {
    const { decoration, loading } = this.props;
    const { getFieldDecorator } = this.props.form;

    const { modalVisiale, fetching, data, value, listArr, tabsKey } = this.state;
    const { decorations } = decoration;
    const Info = ({ title, value, bordered, color }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p style={{ color }}>{value}</p>
        {bordered && <em />}
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <Button
          type="primary"
          onClick={() => this.openModal()}
          className={styles.extraContentButton}
        >
          颁发勋章
        </Button>
        <RadioGroup defaultValue={-1} onChange={this.onStatusChange.bind(this)}>
          <RadioButton value={-1}>全部</RadioButton>
          <RadioButton value={1}>已发放</RadioButton>
          <RadioButton value={0}>未发放</RadioButton>
        </RadioGroup>
        <Search
          className={styles.extraContentSearch}
          placeholder="请输入用户名或者uid"
          onSearch={this.onSearchKeyword.bind(this)}
        />

      </div>
    );

    const paginationProps = {
      pageSize: 10,
      total: decorations.total,
      onChange: page => {
        console.info(page);
        this.setState({
          currentPage: page,
        });
        this.getDetail(page);
      },
    };


    const columns = [
      {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (text, record) => (
          <Avatar shape="square" size="large" src={record.avatar}></Avatar>
        )
      },
      {
        title: '昵称',
        key: 'username',
        dataIndex: 'username'
      },

      {
        title: 'uid',
        dataIndex: 'uid',
        key: 'uid'
      },
      {
        title: '操作',
        render: (text, record) => (
          <Button
            type={record.status == 1 ? 'danger' : 'primary'}
            onClick={() => this.authIt(record)}
          >
            {record.status == 1 ? '撤销' : '授权'}
          </Button>

        ),
      },
    ];




    const listStringConfig = {
      rules: [{ type: 'string', required: true, message: '输入检测的用户不能为空' }],
    };

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card bordered={false}>
            <Row>
              <Col sm={5} xs={24}>
                <Info title="勋章名称" value={decorations.medal.medal_name} bordered />
              </Col>
              <Col sm={5} xs={24}>
                <Info title="发放时间" value={decorations.medal.granttime} bordered />
              </Col>
              <Col sm={5} xs={24}>
                <Info title="到期时间" value={decorations.medal.deadline} bordered />
              </Col>
              <Col sm={5} xs={24}>
                <Info title="总人数" value={decorations.medal.count + '位红柚'} bordered />
              </Col>
              <Col sm={4} xs={24}>
                <Info
                  title="状态"
                  value={decorations.medal.status == 1 ? '上线' : '下线'}
                  color="red"
                />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            bordered={false}
            title="红柚列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={extraContent}
          >

            <Table pagination={paginationProps} columns={columns} dataSource={decorations.list}></Table>

          </Card>
        </div>
        {modalVisiale && (
          <Modal
            title="颁发勋章"
            wrapClassName="vertical-center-modal"
            visible={modalVisiale}
            okText="颁发"
            footer={[
              <Button key="back" onClick={() => this.cancel(false)}>
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={tabsKey == 1 ? listArr.length == 0 : value.length == 0}
                onClick={() => this.comfirm()}
              >
                颁发
              </Button>,
            ]}
            onCancel={() => this.cancel(false)}
          >
            <Tabs defaultActiveKey="1" onChange={this.tabsChange.bind(this)}>
              <TabPane tab="普通" key="1">
                <Form>
                  <FormItem>
                    {getFieldDecorator('liststring', listStringConfig)(
                      <TextArea placeholder="输入用户名或uid并以英文逗号&quot;,&quot;隔开,举个栗子- 君鸿,junver,2335111" />
                    )}
                  </FormItem>
                </Form>

                <Button
                  loading={this.state.checkStatus}
                  className={styles.checkBtn}
                  onClick={() => this.checkThem()}
                >
                  检测
                </Button>
              </TabPane>
              <TabPane tab="搜索" key="2">
                <Select
                  mode="multiple"
                  labelInValue
                  value={value}
                  placeholder="请输入uid或者用户名"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={false}
                  onSearch={this.fetchUser}
                  onChange={this.handleChange}
                  style={{ width: '100%' }}
                >
                  {data.map(d => <Option key={d.value}>{d.text}</Option>)}
                </Select>
              </TabPane>
            </Tabs>
          </Modal>
        )}
      </PageHeaderLayout>
    );
  }
}
