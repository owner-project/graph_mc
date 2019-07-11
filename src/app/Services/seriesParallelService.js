export function seriesParallelService($injector) {
    'ngInject';
    let http = $injector.get('$http');
    let service = {
        textAnalyse: (content) => { //获取某一个大类下的类型,如获取实体下的(人,车,案件)
            return http.post('admin_api/textmining/analyse' , {content});
        },
        connectCase:(params) => {
            return http.post('admin_api/textmining/connect_case',params)
        },
        getImportancePerson:(params) => {
            return http.post('admin_api/textmining/key_person',params)
        }
    }
    return service
}