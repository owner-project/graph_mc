export class EnterpriseRankingController {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.$timeout = $injector.get('$timeout');
        this.applicationAPIService = $injector.get('applicationAPIService');
        this.utils = $injector.get('util');

        this.jsonData = {
            resultData: []
        };
        this.init();
    }

    init() {
        this.searchData = {
            name: ''
        };
        this.pager = {
            pageSize: 20,
            pageNo: 1,
            total: 0
        };

        this.getEnterpriseRankList();
    }

    searchList() {
        this.pager.pageNo = 1;
        this.getEnterpriseRankList();
    }

    getEnterpriseRankList() {
        const params = {
            name: this.searchData.name,
            pageSize: this.pager.pageSize,
            pageNo: this.pager.pageNo
        };

        this.applicationAPIService.getEnterpriseRankList(globalLoading(params)).then((result) => {
            if (result.data && result.data.data) {
                this.jsonData.resultData = result.data.data.list || [];
                this.pager.total = result.data.data.total;
                this.init_table_color();
            }
        }, (error) => {
            //expection
        });
    }

    //初始化表格颜色
    init_table_color() {
        let $this = this;
        angular.forEach($this.jsonData.resultData, (item) => {
            item.cColor = $this.utils.selectTableColor(item.score);
            item.bColor = $this.utils.selectTableBfbColor(item.score);
        });
    }

    //企业画像点击事件
    corporatePortraitClick(item) {
        let $this = this;
        let state = $this.inject.get('$state');
        state.transitionTo('main.corporatePortrait', {id: item.id}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
}
