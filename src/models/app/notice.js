import { appNoticeList,statusNotice,editNotice,addNotice } from '../../services/api';

export default {
  namespace: 'notice',

  state: {
    list: [],
    total: 0,
    domain: '',
    arr: [],
    checkList:[],
    wxAppList:[],
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(appNoticeList, payload);
      const data = response.data;
      const page = payload.page;
      // 添加序号
      for (const i in data.list) {
        if (page == 1) {
          data.list[i].order = Number(i) + 1;
        } else {
          const order = (page - 1) * 10 + Number(i) + 1;
          data.list[i].order = order;
        }
      }
      yield put({
        type: 'queryList',
        payload: data,
      });
    },
    *addNotice({ payload }, { call }) {
      const response = yield call(addNotice, payload);
      return response;
    },
    *editNotice({ payload }, { call }) {
      const response = yield call(editNotice, payload);
      return response;
    },
    *statusNotice({ payload }, { call }) {
      const response = yield call(statusNotice, payload);
      return response;
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
        wxAppList:Object.values(action.payload.wxAppList),
      };
    },
  },
};
