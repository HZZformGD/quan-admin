import React, { Component } from 'react';
import styles from './Welcome.less';
import moment from 'moment';

export default class WelcomePage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  render() {
    let hour = moment().hour();
    let minute = moment().minute();
    let greetings = '';
    if (hour <= 9) {
      greetings = '早上好';
    } else if (hour <= 11) {
      greetings = '上午好';
    } else if (11 < hour && hour <= 13) {
      greetings = '中午好';
    } else if (13 < hour && hour <= 18) {
      greetings = '下午好';
    } else if(hour > 18){
      greetings = '晚上好';
    }
    return (
      <div className={styles.exception}>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
            style={{
              backgroundImage: `url(https://gw.alipayobjects.com/zos/rmsportal/RVRUAYdCGeYNBWoKiIwB.svg)`,
            }}
          />
        </div>
        <div className={styles.content}>
          <h1>嘿！{greetings}</h1>
          <div className={styles.desc}>欢迎来到社区管理后台</div>
        </div>
      </div>
    );
  }
}
