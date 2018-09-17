import { getLabelList, addLabel, editLabel, delLabel, statusLabel } from '../../services/api';

export default {
  namespace: 'label',

  state: {
    list: [],
    total: 0,
    domain: '',
    arr: [],
    decorations: {
      list: [],
      medal: {},
      total: 0,
    },
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(getLabelList, payload);
      const data = response.data;
      const page = payload.page;
      // 添加序号
      for (const i in data.list) {
        if (page == 1) {
          data.list[i].order = Number(i) + 1;
        } else {
          const order = (page - 1) * 10 + Number(i) + 1;
          data.list[i].order = order;
        }
      }
      yield put({
        type: 'queryList',
        payload: data,
      });
    },
    *addLabel({ payload }, { call }) {
      const response = yield call(addLabel, payload);
      return response;
    },
    *editLabel({ payload }, { call }) {
      const response = yield call(editLabel, payload);
      return response;
    },
    *delLabel({ payload }, { call }) {
      const response = yield call(delLabel, payload);
      return response;
    },
    *statusLabel({ payload }, { call }) {
      const response = yield call(statusLabel, payload);
      return response;
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
        domain: action.payload.domain,
      };
    },
  },
};
