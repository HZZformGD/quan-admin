import React, { PureComponent } from 'react';
import { Map, Marker } from 'react-amap';

export default class GdMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      position: props.position ? { longitude: 114.415011, latitude: 23.103598 } : props.position, // 若不传position则定位到华贸天地
      clickable: true,
      draggable: true,
      amapkey: props.amapkey,
      map: {},
      search_text:props.text
    };
  }

  setAddress = (address, position) => {
    const { setFun } = this.props;
    setFun(address, position);
  };
  setPosition=(position)=>{
    this.setState({
      position
    })
  }
  searchPoi =(t)=>{
    let gps = [this.state.position.longitude, this.state.position.latitude]
    const {getPois} = this.props;
    this.placeSearch.searchNearBy(t,gps, 10000,function (status, result) {
      getPois(result.poiList.pois)
      // console.log(result.poiList.pois)
    });
  }
  render() {
    const { position, amapkey, clickable, draggable, visible } = this.state;
    // 地图逻辑
    const mapEvents = {
      created: mapInstance => {
        this.state.map = mapInstance;
        AMap.plugin(["AMap.PlaceSearch", 'AMap.Geocoder'], () => {
          this.geocoder = new AMap.Geocoder({
            city: '010', // 城市，默认：“全国”
            extensions: 'all',
            radius: 200
          });
          this.placeSearch = new AMap.PlaceSearch({ //构造地点查询类
            pageSize: 10,
            pageIndex: 1,
            city: "惠州", //城市
          });
        });
      },
      // click: e => {
      //   const position = {
      //     longitude: e.lnglat.lng,
      //     latitude: e.lnglat.lat,
      //   };
      //   this.setState({
      //     position,
      //   });
        
      //   let gps = [position.longitude, position.latitude]
      //   AMap.convertFrom(gps, 'gps', function (status, result) {
      //     if (result.info === 'ok') {
      //       var lnglats = result.locations; // Array.<LngLat>
      //     }
      //   });
      //   const { lnglat } = e;
      //   // 逆地理编码
      //   this.geocoder &&
      //     this.geocoder.getAddress(lnglat, (status, result) => {
      //       if (status === 'complete') {
      //         if (result.regeocode) {
      //           this.setAddress(result.regeocode,position);
      //         } else {
      //           this.props.setAddress();
      //         }
      //       } else {
      //         this.props.setAddress();
      //       }
      //     });
      // },
    };
    return (
      <Map amapkey={amapkey} zoom={16} events={mapEvents} center={position}>
        <div id="panel"></div>
        <Marker position={position} visible={visible} clickable={clickable} draggable={draggable} />
      </Map>
    );
  }
}
