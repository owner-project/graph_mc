import Dalaba from '../../../lib/dalaba/dalaba';
import Flags from '../../../lib/dalaba/dalaba.flags';
import moment from 'moment';
class PersonGraphComponent {
    constructor($injector, $scope,$timeout){
        'ngInject';
        this.$scope = $scope;
        this.inject = $injector;
        this.$timeout = $timeout
        this.toaster = this.inject.get('toaster');
        this.timeType = 0;
        this.isDay = false;
        this.hideGraph = true;
        this.graphTipInfo = {
            show:false,
            left:0,
            bottom:0,
            detailInfo:null
        }
        var _this = this;
        this.optionType = [
            {
                name: '一月内',
                value: '0'
            },
            {
                name: '一季度内',
                value: '1'
            },
            {
                name: '一年内',
                value: '2'
            }
        ];
        this.tagList= [];
        this.tagMap ={};
        this.FlagsChart = Flags.deps(Dalaba)().symbol("hotel").onClick((event,data,isNext) => {
            if(isNext){
                this.isDay = true;
                let keyList = [];
                let dangAnKeyList = []
                if(Array.isArray(data)){
                    this.flagChartNowData =  _.cloneDeep(data);
                }else{
                    this.flagChartNowData  = [data.data];
                }
                this.flagChartNowData.forEach(data => {
                    data.value.forEach(item => {
                        item.forEach(subitem => {
                            if(subitem.edgeKey){
                                subitem.edgeKey && subitem.edgeKey.forEach(edgeItem => {
                                    dangAnKeyList = dangAnKeyList.concat({
                                        relationId:subitem.type,
                                        id:subitem.idList,
                                        dataType:edgeItem && edgeItem.dataType,
                                        personKeys:subitem.keyList
                                    })
                                    keyList = keyList.concat(edgeItem.id);
                                })
                            }else{
                                subitem.idList
                                dangAnKeyList = dangAnKeyList.concat({id:subitem.idList[0],relationBigId:subitem.type})
                            }
                        })
                    })

                })
                keyList = Array.from(new Set(keyList))
                this.onSelected && this.onSelected({keyList}); 
                this.onSelectedDangAn &&this.onSelectedDangAn({keyList:dangAnKeyList})
                this.$scope.$digest(); 

            }
        }).onMoving(_.debounce(function(e,data,checkIn,dom){
            /**
             * @description 鼠标移动的时候 显示浮层
             */
            let $this = $(this).get(0);
            if(checkIn && $this && data.data){
                let left = $this.offsetLeft + 'px';
                let bottom = $(this).parents('.person-graph-dom').get(0).clientHeight - $this.offsetTop + 10+ 'px';
                // tip显示相关
                _this.graphTipInfo.left = left;
                _this.graphTipInfo.bottom = bottom;
                _this.graphTipInfo.show = true;
                if(_this.isDay){ 
                    _this.graphTipInfo.detailList = data.data.value.map(item =>{
                        item.forEach(subitem => {
                            subitem.typeName = _this.tagMap[subitem.value[0]];
                        })
                        return item
                    })
                }else{
                    _this.graphTipInfo.detailList = data.data.value.map(item => {
                        item.forEach(subitem => {
                            subitem.typeName = _this.tagMap[subitem.value[0]];
                        })
                        return item
                    });
                }
                _this.$scope.$digest(); 
            }else{
                _this.graphTipInfo.show = false;
                _this.$scope.$digest(); 
            }
        },0));
        this.searchStartTime = '';
        this.searchEndTime = '';
        this.nowTime = moment().endOf('day').valueOf();
        this.searchEndTime = moment().valueOf();
    }
    $onInit(){
            this.selectAllTag()
            if(this.defaultSearch){
                this.searchEndTime = moment().endOf('day').valueOf();
                this.searchStartTime = moment().subtract(1, 'year').startOf('day').valueOf();
                this.searchInfo(true);
            }
    }
    $onChanges(changeObj){
        if(changeObj.graphData && !!changeObj.graphData.currentValue){
            if(changeObj.graphData.currentValue.coerce && this.startTime !== undefined){
                this.searchStartTime = this.startTime;
                // if(!this.$scope.$$phase){
                //     this.$scope.$digest();
                // }
            }
            this.initGraphData()
            // this.onSelectedDangAn &&this.onSelectedDangAn({keyList:[]})
            this.graphTipInfo.show =false;
        }
        if(changeObj && changeObj.startTime && changeObj.startTime.currentValue !== undefined){
            this.searchStartTime = changeObj.startTime.currentValue;
        }
    }
    $onDestroy(){
        this.flagChar && this.flagsChart.destroy && this.flagsChart.destroy();
        this.flagsChart = null;
    }
    /**
     * @description 获取事件类型
     */
    getEventTypeName(typeId){
        switch(typeId){
            case 0:
            return "同火车";
            case 1:
            return "同飞机";
            case 2:
            return "同上网";
            case 3:
            return "";
            case 4:
            return "";
            case 5:
            return ""
        }
    }

    /**
     * @desc 选择所有的标签
     */
    selectAllTag(){
        this.tagList.forEach(item => item.selected = true);
    }
    /**
     * @description 初始化数据
     * */
    initGraphData(){
        if(!this.flagsChart ){
            this.flagsChart =  this.initChartFlags(angular.element('.person-graph-dom')[0]);
        }
        const flagsChart = this.flagsChart;
        this.isDay = false;
        let data = this.graphData.data && this.graphData.data.data;
        let tag = this.graphData.data && this.graphData.data.tags || [];
        this.tagList = tag;
        this.tagMap ={}
        this.tagList.forEach(tag => {
            this.tagMap[tag.key] = tag.name;
        })
        if(!data || !data && data.length == 0){
            this.flagsChart.setOptions({
                rangeSelector: {
                    enabled: false
                }
            });
            this.hideGraph = true;
            return false;
        }
        let setData = [];
        for(let p in data){
            if({}.hasOwnProperty.call(data,p)){
                setData.push({
                    detail:p,
                    time:p,
                    value:data[p]
                })
            }
        }
        // 实际使用的数据
        this.flagChartData = setData;
        this.hideGraph = setData.length === 0;
        // 节点相同 设置筛选数据
            this.selectAllTag();
            this.jisuanData(this.flagChartData)
            this.drawGraphChart(this.flagChartData)
    }

    //计算数据
    jisuanData(data){
        data.forEach(dayData => {
            if(dayData.value.length <0){
                dayData.dayData = [dayData.value];
            }else{
                let mapData = new Map()
                dayData.value.forEach(item => {
                    let timeValue = JSON.stringify(item.value);
                    if(mapData.has(timeValue)){
                        let mapDataItem = mapData.get(timeValue);
                        mapDataItem.push(item);
                    }else{
                        mapData.set(timeValue,[item])
                    }
                });
                let dayDataList = []
                mapData.forEach(item => {
                    dayDataList.push(item);
                })
                dayData.value = dayDataList;
            }

        })
    }

    /**
     * @description 初始化图形
     * */
    initChartFlags (dom) {
        let self = this;
        let onReady = function (event) {
            var series = this.series;
            var rangeSelector = this.rangeSelector[0];
            var from, to;
            if (series.length && (series = series[0]) && rangeSelector) {
                //console.log(series.data, event.type)
                //if (event.type === "load") {
                from = rangeSelector.from, to = rangeSelector.to;
                if (event.type === "mousemove") {
                    self.FlagsChart.range([from, to]);
                }

                self.FlagsChart.size([series.plotWidth, series.plotHeight])
                    .domain([parseFloat(from, 10) / 100, parseFloat(to, 10) / 100])
                    .translate([series.plotX, series.plotY])(this);
            }
        };

        return Dalaba.Chart(dom, {
            chart: {
                //width: dom.getBoundingClientRect().width,
                height: 210,
                spacing: [0, 0, 0, 0],
                backgroundColor: "transparent",
                events: {
                    load: function () {
                    },
                    redraw: function (event) {
                        onReady.call(this, event);
                    },
                    ready: function (event) {
                        onReady.call(this, event);
                    }
                },
                animation: { enabled: false}
            },
            title: {
                enabled: false
            },
            credits: { enabled: false},
            rangeSelector: {
                enabled: true,
                //xAxis: 0,
                height: 25,
                start: "0%",
                end: "100%",
                verticalAlign: "bottom",
                backgroundColor: "transparent",
                borderColor: "#999999"
            }
        });
    }

    /**
     * @description 绘制图形
     * */
    drawGraphChart(data){
        if(this.isDay){
            this.FlagsChart.data(data,this.isDay);
        }else{
            this.FlagsChart.data(data);
        }
        this.flagsChart.setOptions({
            //chart: { width: vis.width },
            rangeSelector: {
                enabled: !!data.length
            },
            series: [{
                type: "custom",
                data: data,
                dataLabels: {
                    enabled: true,
                    useHTML: true,
                    className: "data-label",
                    formatter: function () {
                        let _this = this;
                        let itemNum = 0;
                        var html =''
                        this.value.forEach(function (d) {
                            d.forEach(item => {
                                let entityHtml =  item.entityName? item.entityName+'</br>':'';
                                let detailHtml = ''
                                itemNum ++ ;
                                item.detail.forEach(subitem => {
                                    if(Array.isArray(subitem)){
                                        subitem.forEach(subsubItem => {
                                            detailHtml += `${subsubItem.key}:${subsubItem.value}<br>`
                                        })
                                    }else{
                                        detailHtml += `${subitem.key}:${subitem.value}<br>`
                                    }
                                })
                                let itemLengthHtml = itemNum > 1?`<span class='title-more-num'>${itemNum}</span>`:"";
                                html = "<h2>" + _this.time +itemLengthHtml+"</h2><div>";
                                html += "<p>" +entityHtml+detailHtml+ "</p>";
                            })
                        });
                        return "</div>" + html;
                    }
                }
            }]
        });
        this.FlagsChart();
    }

    /**
     * @description 人员轨迹 点击返回
     * */
    onDrilldown () {
        this.isDay = false;
        // this.FlagsChart.data(this.flagChartData)();
        this.setGraphType()
        this.FlagsChart.range(null);//.data(this.flagChartData, true)();// reset previous range
        this.onBack()
    }

    /**
     * @description 查询信息
     * */
    searchInfo(isFirst = false){
        // 注释掉开始时间的判断,开始时间为空表示到结束时间为止的所有数据
        // if(!this.searchStartTime){
        //     new toast(this.inject, {
        //         str: '请选择开始时间 '
        //     }).warn();
        // this.toaster.pop({type:'warning',title:'请选择开始时间'});
        //     return false;
        // }

        if(!this.searchEndTime){
            // new toast(this.inject, {
            //     str: '请选择结束时间 '
            // }).warn();
            this.toaster.pop({type:'warning',title:'请选择结束时间'});
            return false;
        }
    // 保证搜索的 开始时间是一天的开始  结束时间 是一天的结束
    this.searchStartTime = moment(this.searchStartTime ).startOf('day').valueOf();
    this.searchEndTime = moment(this.searchEndTime).endOf('day').valueOf();
        this.onSearch({dateParam:{
            start:this.searchStartTime,
            end:this.searchEndTime
        },
        isFirst})
    }

    /**
     * @description 筛选类型
     * */
    setGraphType(){
        if(!this.flagChartData || this.flagChartData.length == 0 ){
            this.hideGraph = true;
            return
        }
        let selectTagList = [];
        let filterData = this.flagChartData;
        this.tagList.forEach(tag => {
            if(tag.selected){
                selectTagList.push(tag.key)
            }
        });
        // 如果下钻到天 则取该日的数据进行过滤
        if (this.isDay) {
            filterData = this.flagChartNowData;
        }
        if(selectTagList.length !== 0 && selectTagList.length != this.tagList.length){
            let newDataArray = [];
            filterData.forEach(item => {
                let newValues = []
                let values = item.value.forEach(subItem => {
                    let newSubValue = subItem.filter(childItem => {
                        return selectTagList.includes(childItem.value[0].toString())
                    })
                    if(newSubValue.length >0){
                        newValues.push(newSubValue)
                    }
                });
                if(newValues.length !== 0){
                    newDataArray.push ({
                        detail:item.detail,
                        time:item.time,
                        // entityName:item.entityName,
                        // edgeKey:item.edgeKey,
                        // keyList:item.keyList,
                        value:newValues
                    })
                }
            });
            this.hideGraph = newDataArray.length === 0;
            this.drawGraphChart(newDataArray)
        }else if(selectTagList.length !== 0 ){
            this.hideGraph = this.flagChartData.length === 0;
            this.drawGraphChart(filterData,!this.isDay)
        }else{
            this.hideGraph = true;
            this.drawGraphChart([])
        }
    }
    /**
     * @description 标签的筛选
     * */
    switchSelectTag(tag){
        if(!tag.selected){
            tag.selected = true;
        }else{
            tag.selected = false
        }
        this.setGraphType()
    }
}
/**
 * @description graphdata:{data:object,node:string}
 * data为从后台获取的数据,node是节点的名称,主要是为了比对选中节点是否改变,当节点改变的时候 筛选条件重置
 * startTime 可以让该组件随着时间 父组件改变
 * */

export const personGraphComponent  = {
        bindings:{
            graphData:'<',
            startTime:'=',
            onSearch:'&',
            onSelected:'&',
            onSelectedDangAn:'&',
            defaultSearch:'=',
            onBack:'&'
        },

        controller:PersonGraphComponent,
        controllerAs:'person',
        templateUrl:'app/main/porpoise/personGraphComponent/personGraph.component.html',
};


