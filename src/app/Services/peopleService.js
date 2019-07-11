export function peopleService($injector) {
    'ngInject';
    const http = $injector.get('$http');
    const $q = $injector.get('$q');

    let httpService = {
        /**
         * @desc 获取人物的基本数据
         */
        getPeopleInfo: function (params = {} ) {
            return http.post('/admin_api/person/item', params);
        },
        /**
         * @desc 查询左下角的echart图(概览)
         */
        getTrailInfo: function (params = {} ) {
            params.start = params.start || '';
            params.start = String(params.start);
            params.end = String(params.end || '');
            return http.post('/admin_api/person/getTrailInfo', params);
        },
        /**
         * @desc 导出人物档案
         */
        getLoadInfo: function (params = {} ) {
            return http.post('/admin_api/person/loadinfo', params,{responseType: 'arraybuffer'});
        },
        /**
         * @desc 查询档案统计数据
         */
        getStatisticsInfo(){
            return http.get('/admin_api/person/statistics')
        },

        /**
         * @description 查询左侧菜单信息(实体列表)
         */

        getLeftMenuInfo(params= {type:'',keyword:[],pageNo:'1',pageSize:'10'}){
            return http.post("/admin_api/person/entityList",params)
        },
        
        /**
         * @desc 获取轨迹相关关系
         */
        getRelation(params) {

            return http.post('/admin_api/person/getRelationEvents', params);
        },
        /**
         * @desc 获取同关注列表
         */
        getSameFocusList(params) {
            return http.post('/admin_api/person/getSameFocus', params);
        },
        /**
         * @desc 获取图析历史
         */
        getJudgImages(params) {
            return http.post('/admin_api/person/getGrapShot', params);
        },
        /**
         * @desc 获取关系明细
         */
        geEventsByIdAndRelation(params) {
            return http.post('/admin_api/person/geEventsByIdAndRelation', params);
        },
        /**
         * @desc 获取被关注人的动态列表
         */
        getFocusDynamic(params) {
            return http.post('/admin_api/count/getFocusDynamic', params);
        }
    };

    return httpService;
}
