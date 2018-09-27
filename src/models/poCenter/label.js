import { getLabelList, addLabel, editLabel, delLabel, statusLabel, statusRecommend,labelType } from '../../services/api';

export default {
  namespace: 'label',

  state: {
    list: [],
    total: 0,
    domain: '',
    arr: [],
    decorations: {
      list: [],
      medal: {},
      total: 0,
    },
  },

  effects: {
    *getList({ payload }, { call, put }) {
      const response = yield call(getLabelList, payload);
      const data = response.data;
      const page = payload.page;
      // 添加序号
      for (const i in data.list) {
        if (page == 1) {
          data.list[i].order = Number(i) + 1;
        } else {
          const order = (page - 1) * 10 + Number(i) + 1;
          data.list[i].order = order;
        }
      }
      let type = 'queryList';
      if (payload.type == 'content') {
        type = 'ContentLabel';
      }
      yield put({
        type: type,
        payload: data,
      });
    },
    *addLabel({ payload }, { call }) {
      const response = yield call(addLabel, payload);
      return response;
    },
    *editLabel({ payload }, { call }) {
      const response = yield call(editLabel, payload);
      return response;
    },
    *delLabel({ payload }, { call }) {
      const response = yield call(delLabel, payload);
      return response;
    },
    *statusLabel({ payload }, { call }) {
      const response = yield call(statusLabel, payload);
      return response;
    },
    *statusRecommend({payload}, {call}) {
      const response = yield call(statusRecommend, payload);
      return response;
    },
    *labelType({payload}, {call}) {
      const response = yield call(labelType, payload);
      return response;
    }
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.list,
        total: Number(action.payload.total),
        domain: action.payload.domain,
      };
    },
    ContentLabel(state, action) {
      const checkList = [];
      action.payload.list.map(val => {
        checkList.push({
          value: val.label_id,
          label: val.label_name,
        });
      });
      const obj = {
        list: action.payload.list,
        checkList,
        total: Number(action.payload.total),
      };
      return obj;
    },
  },
};
