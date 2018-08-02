import request from '../utils/request';

export async function queryMenus() {
  return request('/common/menus/menus',{
    noToken: false
  });
}
