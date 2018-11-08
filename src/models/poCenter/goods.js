import {
  getGoodsList,
  statusGoods,
  addGoods,
  editGoods,
} from '../../services/api';

export default {
  namespace: 'goods',

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
      const response = yield call(getGoodsList, payload);
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
    *addGoods({ payload }, { call }) {
      const response = yield call(addGoods, payload);
      return response;
    },
    *editGoods({ payload }, { call }) {
      const response = yield call(editGoods, payload);
      return response;
    },
    *statusGoods({ payload }, { call }) {
      const response = yield call(statusGoods, payload);
      return response;
    },
  },

  reducers: {
    queryList(state, action) {
      const obj = {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
        domain: action.payload.domain,
      };
      return obj;
    },
  },
};
