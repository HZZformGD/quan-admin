import { configList,editConfig,delConfig} from '../../services/api';

export default {
  namespace: 'appconfig',

  state: {
    list: [],
    total: 0,
    domain: '',
    arr: [],
    checkList:[],
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(configList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    *addConfig({ payload }, { call }) {
      const response = yield call(editConfig, payload);
      return response;
    },
    *delConfig({ payload }, { call }) {
        const response = yield call(delConfig, payload);
        return response;
      },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.data,
      };
    },
  },
};
