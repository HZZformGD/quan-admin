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
    InputNumber,
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Startup.less';

const Option = Select.Option;
const FormItem = Form.Item;
const Confirm = Modal.confirm;

const { TextArea } = Input;

@connect(({ startup, global = {}, loading }) => ({
    startup,
    loading: loading.models.test,
    uploadToken: global.uploadToken,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        addTitle: '添加启动页',
        show_a_e_Category: false,
        aid: '',
        notice_type: "",
        event_type: "",
        type: "",
        start_at:'',
        end_at: '',
        data: '',
        data: '',
        title: '',
        position: '',
        currentPage: 1,
        if_again: true,
        fileList: [],
        list_type: '',
        from_outside: '0',
        button_desc: '',
        image_type:'',
        second:1,
    };

    componentDidMount() {
        this.getList();
        // console.log(this.props.decoration)
    }

    getList(page = 1, size = 10,) {
        const { dispatch } = this.props;
        dispatch({
            type: 'startup/getList',
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
            payload: {
                bucket: 'bbsimg'
            }
        });
    }

    // 显示添加弹窗
    show_Category() {
        this.setState({
            show_a_e_Category: true,
            addTitle: '添加启动图',
        });
    }

    // 添加或修改弹窗提交
    submitCategory = e => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log(fieldsValue);
            let { image, type, program,po_type,second,image_type } = this.state;
            console.log(fieldsValue.expired_at)
            const postObj = {
                title: fieldsValue.title,
                image,
                image_type,
                type,
                start_at: fieldsValue.start_at ? parseInt(fieldsValue.start_at.valueOf() / 1000) : '',
                end_at: fieldsValue.end_at ? parseInt(fieldsValue.end_at.valueOf() / 1000) : '',
                second,
            };
            if (type == '10') {
                postObj.data = JSON.stringify({
                    path: fieldsValue.data,
                    userName: program,
                    type: '0',
                })
            } else if(type == '6'){
                postObj.data = JSON.stringify({
                    po_id: fieldsValue.data,
                    po_type,
                })
            } else {
                postObj.data = fieldsValue.data
            }
            if (this.state.aid) {
                postObj.aid = this.state.aid
            }
            this.props
                .dispatch({
                    type: 'startup/editStartUp',
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
                        if (type == '10') {
                            postObj.data = JSON.stringify({
                                path: fieldsValue.data,
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
            aid: '',
            title: '',
            type: '',
            data: '',
            fileList: [],
            image: '',
            image_type:'',
        });
    };

    // 编辑弹窗
    edit(e) {
        let { data: { aid, button_desc, title, position, image, type, data, from_outside, end_at,start_at,second,image_type } } = e;
        const obj = {
            uid: '-1',
            status: 'done',
            url: image,
        };
        let program = '';
        if (type == '10') {
            let data1 = JSON.parse(data)
            console.log(data1)
            data = data1.path;
            program = data.userName
        }
        let po_type = '';
        if(type == '6'){
            let data1 = JSON.parse(data)
            console.log(data1)
            data = data1.po_id;
            po_type = data1.po_type
        }
        const fileList = [obj];
        this.setState({
            show_a_e_Category: true,
            addTitle: '修改弹窗',
            aid,
            title,
            fileList,
            type,
            data,
            image,
            program,
            start_at: start_at ? moment(moment(start_at * 1000).format("YYYY-MM-DD")) : '',
            end_at: end_at ? moment(moment(end_at * 1000).format("YYYY-MM-DD")) : '',
            image_type,
            second,
            po_type,
        });
    }

    // 下线弹窗
    downline(aid, status) {
        status = status == '1' ? '2' : '1';
        this.props
            .dispatch({
                type: 'startup/statusStartUp',
                payload: { aid, status },
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
    del(aid) {
        const _this = this;
        const status = 3;
        Confirm({
            title: `确定把该启动页内容删除吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props
                    .dispatch({
                        type: 'startup/statusStartUp',
                        payload: { aid, status },
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
        
        let image = '';
        let image_type = '';
        if (fileList.length && file.status == 'done') {
            image = fileList[0].response.full_url;
            image_type = fileList[0].type.split("/")[1];
            console.log(image_type)
            fileList[0].url = fileList[0].response.full_url;
        }

        this.setState({ fileList, image,image_type });
    }
    typeChange = e => {
        this.setState({
            list_type: e,
        })
    }

    select_type = e => {
        this.setState({
            type: e,
        });
    }
    select_program = e => {
        this.setState({
            program: e
        })
    }
    select_po_type = e=>{
        this.setState({
            po_type: e
        })
    }
    changeSecond = e =>{
        this.setState({
            second:e
        })
    }
    render() {
        const { uploadToken } = this.props;
        const { total, list, wxAppList } = this.props.startup;
        const { aid, fileList, title, type, currentPage, program,po_type, data, start_at,end_at,second } = this.state;
        const { getFieldDecorator } = this.props.form;
        const RadioGroup = Radio.Group;
        const Search = Input.Search;
        const FormCheck = {
            idConfig: {
                initialValue: aid || 0,
            },
            nameConfig: {
                rules: [{ type: 'string', required: true, message: '输入的启动页描述不能为空哦' }],
                initialValue: title || '',
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
                    <span className={styles.listContentItem}>标题</span>
                    <span className={styles.listContentItem}>启动图片</span>
                    {/* <span className={styles.listContentItem}>秒数</span>
                    <span className={styles.listContentItem}>跳转类型</span>
                    <span className={styles.listContentItem}>跳转数据</span> */}
                    <span className={styles.listContentItem}>开始时间</span>
                    <span className={styles.listContentItem}>结束时间</span>
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
                    onClick={() => this.downline(item.data.aid, item.data.status)}
                >
                    {item.data.status == '2' ? '上线' : '下线'}
                </Button>
                <Button className={styles.listBtn} onClick={() => this.del(item.data.aid)}>
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
                    <img src={data.image} />
                </div>
                {/* <div className={styles.listContentItem}>
                    <p>{data.position}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.type}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.data ? data.type != '10' ? data.data : (JSON.parse(data.data)).path : '无'}</p>
                </div> */}
                <div className={styles.listContentItem}>
                    <p lines={2}>{moment(Number(data.start_at * 1000)).format('YYYY-MM-DD')}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{moment(Number(data.end_at * 1000)).format('YYYY-MM-DD')}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.click_num}</p>
                </div>
                <OperationBtn data={data} />
            </div>
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
                        title="启动页列表"
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
                            添加启动页
                            </Button>

                        <ListHeader />
                        <List
                            rowKey="aid"
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
                        {this.state.addTitle == '添加启动页' ? (
                            ''
                        ) : (
                                <FormItem className={styles.hidden} style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('aid', FormCheck.idConfig, { initialValue: aid })(<Input />)}
                                </FormItem>
                            )}
                        <FormItem label="标题" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('title', FormCheck.nameConfig, { initialValue: title })(
                                <Input placeholder="请输入启动页描述" />
                            )}
                        </FormItem>
                        <FormItem label="启动图" style={{ marginBottom: 0 }}>
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
                            <p style={{ color: 'red',fontWeight: 'bold', }}>*图片尺寸1949 2436  主体内容居中，在两侧412px内</p>
                        </FormItem>
                        <FormItem label="开始时间" style={{ marginBottom: 0 }}>

                            {getFieldDecorator('start_at', { initialValue: start_at })(
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    placeholder="到期时间"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="结束时间" style={{ marginBottom: 0 }}>

                            {getFieldDecorator('end_at', { initialValue: end_at })(
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    placeholder="到期时间"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="秒数" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('second', { initialValue: second })(
                                <InputNumber onChange={this.changeSecond} min={1} max={10} />
                            )}
                        </FormItem>
                        <FormItem label="跳转类型" style={{ marginBottom: 0 }}>
                            <Select defaultValue={type} style={{ width: 250 }} onChange={this.select_type}>
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
                                <Option value="100">客户端默认跳转</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="跳转类型数据" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('data', { initialValue: data })(
                                <Input placeholder="请根据类型填写对应的数据" />
                            )}
                        </FormItem>
                        {type == '6' ? <FormItem label="Po详情类型" style={{ marginBottom: 0 }}>
                            <Select defaultValue={po_type} style={{ width: 250 }} onChange={this.select_po_type}>
                            <Option value="1">图片</Option>
                            <Option value="2">小程序</Option>
                            </Select>
                        </FormItem> : ''}
                        {type == '10' ? <FormItem label="小程序" style={{ marginBottom: 0 }}>
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
