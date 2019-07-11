export function tradeAPIService($injector) {
    'ngInject';

    const http = $injector.get('$http');

    const service = {
        getTradeList: () => {
            return http.get('/admin_api/treasuryAnalyst/get_graphrecords');
        },
        exlImportInfo: (data) => {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/treasuryAnalyst/upload_excel',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },
        capitalFlowImport(data) {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/treasuryAnalyst/upload_excel/preview',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },
        deleteTradeListItem: (data) => {
            return http.post('/admin_api/treasuryAnalyst/removeRecord', data);
        },
        getTradeListCount: (data) => {
            return http.post('/admin_api/treasuryAnalyst/getAccount', data);
        },
        getzczjAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/fromMoney', data);
        },
        getzrzjAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/toMoney', data);
        },
        getzjzcfAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/foundToTop', data);
        },
        getzjzczAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/foundFromTop', data);
        },
        getzczhAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/fromAccount', data);
        },
        getzrzhAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/toAccount', data);
        },
        getzhzczAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/foundFromAccount', data);
        },
        getzhzcfAcountData: (data) => {
            return http.post('/admin_api/treasuryAnalyst/foundToAccount', data);
        },
        getReportList(data) {
            return http.post('/admin_api/treasuryAnalyst/foundList', data);
        },
        getReportGraph(data) {
            return http.post('/admin_api/person/expand', data);
        },
        getReportItem(data) {
            return http.post('/admin_api/treasuryAnalyst/getInteractive', data);
        },
        getReportLink(data) {
            return http.post('/admin_api/person/check_eventDetail', data);
        }
        
    };

    return service;

}