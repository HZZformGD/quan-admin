import { getDecorationList,saveDecoration } from '../services/api';

export default {
  namespace: 'decoration',

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
    *saveDecoration({ payload }, { call, put }) {
      console.info(payload)
      const response = yield call(saveDecoration, payload);
      // yield put({
      //   type: 'appendList',
      //   payload: Array.isArray(response) ? response : [],
      // });
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
