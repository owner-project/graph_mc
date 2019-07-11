export function voiceAPIService($injector) {
    'ngInject';
    const http = $injector.get('$http');
    const $q = $injector.get('$q');

    let httpService = {
        /**
         * @desc 获取嫌疑犯表格的列表
         */
        getVoiceTable: function (params) {
            return http.get('/admin_api/phonebook/get_excelcontent', params);
        },

        /**
         * @desc 嫌疑犯表格页面提交
         */
        submitVoiceTable: function (params = {}) {
            return http.post('/admin_api/phonebook/create_suspect_graph', params);
        },

        /**
         * @desc 获取嫌疑犯列表
         */
        getSuspectsInfoTable: function (params = {}) {
            return http.post('/admin_api/phonebook/get_countresult', params);
        },

        /**
         * @desc 获取嫌疑犯集合
         */
        getVoiceList: function (params) {
            return http.get('/admin_api/phonebook/get_graphrecords', {params});
        },

        /**
         * @desc 删除嫌疑犯集合item
         */
        deleteVoiceListItem: function (params = {}) {
            return http.post('/admin_api/phonebook/remove_record', params);
        },

        /**
         * @desc 话单表格页面提交
         */
        submitTicketTable: function (params = {}) {
            return http.post('/admin_api/phonebook/create_calllog_graph', params);
        },

        /**
         * @desc 获取话单列表
         */
        getTicketList: function (params ) {
            return http.get('/admin_api/phonebook/get_calllogcontent', {params});
        },

         /**
         * @desc 话单设为本机
         */
        setPhones: function (params = {} ) {
            return http.post('/admin_api/phonebook/count_by_number', params);
        },

         /**
         * @desc 话单删除项
         */
        deleteItem: function (params = {} ) {
            return http.post('/admin_api/phonebook/delete_call_logs', params);
        },

        /**
         * @desc 话单下方echart图数据
         */
        getBottomEData: function (params = {} ) {
            return http.post('/admin_api/phonebook/count_for_echart', params);
        },

         /**
         * @desc 话单右边的pie图数据
         */
        getPieEData: function (params = {} ) {
            return http.post('/admin_api/phonebook/count_by_incident', params);
        },



    }

    return httpService;
}
