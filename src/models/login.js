import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, accountLogout } from '../services/api';
import { setAuthority, setToken, clearToken } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { getPageQuery } from '../utils/utils';
import { notification } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);

      if (response.code === 200) {
        const data = {
          status: 'ok',
          type: 'account',
          currentAuthority: 'user',
        };
        const userData = {
          name: response.data.user.user.username,
          avatar: response.data.user.user.avatar,
          userid: response.data.user.user.id,
          notifyCount: 12,
        };
        yield put({
          type: 'changeLoginStatus',
          payload: data,
        });
        yield put({
          type: 'setNewToken',
          payload: response.data.user.token,
        });
        yield put({
          type: 'user/saveCurrentUser',
          payload: userData,
        });
        localStorage.setItem('userInfo', JSON.stringify(userData));
        reloadAuthorized();
        let redirect = '/welcome';

        yield put(routerRedux.replace(redirect || '/'));
      } else {
        notification.error({
          message: response.message,
          description: '请仔细检查用户名和密码',
        });
      }
    },
    *logout({ payload }, { call, put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      yield call(accountLogout, payload);

      yield put({
        type: 'clearOldToken',
        payload: true,
      });

      reloadAuthorized();

      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    setNewToken(state, { payload }) {
      return setToken(payload);
    },
    clearOldToken(state, { payload }) {
      return clearToken();
    },
  },
};
