export function authManagerService($injector) {
    'ngInject';

    let service = {
        getAddData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/permission/add', data);
        },
        getDeleteData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/permission/del', data);
        },
        getUpdateData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/permission/modify', data);
        },
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/permission/get_list', data);
        },
        getDataInfo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/permission/get_info', data);
        }
        
    }

    return service;

}