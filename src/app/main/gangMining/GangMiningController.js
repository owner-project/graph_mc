// import echarts from 'echarts';
var echarts = require('../../../../../Odipus/node_modules/echarts/lib/echarts');

export class GangMiningController {
    constructor($injector, $scope) {
        'ngInject';
        this.inject = $injector;
        this.applicationAPIService = $injector.get('applicationAPIService');

        this.searchData = {
            name: '',
            type: -1
        };

        this.jsonData = {
            counts: [],
            option: [],
            resultData: [],
            gangDetailInfo: {}
        };

        this.pager = {
            pageNo: 1,
            pageSize: 20
        };
        this.init($scope);
    }

    init($scope) {
        let $this = this;
        let timeout = $this.inject.get('$timeout');

        //初始化动画
        timeout(() => {
            angular.element('.jq_gang-mining_left').addClass('gang-animate');
            angular.element('.jq_gang-mining_right').addClass('gang-animate');
        }, 500);

        this.getPageData(true);

        const cancel = this.inject.get('$rootScope').$on('updateTheme', () => {
            this.initEchart2Circle();
        });

        $scope.$on('$destroy', () => {
            cancel();
        });
    }

    changePage() {
        this.getPageData();
    }

    getPageData(init) {
        const defer = this.inject.get('$q').defer();
        const $filter = this.inject.get('$filter');

        let params = {};
        params.type = this.searchData.type != -1 ? this.searchData.type : undefined;
        params.name = this.searchData.name;
        params.pageNo = this.pager.pageNo;
        params.pageSize = this.pager.pageSize;

        params = init ? globalLoading(params) : params;

        function _getNumber(number) {
            return number.indexOf('%') > -1 ? number.split('%')[0] : number;
        }

        this.applicationAPIService.getGangMiningList(params).then((result) => {
            if (result.data && result.data.data) {
                this.jsonData.counts = result.data.data.counts || [];
                this.jsonData.resultData = result.data.data.list || [];
                this.pager.total = result.data.data.total;
                this.jsonData.resultData.length && this.getGangDetailInfo(this.jsonData.resultData[0].id);

                this.jsonData.resultData.forEach((gang) => {
                    ['wxd', 'hyd', 'jjd'].forEach((key) => {
                        gang[key] = _getNumber(gang[key]);
                    });
                });


                //加载工具类
                this.utils = this.inject.get('util');
                this.init_table_color();

                if (result.data.data.counts) {
                    this.jsonData.option = result.data.data.counts.map((type) => {
                        return {
                            name: $filter('fzlxFilter')(type.thlx).name, //团伙类型名称
                            value: type.thlx //团伙类型
                        }
                    });
                }

                this.jsonData.option.unshift({
                    name: '全部',
                    value: -1
                });
            }
            defer.resolve();
        }, (error) => {
            //exception
            defer.reject();
        });

        return defer.promise;
    }

    getGangDetailInfo(id) {
        const timeout = this.inject.get('$timeout');
        const params = {
            id,
        };

        function _getNumber(number) {
            return number.indexOf('%') > -1 ? number.split('%')[0] : number;
        }

        this.applicationAPIService.getGangDetailInfo(params).then((result) => {
            if (result.data && result.data.data) {
                this.jsonData.gangDetailInfo = result.data.data;
                ['wxd', 'jjd', 'hyd'].forEach((key) => {
                    this.jsonData.gangDetailInfo[key] = _getNumber(this.jsonData.gangDetailInfo[key]);
                    this.jsonData.gangDetailInfo[key + 'Color'] = this.utils.selectTableBfbColor(this.jsonData.gangDetailInfo[key]);
                });

                this.initEchart2Circle();
            }
        }, (error) => {
            //exception
        });
    }

    //初始化表格颜色
    init_table_color() {
        angular.forEach(this.jsonData.resultData, (item) => {
            item.lColor = this.utils.selectTableBfbColor(item.wxd);
            item.aColor = this.utils.selectTableBfbColor(item.jjd);
            item.dColor = this.utils.selectTableBfbColor(item.hyd);
        });
    }

    toPorpoise(item) {
        const state = this.inject.get('$state');

        state.transitionTo('main.porpoise', {type: 'normal', id: encodeURIComponent(`gang/${item.id}`)}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    initEchart2Circle() {
        let myChartCircle = echarts.init(document.getElementById('gang-mining-circle'));
        const $filter = this.inject.get('$filter');
        const isStarBlue = $('body').hasClass('theme_star_blue');
        const echartData = {};

        this.jsonData.gangDetailInfo.thcy.forEach((member) => {
            echartData[`${$filter('fzlxFilter')(member.lx).name}`] ? echartData[`${$filter('fzlxFilter')(member.lx).name}`]++ : echartData[`${$filter('fzlxFilter')(member.lx).name}`] = 1;
        });

        let option = {
            color: ['#9ACC67', '#5182e4', '#AF41EB', '#EBA041', '#E1EB41', '#41EB66', '#41C1EB', '#8241EB'],
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                x: 'right',
                top: '35',
                padding: 30,
                textStyle: {
                    color: isStarBlue ? '#ffffff': 'rgba(10, 18, 32, 0.64)'
                },
                data: Object.keys(echartData)
            },
            series: [
                {
                    center: '90,90',
                    type: 'pie',
                    radius: ['50', '75'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: Object.entries(echartData).map((d) => {return {name: d[0], value: d[1]}})
                }
            ]
        };
        myChartCircle.setOption(option);
    }
}
