import { queryDetail } from '../services/api';

export default {
  namespace: 'detail',

  state: {
    decorations: {}
  },

  effects: {
    *fetchList({payload}, { call, put }) {
      const response = yield call(queryDetail,payload);
      yield put({
        type: 'saveDetail',
        payload: response
      });
    },
  },

  reducers: {
    saveDetail(state, action) {
      return {
        ...state,
        decorations: {
          ...action.payload
        },
      };
    },
  },
};
