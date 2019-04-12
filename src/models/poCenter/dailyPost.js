import { queryDailyData, changeDailyData, editDailyExpress } from '../../services/api';

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
        list: response.data.list,
        pagination: { total: response.data.count },
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
    *updateItem({ payload, callback }, { select, call, put }) {


      yield put({
        type: 'update',
        payload: payload
      })

      // const dailyPost= yield select(state => state.dailyPost)
      // dailyPost.data.list[payload.currentIndex].express = payload.data.express
      // dailyPost.data.list[payload.currentIndex].express_code = payload.data.express_code
      // console.info(dailyPost)
      // yield put({
      //   type: 'save',
      //   payload: dailyPost,
      // });

    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    update(state, action) {
      state.data.list[action.payload.currentIndex].express = action.payload.data.express
      state.data.list[action.payload.currentIndex].express_code = action.payload.data.express_code
      return {
        ...state
      }
    }
  },
};
