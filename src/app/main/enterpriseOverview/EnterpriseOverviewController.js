// import echarts from 'echarts';
var echarts = require('../../../../../Odipus/node_modules/echarts/lib/echarts');
require("../../../../../Odipus/node_modules/echarts/lib/component/geo");
export class EnterpriseOverviewController {
    constructor($injector, $scope) {
        'ngInject';
        this.inject = $injector;

        this.jsonData = {
            company: [],
            echartData: {
                data: []
            },
            count: {
                companyCount: 0, //评分总数
                highDangerCompanyCount: 0, //高危数量
                proportion: 0, //高危占比
                crimeSampleCount: 0, //犯罪样本
                sampleCount: 0 //模型样本
            }
        };
        this.init($scope);
    }

    init($scope) {
        let timeout = this.inject.get('$timeout');

        //初始化动画
        timeout(() => {
            angular.element('.jq_enterprise_main').addClass('enterprise-animate');
        }, 500);
        this.getData().then(() => {
            this.initEchart2Map();
        });

        const cancel = this.inject.get('$rootScope').$on('updateTheme', () => {
            this.initEchart2Map();
        });

        $scope.$on('$destroy', () => {
            cancel();
        });
    }

    getData() {
        const defer = this.inject.get('$q').defer();
        this.inject.get('applicationAPIService').getEnterpriseRankList(globalLoading({})).then((result) => {
            if (result.data && result.data.data) {
                this.jsonData.company = result.data.data.list || [];
                Object.keys(this.jsonData.count).forEach((key) => {
                    this.jsonData.count[key] = result.data.data[key];
                });
                this.jsonData.echartData.data = result.data.data.counts || [];
            }
            defer.resolve();
        }, (error) => {
            //expection
            defer.reject();
        });

        return defer.promise;
    }

    //企业排名点击事件
    enterpriseRankingClick() {
        let $this = this;
        let state = $this.inject.get('$state');
        state.transitionTo('main.enterpriseRanking', {}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    //企业画像点击事件
    corporatePortraitClick(item) {
        let $this = this;
        let state = $this.inject.get('$state');
        state.transitionTo('main.corporatePortrait', { id: item.id }, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    initEchart2Map() {
        let $this = this;
        const isStarBlue = $('body').hasClass('theme_star_blue');

        let myChartCircle = echarts.init(angular.element('#enterprise-o-left-map')[0]);
        let data = $this.jsonData.echartData.data;

        $.get('app/concatData/city/wuhan.json', (data_map) => {
            let geoCoordMap = {};

            if (angular.isString(data_map)) {
                data_map = JSON.parse(data_map);
            }

            data_map.features.forEach((area) => {
                geoCoordMap[area.properties.name] = area.properties.cp;
            });

            let convertData = (data) => {
                let res = [];
                const maxValue = Math.max(...data.map(i => i.count));
                const ratio = 30 / maxValue;
                angular.forEach(data, (item) => {
                    if (geoCoordMap[item.area]) {
                        res.push({
                            name: item.area,
                            value: geoCoordMap[item.area].concat(item.count * ratio) //把点放大点.
                        });
                    }
                });
                return res;
            };
            echarts.registerMap('wuhan', data_map);
            myChartCircle.setOption({
                geo: {
                    map: 'wuhan',
                    layoutCenter: ['55%', '50%'],
                    layoutSize: '90%',
                    label: {
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: isStarBlue ? '#ccc' : 'rgba(10, 18, 32, 0.64)',
                            },
                        }
                    },
                    roam: false,
                    mapLocation: {
                        width: '95%',
                        height: '97%'
                    },
                    itemStyle: {
                        normal: {
                            shadowBlur: 50,
                            shadowColor: isStarBlue ? 'rgba(0, 0, 0,1)' : 'transparent',
                            areaColor: isStarBlue ? 'rgba(28,30,58,1)' : 'transparent',
                            borderColor: '#5182E4'
                        },
                        emphasis: {
                            areaColor: 'rgba(37,49,86,1)'
                        }
                    }
                },
                series: [
                    {
                        name: 'Top 5',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        data: convertData(data.sort((a, b) => {
                            return b.value - a.value;
                        }).slice(0, 6)),
                        symbolSize: (val) => {
                            return val[2] / 5;
                        },
                        showEffectOn: 'render',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        hoverAnimation: true,
                        label: {
                            normal: {
                                color: isStarBlue ? '#ffffff' : 'rgba(10, 18, 32, 0.64)',
                                formatter: '{b}',
                                position: 'right',
                                show: true
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#FF8660',
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        zlevel: 1
                    }
                ]
            });
        });
    }
}
