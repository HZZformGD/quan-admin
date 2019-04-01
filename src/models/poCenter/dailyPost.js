import { queryDailyData, changeDailyData,editDailyExpress } from '../../services/api';

export default {
  namespace: 'dailyPost',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {

      const response = yield call(queryDailyData, payload);


      const data = {
        list: response.data,
        pagination: {},
      }
      yield put({
        type: 'save',
        payload: data,
      });
      if (response) {
        return true
      }
    },
    *change({ payload }, { call, put }) {
      const response = yield call(changeDailyData, payload);
      if (response) {
        return true
      }
    },
    *editExpress({ payload, callback }, { call, put }) {
      const response = yield call(editDailyExpress, payload);
      if (response) {
        return true
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
