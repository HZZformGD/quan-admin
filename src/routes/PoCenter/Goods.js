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
    AutoComplete,
    Select,
    Spin
} from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Goods.less';
const Option = Select.Option;
const FormItem = Form.Item;
const Confirm = Modal.confirm;
const { TextArea } = Input;

@connect(({ goods, label, global = {}, loading }) => ({
    goods,
    label,
    loading: loading.models.test,
    uploadToken: global.uploadToken,
}))
@Form.create()
export default class CardList extends PureComponent {
    state = {
        addTitle: '添加商品',
        show_a_e_Goods: false,
        id: '',
        title: '',
        corner:'',
        desc:'',
        labelName: '',//弹窗搜索文本
        label_name: '',//页面搜索文本
        currentPage: 1,
        if_again: true,
        fileList: [],
        cover: '',
        expiry_time: moment(moment().format("YYYY-MM-DD HH:mm:ss")),
        price: 0,
        labelOption: [],
        select_label: [],
        post_label_id: [],
        select_category: [],
        select_tags: [],
        fetching: false
    };

    componentDidMount() {
        const data = this.props.location.query;
        let obj = {}
        if (data) {
            const { id, name } = data;
            obj.id = id;
            obj.labelName = name;
        }
        this.setState(obj, () => this.getList(1, 10, '', ''))
        this.getLabel();
        // console.log(this.props.decoration)
    }
    getList(page = 1, size = 10, label_name = '') {
        const { dispatch } = this.props;
        dispatch({
            type: 'goods/getList',
            payload: {
                page,
                size,
                label_name,
                label_id: this.state.id
            },
        });
        this.refreshUploadToken()
    }
    getLabel(page = 1, searchLabelName = '') {
        const { dispatch } = this.props;
        dispatch({
            type: 'label/getList',
            payload: {
                page,
                size: 10,
                label_name: searchLabelName,
                type: 'content',
            },
        }).then(res => {
            this.setState({
                fetching: false
            });
        });
    }
    refreshUploadToken() {
        this.props.dispatch({
            type: 'global/fetchUploadToken',
        });
    }
    searchFun = val => {
        this.setState({
            id: '',
            labelName: '',
        }, () => this.getList(1, 10, val))
    }
    // 显示添加分类弹窗
    show_Category() {
        this.setState({
            show_a_e_Goods: true,
            addTitle: '添加商品',
        });
    }

    // 添加或修改商品
    submitCategory = e => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            let { cover, post_label_id, select_category, select_tags } = this.state;
            let label_id = ''
            post_label_id.map(val => {
                label_id += val.label_id + ','
            })
            let categoryList = ''
            select_category.map(val => {
                categoryList += val + ','
            })
            let tagsList = '';
            select_tags.map(val => {
                tagsList += val + ','
            })
            const postObj = {
                title: fieldsValue.title,
                miniapp_url: fieldsValue.programAddress,
                h5_url: fieldsValue.h5Address,
                price: fieldsValue.price,
                cover,
                corner:fieldsValue.corner,
                desc:fieldsValue.desc,
                end_time: parseInt(fieldsValue.expiry_time.valueOf() / 1000),
                label_id: label_id.substr(0, label_id.length - 1),
                db_category: categoryList.substr(0, categoryList.length - 1),
                db_tag: tagsList.substr(0, tagsList.length - 1),
            };
            let url = 'goods/addGoods';
            if (fieldsValue.goods_id) {
                postObj.goods_id = fieldsValue.goods_id;
                url = 'goods/editGoods';
            }
            this.props
                .dispatch({
                    type: url,
                    payload: postObj,
                })
                .then(res => {
                    if (res.code == 200) {
                        this.setState({
                            show_a_e_Goods: false,
                            select_label: [],
                            select_category: [],
                            select_tags: [],
                        });
                        message.success(res.message);
                        this.getList();
                    } else {
                        message.error(res.message);
                    }
                });
        });
    };

    handleChange(e) {
        const { fileList, file } = e;
        let cover = '';
        if (fileList.length && file.status == 'done') {
            cover = fileList[0].response.base_url;
            fileList[0].url = fileList[0].response.full_url;
        }

        this.setState({ fileList, cover });
    }
    //数组去重
    unique(arr) {
        // arr.sort(); //数组重新排列
        var _arr = [arr[0]];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].label_name != _arr[_arr.length - 1].label_name) {
                _arr.push(arr[i]);
            }
        }
        return _arr;
    }
    setLabel = e => {
        let { post_label_id, select_label } = this.state;
        e.map(val => {
            this.props.label.checkList.map(value => {
                if (val == value.label) {
                    post_label_id.push({
                        label_id: value.value,
                        label_name: value.label
                    })
                }
            })
        })

        if(post_label_id.length>1){
            post_label_id = this.unique(post_label_id)
        }
        let list = [];
        e.map(val => {
            post_label_id.map(value => {
                if (val == value.label_name) {
                    list.push(value)
                }
            })
        })
        if(list.length>1){
            list = this.unique(list)
        }
        this.setState({
            post_label_id: list,
        })
    }
    fetchLabel = e => {
        this.setState({ fetching: true }, () => this.getLabel(1, e));
    }
    setTags = e => {
        this.setState({
            select_tags: e
        })
    }
    setCategory = e => {
        this.setState({
            select_category: e
        })
    }
    // 关闭弹窗
    handleCancel = e => {
        this.getList(this.state.currentPage);
        this.setState({
            show_a_e_Goods: false,
            show_addLabel: false,
            show_delCategory: false,
            goods_id: '',
            title: '',
            corner:'',
            desc:'',
            select_label: [],
            select_category: [],
            select_tags: [],
            programAddress: '',
            h5Address: '',
            price: '',
            fileList: [],
            labels: [],
            labelOption: [],
            expiry_time: '',
        });
    };

    // 编辑分类
    edit(e) {

        let { data: { goods_id, title, path: programAddress,corner,desc, url: h5Address, price, cover, labels, end_time, category, tag } } = e;
        let { select_label, select_category, select_tags, post_label_id } = this.state;
        const obj = {
            uid: '-1',
            status: 'done',
            url: this.props.label.domain + cover,
        };
        const fileList = [obj];
        if (end_time != '0') {
            end_time = moment(moment(end_time * 1000).format("YYYY-MM-DD HH:mm:ss"));
        } else {
            end_time = '';
        }
        labels.map(val => {
            select_label.push(val.label_name)
        })
        category.map(val => {
            select_category.push(val.value)
        })
        tag.map(val => {
            select_tags.push(val.value)
        })
        post_label_id = labels;
        this.setState({
            show_a_e_Goods: true,
            addTitle: '修改商品',
            goods_id,
            title,
            corner,
            desc,
            post_label_id,
            select_label,
            select_category,
            select_tags,
            programAddress,
            cover,
            h5Address,
            price,
            fileList,
            labels,
            expiry_time: end_time,
        });
    }

    // 添加标签l
    addLabel(e) {
        this.setState({
            show_addLabel: true,
        });
    }

    // 下线商品
    downline(id, status) {
        status = status == '0' ? '1' : '0';
        this.props
            .dispatch({
                type: 'goods/statusGoods',
                payload: { goods_id: id, status },
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

    // 删除商品
    del(id) {
        const _this = this;
        Confirm({
            title: `删除会把该信息下全部内容置为空确定删除吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk() {
                _this.props
                    .dispatch({
                        type: 'goods/statusGoods',
                        payload: { goods_id: id, status: -1 },
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
    //选择日期时间
    selectTime() {

    }

    handleSearch = (value) => {
        this.setState({
            dataSource: !value ? [] : [
                value,
                value + value,
                value + value + value,
            ],
        });
    }
    render() {
        const { total, list } = this.props.goods;
        const { title, price, goods_id, h5Address, fetching, programAddress,corner,desc, tag_list, fileList, expiry_time, labelName, labelOption, select_label, select_category, select_tags } = this.state;
        const { uploadToken } = this.props;
        const { checkList: labelList, total: labelTotal, domain } = this.props.label;
        const { getFieldDecorator } = this.props.form;
        const RadioGroup = Radio.Group;
        const Search = Input.Search;
        const FormCheck = {
            idConfig: {
                initialValue: goods_id || 0,
            },
            GoodsNameConfig: {
                rules: [{ type: 'string', required: true, message: '输入的商品不能为空哦' }],
                initialValue: title || '',
            },
            descConfig: {
                rules: [{ type: 'string', required: true, message: '输入的商品描述不能为空哦' }],
                initialValue: desc || '',
            },
            cornerConfig: {
                rules: [{ type: 'string', required: true, message: '输入的商品角标不能为空哦' }],
                initialValue: corner || '',
            },
            priceConfig: {
                rules: [{ type: 'string', required: true, message: '输入的价格不能为空哦' }],
                initialValue: price || '',
            },
            H5Config: {
                rules: [{ type: 'string', required: true, message: '输入的H5地址不能为空哦' }],
                initialValue: h5Address || '',
            },
            programConfig: {
                rules: [{ type: 'string', required: true, message: '输入的小程序地址不能为空哦' }],
                initialValue: programAddress || '',
            },
            dateConfig: {
                initialValue: expiry_time || '',
            }
        };

        const paginationProps = {
            pageSize: 10,
            total,
            onChange: page => {
                this.setState({
                    currentPage: page,
                }, () => this.getList(page));

            },
        };
        const ListHeader = () => (
            <div className={styles.flexHeader}>
                <div className={styles.listHeader}>
                    <span className={styles.listContentItem}>排序</span>
                    <span className={styles.listContentItem}>商品名称</span>
                    <span className={styles.listContentItem}>封面图</span>
                    <span className={styles.listContentItem}>关联标签</span>
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
                    type={item.data.status == '0' ? 'danger' : 'primary'}
                    className={styles.listBtn}
                    onClick={() => this.downline(item.data.goods_id, item.data.status)}
                >
                    {item.data.status == '0' ? '上线' : '下线'}
                </Button>
                <Button className={styles.listBtn} onClick={() => this.del(item.data.goods_id)}>
                    删除
        </Button>
            </div>
        );

        const ListContent = ({ data }) => (
            <div className={styles.listContent}>
                <div className={styles.listContentItem}>
                    <p>{Number(data.order)}</p>
                </div>
                <div className={styles.listContentItem}>
                    <p lines={2}>{data.title}</p>
                </div>
                <div className={styles.listContentItem}>
                    {data.cover ? (
                        <img src={domain + data.cover} className={styles.logoUrl} />
                    ) : (
                            '无'
                        )}
                </div>
                <div className={styles.listContentItem}>
                    {data.labels.length != 0 ? data.labels.map((element, index) => (
                        <Tag key={element.label_id} color="geekblue">{element.label_name}</Tag>
                    )) : '无'}
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
                        title="商品列表"
                        style={{ marginTop: 24 }}
                        bodyStyle={{ padding: '0 32px 40px 32px' }}
                    // extra={extraContent}
                    >
                        {labelName ? <p style={{ 'font-size': '18px', 'padding-bottom': '10px' }}>标签名称：{labelName}</p> : ''}
                        <Button
                            type="dashed"
                            onClick={() => this.show_Category()}
                            style={{ width: '100%', marginBottom: 8 }}
                            icon="plus"
                        >添加商品</Button>
                        <div className={styles.menubox}>
                            <Search
                                className={styles.SearchBox}
                                placeholder="标签名字"
                                onSearch={this.searchFun}
                                enterButton
                                style={{ width: '200px' }}
                            />
                            <p className={styles.check} className={styles.totalnum}>商品总数：{total}</p>
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
                {/* 添加或修改分类弹窗 */}
                <Modal
                    title={this.state.addTitle}
                    visible={this.state.show_a_e_Goods}
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
                        {this.state.addTitle == '添加商品' ? (
                            ''
                        ) : (
                                <FormItem className={styles.hidden}>
                                    {getFieldDecorator('goods_id', FormCheck.idConfig, { initialValue: goods_id })(<Input />)}
                                </FormItem>
                            )}
                        <FormItem label="封面" style={{ marginBottom: 0 }}>
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
                        <FormItem label="商品名称" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('title', FormCheck.GoodsNameConfig)(
                                <Input placeholder="请输入商品名称" />
                            )}
                        </FormItem>
                        <FormItem label="商品描述" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('desc', FormCheck.descConfig)(
                                <Input placeholder="请输入商品描述" />
                            )}
                        </FormItem>
                        <FormItem label="角标" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('corner', FormCheck.cornerConfig)(
                                <Input placeholder="请输入角标" />
                            )}
                        </FormItem>
                        <FormItem label="H5地址" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('h5Address', FormCheck.H5Config)(
                                <Input placeholder="请输入H5地址" />
                            )}
                        </FormItem>
                        <FormItem label="小程序地址" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('programAddress', FormCheck.programConfig)(
                                <Input placeholder="请输入小程序地址" />
                            )}
                        </FormItem>
                        <FormItem label="售价" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('price', FormCheck.priceConfig)(
                                <Input placeholder="请输入金额" />
                            )}
                        </FormItem>
                        <FormItem label="到期时间" style={{ marginBottom: 0 }}>
                            {getFieldDecorator('expiry_time', FormCheck.dateConfig)(
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="到期时间，可不填"
                                    onOk={this.selectTime}
                                />
                            )}
                        </FormItem>
                        <FormItem label="关联标签" style={{ marginBottom: 0 }}>
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="标签名称"
                                defaultValue={select_label}
                                onSearch={this.fetchLabel}
                                onChange={this.setLabel}
                                notFoundContent={fetching ? <Spin size="small" /> : null}
                            >
                                {labelList.map(l => <Option key={l.label}>{l.label}</Option>)}
                            </Select>
                        </FormItem>
                        <FormItem label="tags" style={{ marginBottom: 0 }}>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="tags名称,可不填"
                                defaultValue={select_tags}
                                onChange={this.setTags}
                            >
                            </Select>
                        </FormItem>
                        <FormItem label="品类" style={{ marginBottom: 0 }}>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="品类名称,可不填"
                                defaultValue={select_category}
                                onChange={this.setCategory}
                            >
                            </Select>
                        </FormItem>
                    </Form>
                </Modal>
            </PageHeaderLayout>
        );
    }
}
