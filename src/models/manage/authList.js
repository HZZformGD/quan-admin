import { permissionList, editAuth, removeAuthByName } from '../../services/api';

export default {
  namespace: 'authList',

  state: {
    list: [],
    total: 0,
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(permissionList, payload);

      if (response.code == 200) {
        const data = response.data;
        console.info(data)
        yield put({
          type: 'saveList',
          payload: data,
        });
      }
    },
    *editAuth({ payload }, { call, put }) {
      const response = yield call(editAuth, payload);
      if (response.code == 200) {
        return response;
      }
    },
    *removeAuth({ payload }, { call, put }) {
      const response = yield call(removeAuthByName, payload);
      if (response.code == 200) {
        return response;
      }
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
        list: action.payload.permissions || [],
        total: action.payload.total || 0,
      };
    },
  },
};
