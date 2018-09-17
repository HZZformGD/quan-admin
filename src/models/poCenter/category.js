import {
  getCategoryList,
  addCategory,
  editCategory,
  delCategory,
  statusCategory,
} from '../../services/api';

export default {
  namespace: 'category',

  state: {
    list: [],
    total: 0,
    arr: [],
    decoration: {
      list: [],
      medal: {},
      total: 0,
    },
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(getCategoryList, payload);
      const data = response.data;
      let type = 'queryList';
      if (payload.type == 'content') {
        type = 'ContentCategory';
      }
      yield put({
        type,
        payload: data,
      });
    },
    *addCategory({ payload }, { call }) {
      const response = yield call(addCategory, payload);
      return response;
    },
    *editCategory({ payload }, { call }) {
      const response = yield call(editCategory, payload);
      return response;
    },
    *delCategory({ payload }, { call }) {
      const response = yield call(delCategory, payload);
      return response;
    },
    *statusCategory({ payload }, { call }) {
      const response = yield call(statusCategory, payload);
      return response;
    },
  },

  reducers: {
    queryList(state, action) {
      const obj = {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
      };
      return obj;
    },
    ContentCategory(state, action) {
      const checkList = [];
      action.payload.list.map(val => {
        checkList.push({
          value: val.category_id,
          label: val.category_name,
        });
      });
      const obj = {
        list: action.payload.list,
        checkList,
      };
      return obj;
    },
  },
};
