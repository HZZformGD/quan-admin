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
  Radio,
  Icon,
  Tag,
  List,
  Modal,
  Input,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Category.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ category, global = {}, loading }) => ({
  category,
  loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
  state = {
    addTitle: '添加分类',
    show_a_e_Category: false,
    show_addLabel: false,
    show_delCategory: false,
    id: '',
    categoryName: '',
    order: '',
    form: 'info',
    labelName: '',
    currentPage: 1,
    if_again: true,
  };

  componentDidMount() {
    this.getList();
    // console.log(this.props.decoration)
  }

  getList(page = 1, size = 10) {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/getList',
      payload: {
        page,
        size,
      },
    });
    // this.refreshUploadToken()
  }

  refreshUploadToken() {
    this.props.dispatch({
      type: 'global/fetchUploadToken',
    });
  }

  // 显示添加分类弹窗
  show_Category() {
    this.setState({
      show_a_e_Category: true,
      addTitle: '添加分类',
    });
  }

  // 添加或修改分类提交
  submitCategory = e => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      console.log(fieldsValue);
      const postObj = {
        name: fieldsValue.name,
        sort: fieldsValue.order,
        show_style: fieldsValue.show_style,
      };
      let url = 'category/addCategory';
      if (fieldsValue.id) {
        postObj.id = fieldsValue.id;
        url = 'category/editCategory';
      }
      this.props
        .dispatch({
          type: url,
          payload: postObj,
        })
        .then(res => {
          if (res.code == 200) {
            this.setState({
              show_a_e_Category: false,
            });
            message.success(res.message);
            this.getList();
          } else {
            message.error(res.message);
          }
        });
    });
  };

  // 添加标签
  submitLabel = e => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.props
        .dispatch({
          type: 'topic/addTopic',
          payload: postObj,
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
  };

  // 关闭弹窗
  handleCancel = e => {
    this.setState({
      show_a_e_Category: false,
      show_addLabel: false,
      show_delCategory: false,
      id: '',
      categoryName: '',
      order: '',
      form: '0',
    });
  };

  // 编辑分类
  edit(e) {
    const data = e.data;
    this.setState({
      show_a_e_Category: true,
      addTitle: '修改分类',
      id: data.category_id,
      categoryName: data.category_name,
      order: data.category_sort,
      form: data.show_style,
    });
  }

  // 添加标签
  addLabel(e) {
    this.setState({
      show_addLabel: true,
    });
  }

  // 下线分类
  downline(id, status) {
    status = status == '0' ? '1' : '0';
    this.props
      .dispatch({
        type: 'category/statusCategory',
        payload: { id, status },
      })
      .then(res => {
        if (res.code == 200) {
          message.success(res.message);
          this.getList();
        } else {
          message.error(res.message);
        }
      });
  }

  // 删除分类
  del(id) {
    const _this = this;
    Confirm({
      title: `删除会把该信息下全部内容分类置为空确定删除吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        _this.props
          .dispatch({
            type: 'category/delCategory',
            payload: { id },
          })
          .then(res => {
            if (res.code == 200) {
              message.success(res.message);
              _this.getList();
            } else {
              message.error(res.message);
            }
          });
      },
      onCancel() {},
    });
  }

  // 选择展现形式
  selectForm = e => {
    this.setState({
      form: e.target.value,
    });
  };

  // 删除关联标签
  closeTag(e) {
    console.log(e);
  }

  render() {
    const { total, list } = this.props.category;
    const { categoryName, order, id, form, labelName, tag_list } = this.state;

    const { getFieldDecorator } = this.props.form;
    const RadioGroup = Radio.Group;

    const FormCheck = {
      idConfig: {
        initialValue: id || 0,
      },
      categoryNameConfig: {
        rules: [{ type: 'string', required: true, message: '输入的分类名称不能为空哦' }],
        initialValue: categoryName || '',
      },
      orderConfig: {
        rules: [{ type: 'string', required: true, message: '输入的排序不能为空哦' }],
        initialValue: order || '',
      },
      labelNameConfig: {
        rules: [{ type: 'string', required: true, message: '输入的标签名称不能为空哦' }],
        initialValue: labelName || '',
      },
    };

    const paginationProps = {
      pageSize: 10,
      total,
      onChange: page => {
        this.setState({
          currentPage: page,
        });
        this.getList(page);
      },
    };

    const ListHeader = () => (
      <div className={styles.flexHeader}>
        <div className={styles.listHeader}>
          <span className={styles.listContentItem}>排序</span>
          <span className={styles.listContentItem}>分类名称</span>
          <span className={styles.listContentItem}>展现形式</span>
          {/* <span className={styles.listContentItem}>关联标签</span> */}
          <span className={styles.listContentItem}>内容数</span>
          <span className={styles.listContentItem}>操作</span>
        </div>
      </div>
    );

    const OperationBtn = item => (
      <div className={styles.listContentItem}>
        <Button className={styles.listBtn} onClick={() => this.edit(item)}>
          编辑
        </Button>
        {/* <Button className={styles.listBtn} onClick={() => this.addLabel(item)}>添加标签</Button> */}
        <Button
          type={item.data.category_status == '0' ? 'danger' : 'primary'}
          className={styles.listBtn}
          onClick={() => this.downline(item.data.category_id, item.data.category_status)}
        >
          {item.data.category_status == '0' ? '上线' : '下线'}
        </Button>
        <Button className={styles.listBtn} onClick={() => this.del(item.data.category_id)}>
          删除
        </Button>
      </div>
    );

    const ListContent = ({ data }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <p>{Number(data.category_sort)}</p>
        </div>
        <div className={styles.listContentItem}>
          <p lines={2}>{data.category_name}</p>
        </div>
        <div className={styles.listContentItem}>
          <p lines={2}>{data.show_style == '0' ? '信息流' : '瀑布流'}</p>
        </div>
        {/* <div className={styles.listContentItem}>
                    <p lines={2}>{data.label ? data.label : '无'}</p>
                </div> */}
        <div className={styles.listContentItem}>
          <p lines={2}>{data.num}</p>
        </div>
        <OperationBtn data={data} />
      </div>
    );
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="分类列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            // extra={extraContent}
          >
            <Button
              type="dashed"
              onClick={() => this.show_Category()}
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
            >
              添加分类
            </Button>
            <ListHeader />
            <List
              rowKey="id"
              pagination={paginationProps}
              dataSource={list}
              renderItem={item => (
                <List.Item>
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
        {/* 添加或修改分类弹窗 */}
        <Modal
          title={this.state.addTitle}
          visible={this.state.show_a_e_Category}
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
            {this.state.addTitle == '添加分类' ? (
              ''
            ) : (
              <FormItem className={styles.hidden}>
                {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input />)}
              </FormItem>
            )}
            <FormItem label="分类名称">
              {getFieldDecorator('name', FormCheck.categoryNameConfig)(
                <Input placeholder="请输入分类名称" />
              )}
            </FormItem>
            <FormItem label="排序">
              {getFieldDecorator('order', FormCheck.orderConfig)(
                <Input placeholder="请输入排序" />
              )}
            </FormItem>
            <FormItem label="展现形式">
              {getFieldDecorator('show_style', { initialValue: form })(
                <RadioGroup onChange={this.selectForm}>
                  <Radio value="0">信息流</Radio>
                  <Radio value="1">瀑布流</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 标签弹窗 */}
        {/* <Modal
                    title='关联标签'
                    visible={this.state.show_addLabel}
                    footer={[
                        <Button key="back" onClick={() => this.handleCancel(false)}>取消</Button>,
                        <Button key="submit" type="primary" onClick={() => this.submitLabel()}>确定添加</Button>,]}
                    onCancel={() => this.handleCancel(false)}
                >
                    <Form>
                        <FormItem
                            className={styles.hidden}
                        >
                            {getFieldDecorator('id', FormCheck.idConfig)(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            label="标签名称"
                        >
                            {getFieldDecorator('labelName', FormCheck.labelNameConfig)(
                                <Input placeholder='请输入标签名称' />
                            )}
                        </FormItem>
                    </Form>
                    <div>
                        <p>已有标签:</p>
                        {tag_list.map((item, index) => {
                            const tagElem = (
                                <Tag className={styles.tag} key={item.name} color="#108ee9" closable afterClose={() => this.closeTag(item.name)}>
                                    {item.name}
                                </Tag>
                            );
                            return tagElem;
                        })}
                    </div>
                </Modal> */}
      </PageHeaderLayout>
    );
  }
}
