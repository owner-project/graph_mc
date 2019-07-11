export function phoneTypeService($injector) {
    'ngInject';

    let service = {
        getAddData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/add_phoneRule', data);
        },
        getDeleteData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/del_phoneRule', data);
        },
        getUpdateData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/upd_phoneRule', data);
        },
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/dictionary/get_phoneRule', data);
        }

    };

    return service;

}
