import {
    getAdvertList,
    statusAdvert,
    addAdvert,
    editAdvert,
  } from '../../services/api';
  
  export default {
    namespace: 'advert',
  
    state: {
      list: [],
      total: 0,
      wxAppList:[],
      arr: [],
    },
  
    effects: {
      *getList({ payload }, { call, put }) {
        const response = yield call(getAdvertList, payload);
        const data = response;
        const page = payload.page;
        yield put({
          type: 'queryList',
          payload: data,
        });
      },
      *statusAdvert({ payload }, { call }) {
        const response = yield call(statusAdvert, payload);
        return response;
      },
      *addAdvert({ payload }, { call }) {
        const response = yield call(addAdvert, payload);
        return response;
      },
      *editAdvert({ payload }, { call }) {
        const response = yield call(editAdvert, payload);
        return response;
      },
    },
  
    reducers: {
      queryList(state, action) {
        //  console.log(Object.values(action.payload.wxAppList))
        const obj = {
          ...state,
          list: action.payload.list,
          total: Number(action.payload.count),
          wxAppList:Object.values(action.payload.wxAppList)
        };
        return obj;
      },
    },
  };
  