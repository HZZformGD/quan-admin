import { addTopic } from '../../services/api';

export default {
  namespace: 'topic',

  state: {
    topic: {
      list: [],
      count: 100
    },
    isloading: false,
  },

  effects: {
    *addTopic({ payload }, { call, put }) {
      const response = yield call(addTopic, payload);
      // redirect on client when network broken
      return response
    },
  },

  reducers: {
    trigger(state, action) {
      return {
        error: action.payload,
      };
    },
  },
};
