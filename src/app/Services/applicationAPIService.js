export function applicationAPIService($injector) {
    'ngInject';
    const http = $injector.get('$http');
    const $q = $injector.get('$q');

    let httpService = {
        /**
         * @desc 获取重点公司排名
         */
        getEnterpriseRankList: function (params) {
            return http.post('/admin_api/enterprise/list', params);
        },
        /**
         * @desc 获取重点公司企业信息
         */
        getEnterpriseDetailInfo: function (params) {
            return http.post('/admin_api/enterprise/item', params);
        },

        /**
         * @desc 获取团伙挖掘页面数据
         */
        getGangMiningList: function (params) {
            return http.post('/admin_api/gangMining/list', params);
        },

        /**
         * @desc 获取团伙具体详情
         * @param params.id - {String}
         */
        getGangDetailInfo: function (params) {
            return http.post('/admin_api/gangMining/item', params);
        },

        exlImportInfo: (data) => {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/phonebook/upload_excel',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },

        /**
         *
         * @desc 获取隐性重点人员概要
         * @param params
         */
        getRecessivePersonIndex: function (params) {
            return http.post('/admin_api/recessivePerson/index', params);
        },

        /**
         *
         * @desc 获取隐性重点人员列表
         * @param params
         */
        getRecessivePersonList: function (params) {
            return http.post('/admin_api/recessivePerson/list', params);
        },

        /**
         *
         * @desc 获取隐性重点人员详情
         * @param params
         */
        getRecessivePersonDetail: function (params) {
            return http.post('/admin_api/recessivePerson/item', params);
        },

        /**
         *
         * @desc 获取积分规则列表
         * @param params
         */
        getIntegralRuleList: function (params) {
            return http.post('/admin_api/integralRule/list', params);
        },

        /**
         * @desc 获取积分规则修改日志
         * @param params
         */
        getIntegralLogsList: function (params) {
            return http.post('/admin_api/integralRule/logs', params);
        },

        /**
         *
         * @desc 编辑积分规则
         * @param params
         */
        editIntegralRule: function (params) {
            return http.post('/admin_api/integralRule/save', params);
        },

        getGccData: function(params) {
            return http.post('/admin_api/multi_card/list', params);
        }
    }

    return httpService;
}
