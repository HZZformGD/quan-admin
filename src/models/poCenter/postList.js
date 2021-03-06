import {
  getDecorationList,
  changeStatus,
  saveDecoration,
  queryDetail,
  searchUser,
  authMedal,
  changeUserStatus,
  checkUserList,
} from '../../services/api';

export default {
  namespace: 'postList',

  state: {
    list: [],
    total: 0,
    arr: [],
    decorations: {
      list: [],
      medal: {},
      total: 0,
    },
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
      const response = yield call(saveDecoration, payload);
      return response;
    },
    *getList({ payload }, { call, put }) {
      const response = yield call(getDecorationList, payload);
      console.info(response);
      if (response.code == 200) {
        const data = response.data;
        yield put({
          type: 'queryList',
          payload: data,
        });
      }
    },
    *getDetailList({ payload }, { call, put }) {
      const response = yield call(queryDetail, payload);
      if (response.code == 200) {
        const decorations = response.data;
        yield put({
          type: 'saveDetailList',
          payload: decorations,
        });
      }
    },
    *changeStatus({ payload }, { call, put }) {
      const response = yield call(changeStatus, payload);
      if (response.code == 200) {
        return response;
      }
    },
    *searchUser({ payload }, { call, put }) {
      const response = yield call(searchUser, payload);
      return response;
    },
    *authMedal({ payload }, { call, put }) {
      const response = yield call(authMedal, payload);
      if (response.code == 200) {
        return response;
      }
    },
    *changeUserStatus({ payload }, { call, put }) {
      const response = yield call(changeUserStatus, payload);
      return response;
    },
    *checkUser({ payload }, { call, put }) {
      const response = yield call(checkUserList, payload);
      return response;
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.list,
        total: action.payload.total,
      };
    },
    appendList(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
    saveDetailList(state, action) {
      console.info(action, 'action');
      return {
        ...state,
        decorations: {
          ...action.payload,
        },
      };
    },
  },
};
