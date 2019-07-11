export function porpoiseService($injector) {
    'ngInject';

    let http = $injector.get('$http');

    let httpService = {
        getPorpoiseData: (data) => {
            if (!Array.isArray(data.id)) {
                data.id = [data.id];
            }
            return http.post('/admin_api/person/expand', data);
        },

        getSuspectsPorpoiseData: (data) => {
            return http.post('/admin_api/phonebook/expand', data);
        },
        retrieve: (data) => {
            return http.post('/admin_api/person/retrieve_edges', data);
        },

        getLinkData: (data) => {
            return http.post('/admin_api/person/check_eventDetail', data);
        },

        getLinkData_out: (data) => {
            return http.post('/admin_api/person/check_eventDetail/third_party', data);
        },

        getLineRelation: (data) => {
            return http.post('/admin_api/person/rel_deduction', data);
        },

        getLineRelation_out: (data) => {
            return http.post('/admin_api/person/rel_deduction/third_party', data);
        },

        initPorpoise: () => {
            return http.get('/admin_api/person/init_graph');
        },

        saveJudge: (data) => {
            return http.post('/admin_api/person/save_graphshot', data);
        },
        // 保存临时文件
        saveTemporatyJudge: (data) => {
            return http.post('/admin_api/person/save_tmpgraphshot', data);
        },

        /**
         * @description 关系收回
         */
        regain: (data) => {
            return http.post('/admin_api/person/retrieve_vertices',data);
        },

        /**
         * @description 实体节点内关系推演,不同于关系推演,这个接口不会引入新的实体
         * @param data 实体id
         */
        getDirectRelation: (data) => {
            return http.post('/admin_api/person/getDirectRelation',data);
        },

        /**
         * @description 获取实体详情
         * @param str
         */
        getNodeDetail: (str) => {
            return http.get('/admin_api/person/check_detail?id=' + encodeURIComponent(str));
        },

        getNodeDetail_out(str) {
            return http.get('/admin_api/person/check_detail/third_party?id=' + encodeURIComponent(str));
        },

        /**
         * @descriotion 通过证件号获取节点信息
         * @param data
         */
        getNodeInfo: (data) => {
            return http.post('/admin_api/person/search_vertices', data);
        },

        getEventMap: () => {
            return {
                'type_1': {
                    'rzbm': '入住编码',
                    'key': '身份证号',
                    'rzxm': '入住姓名',
                    'fjh': '房间号',
                    'ldbh': '旅店编号',
                    'rzsj': '入住时间',
                    'lksj': '离开时间',
                    'type': '类型'
                },
                'type_2': {
                    'zwm': '中文名',
                    'zjlx': '证件类型',
                    'key': '证件号码',
                    'ywm': '英文名',
                    'hbh': '火车班次',
                    'cfcz': '出发车站',
                    'ddcz': '到达车站',
                    'cxh': '车厢号',
                    'zwh': '座位号',
                    'xdhhm': '电话号码',
                    'ysdhhm': '电话号码原始',
                    'jpk': '检票口',
                    'ccrq': '车次日期',
                    'cfsj': '出发时间',
                    'ddsj': '到达时间'
                },
                'type_3': {
                    'zwm': '中文名',
                    'zjlx': '证件类型',
                    'key': '证件号码',
                    'ywm': '英文名',
                    'key_label_2': '后缀主键2',
                    'hbh': '航班号',
                    'djjc': '登机机场',
                    'ddjc': '到达机场',
                    'cyhkgs': '承运航空公司',
                    'xlzjs': '行李总件数',
                    'xlzzl': '行李总重量',
                    'zwh': '座位号',
                    'xdhhm': '电话号码',
                    'ysdhhm': '电话号码原始',
                    'djh': '登机号',
                    'hbrq': '航班日期',
                    'jgsj': '进港时间',
                    'lgsj': '离港时间',
                    'type': '类型'
                },
                'type_5': {
                    'swbm': '上网编号',
                    'wbmc': '网吧名称',
                    'wbbh': '网吧编号',
                    'key': '公民身份证号',
                    'sxsj': '上线时间',
                    'xxsj': '下线时间',
                    'type': '类型',
                    'wbdz': '网吧地址'

                }
            }
        },

        getNodeInfoMap: () => {
            return {
            }
        },

        getEntity: () => {
            return {
                1: '普通人员',
                2: '重点人员',
                3: '车辆',
                4: '虚拟身份',
                5: '宾馆',
                6: '案件',
                7: '网吧',
                8: '航班',
                9: '火车',
                10: '房产',
                11: '重点企业',
                15: '电话号码'
            }
        },

        getEntityInfo: (data) => {
            return http.post('/admin_api/person/get_trail_list', data);
        },

        getTreeInfo: (data) => {
            return http.post('/admin_api/person/transform_tree', data);
        },

        getCircleInfo: (data) => {
            return http.post('/admin_api/person/transform_cyclic', data);
        },

        getWebInfo: (data) => {
            return http.post('/admin_api/person/transform_gird', data);
        },

        searchNodeInfo: (data) => {
            return http.post('/admin_api/person/serch_vertices', data);
        },
        importRelationship(data) {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/person/import_data',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },
        createGraph(params) {
            return http.post('/admin_api/import/createGraph', params);
        },
        importExcel(data) {
            const formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });

            return http({
                method: 'POST',
                url: '/admin_api/import/excel',
                headers: {
                    'Content-Type': undefined
                },
                data: formData
            })
        },
        deleteNode(data) {
            return http.post('/admin_api/person/vertex', data);
        },
        mergeGraph(data) {
            return http.post('/admin_api/person/merged_source', data);
        },
        getRelationEntity(params) {
            return http.get('/admin_api/dictionary/relation_entity/type', {params});
        },
        changeStep(flag) {
            return http.post('/admin_api/person/getPreOrNextStep', {flag});
        },
        getImportRecordList(params) {
            return http.post('/admin_api/import/getImportRecordList', params);
        },
        getGraphComponent(params) {
            return http.get('/admin_api/import/getImportDetailById', {params});
        },
        deleteImportRecord(params) {
            return http.delete('/admin_api/import/deleteImportRecord', {params});
        },
        exportExcel(params) {
            return http.post('/admin_api/import/download', params, {responseType: 'arraybuffer'});
        },
        getSnapshotData(params) {
            return http.get('/admin_api/person/get_graphshot_data', {params});
        },
        updateJudgeData(params) {
            return http.post('/admin_api/person/update_graphshot', params);
        },
        getRetrieveType() {
            return http.get('/admin_api/dictionary/graphNames');
        },
        exportBDP(data) {
            return http.post('/admin_api/import/download_toBDP', data);
        },
        // 获取相关人轨迹统计数量
        getGraphStatisticsTrail(type,edges,active_edges =[]){
            return http.post('/admin_api/graph/statistics/trail', {type,edges,active_edges});
        },
        // 获取人员轨迹类型
        getGeoConfig(){
            return http.get('/admin_api/person/getGeoConfig');
        },
        //获取条件扩展事件类型
        getExpandTypeConfig(data){
            return http.post('/admin_api/v1/manager/expand/type/all',data);
        },
        // 获取人员轨迹数据
        getGeoData(data){
            return http.post('/admin_api/person/getGeoData',data);
        },
        // 获取多个人员轨迹数据
        getMutilEntityData(data){
            return http.post('/admin_api/person/getMutilEntityData',data);
        },
        // 获取条件扩展一级类型
        getRelatedRoot(data){
            return http.post('/admin_api/v1/manager/expand/type/active/root',data);
        },
        // 获取条件扩展-组合扩展选项数据
        getCombineExpandTypeConfig(){
            return http.post('/admin_api/graphic/expand/es/term');
        },
        // 条件扩展
        combineExpand(data){
            return http.post('/admin_api/graphic/expand/es',data);
        },
        //半径扩展-获取轨迹类型
        getGeoTerm(id){
            return http.get('/admin_api/person/getGeoTerm/' + id);
        },
        //存储操作数据
        operationSave(data){
            return http.post('/admin_api/v1/graph/operate/save' ,data);
        },
        //获取操作数据
        operationGet(data){
            return http.post('/admin_api/v1/graph/operate/find' ,data);
        },
        //删除操作数据
        operationDel(id){
            return http.delete('/admin_api/v1/graph/operate/' + id);
        },
    };

    return httpService;
}
