import { permissionList, editAuth, removeAuthByName } from '../../services/api';

export default {
  namespace: 'assignDetail',

  state: {
    name: '',
    description: '',
    authList: []
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
    *setDetail({ payload }, { call, put }) {
      yield put({
        type: 'saveDetail',
        payload: payload
      })
    }
  },

  reducers: {
    saveDetail(state, action) {
      return {
        ...state,
        name: action.payload.name,
        description: action.payload.description,
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
