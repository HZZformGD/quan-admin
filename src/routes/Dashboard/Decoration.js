import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';

import { Card, Form, Upload, DatePicker, Button, Icon, List, Modal, Input } from 'antd';
import Ellipsis from 'components/Ellipsis';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Decoration.less';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;

@connect(({ decoration, global = {}, loading }) => ({
  decoration,
  uploadToken: global.uploadToken,
  loading: loading.models.test
}))

@Form.create()

export default class CardList extends PureComponent {

  state = {
    modalShow: false,
    modalTitle: '添加小红柚勋章',
    confirmText: '确定',
    rangeTime: [],
    title: '',
    cover: '',
    fileList: [],
    remark: '',
    id: 0
  }

  componentDidMount() {
    this.getList()
  }
  getList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'decoration/getList',
      payload: {
        count: 8,
      },
    });
    dispatch({
      type: 'global/fetchUploadToken'
    })
  }
  edit(e) {
    this.setState({
      modalShow: true,
      modalTitle: '编辑小红柚勋章',
      confirmText: '保存',
      title: e.medal_name,
      rangeTime: [e.granttime, e.deadline],
      cover: e.medal_icon,
      fileList: [{
        uid: -1,
        status: 'done',
        url: e.show_icon
      }],
      remark: e.remark,
      id: e.medal_id
    })
  }
  create() {
    this.setState({ id: 0, modalShow: true, modalTitle: '添加小红柚勋章', confirmText: '新增', cover: '', rangeTime: new Array, fileList: new Array, title: '', remark: '' })
  }
  comfirm() {

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      // Should format date value before submit.
      const rangeValue = fieldsValue['range-picker'];
      const values = {
        ...fieldsValue,
        'range-picker': [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')]
      };
      let cover = this.state.cover
      this.props.dispatch({
        type: 'decoration/saveDecoration',
        payload: {
          Medal: {
            medal_name: values.name,
            medal_icon: cover,
            granttime: values['range-picker'][0],
            deadline: values['range-picker'][1],
            remark: values.remark,
            medal_id: values.id
          },

        }
      })
    });
  }
  cancel(modalShow) {
    this.setState({ id: 0, modalShow, modalTitle: '添加小红柚勋章', confirmText: '新增', cover: '', rangeTime: new Array, fileList: new Array, title: '', remark: '' })
  }
  handleSubmit(e) {

  }
  handlePreview() {

  }
  handleChange(e) {
    let { fileList, file } = e
    console.info(e)
    let cover = ''
    if (fileList.length && file.status == 'done') {
      cover = fileList[0].response.base_url
      fileList[0].url = fileList[0].response.full_url
    }

    this.setState({ fileList, cover: cover })
  }
  lengthCheck = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value.length > 100) {
      callback('长度不能超过100');
    } else {
      callback();
    }
  }
  render() {
    let { list } = this.props.decoration
    let { uploadToken } = this.props
    const { getFieldDecorator } = this.props.form
    const { fileList, rangeTime, title, cover, remark, id } = this.state
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
    let setRange = rangeTime.length ? [moment(rangeTime[0], 'YYYY-MM-DD'), moment(rangeTime[1], 'YYYY-MM-DD')] : ''
    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '记得选择生效日期啊！亲', }],
      initialValue: setRange
    };
    const nameConfig = {
      rules: [{ type: 'string', required: true, message: '记得填写名字啊！亲' }],
      initialValue: title || ''
    }
    const remarkConfig = {
      rules: [{ type: 'string', required: false, message: '字数超过100个啦' }, { validator: this.lengthCheck }],
      initialValue: remark || ''
    }
    const idConfig = {
      initialValue: id || 0
    }

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    return (
      <PageHeaderLayout >
        <List
          rowKey="id"
          loading={false}
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 10,
          }}
          grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={['', ...list]}
          renderItem={item =>
            item ? (
              <List.Item key={item.medal_id}>
                <div className={styles.cardHeader}>
                  <span>{item.medal_name}</span>
                  <Button size="small" className={styles.editBtn} onClick={() => this.edit(item)}>编辑</Button>
                </div>
                <Card hoverable className={styles.card} >
                  <Card.Meta
                    avatar={<img alt="" className={styles.cardAvatar} src={item.medal_icon} />}
                    description={
                      <Ellipsis className={styles.item} lines={2}>
                        {item.remark}
                      </Ellipsis>
                    }
                  />
                  <div className={styles.details}>
                    <span className={styles.endTime}>到期时间：{item.deadline}</span>
                    <span className={styles.detailsLink}>
                      <Link to={`/decoration/decoration-detail/` + item.id}>详情></Link>

                    </span>
                  </div>
                </Card>
              </List.Item>
            ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton} onClick={() => this.create()}>
                    <Icon type="plus" /> 新增🎖勋章
                  </Button>
                </List.Item>
              )
          }
        />

        <Modal
          title={this.state.modalTitle}
          wrapClassName="vertical-center-modal"
          visible={this.state.modalShow}
          onOk={() => this.comfirm(false)}
          okText={this.state.confirmText}
          onCancel={() => this.cancel(false)}
        >
          <Form>
            <FormItem
              className={styles.hidden}
            >
              {getFieldDecorator('id', idConfig)(
                <Input placeholder="输入名称" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="生效时间"
            >
              {getFieldDecorator('range-picker', rangeConfig)(
                <RangePicker />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="勋章名称"
            >
              {getFieldDecorator('name', nameConfig)(
                <Input placeholder="输入名称" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="勋章说明"
            >
              {getFieldDecorator('remark', remarkConfig)(
                <Input placeholder="请输入勋章说明" />
              )}
            </FormItem>

            <FormItem>
              <Upload
                action="http://upload.qiniup.com"
                listType="picture-card"
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange.bind(this)}
                data={{ token: uploadToken }}
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
