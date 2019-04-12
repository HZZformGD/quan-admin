import {
  ShutupList,
  shutupRelieve,
  shutupAdd
  } from '../../services/api';
  
  export default {
    namespace: 'shutup',
  
    state: {
      list: [],
      total: 0,
      domain: '',
      arr: [],
      decorations: {
        list: [],
        medal: {},
        total: 0,
      },
    },
  
    effects: {
      *getList({ payload }, { call, put }) {
        const response = yield call(ShutupList, payload);
        const data = response;
        const page = payload.page;
        yield put({
          type: 'queryList',
          payload: data,
        });
      },
      *shutupRelieve({ payload }, { call }) {
        const response = yield call(shutupRelieve, payload);
        return response;
      },
      *shutupAdd({ payload }, { call }) {
        const response = yield call(shutupAdd, payload);
        return response;
      },
    },
  
    reducers: {
      queryList(state, action) {
          console.log(action)
        const obj = {
          ...state,
          list: action.payload.list,
          total: Number(action.payload.count),
        };
        return obj;
      },
    },
  };
  