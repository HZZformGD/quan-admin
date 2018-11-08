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

import styles from './Report.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ report, global = {}, loading }) => ({
    report,
    loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        id: '',
    };

    componentDidMount() {
        this.getList();
        // console.log(this.props.decoration)
    }

    getList(page = 1, size = 10) {
        const { dispatch } = this.props;
        dispatch({
            type: 'report/getList',
            payload: {
                page,
                size,
            },
        });
        // this.refreshUploadToken()
    }

    // 下线分类
    downline(id, status) {
        const _this = this;
        const title = status == '0' ? '是否恢复该评论？' : '是否将该评论禁言？';
        status = status == '0' ? '1' : '0';
        Confirm({
            title: title,
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props.dispatch({
                    type: 'report/statusReport',
                    payload: { report_id:id, status },
                }).then(res => {
                    if (res.code == 200) {
                        message.success(res.message);
                        _this.getList();
                    } else {
                        message.error(res.message);
                    }
                });
            },
            onCancel() { },
        });
    }

    render() {
        const { total, list } = this.props.report;
        const { id } = this.state;
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
                    <span className={styles.listContentItem}>评论内容</span>
                    <span className={styles.listContentItem}>评论人</span>
                    <span className={styles.listContentItem}>举报人</span>
                    <span className={styles.listContentItem}>举报时间</span>
                    <span className={styles.listContentItem}>操作</span>
                </div>
            </div>
        );

        const OperationBtn = item => (
            <div className={styles.listContentItem}>
                {/* <Button className={styles.listBtn} onClick={() => this.addLabel(item)}>添加标签</Button> */}
                <Button
                    type={item.data.ifcheck == '0' ? 'danger' : 'primary'}
                    className={styles.listBtn}
                    onClick={() => this.downline(item.data.comment_id, item.data.ifcheck)}
                >
                    {item.data.ifcheck == '0' ? '取消审核' : '审核'}
                </Button>

            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <p>{data.comment}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.reviewer.name}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.reporter.name}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{moment(Number(data.dateline*1000)).format('YYYY-MM-DD HH:mm:ss')}</p>
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
                        title="评论举报列表"
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
