import { addTopic, getTopicList, pushTopic } from '../../services/api';

export default {
  namespace: 'topic',

  state: {

    list: [],
    total: 100

  },

  effects: {
    *addTopic({ payload }, { call, put }) {
      const response = yield call(addTopic, payload);
      // redirect on client when network broken
      return response
    },
    *getList({ payload }, { call, put }) {
      const response = yield call(getTopicList, payload)
      const data = response.data
      yield put({
        type: 'saveList',
        payload: data
      })
    },
    *pushIt({ payload }, { call, put }) {
      const response = yield call(pushTopic, payload)
      return response
    }
  },

  reducers: {
    trigger(state, action) {
      return {
        error: action.payload,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        list: action.payload.list || [],
        total: action.payload.total || 0
      }
    }
  },
};
