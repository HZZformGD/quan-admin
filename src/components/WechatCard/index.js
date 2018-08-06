import React, { Component } from 'react';

const arr = [{ name: '123', text: 'asd asd ' }, { name: 'asd', text: '123 123 ' }]

export default class WechatCard extends Component {
  constructor(props) {
    super(props)

  }
  state = {
    list: []
  }
  componentWillReceiveProps() {

    this.setState({
      list: this.props.list
    })
    console.info(this.state.list, 'list')

  }
  render() {
    const list = this.state.list.map((item, index) =>
      <div className="card-item" key={index}>{item.text}</div>
    )
    return (
      <div className="card-content">{list}</div>
    )
  }
}

