export function cardTypeService($injector) {
    'ngInject';

    let service = {
        getAddData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/add_identityRule', data);
        },
        getDeleteData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/del_identityRule', data);
        },
        getUpdateData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/upd_identityRule', data);
        },
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/get_identityRule', data);
        }

    };

    return service;

}
