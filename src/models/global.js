import { queryNotices, getToken,getOriginToken, getDomain } from '../services/api';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    uploadToken: '',
    domain: '',
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
    *fetchUploadToken({payload}, { call, put }) {
      const response = yield call(getToken,payload);
      const uploadToken = response.data.upload_token;
      yield put({
        type: 'saveUploadToken',
        payload: uploadToken,
      });
    },
    *fetchOriginToken(_, { call, put }) {
      const response = yield call(getOriginToken);
      const uploadToken = response.data.upload_token;
      yield put({
        type: 'saveUploadToken',
        payload: uploadToken,
      });
    },
    *fetchGetDomain(_, { call, put }) {
      const response = yield call(getDomain);

      const domain = response.data.domain;
      yield put({
        type: 'saveDomain',
        payload: domain,
      });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    getUploadToken(state, { payload }) {
      return {
        ...state,
      };
    },

    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    saveUploadToken(state, action) {
      return {
        ...state,
        uploadToken: action.payload,
      };
    },
    saveDomain(state, action) {
      return {
        ...state,
        domain: action.payload,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
