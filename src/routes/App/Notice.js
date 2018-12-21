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
    Select,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Notice.less';

const Option = Select.Option;
const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ notice, global = {}, loading }) => ({
    notice,
    loading: loading.models.test,
    uploadToken: global.uploadToken,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        addTitle: '添加弹窗',
        show_a_e_Category: false,
        show_addLabel: false,
        show_delCategory: false,
        id: '',
        notice_type: "",
        event_type: "",
        jump_type: "",
        data: '',
        jump_data:'',
        title:'',
        currentPage: 1,
        if_again: true,
        fileList: [],
        end_at: moment(moment().format("YYYY-MM-DD")),
        begin_at: moment(moment().format("YYYY-MM-DD")),
        list_type: '',
    };

    componentDidMount() {
        this.getList();
        // console.log(this.props.decoration)
    }

    getList(page = 1, size = 10, title = '', notice_type = this.state.list_type) {
        const { dispatch } = this.props;
        dispatch({
            type: 'notice/getList',
            payload: {
                page,
                size,
                title,
                notice_type
            },
        });
        this.refreshUploadToken()
    }

    refreshUploadToken() {
        this.props.dispatch({
            type: 'global/fetchUploadToken',
        });
    }

    // 显示添加弹窗弹窗
    show_Category() {
        this.setState({
            show_a_e_Category: true,
            addTitle: '添加弹窗',
        });
    }

    // 添加或修改弹窗提交
    submitCategory = e => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log(fieldsValue);
            let { cover, event_type, notice_type, jump_type, program } = this.state;
            const postObj = {
                title: fieldsValue.title,
                cover,
                notice_type,
                jump_type,
                event_type,
                begin_at: parseInt(fieldsValue.begin_at.valueOf() / 1000),
                end_at: parseInt(fieldsValue.end_at.valueOf() / 1000),
            };
            if (jump_type == '10') {
                postObj.jump_data = JSON.stringify({
                    path: fieldsValue.jump_data,
                    userName: program,
                    type: '0',
                })
            }else{
                postObj.jump_data = fieldsValue.jump_data
            }
            let url = 'notice/addNotice';
            if (fieldsValue.id) {
                postObj.id = fieldsValue.id;
                url = 'notice/editNotice';
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
                        this.handleCancel();
                        if (jump_type == '10') {
                            postObj.jump_data = JSON.stringify({
                                path: fieldsValue.jump_data,
                                userName: program,
                                type: '0',
                            })
                        }
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
            title: '',
            begin_at: '',
            end_at: '',
            jump_type: '',
            jump_data: '',
            event_type: '',
            notice_type: '',
            fileList: [],
            cover: '',
        });
    };

    // 编辑弹窗
    edit(e) {
        let { data: { id, title: title, begin_at, end_at, cover, jump_type, event_type, notice_type, jump_data } } = e;
        const obj = {
            uid: '-1',
            status: 'done',
            url: cover,
        };
        let program = '';
        if (jump_type == '10') {
            let data = JSON.parse(jump_data)
            console.log(data)
            jump_data = data.path;
            program = data.userName
        }
        const fileList = [obj];
        this.setState({
            show_a_e_Category: true,
            addTitle: '修改弹窗',
            id,
            title,
            fileList,
            begin_at: moment(moment(begin_at * 1000).format("YYYY-MM-DD")),
            end_at: moment(moment(end_at * 1000).format("YYYY-MM-DD")),
            notice_type,
            event_type,
            jump_type,
            jump_data,
            cover,
            program,
        });
    }

    // 下线弹窗
    downline(id, status) {
        status = status == '1' ? '2' : '1';
        this.props
            .dispatch({
                type: 'notice/statusNotice',
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

    // 删除弹窗
    del(id) {
        const _this = this;
        const status = 3;
        Confirm({
            title: `确定把该信息下全部弹窗内容删除吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props
                    .dispatch({
                        type: 'notice/statusNotice',
                        payload: { id, status },
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
            onCancel() { },
        });
    }

    handleChange(e) {
        const { fileList, file } = e;
        let cover = '';
        if (fileList.length && file.status == 'done') {
            cover = fileList[0].response.full_url;
            fileList[0].url = fileList[0].response.full_url;
        }

        this.setState({ fileList, cover });
    }
    typeChange = e => {
        this.setState({
            list_type: e,
        })
    }
    searchFun = val => {
        // console.log(val)
        this.setState({
            currentPage: 1
        })
        this.getList(1, 10, val);
    };

    select_notice_type = e => {
        this.setState({
            notice_type: e,
        });
    }

    select_event_type = e => {
        this.setState({
            event_type: e,
        });
    }

    select_jump_type = e => {
        this.setState({
            jump_type: e,
        });
    }
    select_program = e => {
        this.setState({
            program: e
        })
    }
    render() {
        const { uploadToken } = this.props;
        const { total, list, wxAppList } = this.props.notice;
        const { id, fileList, title, notice_type, event_type, jump_type, begin_at, end_at, currentPage, program, jump_data } = this.state;
        const { getFieldDecorator } = this.props.form;
        const RadioGroup = Radio.Group;
        const Search = Input.Search;
        const FormCheck = {
            idConfig: {
                initialValue: id || 0,
            },
            nameConfig: {
                rules: [{ type: 'string', required: true, message: '输入的弹窗名称不能为空哦' }],
                initialValue: title || '',
            },
            startTimeConfig: {
                rules: [{ required: true, message: '开始时间不能为空哦' }],
                initialValue: begin_at || '',
            },
            endTimeConfig: {
                rules: [{ required: true, message: '结束时间不能为空哦' }],
                initialValue: end_at || '',
            },
        };

        const paginationProps = {
            pageSize: 10,
            total,
            current: currentPage,
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
                    <span className={styles.listContentItem}>弹窗描述</span>
                    <span className={styles.listContentItem}>背景图</span>
                    <span className={styles.listContentItem}>弹窗时间</span>
                    <span className={styles.listContentItem}>弹窗事件</span>
                    <span className={styles.listContentItem}>跳转类型</span>
                    <span className={styles.listContentItem}>跳转数据</span>
                    <span className={styles.listContentItem}>点击数</span>
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
                    type={item.data.status == '2' ? 'danger' : 'primary'}
                    className={styles.listBtn}
                    onClick={() => this.downline(item.data.id, item.data.status)}
                >
                    {item.data.status == '2' ? '上线' : '下线'}
                </Button>
                <Button className={styles.listBtn} onClick={() => this.del(item.data.id)}>
                    删除
        </Button>
            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent} key={data}>
                <div className={styles.listContentItem}>
                    <p>{data.title}</p>
                </div>
                <div className={styles.listContentItem}>
                    <img src={data.cover} />
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{moment(Number(data.begin_at * 1000)).format('YYYY-MM-DD')}</p>
                    <p lines={2}>{moment(Number(data.end_at * 1000)).format('YYYY-MM-DD')}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.event_type == '1' ? '时间段内第一次启动提示' : data.event_type == '2' ? '时间段内每日第一次启动提示' : '根据参数提示'}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.notice_type == '1' ? '更新提醒' : data.notice_type == '2' ? '消息开启提醒' : '跳转'}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.jump_data ? data.jump_type != '10' ? data.jump_data : (JSON.parse(data.jump_data)).path : '无'}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.click_num}</p>
                </div>
                <OperationBtn data={data} />
            </div>
        );

        const typeArr = [
            { name: '更新提醒', value: "1" },
            { name: '消息开启提醒', value: "2" },
            { name: '跳转', value: "3" },

        ]

        const selectBefore = (
            <Select className={styles.beforeSearch} defaultValue="弹窗类型" onChange={this.typeChange} style={{ width: 120 }}>
                {typeArr.map((item) => <Option value={item.value} key={item.value}>{item.name}</Option>)}
            </Select>
        );

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传</div>
            </div>
        );

        return (
            <PageHeaderLayout>
                <div className={styles.standardList}>
                    <Card
                        className={styles.listCard}
                        bordered={false}
                        title="弹窗列表"
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
                            添加弹窗
            </Button>
                        <div className={styles.menubox}>
                            <Search
                                addonBefore={selectBefore}
                                className={styles.SearchBox}
                                placeholder="输入弹窗描述"
                                onSearch={this.searchFun}
                                enterButton
                            />
                            <p className={styles.check} className={styles.totalnum}>弹窗总数：{total}</p>
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
                {/* 添加或修改弹窗弹窗 */}
                <Modal
                    title={this.state.addTitle}
                    visible={this.state.show_a_e_Category}
                    destroyOnClose
                    footer={[
                        <Button key="back" onClick={() => this.handleCancel(false)}>
                            取消
            </Button>,
                        <Button key="submit" type="primary" onClick={() => this.submitCategory()}>
                            提交
            </Button>,
                    ]}
                    onCancel={() => this.handleCancel(false)}
                >
                    <Form>
                        {this.state.addTitle == '添加弹窗' ? (
                            ''
                        ) : (
                                <FormItem className={styles.hidden} style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input />)}
                                </FormItem>
                            )}
                        <FormItem label="弹窗描述" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('title', FormCheck.nameConfig,{initialValue:title})(
                                <Input placeholder="请输入弹窗描述" />
                            )}
                        </FormItem>
                        <FormItem label="背景图（610*768）" style={{ marginBottom: 0 }}>
                            <Upload
                                action="http://upload.qiniup.com"
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={this.handlePreview}
                                onChange={this.handleChange.bind(this)}
                                data={{ token: uploadToken }}
                                beforeUpload={this.beforeUpload}
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                        </FormItem>
                        <FormItem label="弹窗类型" style={{ marginBottom: 0 }}>
                            <Select defaultValue={notice_type} style={{ width: 250 }} onChange={this.select_notice_type}>
                                <Option key="1" value="1">更新提醒</Option>
                                <Option key="2" value="2">消息开启提醒</Option>
                                <Option key="3" value="3">跳转</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="开始时间" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('begin_at', FormCheck.startTimeConfig)(
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    placeholder="开始时间"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="结束时间" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('end_at', FormCheck.endTimeConfig)(
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    placeholder="结束时间"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="弹窗事件" style={{ marginBottom: 0 }}>
                            <Select defaultValue={event_type} style={{ width: 250 }} onChange={this.select_event_type}>
                                <Option value="1">时间段内第一次启动提示</Option>
                                <Option value="2">时间段内每日第一次启动提示</Option>
                                <Option value="3">根据参数提示</Option>

                            </Select>
                        </FormItem>
                        {event_type == 3 ? (
                            [<FormItem label="跳转类型" style={{ marginBottom: 0 }}>
                                <Select defaultValue={jump_type} style={{ width: 250 }} onChange={this.select_jump_type}>
                                    <Option value="0">通用链接(公众号,精选文章)</Option>
                                    <Option value="1">板块</Option>
                                    <Option value="2">栏目</Option>
                                    <Option value="3">圈子</Option>
                                    <Option value="4">摇一摇</Option>
                                    <Option value="5">更多活动</Option>
                                    <Option value="6">Po详情</Option>
                                    <Option value="7">Po话题</Option>
                                    <Option value="8">个人中心</Option>
                                    <Option value="9">帖子</Option>
                                    <Option value="10">小程序</Option>
                                    <Option value="11">Po标签</Option>
                                    <Option value="12">Po分类</Option>
                                </Select>
                            </FormItem>,
                            <FormItem label="跳转类型数据" style={{ marginBottom: 0 }}>
                                {getFieldDecorator('jump_data',{ initialValue: jump_data })(
                                    <Input placeholder="请根据类型填写对应的数据" />
                                )}
                            </FormItem>]) : ('')}
                        {jump_type == '10' ? <FormItem label="小程序" style={{ marginBottom: 0 }}>
                            <Select defaultValue={program} style={{ width: 250 }} onChange={this.select_program}>
                                {wxAppList.map((val, index) =>
                                    <Option key={val.name} value={val.original_id}>{val.name}</Option>
                                )}
                            </Select>
                        </FormItem> : ''}

                    </Form>

                </Modal>
            </PageHeaderLayout>
        );
    }
}
