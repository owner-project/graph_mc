import importExlModal from '../deleteDialog/modal'
var echarts = require('../../../../../Odipus/node_modules/echarts/lib/echarts');
require("../../../../../Odipus/node_modules/echarts/lib/chart/heatmap");

export class VoiceModelController {
    constructor($injector , $scope,$state){
        'ngInject';
        this.inject = $injector;
        this.toaster = this.inject.get('toaster');
        this.$state = $state
        this.$scope = $scope;
        this.selectOptions = [
            {
                name:'全部',
                value:-1,
            },{
                name:'5',
                value:5,
            },{
                name:'10',
                value:10,
            },{
                name:'20',
                value:20,
            },{
                name:'50',
                value:50,
            },{
                name:'100',
                value:100,
            }
        ]
        this.sizeObj = {
            areaSize:'5',
            baseStationSize:'5',
            qualitySize:'5',
            qualityEndSize:'5'
        }
        this.data = {
            nowSetPhones: [],
            graph: {
                nodes: [],
                links: []
            },
            incidentTime: undefined,
            startDate: '',
            hasCallTimeChart: false,
            checkAll: false,
            indeterminate: false
        };
        this.jsonData = {
            resultData: [],
            echartData:[],
            callTimesMap: {},
            rightData:{
                myNumber:[],
                property:[
                    {
                        phone: '16353435353',
                        bfb: '44'
                    },
                    {
                        phone: '12522513441',
                        bfb: '100'
                    },
                    {
                        phone: '16353435353',
                        bfb: '32'
                    },
                    {
                        phone: '14787878787',
                        bfb: '84'
                    }
                ],
                logic:[
                    {
                        phone: '16353435353',
                        bfb: '44'
                    },
                    {
                        phone: '12522513441',
                        bfb: '56'
                    },
                    {
                        phone: '16353435353',
                        bfb: '13'
                    }
                ],
                station:[
                    {
                        phone: '16353435353',
                        bfb: '84'
                    },
                    {
                        phone: '12522513441',
                        bfb: '33'
                    },
                    {
                        phone: '16353435353',
                        bfb: '15'
                    }
                ]
            },
            option: []
        };
        this.colors = ['#7fffd4','#fafad2','#6b8e23','#90ee90','#d3d3d3','#ffb6c1','#ffa07a','#20b2aa','#87cefa','#e6e6fa']
        this.phone_color = [];
        this.checkedPhones = [];
        this.init();
    }


    init() {
        this.isMyNumber = true;
        this.isProperty = true;
        this.isLogic = true;
        this.isStation = true;
        this.chooseType = 'hd';
        this.chooseTypeRight = 'tj';
        this.rightSum = 0;
        this.tableInit();
        this.initBottomOptions();

        const cancel = this.inject.get('$rootScope').$on('updateTheme', () => {
            if (document.getElementById('incidentStackBar')) {
                if (echarts.getInstanceByDom(document.getElementById('incidentStackBar'))) {
                    this.initEchartPie2Map();
                }
            }

            if (document.getElementById('voice-VMap')) {
                if (echarts.getInstanceByDom(document.getElementById('voice-VMap'))) {
                    this.initEchart2VMap();
                }
            }

        });

        this.$scope.$on('$destroy', () => {
            cancel();
        });

        setTimeout(() => {
            this.initEchart2VMap();
        });
    }

    initBottomOptions () {
        const $this = this;
        const year = new Date().getFullYear();
        for(let i = 0 ; i < 5 ; i++){
            $this.jsonData.option.push({name: year-i, value: year-i});
        }

    }

    tableInit() {
        const $this = this;
        const $state = this.inject.get('$state');
        $this.inject.get('voiceAPIService').getSuspectsInfoTable(globalLoading({
            graphName:$state.params.id,
            type: parseInt($state.params.type)
        })).then(res => {
           if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.jsonData.resultData = res.data.data;
                    angular.forEach($this.jsonData.resultData, function(data,index,array){
                        data.tag = 1;
                    });
                    $this.rightSum = res.data.data.sum;
                } else {
                    this.toaster.pop({type: 'error',title: res.data.message});
                }
            }
        }, error => {});
    }


    yearChange() {
        this.inject.get('voiceAPIService').getBottomEData({
            year: parseInt(this.$scope.vm.time)
        }).then(res => {
           if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.echartData = res.data.data.data
                    this.initEchart2VMap();
                }
            }
        }, error => {});
    }

    checkAll(e) {
        const self = this;
        angular.forEach(this.jsonData.resultData, function(data,index,array){
            data.ischeck = self.data.checkAll;
            self.data.indeterminate = false;
        });
    }

    toPorpoise() {
        this.setphone()
        const $state = this.inject.get('$state');
        let paramsId = $state.params.id
        let phonesId = this.checkedPhones
        phonesId = [... new Set(phonesId)]
        if (phonesId.length > 0) {
            const state = this.inject.get('$state');
            const stateData =  { graphName:paramsId,type: 'normal', id: encodeURIComponent(phonesId.join(';'))};
            window.open(state.href('main.porpoise' , stateData), '_blank');//去porpoisecontroller 搜 跳转到图谱的处理
        }
    }

    checkItem() {
        if (this.jsonData.resultData.some(item => item.ischeck)) {
            if (this.jsonData.resultData.every(item => item.ischeck)) {
                this.data.indeterminate = false;
                this.data.checkAll = true;
            } else {
                this.data.indeterminate = true;
                this.data.checkAll = false;
            }
        } else {
            this.data.indeterminate = false;
            this.data.checkAll = false;
        }
    }

    selectedTop() {
        const $this = this;
        const minValue = Math.min(...$this.jsonData.resultData.map(item => item.tag));
        angular.forEach($this.jsonData.resultData, function(data,index,array){
            if(data.ischeck){
               data.tag = minValue - 1;
            }
        });
    }

    deleteFalseItemClick() {
        const $this = this;
        new importExlModal($this.inject).$promise.then((res) => {
            if(res === 1){
                const ids = [];
                angular.forEach($this.jsonData.resultData, function(data,index,array){
                    if(!data.ischeck){
                       ids.push(data.id)
                    }
                });
                this.deleteItems(ids);
            }
        });
    }

    deleteItemClick() {
        const $this = this;
        new importExlModal($this.inject).$promise.then((res) => {
            if(res === 1){
                let ids = [];
                angular.forEach($this.jsonData.resultData, function(data,index,array){
                    if(data.ischeck){
                       ids.push(data.id)
                    }
                });
                this.deleteItems(ids);
            }
        });
    }

    deleteItems(ids) {
        const $this = this;
        $this.inject.get('voiceAPIService').deleteItem({
            ids:ids
        }).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.tableInit();
                }
            }
        }, error => {});
    }

    setphone() {
        let phones = [];

        //获取本年年份
        this.time = new Date().getFullYear();
        this.checkedPhones = []
        angular.forEach(this.jsonData.resultData, (data,index,array) => {
            if(data.ischeck){
                if(phones.indexOf(data.baseNumber) === -1 && data.ids){
                    this.checkedPhones.push(data.ids[0])
                    this.checkedPhones.push(data.ids[1])
                    phones.push(data.baseNumber);
                }
            }
        });
        this.phone_color.splice(0, this.phone_color.length);
        angular.forEach(phones, (data,index,array) => {
            this.phone_color.push({
                key: data,
                value: this.colors[index]
            });
        });
        this.data.nowSetPhones = phones;
        if(this.data.nowSetPhones.length > 0){
            this.inject.get('voiceAPIService').setPhones({
                ownNumber: phones,
                ...this.sizeObj
            }).then(res => {
               if (res.status === 200) {
                    if (res.data.status === 0) {
                        this.jsonData.rightData = res.data.data;
                        this.data.startDate = new Date(res.data.data.beginTime);
                        this.data.incidentTime = res.data.data.beginTime;
                        this.jsonData.rightData.myNumber = phones;
                        this.jsonData.echartData = res.data.data.echart.data
                        this.initEchart2VMap();
                        this.toaster.pop({type:'success',title:'设置成功'});
                    }
                }
            }, error => {});
        }
        else{
            this.toaster.pop({type:'warning',title:'请在下表中至少选择一个有效号码'});
        }
    }
    // 返回到voicelist页面
    backToVoiceList(){
        this.$state.transitionTo('main.voiceList',{
            reload: false,
            inherit: false,
            notify: false,
            location: 'replace',
        })
    }

    //右部标签页点击事件
    chooseTagRight(e, type) {
        this.chooseTypeRight = type || '';
        if(this.data.nowSetPhones.length == 0){
            this.toaster.pop({type:'warning',title:'请在左侧表格处选择号码并设为本机'});
        }
    }

    //标签页点击事件
    chooseTag(e, type) {
        if(type === 'tx') {
            if (this.data.nowSetPhones.length) {
                this.chooseType = type;
                this.getPhoneBookGraph();
            } else {
                // new toast(this.inject, {
                //     str: '请选择号码并设为本机'
                // }).warn();
                this.toaster.pop({type:'warning',title:'请选择号码并设为本机'});
            }
        }
        else {
            this.chooseType = type ||'';
        }
    }

    //本机号码菜单点击事件
    myNumberChange() {
        this.isMyNumber = !this.isMyNumber;
    }
    //属性菜单点击事件
    propertyChange() {
        this.isProperty = !this.isProperty;
    }
    //逻辑小区菜单点击事件
    logicChange() {
        this.isLogic = !this.isLogic;
    }
    //基站小区菜单点击事件
    stationChange() {
        this.isStation = !this.isStation;
    }

    //pie时间选择事件
    getPieData() {
        if(this.data.incidentTime){
            this.inject.get('voiceAPIService').getPieEData({
                incidentTime: this.data.incidentTime
            }).then(res => {
                if (res.status === 200) {
                    if (res.data.status === 0) {
                        res.data.data.before.forEach(i => {
                            if (!this.jsonData.callTimesMap[i.name]) {
                                this.jsonData.callTimesMap[i.name] = {
                                    before: 0,
                                    after: 0
                                };
                            }
                            this.jsonData.callTimesMap[i.name].before = i.value;
                        });
                        res.data.data.after.forEach(i => {
                            if (!this.jsonData.callTimesMap[i.name]) {
                                this.jsonData.callTimesMap[i.name] = {
                                    before: 0,
                                    after: 0
                                };
                            }
                            this.jsonData.callTimesMap[i.name].after = i.value;
                        });
                        this.data.hasCallTimeChart = true;
                        this.inject.get('$timeout')(() => {
                            this.initEchartPie2Map();
                        }, 10);
                    }
                }
            }, error => {});
        }
    }

    //秒转HHmmss
    secondToDate(result = 0) {
        var h = Math.floor(result / 3600);
        var m = Math.floor((result / 60 % 60));
        var s = Math.floor((result % 60));
        return `${h}小时${m}分钟${s}秒`;
    }

    //初始化echartpie
    initEchartPie2Map() {
        const before = [];
        const after = [];
        const category = [];
        const isStarBlue = $('body').hasClass('theme_star_blue');
        const lineColor = isStarBlue ? '#484A5A' : 'rgba(10, 18, 32, 0.08)';
        const textColor = isStarBlue ? '#999999' : 'rgba(10, 18, 32, 0.64)';

        for (let key in this.jsonData.callTimesMap) {
            if (this.jsonData.callTimesMap.hasOwnProperty(key)) {
                category.push(key);
                before.push(-this.jsonData.callTimesMap[key].before);
                after.push(this.jsonData.callTimesMap[key].after);
            }
        }
        const options = {
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter(params) {
                    return `${params[0].axisValue}<br />${params[0].seriesName}: ${Math.abs(params[0].value)}<br />${params[1].seriesName}: ${Math.abs(params[1].value)}`
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'value',
                    interval: 1,
                    axisLabel: {
                        formatter(value, index) {
                            return Math.abs(value);
                        },
                        textStyle: {
                            color: textColor
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: lineColor,
                            type: 'solid'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: lineColor,
                        }
                    },
                    axisTick: {
                        lineStyle: {
                            color: lineColor,
                        }
                    }
                }
            ],
            yAxis : [
                {
                    type : 'category',
                    name: '案发时',
                    nameTextStyle: {
                        color: textColor
                    },
                    nameGap: '5',
                    axisTick : {show: false},
                    data: category
                }
            ],
            series : [
                {
                    name:'案发前',
                    type:'bar',
                    stack: '通话个数',
                    barCategoryGap: '5%',
                    barWidth:'20%',
                    data: before,
                    itemStyle: {
                        normal: {
                            color: '#5182E4'
                        }
                    }
                },
                {
                    name:'案发后',
                    type:'bar',
                    stack: '通话个数',
                    data: after,
                    itemStyle: {
                        normal: {
                            color: '#4CC3CC'
                        }
                    }
                }
            ]
        };

        let stackChart = echarts.init(document.getElementById('incidentStackBar'));
        stackChart.setOption(options);
    }

    getPhoneBookGraph() {
        const $state = this.inject.get('$state');
        const params = {
            graphName: $state.params.id,
            start: 0,
            depth: 1,
            id: this.data.nowSetPhones.map(i => {
                return `calllog_${$state.params.id.split('_')[1]}/${i}`;
            })
        };

        this.inject.get('porpoiseService').initPorpoise().then(result => {
            this.inject.get('porpoiseService').getPorpoiseData(params).then(result => {
                if (result.data && result.data.data) {
                    this.data.graph.nodes = result.data.data.vertices;
                    this.data.graph.links = result.data.data.edges;
                }
            }, error => {
                //
            });
        }, error => {
            //
        });
    }

    //初始化echartmap
    initEchart2VMap (){
        let $this = this;
        let myChartCircle = echarts.init(document.getElementById('voice-VMap'));
        let hours = ['1', '2', '3', '4', '5', '6', '7',
            '8', '9', '10','11','12',
            '13', '14', '15', '16', '17', '18',
            '19', '20', '21', '22', '23', '24','25', '26', '27', '28', '29', '30', '31'];

        let days = ['1', '2', '3', '4', '5', '6', '7',
            '8', '9', '10','11','12'];
        let data = $this.jsonData.echartData.map((item) => {
            return [item[1] - 1, item[0] - 1, item[2] || '-'];
        });

        const isStarBlue = $('body').hasClass('theme_star_blue');
        const lineColor = isStarBlue ? '#484A5A' : 'rgba(10, 18, 32, 0.08)';
        const textColor = isStarBlue ? '#999999' : 'rgba(10, 18, 32, 0.64)';

        let option = {

            tooltip: {
                formatter: (params) => {
                    return `${params.data[1] + 1}月${params.data[0] + 1}日<br/>${params.seriesName} ${params.data[2]}`
                }
            },
            animation: true,
            grid: {
                height: '78%',
                width: '92%',
                y: '30',
                right:'30'
            },
            xAxis: {
                type: 'category',
                name:'日',
                nameLocation:'end',
                nameTextStyle:{
                    color:'#fff'
                },
                data: hours.map(value => ({value, textStyle: {color: textColor}})),
                axisLine: {
                    lineStyle: {
                        color: lineColor
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: lineColor
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: lineColor,
                        type: 'solid',
                    },

                },
                axisLabel: {
                    textStyle: {
                        color: textColor
                    }
                }
            },
            yAxis: {
                type: 'category',
                name:'月',
                nameLocation:'end',
                nameTextStyle:{
                    color:'#fff'
                },
                data: days.map(value => ({value, textStyle: {color: textColor}})),
                axisLine: {
                    lineStyle: {
                        color: lineColor
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: lineColor
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: lineColor,
                        type: 'solid',
                    },

                },
                splitArea: {
                    show : true,
                    areaStyle : {
                        color: 'transparent'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: textColor
                    }
                }
            },
            visualMap: {
                min: 0,
                max: 10,
                calculable: false,
                algin: 'left',
                bottom: '15%',
                show: false,
                inRange: {
                    color: ['rgba(81, 130, 228, 0.4)','rgba(81, 130, 228, 0.6)','rgba(81, 130, 228, 0.8)','rgba(81, 130, 228, 1)']
                }
            },
            series: [{
                name: '通话次数',
                type: 'heatmap',
                data: data,
                itemStyle: {
                    normal: {
                        // borderWidth: 1,
                        // borderColor: '#1C1D2F'
                    },
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        myChartCircle.setOption(option);
    }
}
