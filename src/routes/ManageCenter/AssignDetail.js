import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import {
  Card,
  Popconfirm,
  Button,
  Checkbox,
  Spin,
  message,
  Form,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AssignDetail.less';

const CheckboxGroup = Checkbox.Group;

@Form.create()
@connect(({ assignDetail, loading }) => ({
  assignDetail,
  loading: loading.models.decoration,
}))
export default class AuthList extends PureComponent {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.input = {};
  }

  state = {
    selectArr: []
  };


  componentDidMount() {
    this.getList()
  }

  getList() {
    const { dispatch, assignDetail } = this.props;
    if (assignDetail.name == '') {
      dispatch(routerRedux.push('/manager-center/role-manager'))
    } else {
      dispatch({
        type: 'assignDetail/getList',
        payload: {
          name: assignDetail.name
        }
      })
    }

  }


  cancel() {
    this.setState({
      modalVisiale: false,
    });
  }
  confirmAssign() {
    const { assignDetail, dispatch } = this.props
    let arr = []
    assignDetail.authList.map((item) => {
      item.children.map((child) => {
        child.children.map((action) => {
          if (action.checked) {
            arr.push(action.name)
          }
        })
      })
    })
    dispatch({
      type: 'assignDetail/distributed',
      payload: { permissions: arr, name: assignDetail.name }
    }).then((res) => {
      if (res.code == 200) {
        message.success(res.message)
        dispatch(routerRedux.push('/manager-center/role-manager'))
      }
    })

    console.info(arr)
  }


  checkBoxChange(event) {
    let { checked, dataName, dataMindex, dataCindex, dataAindex } = event.target
    let postArr = this.state.selectArr
    if (checked) {
      postArr.push(dataName)
    } else {
      let index = postArr.indexOf(dataName);
      postArr.splice(index, 1)
    }
    this.props.dispatch({
      type: 'assignDetail/changeList',
      payload: {
        isChecked: checked,
        mIndex: dataMindex,
        cIndex: dataCindex,
        aIndex: dataAindex
      }
    })
  }

  del(name) {
    this.props.dispatch({
      type: 'assignDetail/removeAuth',
      payload: { name }
    }).then((res) => {
      if (res.code == 200) {
        message.success(res.message)
        this.getList()
      } else {
        message.error(res.message)
      }
    })
  }
  edit(e) {
    this.setState({
      modalVisiale: true,
      isEdit: true,
      ...e
    })
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.name} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.description} key={item.name} />;
    });
  }

  render() {

    console.info(this.props.assignDetail)
    const { modalVisiale, isEdit } = this.state
    const { getFieldDecorator } = this.props.form;
    const { assignDetail } = this.props
    let authList = assignDetail.authList
    let dec = assignDetail.description



    const Content = ({ data }) => (
      <div className='tree'>
        {data.map((modules, mIndex) => (
          <div className={styles.treeModules} key={modules.name + '_' + mIndex}>
            <h3>{'- 模块: ' + modules.name}</h3>
            {modules.children.map((contro, cIndex) => (
              <div className={styles.treeContro} key={contro.name + '_' + cIndex}>
                <p>{'- 控制器: ' + contro.name}</p>
                {contro.children.map((action, aIndex) => {
                  return (
                    <Checkbox className={styles.treeAction} dataName={action.name} dataMindex={mIndex} dataCindex={cIndex} key={action.name + '_' + aIndex} dataAindex={aIndex} checked={action.checked == 1} onChange={this.checkBoxChange.bind(this)} >{action.description}</Checkbox>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    )

    return (
      <PageHeaderLayout>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title={dec}
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={<Button type="primary" onClick={() => this.confirmAssign()}>确定分配</Button>}
          >
            <Content data={authList} />
          </Card>
        </div>

      </PageHeaderLayout >
    );
  }
}
