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

@connect(({ content, category, global = {} }) => ({
  content,
  category,
  domain: global.domain,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    page: 1,
    list: this.props.content.list,
    ifselectAll: false,
    showCategoryList: false,
    showtopList: false,
    show_ShutUp: false,
    defaultCategoryList: [],
    checkID: [],
    sort: '',
    category_id: 'all',
    tag: '',
    content_text: '',
    uname: '',
    uid: '',
    id: '',
    searchTagName: '',
    tag_id: '',
    editContentText: '',
  };

  componentDidMount() {
    this.getList();
    this.getCategory();
    this.getDomain();
  }

  getDomain() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchGetDomain',
    });
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
    dispatch({
      type: 'content/getList',
      payload: {
        page,
        sort: this.state.sort,
        category_id: this.state.category_id,
        tag: this.state.tag,
        content: this.state.content_text,
        uname: this.state.uname,
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

  refreshUploadToken() {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
    });
  }

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
    const list = this.props.content.list;
    list[index].ischeck = !list[index].ischeck;
    if (list[index].ischeck) {
      this.state.checkID.push(list[index].id);
    } else {
      for (const i in this.state.checkID) {
        if (this.state.checkID[i].id == list[index].id) {
          this.state.checkID[i].splice(0, i);
        }
      }
    }
    this.setState({
      checkID: this.state.checkID,
    });
    this.poReview(this.state.checkID);
    this.props.dispatch({
      type: 'content/resetList',
      payload: {
        list: this.props.content.list,
      },
    });
  };

  poReview = list => {
    this.props
      .dispatch({
        type: 'content/poReview',
        payload: {
          post_ids: list,
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

  batchReview = e => {
    if (this.state.checkID.length == 0) {
      message.error('未选中审核对象');
      return;
    }
    this.poReview(this.state.checkID);
    this.allselect();
  };

  handleCancel = e => {
    this.setState({
      showCategoryList: false,
      showtopList: false,
      show_View: false,
      show_ShutUp: false,
      defaultCategoryList: [],
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

  searchTagList = e => {
    console.log(e);
    this.setState({
      searchTagName: e,
    });
    this.getTagList(1, e);
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

  openCategory = data => {
    this.setState({
      showCategoryList: true,
      defaultCategoryList: data.category_id,
      id: data.id,
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
      title: `删除会把该信息下全部内容置为空确定删除吗？`,
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
      onCancel() {},
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
    this.props
      .dispatch({
        type: 'content/poShutUp',
        payload: {
          uid: this.state.uid,
          reason: this.state.shut_content,
          days: this.state.shut_day,
        },
      })
      .then(res => {
        if (res.code == 200) {
          this.setState({
            show_ShutUp: false,
          });
          message.success(res.message);
          this.getList(this.state.page);
        } else {
          message.error(res.message);
        }
      });
  };

  getContent = (index, e) => {
    this.props.content.list[index].content = e.target.value;
  };

  delImg = (id, delUrl, cover_img, urls) => {
    for (const i in urls) {
      if (delUrl.url == urls[i].url) {
        urls = urls.splice(0, i);
      }
    }
    if (delUrl.url == cover_img.url) {
      if (urls.length == 0) {
        cover_img = {};
        urls = [];
      } else {
        cover_img = urls[0];
      }
    }
    this.props
      .dispatch({
        type: 'content/delImg',
        payload: {
          post_id: id,
          current_img: delUrl.url,
          cover_img: JSON.stringify(cover_img),
          url: JSON.stringify(urls),
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

  setCover = (id, cover_img) => {
    this.props
      .dispatch({
        type: 'content/setCover',
        payload: {
          post_id: id,
          cover_img: JSON.stringify(cover_img),
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

  render() {
    const { total, list, loading, tag_list, xzapp_po_top_id } = this.props.content;
    const categoryList = this.props.category.list;
    const categoryCheckList = this.props.category.checkList;
    const {
      ifselectAll,
      showtopList,
      showCategoryList,
      defaultCategoryList,
      tag,
      content_text,
      uname,
      category_id,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const Option = Select.Option;
    const CheckboxGroup = Checkbox.Group;
    const RadioGroup = Radio.Group;
    const Search = Input.Search;
    const paginationProps = {
      pageSize: 10,
      total,
      onChange: page => {
        this.setState({
          page,
        });
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
      <div className={styles.listContent}>
        <Button className={styles.checkBtn} onClick={() => this.secItem(index)}>
          <Checkbox className={styles.check} checked={data.ischeck} />
        </Button>
        <div className={styles.listItem}>
          <div className={`${styles.headerItem} ${styles.flexBox}`}>
            <p>{data.uname}</p>
            <Button
              onClick={() => {
                this.setState({ uid: data.uid, show_ShutUp: true });
              }}
            >
              禁言
            </Button>
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
            <p>评论数：{data.reply_num}</p>
          </div>
          <div className={styles.imgList}>
            <div className={styles.imgBox}>
              <div className={styles.imgChild}>
                <img
                  src="/closed.png"
                  className={styles.closeBtn}
                  onClick={() =>
                    this.delImg(
                      data.id,
                      JSON.parse(data.cover_img),
                      JSON.parse(data.cover_img),
                      JSON.parse(data.url)
                    )
                  }
                />
                <img
                  src={this.props.domain + JSON.parse(data.cover_img).url}
                  onClick={() =>
                    this.openView(this.props.domain + JSON.parse(data.cover_img).url, 'img')
                  }
                />
                <div className={styles.bottomBox}>
                  <Icon style={{ fontSize: '18px' }} type="picture" theme="outlined" />
                  <p>封面图</p>
                </div>
              </div>
            </div>
            {JSON.parse(data.url).map(
              (element, index) =>
                JSON.parse(data.cover_img).url != element.url ? (
                  <div className={styles.imgBox} key={index}>
                    {element.url.indexOf('video') < 0 ? (
                      <div className={styles.imgChild}>
                        <img
                          src="/closed.png"
                          className={styles.closeBtn}
                          onClick={() =>
                            this.delImg(
                              data.id,
                              element,
                              JSON.parse(data.cover_img),
                              JSON.parse(data.url)
                            )
                          }
                        />
                        <img
                          src={this.props.domain + element.url}
                          onClick={() => this.openView(this.props.domain + element.url, 'img')}
                        />
                        <div className={styles.bottomBox}>
                          <Icon style={{ fontSize: '18px' }} type="picture" theme="outlined" />
                          <p onClick={() => this.setCover(data.id, element)}>设为封面图</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={styles.videoBox}
                        onClick={() => this.openView(this.props.domain + element.url, 'video')}
                      >
                        <video src={this.props.domain + element.url} />
                        <img src="/play.png" className={styles.playBtn} />
                      </div>
                    )}
                  </div>
                ) : (
                  ''
                )
            )}
          </div>
          <div className={styles.btnBox}>
            <Button onClick={() => this.poReview(data)}>
              {data.ifcheck == '1' ? '已审核' : data.ifcheck == '0' ? '审核' : ''}
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
            <Button onClick={() => this.openCategory(data)}>分类</Button>
            <Button
              onClick={() => {
                this.setState({
                  showtopList: true,
                  id: data.id,
                  tag_name: data.tag_name,
                  tag_id: data.tag_id,
                });
                this.getTagList();
              }}
            >
              话题
            </Button>
            <Button onClick={() => this.randPraise(data)}>随机点赞</Button>
            <Button type="danger" onClick={() => this.del(data.id)}>
              删除
            </Button>
          </div>
        </div>
      </div>
    );
    const OptionList = () => (
      <Select
        defaultValue="all"
        value={category_id}
        style={{ width: 120 }}
        onChange={this.selectTypeFun}
        className={styles.searchItem}
      >
        <Option value="all">全部</Option>
        {categoryList.map((element, index) => (
          <Option key={index} value={element.category_id}>
            {' '}
            {element.category_name}
          </Option>
        ))}
      </Select>
    );
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
              <FormItem className={styles.searchItem}>
                <Input addonBefore="话题名称" onChange={this.getTag} placeholder="请输入话题名称" />
              </FormItem>
              <FormItem className={styles.searchItem}>
                <Input addonBefore="内容" onChange={this.getContentText} placeholder="请输入内容" />
              </FormItem>
              <FormItem className={styles.searchItem}>
                <Input addonBefore="用户名" onChange={this.getUname} placeholder="请输入用户名" />
              </FormItem>
              <Button type="primary" onClick={() => this.getList()} className={styles.searchItem}>
                搜索
              </Button>
              <p className={styles.searchItem}>共{total}篇内容</p>
            </Form>
            <div className={styles.OperationBox}>
              <Button type="primary" className={styles.searchItem} onClick={() => this.allselect()}>
                {ifselectAll ? '取消全选' : '全选'}
              </Button>
              <Button type="primary" className={styles.searchItem} onClick={() => this.batchReview}>
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
