export function assetManagerService($injector) {
    'ngInject';

    let service = {
        getSourceData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/property/get_sourceData', data);
        },
        getEntityData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/property/get_entity', data);
        },
        getRelationData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/property/get_relation', data);
        },
        getTagData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/property/get_tag', data);
        }
    };

    return service;

}
