import { queryFakeList,getDecorationList } from '../services/api';

export default {
  namespace: 'list',

  state: {
    list: [],
    arr : []
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *appendFetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'appendList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *getList({ payload }, { call, put }) {
      const response = yield call(getDecorationList, payload);
      const list = response.data.list
      yield put({
        type: 'queryList',
        payload: Array.isArray(list) ? list : [],
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    appendList(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
  },
};
