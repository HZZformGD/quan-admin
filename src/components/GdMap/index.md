##
##该组件是在react-amap组件上进行封装，有疑问可以上https://github.com/ElemeFE/react-amap
##
## 传入3个参数（position,amapkey,setFun）
## position为定位的经纬度，若不传或传空则地图会根据系统定位，格式如：{   
##                      longitude:112 , 经度
##                      latitude: 23 }  纬度 
## amapkey 这个是高德地图给开发者分配的开发者 Key；你可以在高德开放平台申请你自己的 Key。
## setFun 父组件的方法，由该组件调起并返回position(经纬度)和address(详细地址)