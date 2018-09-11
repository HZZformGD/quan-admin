import { roleAssign, editAuth, removeAuthByName, toDistributed } from '../../services/api';

export default {
  namespace: 'assignDetail',

  state: {
    name: '',
    description: '',
    authList: []
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(roleAssign, payload);
      if (response.code == 200) {
        const data = response.data;
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
    },
    *changeList({ payload }, { call, put }) {
      yield put({
        type: 'saveCheck',
        payload: payload
      })
    },
    *distributed({ payload }, { call, put }) {
      const responese = yield call(toDistributed,payload)
      if (responese.code == 200) {
        return responese
      }
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
        authList: action.payload.permissions || []
      };
    },
    saveCheck(state, action) {
      let list = state.authList
      const { mIndex, cIndex, aIndex, isChecked } = action.payload
      let status = isChecked ? 1 : 0
      list[mIndex].children[cIndex].children[aIndex].checked = status
      console.info(list)
      return {
        ...state,
        authList: list
      }
    }
  },
};
