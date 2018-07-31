import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import {
  List,
  Card,
  Row,
  Col,
  Radio,
  Input,
  Progress,
  Button,
  Icon,
  Dropdown,
  Menu,
  Avatar,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Detail.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

@connect(({ detail, loading }) => ({
  detail,
  loading: loading.models.detail,
}))
export default class BasicList extends PureComponent {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/fetchList',
      payload: { id: this.props.match.params.id }
    });

  }

  render() {
    const {
      detail,
      loading,
    } = this.props;
    const {decorations} = detail
    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <RadioGroup defaultValue="all">
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="progress">已发放</RadioButton>
          <RadioButton value="waiting">未发放</RadioButton>
        </RadioGroup>
        <Search className={styles.extraContentSearch} placeholder="请输入" onSearch={() => ({})} />
      </div>
    );

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: 5,
      total: 50,
    };

    const ListContent = ({ data: { name, start, uid, status, avatar, id ,end} }) => (
      <div className={styles.listContent}>

        <div className={styles.listContentItem}>
          <span>姓名</span>
          <p>{name}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>uid</span>
          <p>{uid}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>开始时间</span>
          <p>{moment(start).format('YYYY-MM-DD') + ` - ` + moment(end).format('YYYY-MM-DD')}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>状态</span>
          <p>{status}</p>
        </div>
      </div>
    );

    const activeBtn = (
      <Button type="primary" icon="cloud" />
    );
    const cancelBtn = (
      <Button type="primary" icon="delete" />
    );

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card bordered={false}>
            <Row>
              <Col sm={6} xs={24}>
                <Info title="勋章名称" value={decorations.name} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="发放时间" value={decorations.start} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="到期时间" value={decorations.end} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="总人数" value={decorations.count+'位红柚'} />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            bordered={false}
            title="红柚列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={extraContent}
          >
            <Button type="dashed" style={{ width: '100%', marginBottom: 8 }} icon="plus">
              添加
            </Button>
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps}
              dataSource={decorations.list}
              renderItem={item => (
                <List.Item actions={item.status ? [activeBtn] : [cancelBtn]}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} shape="square" size="large" />}
                  />
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
