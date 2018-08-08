import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/common/auth/sign-in', {
    method: 'POST',
    body: params,
    noToken: true,
  });
}

export async function accountLogout() {
  return request('/common/auth/sign-out', {
    method: 'POST',
    noToken: false,
  });
}
export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getDecorationList(params) {
  return request('/poadmin/user/medal-list', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function queryDetail(params) {
  return request('/poadmin/user/user-medal-list', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function getToken(params) {
  return request('/common/upload/upload-token', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function saveDecoration(params) {
  return request('/poadmin/user/edit-medal', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function changeStatus(params) {
  return request('/poadmin/user/medal-status', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function searchUser(params) {
  return request('/poadmin/user/user-search', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}
export async function authMedal(params) {
  return request('/poadmin/user/medal-auth', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function changeUserStatus(params) {
  return request('/poadmin/user/user-medal-status', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function checkUserList(params) {
  return request('/poadmin/user/user-check', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function addTopic(params) {
  return request('/miniadmin/topic-list/edit', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function getTopicList(params) {
  return request('/miniadmin/topic-list/list', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function pushTopicAll(params) {
  console.info(params);
  return request('/miniadmin/topic-list/global-push', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function pushTopicApart(params) {
  console.info(params);
  return request('/miniadmin/topic-list/push', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}
