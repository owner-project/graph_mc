export function addressTypeService($injector) {
    'ngInject';

    let service = {
        getAddData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/add_address', data);
        },
        getDeleteData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/del_address', data);
        },
        getUpdateData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/upd_address', data);
        },
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/get_address', data);
        }

    };

    return service;

}
