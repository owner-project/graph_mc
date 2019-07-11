export function roleManagerService($injector) {
    'ngInject';

    let service = {
        getAddData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/role/add', data);
        },
        getDeleteData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/role/del', data);
        },
        getUpdateData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/role/modify', data);
        },
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/role/get_list', data);
        },
        getDataInfo: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/role/get_info', data);
        }

    };

    return service;

}
