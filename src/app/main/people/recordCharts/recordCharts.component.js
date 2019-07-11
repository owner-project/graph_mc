var echarts = require('../../../../../../Odipus/node_modules/echarts/lib/echarts');
class recordChartsController {
    constructor($injector, $scope) {
        'ngInject';
        this.$scope = $scope;
        this.injector = $injector;

        this.selectLineType = 'year';
        // 设定本组件 超出多少显示1万的单位
        this.isOverWanNumber = 100000;
    }

    $onInit() {
            this.pichart = echarts.init(document.querySelector('.pi-chart'));
            this.colunmChart = echarts.init(document.querySelector('.column-chart'));
            this.lineChart = echarts.init(document.querySelector('.line-chart'));

        this.injector.get('peopleService').getStatisticsInfo().then(res => {
            if (res.status === 200) {
                // 为了解决从档案到显示图表的时候,图形显示不匹配,所以重新进行一下resize
                this.resizeCharts();
                this.lineChartYearData = res.data.yearData.map(item => {item.name = item.key;item.value = item.count;return item});
                this.lineChartMonthData = res.data.monthData.map(item => {item.name = item.key;item.value = item.count;return item});
                this.typeChartData = res.data.entityRoportion.map(item => {item.value = item.data;return item});
                this.typeChartDataAllCount = res.data.allEntityCount;
                    this.pichart.setOption(this.getPiOption(this.typeChartData,this.typeChartDataAllCount));
                    this.colunmChart.setOption(this.getColumnOption(this.typeChartData));
                    this.lineChart.setOption(this.getLineChartOption(this.lineChartYearData))
            }
        })
        $(window).on('resize',_.debounce(() => {
            this.resizeCharts()
        },500))
    }
    
    resizeCharts(){
        this.pichart.resize();
        this.colunmChart.resize();
        this.lineChart.resize()
    }

    $onDestroy(){
        $(window).off('resize');
    }
    getPiOption(data,allCount = 0) {
        let option = {
            title: {
                text: '档案总数',
                textStyle: {
                    color: '#b0b8c3',
                    fontSize: 10,
                    align:'center'
                },
                subtext:allCount,
                subtextStyle:{
                    fontSize:14,
                    align:'right',
                    color:'#fff'
                },
                top: '40%',
                left: '50%'
            },
            legend: {
                orient: 'vertical',
                bottom: 30,
                left: 15,
                itemWidth: 8,
                itemHeight: 8,
                selectedMode:false,
                textStyle: {
                    color: '#b0b8c3'
                },
                data: data.map(item => {
                    return item.name
                }),
            },
            color: ['#2979FF', '#5754D6', '#3FADB3', '#64B96D', '#DBBF63', '#C85367'],
            series: [{
                name: '访问来源',
                type: 'pie',
                starAngle:120,
                align: 'right',
                minAngle:5,
                radius: ['40%', '62%'],
                center: ['55%', '50%'],
                avoidLabelOverlap: true,
                seriesLayoutBy:'row',
                itemStyle: {
                    normal: {
                        borderWidth: 2.5,
                        borderColor: '#162746',
                        borderType: 'solid'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position:'right',
                        formatter: function (param) {
                            return `${param.name}:${(param.percent == 0 && param.value !=0) ?"少于0.01":param.percent}%${param.dataIndex %2 != 0 &&param.percent == 0 ?'':''}`
                          },
                        color: '#B0B8C3',
                        verticalAlign: 'bottom',
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '12',
                            fontWeight: 'normal'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: true,
                        length: 15,
                        length2: 10,
                    },
                    emphasis:{
                        show: true,
                        length2: 10,
                    }
                },
                data: data
            }]
        }
        return option
    }
    getColumnOption(data) {
        let isOverWan = this.getIsOverWan(data);
        let option = {
            color: ['#6345E1'],
            title: {
                text: isOverWan ? '单位: (万)' : '',
                textStyle: {
                    color: '#b0b8c3',
                    fontSize: 10
                },
                top: 5,
                left: 16
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '20',
                containLabel: true
            },
            textStyle: {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 'normal'
            },
            tooltip: {
                trigger: 'axis',
                show: true,
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow', // 默认为直线，可选为：'line' | 'shadow',
                    z:'-1',
                    shadowStyle:{
                        color:'rgba(255,255,255,0.1)'
                    }
                },
                formatter: (params) => {
                    return `${params[0].name}<br>${isOverWan?Math.ceil(params[0].value * 10000):params[0].value}`
                },
                backgroundColor: '#223870',
                textStyle: {
                    lineHeight: 40,
                    fontWeight: 'lighter'
                }
            },
            xAxis: [{
                type: 'category',
                data: data.map(item => {
                    return item.name
                }),
                axisTick: {
                    alignWithLabel: true
                },
                axisLine:{
                    show:true,
                    lineStyle:{
                        color:'rgba(111,78,230,.35)'
                    }
                }
            }],
            yAxis: [{
                type: 'value',
                minInterval:1,
                axisLine: {
                    show: false
                },
                splitNumber: 5,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['rgba(111,78,230,.35)'],
                        type: 'dotted'
                    }
                }
            }],
            series: [{
                name: '直接访问',
                type: 'bar',
                itemStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0.0, color: '#2979FF'},
                                {offset: 0.75, color: '#695CFF'}
                            ]
                        )
                    }
                },
                barWidth: '40%',
                data: data.map(item => {
                    return isOverWan ? item.value / 10000 : item.value
                })
            }]
        }
        return option
    }
    getLineChartOption(data) {
        let isOverWan = this.getIsOverWan(data)
        let options = {
            title: {
                text: '单位: (万)',
                show: isOverWan,
                textStyle: {
                    color: 'rgba(255,255,255,.7)',
                    fontSize: 10
                }
            },
            dataZoom:[
                {
                    show:data.length>12?true:false,
                    type: 'slider',
                    start:0,
                    bottom:0,
                    end:data.length>12?100:100,
                    dataBackground:{
                        areaStyle:{
                            
                        }
                    },
                    fillerColor:'rgba(63,108,199,.15)'
                }
            ],
            tooltip: {
                show: true,
                trigger: 'axis',
                formatter: function (param) {  
                    return `${param[0]['name']}<br>档案总数:${isOverWan?param[0]['value']*10000:param[0]['value'] == undefined?'无数据':param[0]['value']}`
                },
                backgroundColor: '#223870',
                textStyle: {
                    lineHeight: 40,
                    fontWeight: 'lighter'
                }
            },
            grid: {
                left: 'left',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            textStyle: {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 'normal'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => item.name),
                axisLine:{
                    show:true,
                    lineStyle:{
                        color:'rgba(111,78,230,.35)'
                    }
                },
                nameTextStyle:{
                    align:'left',
                    padding:5,
                },
                axisTick:{
                    alignWithLabel:true,

                },
                axisLabel:{
                    rotate:-60,
                }
            },
            yAxis: [{
                type: 'value',
                minInterval:1,
                axisLine: {
                    show:false,
                    lineStyle: {
                        color: 'rgba(41, 121, 255, 0.35)',
                        type: 'solid'
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['rgba(111,78,229,.35)'],
                        type: 'dotted'
                    }
                },

            }],
            series: [{
                data: data.map(item => {return isOverWan?item.value/10000:item.value}),
                type: 'line',
                lineStyle: {
                    normal: {
                        color: '#2979FF'
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#2979FF',
                        opacity: '0.3'
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#2979ff',
                        borderColor: '#2979ff',
                        borderWidth: 3,
                        shadowBlur: 4,
                        shadowColor: 'rgba(255, 255, 255, 1)'
                    }

                }
            }]
        }
        return options
    }

    /**
     * @description 判断数据是否超过一定的数量 目前给的是10w
     * */
    getIsOverWan(data) {
        return data.some(item => {
            return item.value > this.isOverWanNumber
        })
    }
    /**
     * @description 切换折线图的数据
     * */
    switchLineData(type) {
        if (type === 'year') {
            this.selectLineType = 'year';
            this.lineChart.setOption(this.getLineChartOption(this.lineChartYearData))
        } else {
            this.selectLineType = 'month';
            this.lineChart.setOption(this.getLineChartOption(this.lineChartMonthData))
        }
    }
}

export const recordChartsComponent = {
    controller: recordChartsController,
    controllerAs: 'recordCharts',
    templateUrl: 'app/main/people/recordCharts/recordCharts.component.html',
};
