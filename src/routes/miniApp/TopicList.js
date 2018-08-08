import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import Ellipsis from 'components/Ellipsis';
import debounce from 'lodash/debounce';

import {
  List,
  Card,
  Tooltip,
  Col,
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
import styles from './TopicList.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { Search } = Input;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
@Form.create()
@connect(({ topic, decoration, loading }) => ({
  topic,
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
    pushVisiale: false,
    data: [],
    fetching: false,
    pushFetching: false,
    medal_id: 0,
    checkStatus: false,
    currentPage: 1,
    status: -1,
    checkType: 1,
    listString: '',
    remark: '',
    topicWords: '',
    path: 'pages/rank/rank',
    id: 0,
    title: '新增话题',
    value: [],
    tabsKey: 1,
    listArr: [],
  };

  componentWillMount() {
    const { match } = this.props;

    this.setState({
      medal_id: match.params.medal_id,
    });
    this.getList();
  }

  getList(page = 1, status = -1, keyword = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'topic/getList',
      payload: { keyword, page, status },
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
        console.info(res);
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

  handlePushChange = value => {
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
  comfirmPush() {
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
        type: 'topic/pushItApart',
        payload: {
          id: this.state.id,
          user_list,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.setState({
            pushVisiale: false,
            value: [],
            data: [],
          });
          this.getList();
        } else {
          message.error(res.message);
        }
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
  cancelPushModal() {
    this.setState({
      pushVisiale: false,
    });
  }
  openPushModal(id) {
    this.setState({
      pushVisiale: true,
      id: id,
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
        type: 'topic/pushItToAll',
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
    const { topic, loading } = this.props;

    const { getFieldDecorator } = this.props.form;

    const {
      modalVisiale,
      topicWords,
      remark,
      id,
      path,
      title,
      tabsKey,
      pushVisiale,
      listArr,
      value,
      pushFetching,
      data,
    } = this.state;

    // const { decorations } = decoration
    // const Info = ({ title, value, bordered, color }) => (
    //   <div className={styles.headerInfo}>
    //     <span >{title}</span>
    //     <p style={{ color }}>{value}</p>
    //     {bordered && <em />}
    //   </div>
    // );

    // const extraContent = (
    //   <div className={styles.extraContent}>
    //     <RadioGroup defaultValue={-1} onChange={this.onStatusChange.bind(this)}>
    //       <RadioButton value={-1}>全部</RadioButton>
    //       <RadioButton value={1}>已发放</RadioButton>
    //       <RadioButton value={0}>未发放</RadioButton>
    //     </RadioGroup>
    //     <Search className={styles.extraContentSearch} placeholder="请输入用户名或者uid" onSearch={this.onSearchKeyword.bind(this)} />
    //   </div>
    // );

    const paginationProps = {
      pageSize: 10,
      total: topic.total,
      onChange: page => {
        console.info(page);
        this.setState({
          currentPage: page,
        });
        this.getDetail(page);
      },
    };

    const ListContent = ({ data }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>{data.id}</p>
        </div>
        <div className={styles.listContentItem}>
          <Tooltip title={data.title}>
            <Ellipsis lines={2}>{data.title}</Ellipsis>
          </Tooltip>
        </div>
        <div className={styles.listContentItem}>
          <Ellipsis lines={2}>{data.remark}</Ellipsis>
        </div>

        <div className={styles.listContentItem}>
          {data.pushed_at > 0 ? moment(data.pushed_at * 1000).format('YYYY-MM-DD HH:mm') : ''}
        </div>
      </div>
    );

    const ListHeader = () => (
      <div className={styles.flexHeader}>
        <div className={styles.listHeader}>
          <span className={styles.listContentItem}>id</span>
          <span className={styles.listContentItem}>话题</span>
          <span className={styles.listContentItem}>备注</span>
          <span className={styles.listContentItem}>推送时间</span>
        </div>
        <div className={styles.operation}>操作</div>
      </div>
    );

    let OperationBtn = item => {
      if (item.status == 1) {
        return [<Button disabled={true}>已推送</Button>];
      } else {
        return [
          <Button type="primary" onClick={() => this.openPushModal(item.id)}>
            批量
          </Button>,
          <Button type="primary" onClick={() => this.pushIt(item.id)}>
            推送
          </Button>,
          <Button onClick={() => this.edit(item)}>编辑</Button>,
        ];
      }
    };

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
    const idConfig = {
      initialValue: id || 0,
    };
    const topicWordsConfig = {
      rules: [{ type: 'string', required: true, message: '输入的话题不能为空哦' }],
      initialValue: topicWords || '',
    };
    const remarkConfig = {
      rules: [{ type: 'string', required: true, message: '输入的备注不能为空哦' }],
      initialValue: remark || '',
    };

    const pathConfig = {
      rules: [{ type: 'string', required: true, message: '输入的路径不能为空' }],
      initialValue: path || '',
    };
    const listStringConfig = {
      rules: [{ type: 'string', required: true, message: '输入检测的用户不能为空' }],
    };

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="话题列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            // extra={extraContent}
          >
            <Button
              type="dashed"
              onClick={() => this.openModal()}
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
            >
              增加话题
            </Button>
            <ListHeader />

            <List
              size="large"
              rowKey="id"
              // loading={loading}
              // pagination={paginationProps}
              dataSource={topic.list}
              renderItem={item => (
                <List.Item actions={OperationBtn(item)}>
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        {modalVisiale && (
          <Modal
            title={title}
            wrapClassName="vertical-center-modal"
            visible={modalVisiale}
            footer={[
              <Button key="back" onClick={() => this.cancel(false)}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={() => this.comfirm()}>
                确定
              </Button>,
            ]}
            onCancel={() => this.cancel(false)}
          >
            <Form>
              <FormItem className={styles.hidden}>
                {getFieldDecorator('id', idConfig)(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} label="话题">
                {getFieldDecorator('topic', topicWordsConfig)(
                  <TextArea placeholder="请输入话题" autosize={{ minRows: 4, maxRows: 10 }} />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('remark', remarkConfig)(<TextArea placeholder="请输入备注" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="路径">
                {getFieldDecorator('path', pathConfig)(<Input placeholder="请输入页面路径" />)}
              </FormItem>
            </Form>
          </Modal>
        )}
        {pushVisiale && (
          <Modal
            title="批量推送"
            wrapClassName="vertical-center-modal"
            visible={pushVisiale}
            okText="颁发"
            footer={[
              <Button key="back" onClick={() => this.cancelPushModal(false)}>
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={tabsKey == 1 ? listArr.length == 0 : value.length == 0}
                onClick={() => this.comfirmPush()}
              >
                推送
              </Button>,
            ]}
            onCancel={() => this.cancelPushModal(false)}
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
                  notFoundContent={pushFetching ? <Spin size="small" /> : null}
                  filterOption={false}
                  onSearch={this.fetchUser}
                  onChange={this.handlePushChange}
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
