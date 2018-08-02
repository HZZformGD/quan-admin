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
const TabPane = Tabs.TabPane
const { Search } = Input;
const FormItem = Form.Item;
const TextArea = Input.TextArea
@Form.create()

@connect(({ topic, loading }) => ({
  topic,
  loading: loading.models.decoration,
}))
export default class BasicList extends PureComponent {

  constructor(props) {
    super(props)
    this.lastFetchId = 0
    this.input = {}
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
    remark: '',
    topicWords: '',
    path: 'pages/rank/rank',
    id: 0
  }



  componentDidMount() {
    const { match } = this.props;

    this.setState({
      medal_id: match.params.medal_id
    })
    // this.getDetail()

  }

  getDetail(page = 1, status = -1, keyword = '') {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'topic/getDetailList',
      payload: { medal_id: match.params.medal_id, keyword, page, status }
    })
  }

  fetchUser = (keyword) => {
    console.log('fetching user', keyword);
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    this.props.dispatch({
      type: 'topic/searchUser',
      payload: {
        keyword,
        medal_id: this.state.medal_id
      }
    }).then(res => {
      if (res.code == 200) {
        if (fetchId !== this.lastFetchId) { // for fetch callback order
          return;
        }
        let { user } = res.data
        const data = [{ text: user.username, value: user.uid }]
        this.setState({ data, fetching: false });
      } else {
        message.error(res.message)
        this.setState({ fetching: false });
      }
    });
  }

  handleChange = (value) => {
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  }
  areaChange(e) {
    console.info(this, e)
  }
  onSearchKeyword(e) {
    this.setState({
      keyword: e
    })
    this.getDetail(1, -1, e)
  }
  onStatusChange(e) {
    let status = e.target.value
    this.setState({
      status
    })
    this.getDetail(1, status)
  }
  tabsChange(e) {
    this.setState({
      tabsKey: e
    })
  }
  comfirm() {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      console.info(fieldsValue)
      this.props.dispatch({
        type: 'topic/addTopic',
        payload: {
          id: fieldsValue.id,
          title: fieldsValue.topic,
          remark: fieldsValue.remark,
          path: fieldsValue.path,
        }
      })
    })

  }
  cancel() {
    this.setState({
      modalVisiale: false
    })
  }
  openModal() {
    this.setState({
      modalVisiale: true
    })
  }

  authIt({ status, uid }) {
    if (status == 1) {
      Modal.warning({
        title: '警告',
        content: '确认要撤销该用户的勋章吗',
        onOk: () => {
          this.props.dispatch({
            type: 'topic/changeUserStatus',
            payload: {
              status,
              uid,
              medal_id: this.state.medal_id
            }
          }).then((res) => {
            if (res.code == 200) {
              message.success(res.message)
              this.getDetail()
            } else {
              message.error(res.message)
            }
          })
        },
      });
    } else {
      this.props.dispatch({
        type: 'topic/changeUserStatus',
        payload: {
          status,
          uid,
          medal_id: this.state.medal_id
        }
      }).then((res) => {
        if (res.code == 200) {
          message.success(res.message)
          this.getDetail()
        } else {
          message.error(res.message)
        }
      })
    }

  }

  checkThem() {


  }

  render() {
    const {
      topic,
      loading,
    } = this.props;

    const { getFieldDecorator } = this.props.form

    const { modalVisiale, topicWords, remark, id, path } = this.state
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

    // const paginationProps = {
    //   pageSize: 10,
    //   total: decorations.total,
    //   onChange: (page) => {
    //     console.info(page)
    //     this.setState({
    //       currentPage: page
    //     })
    //     this.getDetail(page);
    //   }
    // };

    // const ListContent = ({ data: { username, uid, } }) => (
    //   <div className={styles.listContent}>
    //     <div className={styles.listContentItem}>
    //       <span>姓名</span>
    //       <p>{username}</p>
    //     </div>
    //     <div className={styles.listContentItem}>
    //       <span>uid</span>
    //       <p>{uid}</p>
    //     </div>
    //   </div>
    // );
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
      initialValue: id || 0

    }
    const topicWordsConfig = {
      rules: [{ type: 'string', required: true, message: '输入的话题不能为空哦' }],
      initialValue: topicWords || ''
    }
    const remarkConfig = {
      rules: [{ type: 'string', required: true, message: '输入的备注不能为空哦' }],
      initialValue: remark || ''
    }

    const pathConfig = {
      rules: [{ type: 'string', required: true, message: '输入的路径不能为空' }],
      initialValue: path || ''
    }

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
            <Button type="dashed" onClick={() => this.openModal()} style={{ width: '100%', marginBottom: 8 }} icon="plus">
              增加话题
            </Button>
            <List
              size="large"
              rowKey="id"
              // loading={loading}
              // pagination={paginationProps}
              dataSource={topic.list}
              renderItem={item => (
                <List.Item
                  actions={[<Button type={item.status == 1 ? 'danger' : 'primary'} onClick={() => this.authIt(item)}>{item.status == 1 ? '撤销' : '授权'}</Button>]}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} shape="square" size="large" />}
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        {
          modalVisiale &&
          <Modal
            title="新增勋章"
            wrapClassName="vertical-center-modal"
            visible={modalVisiale}
            footer={[
              <Button key="back" onClick={() => this.cancel(false)}>取消</Button>,
              <Button key="submit" type="primary" onClick={() => this.comfirm()}>
                确定
              </Button>,
            ]}
            onCancel={() => this.cancel(false)}
          >
            <Form>
              <FormItem
                className={styles.hidden}
              >
                {getFieldDecorator('id', idConfig)(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="话题"
              >
                {getFieldDecorator('topic', topicWordsConfig)(
                  <TextArea placeholder='请输入话题' autosize={{ minRows: 4, maxRows: 10 }} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="备注"
              >
                {getFieldDecorator('remark', remarkConfig)(
                  <TextArea placeholder='请输入备注' />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="路径"
              >
                {getFieldDecorator('path', pathConfig)(
                  <Input placeholder='请输入页面路径' />
                )}
              </FormItem>
            </Form>


          </Modal>
        }
      </PageHeaderLayout>
    );
  }
}
