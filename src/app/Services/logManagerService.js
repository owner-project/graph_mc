export function logManagerService($injector) {
    'ngInject';

    let service = {
        getDataList: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/systemLog/list', data);
        }
    };

    return service;

}
