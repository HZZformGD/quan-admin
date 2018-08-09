import { rolesList, editRoleByName,removeRoleByName } from '../../services/api';

export default {
  namespace: 'roleManager',

  state: {
    list: [],
    total: 100,
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(rolesList, payload);

      if (response.code == 200) {
        const data = response.data;
        console.info(data)
        yield put({
          type: 'saveList',
          payload: data,
        });
      }
    },
    *editRole({ payload }, { call, put }) {
      const response = yield call(editRoleByName, payload);
      if (response.code == 200) {
        return response;
      }
    },
    *removeRole({ payload }, { call, put }) {
      const response = yield call(removeRoleByName, payload);
      if (response.code == 200) {
        return response;
      }
    },
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
        list: action.payload.roles || [],
        total: action.payload.total || 0,
      };
    },
  },
};
