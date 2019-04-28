import { queryPrizeList, addPrize } from '../../services/api';

export default {
  namespace: 'prize',
  state: {
    datas: {
      sign: {},
      lottery: {},
      box: {},
      source: {
        list: [],
        count: 0
      }
    }
  },
  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(queryPrizeList, payload);
      yield put({
        type: 'updateList',
        payload: response.data,
      });
    },
    *add({ payload }, { call, put }) {
      const response = yield call(addPrize, payload)
      console.info(response)
      return response
    }
  },
  reducers: {
    updateList(state, action) {
      return {
        ...state,
        datas: action.payload
      }
    }
  }
}
