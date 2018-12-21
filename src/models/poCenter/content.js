import {
  getPoList,
  poCatEdit,
  getPoTag,
  poTagEdit,
  posetHot,
  posetTop,
  podelTop,
  podel,
  poShutUp,
  poRandPraise,
  poReview,
  poContetnEdit,
  delImg,
  setCover,
  setLabel,
  delPoLabel,
} from '../../services/api';

export default {
  namespace: 'content',

  state: {
    list: [],
    total: 0,
    arr: [],
    xzapp_po_top_id: '',
    loading: true,
    tag_list: {
      list: [],
      medal: {},
      total: 0,
    },
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(getPoList, payload);
      const data = response.data;
      yield put({
        type: 'queryList',
        payload: data,
      });
    },
    *poCatEdit({ payload }, { call }) {
      const response = yield call(poCatEdit, payload);
      return response;
    },
    *getPoTag({ payload }, { call, put }) {
      const response = yield call(getPoTag, payload);
      const data = response.data;
      yield put({
        type: 'queryTagList',
        payload: data,
      });
    },
    *poTagEdit({ payload }, { call }) {
      const response = yield call(poTagEdit, payload);
      return response;
    },
    *posetHot({ payload }, { call }) {
      const response = yield call(posetHot, payload);
      return response;
    },
    *posetTop({ payload }, { call }) {
      const response = yield call(posetTop, payload);
      return response;
    },
    *podelTop({ payload }, { call }) {
      const response = yield call(podelTop, payload);
      return response;
    },
    *podel({ payload }, { call }) {
      const response = yield call(podel, payload);
      return response;
    },
    *poShutUp({ payload }, { call }) {
      const response = yield call(poShutUp, payload);
      return response;
    },
    *poRandPraise({ payload }, { call }) {
      const response = yield call(poRandPraise, payload);
      return response;
    },
    *poReview({ payload }, { call }) {
      const response = yield call(poReview, payload);
      return response;
    },
    *poContetnEdit({ payload }, { call }) {
      const response = yield call(poContetnEdit, payload);
      return response;
    },
    *delImg({ payload }, { call }) {
      const response = yield call(delImg, payload);
      return response;
    },
    *setCover({ payload }, { call }) {
      const response = yield call(setCover, payload);
      return response;
    },
    *setLabel({ payload }, { call }) {
      const response = yield call(setLabel, payload);
      return response;
    },
    *delPoLabel({ payload }, { call }) {
      const response = yield call(delPoLabel, payload);
      return response;
    },
    *resetList({ payload }, { call, put }) {
      const list = payload.list;
      yield put({
        type: 'refreshList',
        payload: list,
      });
    },
  },

  reducers: {
    queryList(state, action) {
      action.payload.list.map(val => {
        val.isedit = true;
      });
      return {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
        loading: false,
        xzapp_po_top_id: action.payload.xzapp_po_top_id,
      };
    },
    refreshList(state, action) {
      return {
        list: action.payload.list,
        ...state,
      };
    },
    queryTagList(state, action) {
      return {
        ...state,
        tag_list: {
          list: action.payload.list,
          total: Number(action.payload.total),
        },
      };
    },
  },
};
