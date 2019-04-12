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

import styles from './Shutup.less';

const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ shutup, global = {}, loading }) => ({
    shutup,
    loading: loading.models.test,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        id: '',
        day: '',
        reason: '',
        show: false,
        search_uid: '',
    };

    componentDidMount() {
        this.getList();
        // console.log(this.props.decoration)
    }

    getList(page = 1, size = 10) {
        const { dispatch } = this.props;
        dispatch({
            type: 'shutup/getList',
            payload: {
                page,
                size,
                search_uid: this.state.search_uid
            },
        });
        // this.refreshUploadToken()
    }

    //
    openReview(e) {
        this.setState({
            show: true,
        })
    }
    submit() {
        this.props.form.validateFields((err, fieldsValue) => {
            const postObj = {
                uid: fieldsValue.id,
                days: fieldsValue.day,
                reason: fieldsValue.reason,
            };
            this.props
                .dispatch({
                    type: 'shutup/shutupAdd',
                    payload: postObj,
                })
                .then(res => {
                    if (res.code == 200) {
                        this.setState({
                            show: false,
                            id: '',
                            day: '',
                            reason: '',
                        });
                        message.success(res.message);
                        this.getList();
                    } else {
                        message.error(res.message);
                    }
                });
        })

    }
    shutupRelieve = id => {
        let _this = this;
        Confirm({
            title: '确定取消该用户的禁言',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props.dispatch({
                    type: 'shutup/shutupRelieve',
                    payload: { id: id },
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
    handleCancel = e => {
        this.setState({
            show: false,
            id: '',
            day: '',
            reason: '',
        })
    }
    searchFun = val => {
        console.log(1233)
        this.setState({
            search_uid: val,
        }, () => this.getList(1))
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { total, list } = this.props.shutup;
        const { id, day, reason, search_uid } = this.state;
        const Search = Input.Search;
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

        const FormCheck = {
            idConfig: {
                rules: [{ type: 'string', required: true, message: '输入的用户id不能为空哦' }],
                initialValue: id || '',
            },
            dayConfig: {
                rules: [
                    { type: 'string', required: true, message: '输入的天数不能为空哦' },
                ],
                initialValue: day || '',
            },
            reasonConfig: {
                rules: [{ type: 'string', required: true, message: '输入的理由不能为空哦' }],
                initialValue: reason || '',
            },
        };
        const ListHeader = () => (
            <div className={styles.flexHeader}>
                <div className={styles.listHeader}>
                    <span className={styles.listContentItem}>用户id</span>
                    <span className={styles.listContentItem}>用户名称</span>
                    <span className={styles.listContentItem}>原因</span>
                    <span className={styles.listContentItem}>禁言天数</span>
                    <span className={styles.listContentItem}>过期时间</span>
                    <span className={styles.listContentItem}>过期状态</span>
                    <span className={styles.listContentItem}>操作</span>
                </div>
            </div>
        );

        const OperationBtn = item => (
            <div className={styles.listContentItem}>
                {/* <Button className={styles.listBtn} onClick={() => this.addLabel(item)}>添加标签</Button> */}
                <Button
                    type='danger'
                    disabled={item.data.is_outdate}
                    className={styles.listBtn}
                    onClick={() => this.shutupRelieve(item.data.id)}
                >
                    取消禁言
                </Button>

            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <p>{data.uid}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.user_name}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.reason}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.days}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{moment(Number(data.expired_time * 1000)).format('YYYY-MM-DD HH:mm:ss')}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.is_outdate ? '已过期' : '未过期'}</p>
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
                        title="禁言列表"
                        style={{ marginTop: 24 }}
                        bodyStyle={{ padding: '0 32px 40px 32px' }}
                    // extra={extraContent}
                    >
                        <Button
                            type="dashed"
                            onClick={() => this.openReview()}
                            style={{ width: '100%', marginBottom: 8 }}
                            icon="plus"
                        >
                            添加禁言
                        </Button>
                        <div className={styles.menubox}>
                            <Search
                                className={styles.SearchBox}
                                placeholder="用户id"
                                onSearch={this.searchFun}
                                enterButton
                                style={{ width: '200px', marginBottom: '20px' }}
                            />
                        </div>
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
                <Modal
                    title='禁言'
                    visible={this.state.show}
                    destroyOnClose
                    footer={[
                        <Button key="back" onClick={() => this.handleCancel(false)}>
                            取消
            </Button>,
                        <Button key="submit" type="primary" onClick={() => this.submit()}>
                            添加
            </Button>,
                    ]}
                    onCancel={() => this.handleCancel(false)}
                >
                    <Form>
                        <FormItem label="用户id" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input placeholder="请输入禁言的用户id" />)}
                        </FormItem>
                        <FormItem label="禁言理由" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('reason', FormCheck.reasonConfig)(
                                <Input placeholder="请输入禁言理由" />
                            )}
                        </FormItem>
                        <FormItem label="禁言天数" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('day', FormCheck.dayConfig)(
                                <Input placeholder="请输入禁言天数" />
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </PageHeaderLayout>
        );
    }
}
