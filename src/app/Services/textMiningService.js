export function textMiningService($injector) {
    'ngInject';

    let service = {
        getBaseData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/text_mining', data);
        },
        getcbData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/series', data);
        },

        getcbDataFilter(data) {
            let http = $injector.get('$http');
            return http.post('/admin_api/series_filter', data);
        },
        getRelationData: (data) => {
            let http = $injector.get('$http');
            return http.post('/admin_api/relationship', data);
        },

        appraiseParse(params) {
            let http = $injector.get('$http');

            return http.get('/admin_api/appraise/parse', {params});
        },

        correctEnglish(params) {
            let http = $injector.get('$http');

            return http.get('/admin_api/correct_en', {params});
        },
        textMatch(params) {
            let http = $injector.get('$http');

            return http.get('/admin_api/match', {params});
        }
    }

    return service;

}
