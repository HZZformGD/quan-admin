import { appScrolladList,editScrollad,statusScrollad } from '../../services/api';

export default {
  namespace: 'scrollad',

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
      const response = yield call(appScrolladList, payload);
      const data = response.data;
      const page = payload.page;
      yield put({
        type: 'queryList',
        payload: data,
      });
    },

    *editScrollad({ payload }, { call }) {
      const response = yield call(editScrollad, payload);
      return response;
    },
    *statusScrollad({ payload }, { call }) {
      const response = yield call(statusScrollad, payload);
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
