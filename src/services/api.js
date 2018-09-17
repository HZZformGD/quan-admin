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
    method: 'get',
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
  return request('/poadmin/medal/medal-list', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function queryDetail(params) {
  return request('/poadmin/medal/user-medal-list', {
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

export async function getDomain(params) {
  return request('/common/upload/get-domain', {
    body: params,
    noToken: false,
  });
}

export async function saveDecoration(params) {
  return request('/poadmin/medal/edit-medal', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function changeStatus(params) {
  return request('/poadmin/medal/medal-status', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function searchUser(params) {
  return request('/poadmin/medal/user-search', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}
export async function authMedal(params) {
  return request('/poadmin/medal/medal-auth', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function changeUserStatus(params) {
  return request('/poadmin/medal/user-medal-status', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function checkUserList(params) {
  return request('/poadmin/medal/user-check', {
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
  return request('/miniadmin/topic-list/global-push', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function pushTopicApart(params) {
  return request('/miniadmin/topic-list/push', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}
export async function permissionList(params) {
  return request('/common/manager/permissions', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function authEditorByUid(params) {
  return request('/common/manager/admin-assign', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function editAuth(params) {
  return request('/common/manager/edit-permission', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function removeAuthByName(params) {
  return request('/common/manager/remove-permission', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function delEditorByUid(params) {
  return request('/common/manager/remove-admin', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function administratorsList(params) {
  return request('/common/manager/administrators', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function rolesList(params) {
  return request('/common/manager/roles', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function editRoleByName(params) {
  return request('/common/manager/edit-role', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function removeRoleByName(params) {
  return request('/common/manager/remove-role', {
    method: 'POST',
    body: params,
    noToken: false,
  });
}

export async function roleAssign(params) {
  return request(`/common/manager/role-assign?name=${params.name}`, {
    method: 'get',
    noToken: false,
  });
}

export async function toDistributed(params) {
  return request(`/common/manager/role-assign`, {
    method: 'POST',
    body: params,
    noToken: false,
  });
}
export async function getCategoryList(params) {
  return request(`/poadmin/category/category-list?page=${params.page}&size=${params.size}`, {});
}
export async function addCategory(params) {
  return request('/poadmin/category/category-add', {
    method: 'POST',
    body: params,
  });
}
export async function editCategory(params) {
  return request('/poadmin/category/category-edit', {
    method: 'POST',
    body: params,
  });
}
export async function delCategory(params) {
  return request('/poadmin/category/category-del', {
    method: 'POST',
    body: params,
  });
}
export async function statusCategory(params) {
  return request('/poadmin/category/category-status', {
    method: 'POST',
    body: params,
  });
}
export async function getLabelList(params) {
  return request(
    `/poadmin/label/label-list?page=${params.page}&label_name=${params.label_name}&type_location=${
      params.type_location
    }&type_brand=${params.type_brand}`,
    {}
  );
}
export async function addLabel(params) {
  return request('/poadmin/label/label-add', {
    method: 'POST',
    body: params,
  });
}
export async function statusLabel(params) {
  return request('/poadmin/label/label-status', {
    method: 'POST',
    body: params,
  });
}
export async function editLabel(params) {
  return request('/poadmin/label/label-edit', {
    method: 'POST',
    body: params,
  });
}
export async function delLabel(params) {
  return request('/poadmin/label/label-del', {
    method: 'POST',
    body: params,
  });
}
export async function getPoList(params) {
  if (params.category_id === 'all') {
    params.category_id = '';
  }
  return request(
    `/poadmin/po/po-list?page=${params.page}&sort=${params.sort}&category_id=${
      params.category_id
    }&tag=${params.tag}&content=${params.content}&uname=${params.uname}`,
    {}
  );
}
export async function poCatEdit(params) {
  return request('/poadmin/po/po-cat-edit', {
    method: 'POST',
    body: params,
  });
}
export async function poTagEdit(params) {
  return request('/poadmin/po/tag-edit', {
    method: 'POST',
    body: params,
  });
}
export async function posetHot(params) {
  return request('/poadmin/po/po-hot', {
    method: 'POST',
    body: params,
  });
}
export async function posetTop(params) {
  return request('/poadmin/po/po2top', {
    method: 'POST',
    body: params,
  });
}
export async function podelTop(params) {
  return request('/poadmin/po/potop-del', {
    method: 'POST',
    body: params,
  });
}
export async function podel(params) {
  return request('/poadmin/po/po-del', {
    method: 'POST',
    body: params,
  });
}

export async function poShutUp(params) {
  return request('/poadmin/po/po-shutup', {
    method: 'POST',
    body: params,
  });
}
export async function poRandPraise(params) {
  return request('/poadmin/po/rand-praise', {
    method: 'POST',
    body: params,
  });
}
export async function poReview(params) {
  return request('/poadmin/po/po-review', {
    method: 'POST',
    body: params,
  });
}
export async function poContetnEdit(params) {
  return request('/poadmin/po/po-edit', {
    method: 'POST',
    body: params,
  });
}
export async function delImg(params) {
  return request('/poadmin/po/delimg', {
    method: 'POST',
    body: params,
  });
}
export async function setCover(params) {
  return request('/poadmin/po/set-cover', {
    method: 'POST',
    body: params,
  });
}
export async function getPoTag(params) {
  return request(
    `/poadmin/po/tag-list?page=${params.page}&size=${params.size}&tag_name=${params.tag_name}`,
    {}
  );
}
