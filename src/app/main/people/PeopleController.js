import moment from 'moment';
import html2canvas from 'html2canvas'
const SHOWTOOLTIPPEOPLEINFOARR= ['简要案情','案件名称']
import addNodeModal from '../home/addNode/modal';
import focusManagerAddFocus  from "../admin/focusManager/focusManagerAddFocus/focusManagerAddFocus.modal";
export class PeopleController {
    constructor($injector, $scope, $location,$rootScope,util,homeService,toaster) {
        'ngInject';
        this.inject = $injector;
        this.$util = util;
        this.toaster = toaster;
        this.graphDefaultStartTime= moment().subtract(1, 'year').startOf('day').valueOf();
        this.$state = this.inject.get('$state');
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.selectGeneralize = false;
        this.showGeneralize = true;
        this.showSearch = true;
        this.homeService = homeService;
        this.baseUrl = "";
        this.sortType = "1";
        this.sortList = [{
                name: '正序',
                value: '1'
            },
            {
                name: '倒序',
                value: '2'
            }
        ];
        this.loadType = "1"
        this.loadTypeList = [{
                name: 'word',
                value: '1'
            },
            {
                name: 'pdf',
                value: '2'
            },
            {
                name: 'excel',
                value: '3'
            }
        ];
        // 五关所需要的id 组件需要传进去数组
        this.focusId = [];
        this.showExportType = false
        this.showAssistant = false;
        this.assistantType = 'trajectory';
        this.sameFocusList = {
            data: {},
            pageNo: 1,
            pageSize: 5
        };
        this.judgImages = [];

        this.tooltipDelay = {
            show:5000,
            hide:1000
        }
        // 关系类型
        this.relationType = 'person';
        this.relationText = '相关人';
        this.init($scope);
    }

    init($scope) {
        if(this.$state.params.type === 'normal'){
            if(this.$state.params.key === 'fromInit'){
                this.selectGeneralize  = true;
            }else{
                this.entityType = 'person'
            }
        }else{
            // 实体类型
            this.entityType = this.$state.params.type ;
        }
        const $rootScope = this.inject.get('$rootScope');
        $rootScope.urlData.chooseMenu = 'file';
        if(this.$state.params.type !== 'normal'){
            this.focusId = [`${this.$state.params.type}/${this.$state.params.key}`]
            this.getPeopleInfo();

            this.getSameFocusList();
    
            // this.getJudgImages();
        }else{
            this.stateKey = this.$state.params.key
        }
        const cancel = $rootScope.$on('updateTheme', () => {
        });

        $scope.$on('$destroy', () => {
            cancel();
        });
        //  子组件事件类型进行改变的时候,轨迹信息也要进行更改 轨迹的开始时间需要进行更改,并且时间会变成默认时间
        $scope.$on('changeAssistant', (e, type,coerce) => {
            this.assistantType = 'trajectory';
            if(coerce){
                this.graphDefaultStartTime = moment().subtract(1, 'year').startOf('day').valueOf();
                this.dateParam.start = this.graphDefaultStartTime;
            }else{
                this.graphDefaultStartTime = undefined;
            }
            this.relationType = type;
            this.relationText = this.getRelationTypeText(type);
            this.personGraphSearch(this.dateParam,type,coerce);
        })
    }
    // 是否展示用户信息的 tooltip
    showPeopleInfoTooltip(infoItem){
        return SHOWTOOLTIPPEOPLEINFOARR.includes(infoItem.key) && infoItem.value && infoItem.value.length >= 10 
    }
    getFileName(type){
        switch(type){
            case 'person':
                return '人员';
            case 'phone':
                return '手机';
            case 'company':
                return '公司';
            case 'internetcafe':
                return '网吧';
            case 'vechicle':
                return '车辆'
            case 'case':
                return '案件'
            default:
                return ''
        }
    }
    getRelationTypeText(relationType){
        switch(relationType){
            case "person":
                return "相关人";
            case "substance":
                return "相关物";
            case "location":
                return "相关地";
            case "event":
                return "相关事件";
            case "organization":
                return "相关机构";
            default:
                return ''
        }
    }
    getDefaultImg(type){
        if(type =='normal'){
            return false
        }
        return `assets/images/theme_star_blue/people/default-${type}.png`
    }
    //关注或者取消关注
    focusOrUnFocus(){
        console.log(this)
        let focusList = [
            {
                title:this.jsonData.name,
                type:this.jsonData.type,
                //实体id
                focusid:`${this.entityType}/${this.entityKey}`
            }
        ]
        new focusManagerAddFocus(this.inject,focusList).$promise.then(resultList => {
            if(resultList){
                this.jsonData.groupInfo = resultList;
                this.jsonData.focuStatus = this.jsonData.groupInfo.length > 0;
            }
        })
    }

    // 获取同关注列表
    getSameFocusList() {
        const $this = this;
        const $state = $this.inject.get('$state');
        $this.inject.get('peopleService').getSameFocusList({
            key:`${this.entityType}/${$state.params.key}`,
            pageNo: $this.sameFocusList.pageNo,
            pageSize: $this.sameFocusList.pageSize
        }).then(res => {
           if (res.status === 200) {
            if (res.data.status === 0 && res.data && res.data.data) {
                $this.sameFocusList.data = res.data.data;
            }
        }
        }, error => {
        });
    }
    // 获取图析历史
    getJudgImages() {
        const $this = this;
        const $state = $this.inject.get('$state');
        $this.inject.get('peopleService').getJudgImages(globalLoading({
            key: $state.params.key
        })).then(res => {
           if (res.status === 200) {
            if (res.data.status === 0 && res.data && res.data.data) {
                $this.judgImages = res.data.data;
            }
        }
        }, error => {
        });
    }
    // 获取档案信息
    getPeopleInfo() {
        const $this = this;
        $this.$util.innerLoadingStart('people-info-right','#24263C')
        $this.inject.get('peopleService').getPeopleInfo({
            id: this.$state.params.key,
            type:this.entityType
        }).then(res => {
            this.$util.innerLoadingEnd();
           if (res.status === 200) {
            if (res.data.status === 0 && res.data && res.data.data) {
                res.data.data.base.forEach(item => {
                    item.showTooltip = this.showPeopleInfoTooltip(item)
                })
                $this.jsonData = res.data.data;
            }
        }}, error => {});
    }



    /**
     * @description 导出人物档案信息
     * */
    getLoadInfo (loadType){
        const $state = this.inject.get('$state');
        const typeMap = {
            "1": {
                type: "application/msword;charset=utf-8",
                docType: "doc",
                loadType: "word"
            },
            "2": {
                type: "application/pdf;charset=utf-8",
                docType: "pdf",
                loadType: "pdf"
            },
            "3": {
                type: "application/vnd.ms-excel;charset=utf-8",
                docType: "xls",
                loadType: "excel"
            }
        }
        var parseBase64 = function(base64Url){
            return base64Url = base64Url.split('base64,')[1]
        }
        this.inject.get('util').innerLoadingStart('info-body','#24263C');//加载loading
        // html2canvas 拿到轨迹部分的地址
        html2canvas(document.getElementById('person-graph-main'),{backgroundColor:'#141F31'}).then(canvas => {
            var context = canvas.getContext('2d');
            // 【重要】关闭抗锯齿
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;

            let  img = canvas.toDataURL();
            let base64Url = parseBase64(img)
            this.inject.get('peopleService').getLoadInfo({
                key: $state.params.key,
                picTrack:base64Url,
                type:this.$state.params.type,
                loadType:typeMap[loadType].loadType,
            }).then(res => {
                if (res.status === 200) {
                    const blob = new Blob([res.data], {type: typeMap[loadType].type});
                    const objectUrl = URL.createObjectURL(blob);
    
                    const element = document.createElement('a');
                    let dangAnName = this.jsonData.name || this.getFileName(this.$state.params.type);
                    element.setAttribute('download', `${moment().format('YYYY_MM_DD_HH_mm')}_${dangAnName}档案.${typeMap[loadType].docType}`);
                    element.setAttribute('href', objectUrl);
    
                    element.style.display = 'none';
                    document.body.appendChild(element);
    
                    element.click();
                    this.inject.get('util').innerLoadingEnd();
    
                }
            }, error => {
                console.log(error)
            });
        })
    }
    into_porpoise(isToGis) {
        localStorage.setItem("isToGis", isToGis)
        localStorage.setItem('canUpdateGraph','false')
        const $this = this;
        const state = $this.inject.get('$state');
        const stateData =  { type: 'normal', id: encodeURIComponent(state.params.type.replace(/phone/,'phone_number') + '/' + state.params.key)};
        window.open(state.href('main.porpoise' , stateData), '_blank');
    }

    toImagePorpoise({
        id
    }) {
        const state = this.inject.get('$state');
        state.transitionTo('main.porpoise', {
            type: 'normal',
            id: encodeURIComponent(id)
        }, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
    /**
     * @description  子组件search事件触发, 获取轨迹信息
     * relationType  关系类型 
     * */
    personGraphSearch(dateParam,relationType = 'person',coerce = false){
        const $state = this.inject.get('$state');
        const $this = this;
        this.dateParam = dateParam;
        this.inject.get('util').innerLoadingStart('person-graph-main','#24263C');
        let  params = Object.assign({
            key:`${this.entityType}/${$state.params.key}`,
            fromSource:"dangan",
            typeEntity: this.relationType
        },dateParam)
        this.inject.get('peopleService').getTrailInfo(params).then(res => {
            this.inject.get('util').innerLoadingEnd();
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.personGraphData = {
                        data:res.data.data,
                        node:$state.params.key,
                        coerce:coerce
                    }
                }else{
                    $this.personGraphData = {
                        data:null,
                        node:$state.params.key,
                        coerce:coerce
                    }
                }
            }else{
                $this.personGraphData = {
                    data:null,
                    node:$state.params.key,
                    coerce:coerce
                    
                }
            }
        }, error => {
            $this.personGraphData = {
                data:null,
                node:$state.params.key,
                coerce:coerce
            }
        });
    }
    /**
     * @description  显示导出档案类型选项
     * */
    showExportTypeFunc(e) {
        let $this = this;
        e.stopPropagation();
        this.showExportType = !this.showExportType;
        if ($this.showExportType) {
            angular.element('.export-file-type').fadeIn(300);
            $(document.body).bind('click', (e) => {
                if (!$this.showExportType) {
                    $(document.body).unbind('click');
                } else {
                    angular.element('.export-file-type').fadeOut(300);
                    $this.showExportType = false
                }
            });
        } else {
            angular.element('.export-file-type').fadeOut(300);
            $(document.body).unbind('click');
            $this.showExportType = false
        }
    }
    /**
     * @description  显示用户详细信息
     * */
    showAssistantFunc() {
        this.showAssistant = !this.showAssistant
    }
    changeAssistantType(term) {
        this.assistantType = term;
    }
    /**
     * @description 当选择左侧菜单实体
     */
    onSelectRecord(record,type){
        // 实体类型
        this.entityType = type;
        // 实体的key
        this.entityKey = record.key;
        this.focusId = [`${type}/${record.key}`]
        this.getPeopleInfo();
        this.showAssistant = false;
        // 在选择人物的时候取消获取轨迹信息,通过组件的相关关系组件的事件 来获取
        // this.personGraphSearch(this.dateParam);

        this.getSameFocusList();

        // this.getJudgImages();
    }
    /**
     * @description 当轨迹信息选择的时候 进行跟相关关系table的联动
     * @param {*} keyList  edgeKeyList
     */
    personGraphSelected(keyList){
        this.$rootScope.$emit('personRelationKeyListChange',keyList)
    }
    /**
     * @description 当轨迹信息点击back 显示全部轨迹的时候
     */
    personGraphBack(){
        this.$rootScope.$emit('personRelationKeyListChange',[])
    }
}
