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

import styles from './Comment.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ comment, global = {}, loading }) => ({
    comment,
    loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        po_id: '',
        categoryName: '',
        order: '',
        form: 'info',
        labelName: '',
        currentPage: 1,
        if_again: true,
    };

    componentDidMount() {
        const { match } = this.props;
        // console.log(match)
        this.setState({
            po_id: match.params.po_id,
        }, );
        console.log(match.params.page)
        localStorage.setItem('go_comment_page',match.params.page)
        this.getList(match.params.po_id);
        // console.log(this.props.decoration)
    }

    getList(id = '', page = 1, size = 10) {
        const { dispatch } = this.props;
        dispatch({
            type: 'comment/getList',
            payload: {
                post_id: id,
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
    edit = (item)=>{
        this.props
        .dispatch({
          type: 'comment/forbidComment',
          payload: {
            id: item.id,
            status:item.ifcheck=='1'?'0':'1'
          },
        })
        .then(res => {
          if (res.code == 200) {
            message.success('设置成功');
            this.getList(this.state.po_id,this.state.page);
          } else {
            message.error(res.message);
          }
        });
    }

    render() {
        const { list, total } = this.props.comment;
        const { categoryName, order, id, form, labelName,po_id } = this.state;

        const { getFieldDecorator } = this.props.form;
        const RadioGroup = Radio.Group;

        const paginationProps = {
            pageSize: 10,
            total,
            onChange: page => {
                this.setState({
                    currentPage: page,
                });
                this.getList(po_id,page);
            },
        };

        const ListHeader = () => (
            <div className={styles.flexHeader}>
                <div className={styles.listHeader}>
                    <span className={styles.listContentItem}>ID</span>
                    <span className={styles.listContentItem}>内容</span>
                    <span className={styles.listContentItem}>评论人</span>
                    <span className={styles.listContentItem}>时间</span>
                    <span className={styles.listContentItem}>状态</span>
                    <span className={styles.listContentItem}>操作</span>
                </div>
            </div>
        );

        const OperationBtn = item => (
            <div className={styles.listContentItem}>
                <Button type={item.data.ifcheck == '1' ? 'danger' : 'primary'} className={styles.listBtn} onClick={() => this.edit(item.data)}>
                    {item.data.ifcheck == '1' ? '屏蔽' : '恢复'}
        </Button>
            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <p>{data.id}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.comment}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.uname}</p>
                </div>
                <div className={styles.listContentItem}>
                    {data.dateline > 0 ? moment(data.dateline * 1000).format('YYYY-MM-DD HH:mm') : ''}
                </div>
                <div className={styles.listContentItem}>
                   {data.ifcheck==1?<Tag color="blue">显示</Tag>:<Tag color="red">隐藏</Tag>}
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

            </PageHeaderLayout>
        );
    }
}
