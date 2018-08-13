import { authEditorByUid, administratorsList, delEditorByUid } from '../../services/api';

export default {
  namespace: 'manageAuth',

  state: {
    administrators: [],
    total: 0,
    roles: []
  },

  effects: {
    *authEditor({ payload }, { call, put }) {
      const response = yield call(authEditorByUid, payload);
      // redirect on client when network broken
      if (response.code == 200) {
        return response;
      }
    },
    *getList({ payload }, { call, put }) {
      const response = yield call(administratorsList, payload);
      if (response.code == 200) {
        const data = response.data;
        yield put({
          type: 'saveList',
          payload: data,
        });
      }
    },
    *delEditor({ payload }, { call, put }) {
      const response = yield call(delEditorByUid, payload);
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
        administrators: action.payload.administrators || [],
        total: action.payload.total || 0,
        roles: action.payload.roles || []
      };
    },
  },
};
