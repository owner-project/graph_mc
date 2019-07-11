
// import echarts from 'echarts';
var echarts = require('../../../../../../Odipus/node_modules/echarts/lib/echarts');



class graphStatisticsComponentController{
    constructor($injector, $scope){
        'ngInject';
        this.$scope = $scope;
        this.inject = $injector;
        this.$util  = this.inject.get('util');
        this.nowType = 1;
        this.porpoiseService = this.inject.get('porpoiseService');
        this.columnChartData = [];
    }
    $onInit(){
        let _this = this;
        window.columnChart = this.columnChart = echarts.init(document.querySelector('.charts-wrapper'));
        this.getChartData();
        this.columnChart.on('click',function (param) {
            let nowIndex = param.dataIndex;
            let clickRelations = _this.columnChartData[nowIndex].relationIds.map(item=> item.id);
            clickRelations = Array.from(new Set(clickRelations));
            _this.onSelectRelations({relations:clickRelations})
          })

    }
    // 当输入节点发生变化的时候  重新获取饼图  暂时不改变显示的type
    $onChanges(changeObj){
        // console.log(changeObj);
        // console.log(this.graphEdges);
        this.getChartData()
    }
    changeType(type){
        if(type != this.nowType){
            this.nowType = type;
        }
        this.getChartData()
    }
    getChartData(){
        if(this.graphEdges.length == 0){
            this.columnChartData = [];
            return false;
        }
        this.$util.innerLoadingStart('graph-statistics-component');
        // active_edges
        this.porpoiseService.getGraphStatisticsTrail(this.nowType,this.graphEdges,this.activeEdges).then(res => {
            this.$util.innerLoadingEnd()
            if(res.data.code == 0){
                this.columnChartData = res.data.result;
                this.columnChart.setOption(this.getColumnOption(this.columnChartData));
            }else{
                this.columnChartData = [];
            }

        })
    }
    getColumnOption(data) {
        let option = {
            color: ['#6345E1'],
            grid: {
                left: '3%',
                right: '4%',
                bottom: '20',
                height:'180',
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
                    type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    z:'-1',
                    shadowStyle:{
                        color:'rgba(255,255,255,0.1)'
                    }
                },
                formatter: '{b}<br/>数量:{c}',
                backgroundColor: '#223870',
                textStyle: {
                    lineHeight: 40,
                    fontWeight: 'lighter'
                }
            },
            xAxis: [{
                type: 'category',
                data: data.map(item => {
                    return item.des
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
                axisLine: {
                    show: false
                },
                minInterval:1,
                splitNumber: 4,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['rgba(111,78,230,.35)'],
                        type: 'dotted'
                    }
                }
            }],
            series: [{
                type: 'bar',
                barWidth: '40%',
                itemStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0, color: '#695CFF'},
                                {offset: 0.75, color: '#2979FF'}
                            ]
                        )
                    }
                },
                data: data.map(item => {
                    if(item.active && item.active.count !== 0){
                        return{
                            value:item.count,
                            itemStyle:{
                                normal:{
                                    color:
                                    new echarts.graphic.LinearGradient(
                                        0, 0, 0, 1,
                                        [
                                            {offset: 0, color: '#29F1FF'},
                                            {offset: 0.75, color: '#3DA2FF'}
                                        ]
                                    )
                                }
                            }
                        }
                    }else{
                        return item.count
                    }
                })
            }]
        }
        return option
    }
    
}

export const graphStatisticsComponent  = {
    bindings:{
        graphEdges:'<',
        onSelectRelations:'&',
        activeEdges:'<'
    },

    controller:graphStatisticsComponentController,
    controllerAs:'graphStatistic',
    templateUrl:'app/main/porpoise/graphStatistics/graphStatistics.component.html',
};
