import {
    getReportsList,
    statusReport,
  } from '../../services/api';
  
  export default {
    namespace: 'report',
  
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
        const response = yield call(getReportsList, payload);
        const data = response;
        const page = payload.page;
        yield put({
          type: 'queryList',
          payload: data,
        });
      },
      *statusReport({ payload }, { call }) {
        const response = yield call(statusReport, payload);
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
  