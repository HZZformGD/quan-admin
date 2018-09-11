import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { message, Card, Input, Tooltip, Avatar, Button, Icon, List, Modal } from 'antd';
import Ellipsis from 'components/Ellipsis';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './PostList.less'

const TextArea = Input.TextArea

export default class PostList extends PureComponent {
  state = {
    editIndex: -1,
    arr: [
      {
        avatar: 'http://uc.xizi.com/avatar.php?uid=2332222',
        postImgs: [
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
          { aid: 1, src: 'http://uc.xizi.com/avatar.php?uid=2332222' },
        ],
        content: `这是一条内容 懂吧~😁
                  我这里突然换行了 你知道吧`,
        id: 1,
        username: '张君鸿'
      }
    ]
  }
  edit(editIndex) {
    console.info()
    this.setState({
      editIndex
    })
  }
  editContent(index) {
    this.setState({
      editIndex: -1
    })
  }
  onChange(index, e) {
    console.info(e.target.value, index)
    let {arr} = this.state
    arr[index].content = e.target.value
    this.setState({
      arr
    })
  }
  cancelEdit() {
    this.setState({
      editIndex: -1
    })
  }
  render() {
    let { editIndex } = this.state
    const PostMagicable = ({ item, index }) => {
      if (editIndex === index) {
        return (
          <div className={styles.editArea}>
            <TextArea autosize={{ minRows: 2, maxRows: 6 }} style={{ width: '500px' }} onChange={this.onChange.bind(this, index)} defaultValue={item.content} />
            <Button.Group size="small" className={styles.buttonGroup}>
              <Button type="primary" onClick={() => this.editContent(index)}>确定</Button>
              <Button onClick={this.cancelEdit.bind(this)}>取消</Button>
            </Button.Group>

          </div>
        )
      } else {
        return (
          <Tooltip title="点击内容即可编辑">
            <span onClick={() => this.edit(index)}>{item.content}</span>

          </Tooltip>
        )
      }
    }
    const ImgContent = ({ data }) => (
      <div className={styles.photoContent}>
        <img src={data.src} alt="" />
        <div className={styles.operation}>
          <Icon type="eye" className={styles.white} />
          <Icon type="setting" className={styles.white} />
        </div>
      </div>
    )
    const List = ({ item, index }) => (
      <div className={styles.listContent}>
        <div className={styles.listLeft}>
          <Avatar src={item.avatar}></Avatar>
          <span>{item.username}</span>
        </div>
        <div className={styles.listMiddle}>
          <div className={styles.photos}>
            {item.postImgs.map((img, index) => (
              <ImgContent data={img} key={index} />
            ))}
          </div>
          <div className={styles.content} >

            <PostMagicable item={item} index={index} />

          </div>
        </div>
        <div className={styles.listRight}></div>
      </div>
    )
    let { arr } = this.state
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
            {arr.map((item, index) => (
              <List item={item} index={index} key={item.id}></List>
            ))}
          </Card>
        </div>
      </PageHeaderLayout>
    )
  }
}
