// import echarts from 'echarts';
var echarts = require('../../../../../Odipus/node_modules/echarts/lib/echarts');
import 'echarts-wordcloud';

export class CorporatePortraitController {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.applicationAPIService = $injector.get('applicationAPIService');

        this.jsonData = {
            risk: [],
            change: [],
            echartData: {
                radarData: []
            }
        };
        this.init();
    }

    init() {
        let timeout = this.inject.get('$timeout');

        timeout(() => {
            angular.element('.jq_cor_main').addClass('corporate-animate');
        }, 500);

        this.getEnterpriseData().then(() => {
            this.initEchartRadar();
            this.initWordCloud();
        });
    }

    getEnterpriseData() {
        this.getEnterpriseData.defer = this.inject.get('$q').defer();
        const $state = this.inject.get('$state');

        this.applicationAPIService.getEnterpriseDetailInfo({id: $state.params.id}).then((result) => {
            const enterpriseData = (result.data && result.data.data) || {};
            this.jsonData.enterpriseInfo = {
                score: enterpriseData.enterprise.score,
                name: enterpriseData.enterprise.name
            };
            this.jsonData.risk = enterpriseData.enterprise.riskPoints;
            this.jsonData.change = enterpriseData.enterprise.riskTimes;
            this.jsonData.echartData.radarData = [{
                value: enterpriseData.enterprise.radar,
                name: '企业积分'
            }];


            //值从eff里取
            let jsonArray = {};
            angular.forEach(enterpriseData.enterprise.effects, function (data, index, array) {
                jsonArray[data.text] ? jsonArray[data.text] += 1 : jsonArray[data.text] = 1;
            });
            enterpriseData.title = jsonArray;

            this.jsonData.echartData.wordData = Object.entries(enterpriseData.title || {});

            this.getEnterpriseData.defer.resolve();
        }, (error) => {
            //exception
            this.getEnterpriseData.defer.reject();
        });

        return this.getEnterpriseData.defer.promise;
    }

    initWordCloud() {
        let box_width = angular.element('.jq_corporate_wordCloud').width();
        let box_height = angular.element('.jq_corporate_wordCloud').height();

        const MAX_SIZE = 100;
        const MIN_SIZE = 50;
        const sizeRatio = Math.max(...this.jsonData.echartData.wordData.map(d => d[1])) / MAX_SIZE;

        const data = this.jsonData.echartData.wordData.map(function (d) {
            return {
                name: `${d[0].length < 8 ? d[0] : d[0].slice(0, 5) + '...' + d[0].slice(-2)}`,
                originText: d[0],
                value: d[1] / sizeRatio < MIN_SIZE ? MIN_SIZE : (d[1] / sizeRatio)
            };
        });


        const chart = echarts.init(document.getElementById('corporate_wordCloud'));

        chart.setOption({
            tooltip: {
                show: true,
                formatter(item) {
                    return _.chunk(item.data.originText, 10).map(arr => arr.join('')).join('<br>');
                }
            },
            series: [{
                type: 'wordCloud',

                // The shape of the "cloud" to draw. Can be any polar equation represented as a
                // callback function, or a keyword present. Available presents are circle (default),
                // cardioid (apple or heart shape curve, the most known polar equation), diamond (
                // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

                shape: 'circle',

                // A silhouette image which the white area will be excluded from drawing texts.
                // The shape option will continue to apply as the shape of the cloud to grow.

                // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                // Default to be put in the center and has 75% x 80% size.

                left: 'center',
                top: 'center',
                width: '70%',
                height: '80%',
                right: null,
                bottom: null,

                // Text size range which the value in data will be mapped to.
                // Default to have minimum 12px and maximum 60px size.

                sizeRange: [12, 30],

                // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

                rotationRange: [-90, 90],
                rotationStep: 90,

                // size of the grid in pixels for marking the availability of the canvas
                // the larger the grid size, the bigger the gap between words.

                gridSize: 8,

                // set to true to allow word being draw partly outside of the canvas.
                // Allow word bigger than the size of the canvas to be drawn
                drawOutOfBound: false,

                // Global text style
                textStyle: {
                    normal: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        // Color can be a callback function or a color string
                        color: function () {
                            // Random color
                            return 'hsl(' + [
                                Math.round(Math.random() * 360),
                                Math.round(Math.random() * 30) + 50 + '%',
                                Math.round(Math.random() * 30) + 50 + '%'
                            ].join(',') + ')';
                        }
                    },
                    emphasis: {

                    }
                },

                // Data is an array. Each array item must have name and value property.
                data
            }]
        });

        /*var layout = cloud()
            .size([box_width, box_height])
            .words()
            .padding(5)
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .fontSize(function (d) { return d.size; })
            .on("end", draw);

        layout.start();

        function draw(words) {
            let svg = d3.select(".jq_corporate_wordCloud").append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1]);

            let container = svg.append("g")
                .attr("transform", `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2})`)
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return `translate(${[d.x, d.y]})rotate(${d.rotate})`;
                })
                .text(function(d) { return d.text; })
                .append('title')
                .text(function(d) {return d.originText});
        }*/
    }

    initEchartRadar() {
        let myChartRadar = echarts.init(angular.element('.jq_corporate_radar')[0]);

        let optionRadar = {
            tooltip: {
                show: false
            },
            radar: [{
                name: {
                    textStyle: {
                        color: '#5182E4'
                    }
                },
                nameGap: 5,
                indicator: [
                    {text: '工商信息', max: 5},
                    {text: '经营现状', max: 5},
                    {text: '人员背景', max: 5},
                    {text: '人员现状', max: 5},
                    {text: '投资关系', max: 5}
                ],
                splitArea: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#37518D'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#37518D'
                    }
                }
            }],
            series: [
                {
                    type: 'radar',
                    symbol: 'none',
                    itemStyle: {
                        normal: {
                            areaStyle: {
                                type: 'default',
                                color: 'rgba(33, 150, 243, 0.3)'
                            },
                            lineStyle: {
                                width: 1,
                                color: 'rgba(33, 150, 243, 0.6)'
                            }
                        }
                    },
                    data: this.jsonData.echartData.radarData
                }
            ]
        };
        myChartRadar.setOption(optionRadar);
    }
}
