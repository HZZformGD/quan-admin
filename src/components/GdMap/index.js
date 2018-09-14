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
    };
  }

  setAddress = (address, position) => {
    const { setFun } = this.props;
    setFun(address, position);
  };

  render() {
    const { position, amapkey, clickable, draggable, visible } = this.state;
    // 地图逻辑
    const mapEvents = {
      created: mapInstance => {
        this.map = mapInstance;
        AMap.plugin('AMap.Geocoder', () => {
          this.geocoder = new AMap.Geocoder({
            city: '010', // 城市，默认：“全国”
          });
        });
      },
      click: e => {
        const position = {
          longitude: e.lnglat.lng,
          latitude: e.lnglat.lat,
        };
        this.setState({
          position,
        });
        const { lnglat } = e;
        // 逆地理编码
        this.geocoder &&
          this.geocoder.getAddress(lnglat, (status, result) => {
            if (status === 'complete') {
              if (result.regeocode) {
                this.setAddress(result.regeocode.formattedAddress, position);
              } else {
                this.props.setAddress();
              }
            } else {
              this.props.setAddress();
            }
          });
      },
    };
    return (
      <Map amapkey={amapkey} zoom={14} events={mapEvents} center={position}>
        <Marker position={position} visible={visible} clickable={clickable} draggable={draggable} />
      </Map>
    );
  }
}
