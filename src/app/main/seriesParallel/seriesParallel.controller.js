import toast from "../../components/modal/toast/toast"
export class seriesParallelController {
    constructor($injector,$scope,toaster) {
        'ngInject';
        this.inject = $injector;
        this.$util = this.inject.get('util');
        this.$state = this.inject.get('$state');
        this.toaster = toaster;
        this.$scope = $scope
        this.seriesParallelService = this.inject.get('seriesParallelService');
        this.caseDesc = '';
        this.showTab = 1;
        //分析之后的实体数据
        this.analyzeEntityList = [];
       
        //关系图的数据
        this.relationChartsData = {
            edges: [],
            vertices: []
        }
        // 串并案件部分
        this.seriesParallelList = [];

        // 重点人预警部分数据
        this.emphasisPersonList = [
        ]
        this.emphasisPersonInfo = null;
    }
    /**
     * @description 清除案件描述文字
     */
    clearCaseDesc() {
        this.caseDesc = '';
    }
    analyzeKeyDown(event){
        if(event.keyCode == 13 && this.caseDesc !== ''){
            this.startAnalyze()
        }
    }
    /**
     * @description 开始分析
     */
    startAnalyze() {
        if(this.caseDesc == ''){
            return false;
        }
        this.showTab = 1;
        this.$util.innerLoadingStart('series-bottom','#24263C');
        this.seriesParallelService.textAnalyse(this.caseDesc).then(res => {
            this.$util.innerLoadingEnd()
            if(res.data.status == 0){
                let graphData =  res.data.data.graph;
                graphData.edges = graphData.edge.map(item => {item.name = item.key;return item})

                this.relationChartsData = graphData;
                // let sortName= ['person','phone','idCard','carNumber','location','other']
                // let entityList = [];
                let entityList = res.data.data.analysis.map(item => {
                    item.typeName = item.name;
                    item.list.forEach(entity => {
                        entity.entityType = item.name
                    })
                    return item;
                });
                this.analyzeEntityMap= entityList;
                if(res.data.data.analysis.length > 0){
                    this.getImportancePersons(res.data.data.analysis)
                }else{
                    this.emphasisPersonList = [];
                    this.seriesParallelList = [];
                }
            }else{
                this.toaster.warning(res.message || '分析失败')
                // new toast(this.inject,{str:res.message || '分析失败'}).warn()
                this.relationChartsData = {
                    edges: [],
                    vertices: []
                };
                this.analyzeEntityMap = [];
                this.emphasisPersonList = [];
                this.seriesParallelList = [];
            }
        }).catch(error => {                
            this.toaster.error('服务器内部错误,请稍后再试')

            // new toast(this.inject,{str:'服务器内部错误,请稍后再试'}).error()

        })
    }
    /**
     * @description 获取重点人列表
     */
    getImportancePersons(analysis){
        if(analysis.length == 0 ){
            return false
        }
        let params = {};
        analysis.forEach(item => {
            if(item.name == 'person' || item.name == 'phone' || item.name == 'idCard' ){
                params[item.name] = item.list.map(entity => entity.name)
            }
        })
        if(_.isEmpty(params)){
            return false;
        }
        this.seriesParallelService.getImportancePerson(params).then(res => {
            if(res.data.status == 0){
                this.emphasisPersonList = res.data.data
            }else{
                this.toaster.warning('获取重点人失败')
                // new toast(this.inject,{str:'获取重点人失败'}).warn()

                this.emphasisPersonList = []
            }
        }).catch(error => {
            this.toaster.error('服务器内部错误,请稍后再试')

            // new toast(this.inject,{str:'服务器内部错误,请稍后再试'}).error()
        })
    }

    selectTab(type) {
        this.showTab = type;
    }
    /**
     * 人工串并事件
     */
    onCombine(info){
        if(!info.selectEntityMap){
            return false;
        }
        this.$util.innerLoadingStart('statistics-wrapper','#24263C');

        let params = Object.assign({},info.time,info.selectEntityMap)
        this.seriesParallelService.connectCase(params).then(res => {
            this.$util.innerLoadingEnd()
            if(res.data.status == 0){
                this.seriesParallelList = res.data.data
            }else{
                this.toaster.warning(res.message || '未获取到关联信息')

                // new toast(this.inject,{str:res.message || '未获取到关联信息'}).warn()
                this.seriesParallelList = [];

            }
        }).catch(error => {
            this.toaster.error('服务器内部错误,请稍后再试')

            // new toast(this.inject,{str:'服务器内部错误,请稍后再试'}).error()

        })
    }

    /**
     * @description 查看某个重点人的信息  暂时不显示
     */
    showPersonInfo(person){
                    this.emphasisPersonInfo = {
                base: {
                    name: '吴少聪',
                    idNumber: '4127241993333333',
                    phoneNum: '13466666666',
                    nativeArea: '湖北省',
                    nation: '汉族',
                    married: '未婚',
                    address: '武汉市武昌区13路45号'
                },
                image: "",
                tags: ['123', '456']
            }
    }
    /**
     * @description 跳转某个重点人物到档案页面
     */
    jumpPersonToDangAn($event,person){
        $event.stopPropagation();
        console.log('dangan',person)
    }
     /**
     * @description 跳转某个重点人物到图析页面
     */
    jumpPersonToPorpoise($event,person){
        $event.stopPropagation();
        const state = this.inject.get('$state');
        const stateData =  { type: 'normal', id: encodeURIComponent(person.id)};
        window.open(state.href('main.porpoise', stateData), '_blank');
        // state.transitionTo('main.porpoise', {
        //     type: 'normal',
        //     id: encodeURIComponent(person.id)
        // }, {
        //     reload: false,
        //     inherit: true,
        //     notify: true,
        //     relative: state.$current,
        //     location: true
        // });
    }
    /**
     * @description 跳转关系到图析
     */
    jumpRelationToPorpoise(){
        if(this.relationChartsData.vertices.length == 0){
            return false;
        }
        localStorage.setItem("fromTextmining",JSON.stringify(this.relationChartsData))
        const state = this.inject.get('$state');
        const stateData =  { type: 'fromTextmining', id: 'fromTextmining' };
        window.open(state.href('main.porpoise', stateData), '_blank');
        // state.transitionTo('main.porpoise', {
        //     type: 'fromTextmining',
        //     id: 'fromTextmining'
        // }, {
        //     reload: false,
        //     inherit: true,
        //     notify: true,
        //     relative: state.$current,
        //     location: true
        // })
    }
}
