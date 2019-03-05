import { startUpList,editStartUp,statusStartUp} from '../../services/api';

export default {
  namespace: 'startup',

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
      const response = yield call(startUpList, payload);
      const data = response.data;
      const page = payload.page;
      yield put({
        type: 'queryList',
        payload: data,
      });
    },

    *editStartUp({ payload }, { call }) {
      const response = yield call(editStartUp, payload);
      return response;
    },
    *statusStartUp({ payload }, { call }) {
      const response = yield call(statusStartUp, payload);
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
