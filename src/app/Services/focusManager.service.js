export function focusManagerService($injector, $http) {
    'ngInject';
    const http = $http;
    const $rootScope = $injector.get('$rootScope');
    const toaster = $injector.get('toaster')
    let httpService = {
        /**
         * 
         * @param {*} force  是否强制获取
         */
        getFocusGroup: function (force = false) {
            return new Promise((resolve, reject) => {
                if ($rootScope.focusGroupInfo && $rootScope.focusGroupInfo.isInit && !force) {
                    resolve($rootScope.focusGroupInfo)
                } else {
                    let params ={
                        type:'all'
                    }
                    http.get('/admin_api/subscribe/getGroupFocusByUserid',{params}).then(res => {
                        if (res.status == 200 && res.data.status == 0) {
                            $rootScope.focusGroupInfo = {
                                list: res.data.data,
                                isInit: true
                            }
                            resolve($rootScope.focusGroupInfo)
                        } else {
                            $rootScope.focusGroupInfo = {
                                list: [],
                                isInit: false
                            }
                            resolve($rootScope.focusGroupInfo)
                            toaster.error('获取失败,请重试')
                            reject('err')
                        }
                    })
                }
            })
        },
        getEntityFocusGroup: (entityId)=>{
            let params = {
                id:entityId
            }
            return http.get('/admin_api/subscribe/getGroupFocusByUserid',{params})
        },
        getFocusGroupEntities: function (params) {
            return http.get('admin_api/my_focus/getEntityOfGroup', {
                params
            })
        },
        /**
         * @description
         * @param {list} :array 关注的数据
         * @param {type} :string add |update |  delete  添加关注 |更新关注 | 取消关注
         */
        focusEntityListHandle: function (params) {
            return http.post('/admin_api/my_focus/focus_on', params);
        },
        //编辑分组名称
        editFocusGroup: (param) => {
            return http.post('/admin_api/subscribe/upsert', param);
        },
        //删除分组
        deleteFocusGroup:(params) => {
            return http.post('/admin_api/subscribe/delete',params)
        }
    }
    return httpService;
}
