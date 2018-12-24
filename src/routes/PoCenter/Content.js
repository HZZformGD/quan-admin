import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  message,
  Card,
  Form,
  Upload,
  DatePicker,
  Tooltip,
  Button,
  Checkbox,
  Select,
  Icon,
  Tag,
  List,
  Modal,
  Input,
  Popover,
  Radio,
  Pagination,
  InputNumber,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Content.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ content, category, label, global = {} }) => ({
  content,
  category,
  label,
  domain: global.domain,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    page: 1,
    current:1,
    list: this.props.content.list,
    ifselectAll: false,
    showCategoryList: false,
    showtopList: false,
    show_ShutUp: false,
    showlabelList: false,
    defaultCategoryList: [],
    defaultlabelList: [],
    checkID: [],
    sort: '',
    category_id: 'all',
    prop:'all',
    tag: '',
    content_text: '',
    uname: '',
    uid: '',
    id: '',
    searchTagName: '',
    searchLabelName: '',
    tag_id: '',
    label_id: '',
    editContentText: '',
  };

  componentDidMount() {
    this.getCategory();
    this.getLabel();
    this.getDomain();
    this.getList();
  }

  getDomain() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchGetDomain',
    });
  }

  getLabel(page = 1, searchLabelName = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'label/getList',
      payload: {
        page,
        size: 30,
        label_name: searchLabelName,
        type: 'content',
      },
    });
    this.refreshUploadToken();
  }
  getCategory() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/getList',
      payload: {
        page: 1,
        size: 10000,
        type: 'content',
      },
    });
  }

  getList(page = 1) {
    const { dispatch } = this.props;
    this.props.content.loading = true;
    let { sort, category_id, uname, tag, content_text: content,prop } = this.state;
    dispatch({
      type: 'content/getList',
      payload: {
        page,
        sort,
        category_id,
        prop,
        tag,
        content,
        uname
      },
    });
    this.refreshUploadToken();
  }

  getTagList(page = 1, searchTagName = this.state.searchTagName) {
    const { dispatch } = this.props;
    dispatch({
      type: 'content/getPoTag',
      payload: {
        page,
        size: 30,
        tag_name: searchTagName,
      },
    });
    this.refreshUploadToken();
  }

  refreshUploadToken = () => {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
    });
  }
  selectPropFun = e => {
    this.setState({
      prop: e,
    });
  };
  selectTypeFun = e => {
    this.setState({
      category_id: e,
    });
  };

  listTypeFun = e => {
    this.setState({
      sort: e,
    });
  };

  secItem = index => {
    const { list } = this.props.content
    let { checkID } = this.state
    list[index].ischeck = !list[index].ischeck;
    if (list[index].ischeck) {
      checkID.push(list[index].id);
    } else {
      for (const i in checkID) {
        if (checkID[i].id == list[index].id) {
          checkID[i].splice(0, i);
        }
      }
    }
    this.setState({
      checkID
    });
    // this.poReview(checkID);
    this.props.dispatch({
      type: 'content/resetList',
      payload: {
        list
      },
    });
  };
  SingleReview= (data)=>{
    let list = [];
    list.push(data.id)
    this.poReview(list,data.ifcheck==1?0:1)
  }
  poReview = (list,ifcheck = 1) => {
    // console.log(list)
    this.props
      .dispatch({
        type: 'content/poReview',
        payload: {
          post_ids: list,
          ifcheck:ifcheck
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success('审核成功');
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  editContent = index => {
    if (!this.props.content.list[index].isedit) {
      this.props
        .dispatch({
          type: 'content/poContetnEdit',
          payload: {
            post_id: this.props.content.list[index].id,
            content: this.props.content.list[index].content,
          },
        })
        .then(res => {
          if (res.code == 200) {
            message.success(res.message);
            this.getList(this.state.page);
          } else {
            message.error(res.message);
          }
        });
    }
    this.props.content.list[index].isedit = !this.props.content.list[index].isedit;
    this.props.dispatch({
      type: 'content/resetList',
      payload: {
        list: this.props.content.list,
      },
    });
  };

  allselect = () => {
    const ifselectAll = !this.state.ifselectAll;
    this.setState({
      ifselectAll,
    });
    let idList = [];
    const list = this.props.content.list.map((val, index) => {
      val.ischeck = ifselectAll;
      if (ifselectAll) {
        idList.push(val.id);
      } else {
        idList = [];
      }
    });
    this.setState({
      checkID: idList,
    });
  };

  batchReview = () => {
    let { checkID } = this.state
    if (checkID.length == 0) {
      message.error('未选中审核对象');
      return;
    }
    this.poReview(checkID);
    this.allselect();
  };

  handleCancel = () => {
    this.setState({
      showCategoryList: false,
      showtopList: false,
      show_View: false,
      show_ShutUp: false,
      showlabelList: false,
      defaultCategoryList: [],
      defaultlabelList: []
    });
  };

  submitTopic = () => {
    this.props
      .dispatch({
        type: 'content/poTagEdit',
        payload: {
          post_id: this.state.id,
          tag_id: this.state.tag_id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            showtopList: false,
          });
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };
  submitLabel = () => {
    this.props
      .dispatch({
        type: 'content/setLabel',
        payload: {
          post_id: this.state.id,
          label_ids: this.state.defaultlabelList,
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            showlabelList: false,
          });
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };
  delLabel = (label_id, list, post_id) => {
    this.props
      .dispatch({
        type: 'content/delPoLabel',
        payload: {
          post_id: post_id,
          label_id: label_id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            showlabelList: false,
          });
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  }
  searchTagList = e => {
    this.setState({
      searchTagName: e,
    });
    this.getTagList(1, e);
  };
  searchLabelList = e => {
    this.setState({
      searchLabelName: e,
    });
    this.getLabel(1, e);
  };
  submitCategory = () => {
    this.props
      .dispatch({
        type: 'content/poCatEdit',
        payload: {
          post_id: this.state.id,
          category_ids: this.state.defaultCategoryList,
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            showCategoryList: false,
          });
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };
  CategoryChange = e => {
    this.setState({
      defaultCategoryList: e,
    });
  };
  LabelChange = e => {
    this.setState({
      defaultlabelList: e,
    });
  };
  getTag = e => {
    this.setState({
      tag: e.target.value,
    });
  };

  getUname = e => {
    this.setState({
      uname: e.target.value,
    });
  };

  getContentText = e => {
    this.setState({
      content_text: e.target.value,
    });
  };

  // 选择
  selectTopic = e => {
    this.setState({
      tag_id: e.target.value,
    });
  };
  // 选择
  selectLabel = e => {
    this.setState({
      label_id: e.target.value,
    });
  };
  openCategory = data => {
    let { id, category_id: defaultCategoryList } = data;
    console.log(defaultCategoryList)
    this.setState({
      showCategoryList: true,
      defaultCategoryList,
      id
    });
  };

  openView = (src, type) => {
    this.setState({
      viewSrc: src,
      show_View: true,
      viewType: type,
    });
  };

  del(id) {
    const _this = this;
    Confirm({
      title: "删除会把该信息下全部内容置为空确定删除吗？",
      okText: '确认',
      cancelText: '取消',
      onOk() {
        _this.props
          .dispatch({
            type: 'content/podel',
            payload: { post_id: id },
          })
          .then(res => {
            if (res.code == 200) {
              message.success(res.message);
              _this.getList(_this.state.page);
            } else {
              message.error(res.message);
            }
          });
      },
      onCancel() { },
    });
  }

  setHot = e => {
    if (e.type_id == '1') {
      e.type_id = '0';
    } else {
      e.type_id = '1';
    }
    this.props
      .dispatch({
        type: 'content/posetHot',
        payload: {
          post_id: e.id,
          type_id: e.type_id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  setTop = e => {
    let url = 'content/posetTop';
    if (e.id == this.props.content.xzapp_po_top_id) {
      url = 'content/podelTop';
    }
    this.props
      .dispatch({
        type: url,
        payload: {
          post_id: e.id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  randPraise = e => {
    this.props
      .dispatch({
        type: 'content/poRandPraise',
        payload: {
          post_id: e.id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  getShutText = e => {
    this.setState({
      shut_content: e.target.value,
    });
  };

  getShutDay = e => {
    this.setState({
      shut_day: e,
    });
  };

  setShut = () => {
    let { uid, shut_content: reason, shut_day: days, page } = this.state;
    this.props
      .dispatch({
        type: 'content/poShutUp',
        payload: {
          uid,
          reason,
          days
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            show_ShutUp: false,
          });
          message.success(res.message);
          this.getList(page);
        } else {
          message.error(res.message);
        }
      });
  };

  getContent = (index, e) => {
    this.props.content.list[index].content = e.target.value;
  };

  delImg = (e, lengt) => {
    if (e.is_cover == 1 && lengt != 1) {
      message.error('封面不能删除');
      return;
    }
    this.props
      .dispatch({
        type: 'content/delImg',
        payload: {
          aid: e.aid
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  setCover = (id) => {
    this.props
      .dispatch({
        type: 'content/setCover',
        payload: {
          aid: id,
        },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };
  searchFun=()=>{
    this.getList();
    this.setState({current:1})
  }
  render() {
    const { total, list, loading, tag_list, xzapp_po_top_id } = this.props.content;
    const { list: categoryList } = this.props.category;
    const { checkList: categoryCheckList } = this.props.category;
    const { checkList: labelList, total: labelTotal } = this.props.label;
    const {
      ifselectAll,
      showtopList,
      showCategoryList,
      defaultCategoryList,
      defaultlabelList,
      showlabelList,
      tag,
      content_text,
      uname,
      category_id,
      prop,
      page,
      current
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const Option = Select.Option;
    const CheckboxGroup = Checkbox.Group;
    const RadioGroup = Radio.Group;
    const Search = Input.Search;
    const paginationProps = {
      pageSize: 10,
      total,
      current:current,
      onChange: page => {
        this.setState({
          page,
          current:page
        });
        document.body.scrollTop = 0;
        this.getList(page);
      },
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

    const ListContent = ({ data, index }) => (
      data.id != xzapp_po_top_id || page == 1 ? <div className={styles.listContent}>
        <Button className={styles.checkBtn} onClick={() => this.secItem(index)}>
          <Checkbox className={styles.check} checked={data.ischeck} />
        </Button>
        <div className={styles.listItem}>
          <div className={`${styles.headerItem} ${styles.flexBox}`}>
            <img className={styles.userHead} src={data.head} />
            <p>{data.uname}</p>
            <Button
              onClick={() => {
                this.setState({ uid: data.uid, show_ShutUp: true });
              }}
            >
              禁言
            </Button>
            <p className={styles.tagName} onClick={() => {
              this.setState({
                showtopList: true,
                id: data.id,
                tag_name: data.tag_name,
                tag_id: data.tag_id,
              }, () => this.getTagList());
            }}>#{data.tag_name || '选择话题'}</p>
            {data.category_id.length != 0 ? data.category_id.map((element, index) => (
              categoryList.map((el, idx) => (
                element == el.category_id ? <Tag key={index} color="geekblue" onClick={() => this.openCategory(data)}>{el.category_name}</Tag> : ''
              ))
            )) : <Tag color="geekblue" onClick={() => this.openCategory(data)}>选择分类</Tag>}
          </div>
          <TextArea
            className={styles.contentBox}
            onChange={this.getContent.bind(this, index)}
            disabled={data.isedit}
            defaultValue={data.content}
            autosize
          />
          <div className={`${styles.infoBox} ${styles.flexBox}`}>
            <Button onClick={() => this.editContent(index)}>{data.isedit ? '编辑' : '完成'}</Button>
            <p>收藏数：{data.collect_count}</p>
            <p>点赞数：{data.praise_count}</p>
            <p style={{cursor:'pointer'}}><Link to={`/po-center/comment-list/${data.id}`}>评论数：{data.reply_num}</Link></p>
          </div>
          <div className={styles.labelBox}>
            {data.label_id.map((element, index) => (
                <Tag key={index} color="geekblue" closable afterClose={() => this.delLabel(element.label_id, data.label_id, data.id)}>{element.label_name}</Tag>
            ))}
            <Tag color="geekblue" onClick={() => { this.setState({ showlabelList: true, id: data.id }) }}>选择标签</Tag>
          </div>
          <div className={styles.imgList}>
            {data.cover_img != '[]' && data.cover_img ? data.cover_img.map(
              (element, index) =>
                element.is_cover == 1 ? (
                  <div className={styles.imgBox} key={index}>
                    {element.url.indexOf('video') < 0 ? (
                      <div className={styles.imgChild}>
                        <img
                          src="/admin/closed.png"
                          className={styles.closeBtn}
                          onClick={() =>
                            this.delImg(
                              element,
                              data.cover_img.length
                            )
                          }
                        />
                        <img
                          src={this.props.domain + element.url}
                          onClick={() => this.openView(this.props.domain + element.url, 'img')}
                        />
                        <div className={styles.bottomBox}>
                          <Icon style={{ fontSize: '18px' }} type="picture" theme="outlined" />
                          <p>封面图</p>
                        </div>
                      </div>
                    ) : (
                        <div
                          className={styles.videoBox}
                          onClick={() => this.openView(this.props.domain + element.url, 'video')}
                        >
                          <video src={this.props.domain + element.url} />
                          <img src="/admin/play.png" className={styles.playBtn} />
                        </div>
                      )}
                  </div>
                ) : (
                    ''
                  )
            ) : ''}
            {data.cover_img != '[]' && data.cover_img ? data.cover_img.map(
              (element, index) =>
                element.is_cover != 1 ? (
                  <div className={styles.imgBox} key={index}>
                    {element.type == 1 ? (
                      <div className={styles.imgChild}>
                        <img
                          src="/admin/closed.png"
                          className={styles.closeBtn}
                          onClick={() =>
                            this.delImg(
                              element,
                            )
                          }
                        />
                        <img
                          src={this.props.domain + element.url}
                          onClick={() => this.openView(this.props.domain + element.url, 'img')}
                        />
                        <div className={styles.bottomBox}>
                          <Icon style={{ fontSize: '18px' }} type="picture" theme="outlined" />
                          <p onClick={() => this.setCover(element.aid, )}>设为封面图</p>
                        </div>
                      </div>
                    ) : (
                        <div
                          className={styles.videoBox}
                          onClick={() => this.openView(this.props.domain + element.url, 'video')}
                        >
                          <video src={this.props.domain + element.url} />
                          <img src="/admin/play.png" className={styles.playBtn} />
                        </div>
                      )}
                  </div>
                ) : (
                    ''
                  )
            ) : ''}
          </div>
          <div className={styles.btnBox}>
            <Button onClick={() => this.SingleReview(data)} >
              {data.ifcheck == '1' ? '取消审核' : data.ifcheck == '0' ? '未审核' : ''}
            </Button>
            <Button
              type={data.type_id == '1' ? 'danger' : 'primary'}
              onClick={() => this.setHot(data)}
            >
              {data.type_id == '1' ? '取消热门' : '设置热门'}
            </Button>
            <Button
              type={xzapp_po_top_id == data.id ? 'danger' : 'primary'}
              onClick={() => this.setTop(data)}
            >
              {xzapp_po_top_id == data.id ? '取消置顶' : '置顶'}
            </Button>
            <Button onClick={() => this.randPraise(data)}>随机点赞</Button>
            <Button type="danger" onClick={() => this.del(data.id)}>
              删除
            </Button>
          </div>
        </div>
      </div> : ''
    );
    const OptionList = () => (
      <Select
        defaultValue="all"
        value={prop}
        style={{ width: 120 }}
        onChange={this.selectPropFun}
        className={styles.searchItem}
      >
        <Option value="all">全部</Option>
        <Option value="hot">热门</Option>
        <Option value="video">视频</Option>
      </Select>
    );
    const Options = () => (
      <Select
        defaultValue="all"
        value={category_id}
        style={{ width: 120 }}
        onChange={this.selectTypeFun}
        className={styles.searchItem}
      >
        <Option value="all">分类</Option>
        {categoryList.map((element, index) => (
          <Option key={index} value={element.category_id}>
            {' '}
            {element.category_name}
          </Option>
        ))}
      </Select>
    )
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          // extra={extraContent}
          >
            <Form className={styles.searchBox}>
              <OptionList />
              <Options />
              <FormItem className={styles.searchItem}>
                <Input addonBefore="话题名称" onChange={this.getTag} placeholder="请输入话题名称" />
              </FormItem>
              <FormItem className={styles.searchItem}>
                <Input addonBefore="内容" onChange={this.getContentText} placeholder="请输入内容" />
              </FormItem>
              <FormItem className={styles.searchItem}>
                <Input addonBefore="用户名" onChange={this.getUname} placeholder="请输入用户名" />
              </FormItem>
              <Button type="primary" onClick={() => this.searchFun()} className={styles.searchItem}>
                搜索
              </Button>
              <p className={styles.searchItem}>共{total}篇内容</p>
            </Form>
            <div className={styles.OperationBox}>
              <Button type="primary" className={styles.searchItem} onClick={() => this.allselect()}>
                {ifselectAll ? '取消全选' : '全选'}
              </Button>
              <Button type="primary" className={styles.searchItem} onClick={() => this.batchReview()}>
                批量审核
              </Button>
              <Select
                defaultValue="detaline"
                style={{ width: 120 }}
                onChange={this.listTypeFun}
                className={styles.searchItem}
              >
                <Option value="detaline">默认排序</Option>
                <Option value="praise_count">按赞数</Option>
                <Option value="reply_num">按评论数</Option>
                <Option value="collect_count">按收藏数</Option>
              </Select>
            </div>
            <List
              rowKey="id"
              pagination={paginationProps}
              loading={loading}
              dataSource={list}
              renderItem={(item, index) => (
                <List.Item>
                  <ListContent data={item} index={index} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        <Modal
          title="分类"
          visible={showCategoryList}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitCategory()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <Form>
            <FormItem>
              {getFieldDecorator('defaultCategoryList', { initialValue: defaultCategoryList })(
                <CheckboxGroup options={categoryCheckList} onChange={this.CategoryChange} />
              )}
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title="话题"
          visible={showtopList}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitTopic()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <div>
            <Search
              className={styles.SearchBox}
              placeholder="话题名字"
              onSearch={this.searchTagList}
              enterButton
              style={{ marginBottom: '20px' }}
            />
          </div>
          <div>
            <p>当前关联的话题：{this.state.tag_name}</p>
          </div>
          <div>
            <RadioGroup
              className={styles.tagRadioBox}
              onChange={this.selectTopic}
              defaultValue={this.state.tag_id}
            >
              {tag_list.list.length > 0
                ? tag_list.list.map((element, index) => (
                  <Radio
                    className={styles.tagRadio}
                    key={index}
                    name={element.tag_name}
                    value={element.tag_id}
                  >
                    {' '}
                    {element.tag_name}
                  </Radio>
                ))
                : ''}
            </RadioGroup>
          </div>
          <Pagination
            pageSize={30}
            onChange={page => {
              this.getTagList(page);
            }}
            total={tag_list.total}
          />
        </Modal>
        <Modal
          title="标签"
          visible={showlabelList}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.submitLabel()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <div>
            <Search
              className={styles.SearchBox}
              placeholder="标签名字"
              onSearch={this.searchLabelList}
              enterButton
              style={{ marginBottom: '20px' }}
            />
          </div>
          {/* <div>
            <p>当前关联的话题：{this.state.tag_name}</p>
          </div> */}
          <div>
            <Form>
              <FormItem>
                {getFieldDecorator('defaultlabelList', { initialValue: defaultlabelList })(
                  <CheckboxGroup options={labelList} onChange={this.LabelChange} />
                )}
              </FormItem>
            </Form>
            {/* <RadioGroup
              className={styles.tagRadioBox}
              onChange={this.selectLabel}
              defaultValue={this.state.label_id}
            >
              {labelList.length > 0
                ? labelList.map((element, index) => (
                  <Radio
                    className={styles.tagRadio}
                    key={index}
                    name={element.label_name}
                    value={element.label_id}
                  >
                    {' '}
                    {element.label_name}
                  </Radio>
                ))
                : ''}
            </RadioGroup> */}
          </div>
          <Pagination
            pageSize={30}
            onChange={page => {
              this.getLabel(page);
            }}
            total={labelTotal}
          />
        </Modal>
        <Modal
          title="查看"
          visible={this.state.show_View}
          destroyOnClose
          footer={[
            <Button key="submit" type="primary" onClick={() => this.handleCancel()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          {this.state.viewType == 'img' ? (
            <img className={styles.viewBox} src={this.state.viewSrc} />
          ) : (
              <video className={styles.viewBox} src={this.state.viewSrc} controls="controls" />
            )}
        </Modal>
        <Modal
          title="禁言"
          visible={this.state.show_ShutUp}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => this.handleCancel(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.setShut()}>
              确定
            </Button>,
          ]}
          onCancel={() => this.handleCancel(false)}
        >
          <div className={styles.ShutBox}>
            <p>禁言理由:</p>
            <Input onChange={this.getShutText} placeholder="请输入禁言理由" />
            <p>禁言天数:</p>
            <InputNumber
              className={styles.ShutDay}
              min={1}
              addonBefore="禁言天数"
              onChange={this.getShutDay}
              placeholder="请输入禁言天数"
              size={50}
            />
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
