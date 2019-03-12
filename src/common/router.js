import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login', 'menu'], () =>
        import('../layouts/BasicLayout')
      ),
    },
    '/welcome': {
      component: dynamicWrapper(app, [], () => import('../routes/Welcome/Welcome')),
    },
    // '/decoration/analysis': {
    //   component: dynamicWrapper(app, ['chart'], () => import('../routes/Dashboard/Analysis')),
    // },
    // '/decoration/monitor': {
    //   component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    // },
    // '/decoration/workplace': {
    //   component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
    //     import('../routes/Dashboard/Workplace')
    //   ),
    // hideInBreadcrumb: true,
    // name: '工作台',

    // },
    '/po-center/decoration-list': {
      component: dynamicWrapper(app, ['poCenter/decoration'], () =>
        import('../routes/PoCenter/Decoration')
      ),
    },
    '/po-center/decoration-detail/:medal_id': {
      component: dynamicWrapper(app, ['poCenter/decoration'], () =>
        import('../routes/PoCenter/Detail')
      ),
    },
    '/po-center/post-list': {
      component: dynamicWrapper(app, ['poCenter/postList'], () =>
        import('../routes/PoCenter/PostList')
      ),
    },

    '/mini-app/topic-reply-list': {
      component: dynamicWrapper(app, ['miniApp/topic', 'poCenter/decoration'], () =>
        import('../routes/miniApp/TopicList')
      ),
    },

    '/manager-center/manager-auth': {
      component: dynamicWrapper(app, ['manage/manageAuth'], () =>
        import('../routes/ManageCenter/ManageAuth')
      ),
    },
    '/manager-center/auth-list': {
      component: dynamicWrapper(app, ['manage/authList'], () =>
        import('../routes/ManageCenter/AuthList')
      ),
    },
    '/manager-center/role-manager': {
      component: dynamicWrapper(app, ['manage/roleManager', 'manage/assignDetail'], () =>
        import('../routes/ManageCenter/RoleManager')
      ),
    },
    '/manager-center/assign-detail': {
      component: dynamicWrapper(app, ['manage/assignDetail'], () =>
        import('../routes/ManageCenter/AssignDetail')
      ),
    },
    // '/form/step-form/confirm': {
    //   name: '分步表单（确认转账信息）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step2')),
    // },
    // '/form/step-form/result': {
    //   name: '分步表单（完成）',
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step3')),
    // },
    // '/form/advanced-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
    // },
    // '/list/table-list': {
    //   component: dynamicWrapper(app, ['rule'], () => import('../routes/List/TableList')),
    // },
    // '/list/basic-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/BasicList')),
    // },
    // '/list/card-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/CardList')),
    // },
    // '/list/search': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/List')),
    // },
    // '/list/search/projects': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Projects')),
    // },
    // '/list/search/applications': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Applications')),
    // },
    // '/list/search/articles': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Articles')),
    // },
    // '/profile/basic': {
    //   component: dynamicWrapper(app, ['profile'], () => import('../routes/Profile/BasicProfile')),
    // },
    // '/profile/advanced': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import('../routes/Profile/AdvancedProfile')
    //   ),
    // },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
    '/po-center/category-manage': {
      component: dynamicWrapper(app, ['poCenter/category'], () =>
        import('../routes/PoCenter/Category')
      ),
    },
    '/po-center/label-manage': {
      component: dynamicWrapper(app, ['poCenter/label'], () => import('../routes/PoCenter/Label')),
    },
    '/po-center/po-manage': {
      component: dynamicWrapper(app, ['poCenter/content'], () =>
        import('../routes/PoCenter/Content')
      ),
    },
    '/po-center/comment-list/:po_id/:page': {
      component: dynamicWrapper(app, ['poCenter/comment'], () =>
        import('../routes/PoCenter/Comment')
      ),
    },
    '/po-center/goods-manage': {
      component: dynamicWrapper(app, ['poCenter/goods'], () =>
        import('../routes/PoCenter/Goods')
      ),
    },
    '/po-center/comment-report': {
      component: dynamicWrapper(app, ['poCenter/report'], () =>
        import('../routes/PoCenter/Report')
      ),
    },
    '/po-center/flow-advert': {
      component: dynamicWrapper(app, ['poCenter/advert'], () =>
        import('../routes/PoCenter/Advert')
      ),
    },
    '/app/notice-manage': {
      component: dynamicWrapper(app, ['app/notice'], () =>
        import('../routes/App/Notice')
      ),
    },
    '/app/scroll-ad-manage': {
      component: dynamicWrapper(app, ['app/scrollad'], () =>
        import('../routes/App/ScrollAd')
      ),
    },
    '/app/start-up': {
      component: dynamicWrapper(app, ['app/startup'], () =>
        import('../routes/App/Startup')
      ),
    },
    '/app/app-config': {
      component: dynamicWrapper(app, ['app/appconfig'], () =>
        import('../routes/App/AppConfig')
      ),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
