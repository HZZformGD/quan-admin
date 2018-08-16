import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { message, Card, Form, Upload, Avatar, Button, Icon, List, Modal, Input } from 'antd';
import Ellipsis from 'components/Ellipsis';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './PostList.less'

export default class PostList extends PureComponent {
  render() {
    const List = (item) => (
      <div className={styles.listContent}>
        <div className={styles.listLeft}>
          <Avatar src={item.avatar}></Avatar>

        </div>
        <div className={styles.listMiddle}></div>
        <div className={styles.listRight}></div>
      </div>
    )
    const arr = []
    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card bordered={false}></Card>
          <Card
            className={styles.listCard}
            bordered={false}
            title="信息流列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >

          </Card>
        </div>
      </PageHeaderLayout>
    )
  }
}
