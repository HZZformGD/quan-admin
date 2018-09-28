import {
    getCommentList,
    forbidComment
  } from '../../services/api';
  
  export default {
    namespace: 'comment',
  
    state: {
      list: [],
      total: 0,
      arr: [],
    },
  
    effects: {
      *getList({ payload }, { call, put }) {
        const response = yield call(getCommentList, payload);
        const data = response.data;
        yield put({
          type:'queryList',
          payload: data,
        });
      },
      *forbidComment({ payload }, { call }) {
        const response = yield call(forbidComment, payload);
        return response;
      },
    },
  
    reducers: {
      queryList(state, action) {
        const obj = {
          ...state,
          list: action.payload.list,
          total: Number(action.payload.count),
        };
        return obj;
      },
    },
  };
  