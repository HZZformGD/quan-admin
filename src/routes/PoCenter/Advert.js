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

import styles from './Advert.less';
const Option = Select.Option;
const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ advert, global = {}, loading }) => ({
    advert,
    loading: loading.models.test,
    uploadToken: global.uploadToken,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        addTitle: '添加广告',
        id: '',
        content: '',
        currentPage: 1,
        fileList: [],
        end_time: moment(moment().format("YYYY-MM-DD HH:mm:ss")),
        up_time: '',
        ad_type: '0',
        program: '',
        data: '',
    };

    componentDidMount() {
        this.getList();
        // console.log(this.props.decoration)
    }

    getList(page = 1, size = 10) {
        const { dispatch } = this.props;
        dispatch({
            type: 'advert/getList',
            payload: {
                page,
                size,
            },
        });
        this.refreshUploadToken()
    }

    refreshUploadToken() {
        this.props.dispatch({
            type: 'global/fetchUploadToken',
        });
    }

    // 显示添加广告弹窗
    show_Category() {
        this.setState({
            show_a_e_Category: true,
            addTitle: '添加广告',
        });
    }

    // 添加或修改广告提交
    submitCategory = e => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log(fieldsValue);
            let { content, data, end_time } = fieldsValue;
            let { cover, ad_type, program } = this.state;
            const postObj = {
                content,
                data,
                cover,
                type: ad_type,
                end_time: parseInt(end_time.valueOf() / 1000),
            };
            if (ad_type == '10') {
                postObj.data = JSON.stringify({
                    path: data,
                    userName: program,
                    type: '0',
                })
            }
            let url = 'advert/addAdvert';
            if (fieldsValue.id) {
                postObj.id = fieldsValue.id;
                url = 'advert/editAdvert';
            }
            this.props.dispatch({
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

    // 关闭弹窗
    handleCancel = e => {
        this.setState({
            show_a_e_Category: false,
            show_addLabel: false,
            show_delCategory: false,
            id: '',
            content: '',
            cover: '',
            data: '',
            end_time: moment(moment().format("YYYY-MM-DD HH:mm:ss")),
            fileList: [],
            ad_type: ''
        });
    };

    // 编辑分类
    edit(e) {
        let { data: { id, cover, end_time, content, data, type } } = e;
        const obj = {
            uid: '-1',
            status: 'done',
            url: cover,
        };
        const fileList = [obj];
        if (end_time != '0') {
            end_time = moment(moment(end_time * 1000).format("YYYY-MM-DD HH:mm:ss"));
        } else {
            end_time = '';
        }
        if (type == '10') {
            data = JSON.parse(data).path
        }
        this.setState({
            show_a_e_Category: true,
            addTitle: '修改广告',
            id,
            content,
            cover,
            data,
            end_time,
            fileList,
            ad_type: String(type)
        });
    }

    // 下线广告
    downline(id, status) {
        status = status == '0' ? '1' : '0';
        this.props.dispatch({
            type: 'advert/statusAdvert',
            payload: { id: id, status },
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

    // 删除广告
    del(id) {
        const _this = this;
        Confirm({
            title: `删除会把该信息下全部内容置为空确定删除吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props.dispatch({
                    type: 'advert/statusAdvert',
                    payload: { id: id, status: -1 },
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
    beforeUpload = file => {
        const isLt4M = file.size / 1024 / 1024 < 4;
        if (!isLt4M) {
            message.error('图片上传不能超过4M！');
        }
        return isLt4M;
    }
    select_type = e => {
        this.setState({
            ad_type: e
        })
    }
    select_program = e => {
        this.setState({
            program: e
        })
    }
    render() {
        const { total, list, wxAppList } = this.props.advert;
        const { content, id, fileList, end_time, data, up_time, ad_type, program } = this.state;
        const { uploadToken } = this.props;
        const { getFieldDecorator } = this.props.form;
        const RadioGroup = Radio.Group;
        const FormCheck = {
            idConfig: {
                initialValue: id || 0,
            },
            contentConfig: {
                rules: [{ type: 'string', required: true, message: '输入的分类名称不能为空哦' }],
                initialValue: content || '',
            },
            dateConfig: {
                initialValue: end_time || moment(moment().format("YYYY-MM-DD HH:mm:ss")),
            },
            dataConfig: {
                initialValue: data || '',
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
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传</div>
            </div>
        );
        const ListHeader = () => (
            <div className={styles.flexHeader}>
                <div className={styles.listHeader}>
                    <span className={styles.listContentItem}>广告内容</span>
                    <span className={styles.listContentItem}>封面图</span>
                    <span className={styles.listContentItem}>上线时间</span>
                    <span className={styles.listContentItem}>下线时间</span>
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
                    type={item.data.category_status == '0' ? 'danger' : 'primary'}
                    className={styles.listBtn}
                    onClick={() => this.downline(item.data.id, item.data.status)}
                >
                    {item.data.status == '0' ? '上线' : '下线'}
                </Button>
                <Button className={styles.listBtn} onClick={() => this.del(item.data.id)}>
                    删除
        </Button>
            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <p>{data.content}</p>
                </div>
                <div className={styles.listContentItem}>
                    {data.cover ? (
                        <img src={data.cover} className={styles.logoUrl} />
                    ) : (
                            '无'
                        )}
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.created_at ? moment(Number(data.created_at * 1000)).format('YYYY-MM-DD HH:mm:ss') : '无'}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.end_time ? moment(Number(data.end_time * 1000)).format('YYYY-MM-DD HH:mm:ss') : '无'}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.num ? data.num : '暂无'}</p>
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
                        title="广告列表"
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
                            添加广告
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
                        {this.state.addTitle == '添加广告' ? (
                            ''
                        ) : (
                                <FormItem className={styles.hidden}>
                                    {getFieldDecorator('id', FormCheck.idConfig, { initialValue: id })(<Input />)}
                                </FormItem>
                            )}
                        <FormItem label="广告内容" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('content', FormCheck.contentConfig)(
                                <Input placeholder="请输入广告内容" />
                            )}
                        </FormItem>
                        <FormItem label="广告类型" style={{ marginBottom: 0 }}>
                            <Select defaultValue={ad_type} style={{ width: 250 }} onChange={this.select_type}>
                                <Option value="0">通用链接(公众号,精选文章)</Option>
                                <Option value="1">板块</Option>
                                <Option value="2">栏目</Option>
                                <Option value="3">圈子</Option>
                                <Option value="4">摇一摇</Option>
                                <Option value="5">更多活动</Option>
                                <Option value="6">预留,不支持</Option>
                                <Option value="7">Po话题</Option>
                                <Option value="8">个人中心</Option>
                                <Option value="9">帖子</Option>
                                <Option value="10">小程序</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="数据" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('data', FormCheck.dataConfig)(
                                <Input placeholder="请根据广告类型填写对应的数据" />
                            )}
                        </FormItem>
                        {ad_type == '10' ? <FormItem label="小程序" style={{ marginBottom: 0 }}>
                            <Select defaultValue={program} style={{ width: 250 }} onChange={this.select_program}>
                                {wxAppList.map((val,index) =>
                                    <Option key={index} value={val.original_id}>{val.name}</Option>
                                )}
                            </Select>
                        </FormItem> : ''}
                        <FormItem label="下线时间" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('end_time', FormCheck.dateConfig)(
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="到期时间，可不填"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="广告封面图" style={{ marginBottom: 0 }}>
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
                    </Form>
                </Modal>
            </PageHeaderLayout>
        );
    }
}
