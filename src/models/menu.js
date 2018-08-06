import { queryMenus } from '../services/menu';
import { isUrl } from '../utils/utils';
function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}
export default {
  namespace: 'menu',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMenus, payload);
      const menu = formatter(response.data.meData)
      // const menu = yield call(queryMenus, payload);

      yield put({
        type: 'queryList',
        payload: Array.isArray(menu) ? menu : [],
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  },
};
