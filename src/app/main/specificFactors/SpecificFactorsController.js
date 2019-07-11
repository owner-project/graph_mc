export class SpecificFactorsController { //specific-map
    constructor($injector){
        'ngInject';
        this.inject = $injector;
        this.utils = this.inject.get('util');
        this.applicationAPIService = this.inject.get('applicationAPIService');
        this.searchData = {
            searchContent: ''
        };
        this.pager = {
            pageSize: 20,
            pageNo: 1,
            total: 0
        };
        this.jsonData = {
            // image: 'assets/images/theme_star_blue/gang-mining/sd.png',
            // title: '涉毒',
            resultData: [],
            hitevents: [],
            chart: {
                nodes: [],
                links: []
            },
            personal: {}

        };
        const filter = $injector.get('$filter')('fzlxFilter');
        const $state = $injector.get('$state');
        // this.jsonData.image = filter($state.params.type).image;
        // this.jsonData.title = filter($state.params.type).name;
        this.init();
    }

    init() {
        const $this = this;
        this.getPageData().then(() => {
            if (this.jsonData.resultData.length) {
                this.getRecessivePersonDetail(this.jsonData.resultData[0]);
            }
        });
    }

    //初始化表格颜色
    init_table_color() {
        const $this = this;
        angular.forEach($this.jsonData.resultData, (item) => {
            item.iColor = $this.utils.selectTableColor(parseFloat(item.wxd));
            item.wColor = $this.utils.selectTableColor(parseFloat(item.qmd));
       });
    }

    //积分模型点击事件 跳转到 积分规则
    into_rule() {
        const $this = this;
        const state = $this.inject.get('$state');
        state.transitionTo('main.integralRule', {}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    getPageData() {
        const $state = this.inject.get('$state');
        const defer = this.inject.get('$q').defer();
        const params = {
            searchContent: this.searchData.searchContent.trim(),
            pageSize: this.pager.pageSize,
            pageNo: this.pager.pageNo
        };
        this.applicationAPIService.getRecessivePersonList(params).then(result => {
            if (result.status === 200) {
                if (result.data && result.data.status === 0 && result.data.data) {
                    this.jsonData.resultData = result.data.data.list;
                    this.init_table_color();
                    this.pager.total = result.data.data.total;
                }
            }
            defer.resolve();
        }, error => {
            defer.reject();
        });
        return defer.promise;
    }

    getRecessivePersonDetail(item) {
        const params = {
            sfzh: item.sfzh
        };

        this.applicationAPIService.getRecessivePersonDetail(globalLoading(params)).then(result => {
            if (result.status === 200) {
                if (result.data && result.data.status === 0 && result.data.data) {
                    this.jsonData.personal = result.data.data.base;
                    this.jsonData.hitevents = result.data.data.hitevents;
                    this.jsonData.chart.nodes = result.data.data.events.vertices.map(item => Object.assign({}, item, {id: item._id}));
                    this.jsonData.chart.links = result.data.data.events.edges.map(item => Object.assign({}, item, {id: item._id, from: item._from, to: item._to}));
                }
            }
        }, error => {
        });
    }

    //跳转到图析
    into_porpoise(item,isToGis) {
        localStorage.setItem("isToGis", isToGis)
        localStorage.setItem('canUpdateGraph','false')
        const $this = this;
        const state = $this.inject.get('$state');
        state.transitionTo('main.porpoise', {type: 'normal', id: encodeURIComponent(`person/${item.sfzh}`)}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    //跳转到档案
    into_people(item){
        const $this = this;
        const state = $this.inject.get('$state');
        state.transitionTo('main.file', {key: item.sfzh,type:'person'}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
}
