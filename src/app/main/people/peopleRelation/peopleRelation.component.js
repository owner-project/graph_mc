import RelationDetail from '../relationDetail/modal';
// import toast from '../../../components/modal/toast/toast';

class peopleRelationController {
    constructor($injector, $scope,toaster,$state,$rootScope,util) {
        'ngInject';
        this.$scope = $scope;
        this.inject = $injector;
        this.toaster = toaster;
        this.$state = $state;
        this.$util = util;
        this.$rootScope = $rootScope;
        this.relationType = 'person';
        this.keyList = [];
        this.relationLabel = {
            'person': ['标识', '名称', '关系类型', '实体类型', '关系更新时间', '操作'],
            'substance': ['标识', '名称', '关系类型', '实体类型', '关系更新时间', '操作'],
            'location': ['标识', '名称', '关系类型', '实体类型', '关系更新时间', '操作'],
            'event': ['标识', '名称', '关系类型', '事件类型', '关系更新时间', '操作'],
            'organization': ['标识', '名称', '关系类型', '实体类型', '关系更新时间', '操作']
        };
        this.relation = {
            'person': {
                'data': {},
                'pageNo': 1,
                'label': '相关人'
            },
            'substance': {
                'data': {},
                'pageNo': 1,
                'label': '相关物'
            },
            'location': {
                'data': {},
                'pageNo': 1,
                'label': '相关地'
            },
            'event': {
                'data': {},
                'pageNo': 1,
                'label': '相关事件'
            },
            'organization': {
                'data': {},
                'pageNo': 1,
                'label': '相关机构'
            }
        };
        this.pageSize = 5;
        this.orderByDesc = 'desc';
        this.entityType = 'person';
        this.personRelationKeyListChangeListener = this.$rootScope.$on('personRelationKeyListChange',(e,keyList) => {
            console.log(keyList);
            this.keyList = keyList;
            this.getRelationFromServer()
        })
        this.init();
    }
    $onChanges(changeObj) {
        if (changeObj && changeObj.key && changeObj.key.currentValue && changeObj.key.currentValue !== 'fromGraph') {
            this.entityType = this.$state.params.type;
            this.keyList =[];
            this.changeType('person',true)
        }
    }
    $onDestroy(){
        this.$rootScope.$$listeners['personRelationKeyListChange'] = [];
        this.personRelationKeyListChangeListener = null;
    }
    init() {
        this.entityType = this.$state.params.type;
        this.getRelation();
    }
    getRelation(term, e) {
        if (term && term !== '关系更新时间') {
            angular.element(e.target).unbind('click');
            return;
        } 
        if(term && term == '关系更新时间'){
            this.orderByDesc = this.orderByDesc === 'desc'?'asc':'desc';
        }
        this.keyList =[];
        this.getRelationFromServer()
    }
    getRelationFromServer(){
        const $this = this;
        const $state = $this.inject.get('$state');
        let key = $state.params.key;
        key = this.entityType + '/' + key;
        let keyList = Array.isArray(this.keyList)? this.keyList:JSON.parse(this.keyList)
        let params = {
            key: key.replace(/phone/,'phone_number'),
            type: this.relationType,
            pageNo: this.relation[this.relationType].pageNo,
            pageSize: this.pageSize,
            sort: this.orderByDesc
        }
        if(key == 'normal/fromGraph'){
            return false;
        }
        if(this.relationType == 'event'){
            params.eventIds =  keyList;
        }else{
            params.eventIds = keyList.map(item => {
                return {
                    id:item.personKeys.filter(person => {return person != key})[0],
                    relationBigId:item.relationId,
                    relationSmallId:item.dataType
                }
            }) 
        }
        $this.$util.innerLoadingStart('people-info-relation','#24263C');
        $this.inject.get('peopleService').getRelation(params).then(res => {
            $this.$util.innerLoadingEnd();
           if (res.status === 200) {
            if (res.data.status === 0 && res.data && res.data.data) {
                this.relation[this.relationType].data = res.data.data;
                return false;
            }
          }
          this.relation[this.relationType].data = {
                total:0,
                data:[]
            };
        }, error => {
            $this.$util.innerLoadingEnd();
            $this.toaster.error('服务器错误 请重试');
            this.relation[this.relationType].data = {
                total:0,
                data:[]
            };
        });
    }
    /**
     * @description  关系明细
     */
    showRelationDetail(itemInfo) {
        const $this = this;
        new RelationDetail($this.inject, itemInfo,this.relationType);
    }
    /**
     * @description 切换相关关系
     */
    changeType(type,coerce = false) {
        if (type === this.relationType && !coerce) {
            return;
        }
        this.relationType = type;
        this.relation[this.relationType].pageNo = 1;
        this.$scope.$emit('changeAssistant', type,coerce);
        this.keyList = [];
        this.getRelation();
    }
    /**
     * @description 批量跳转
     */
    batchToPorpoise() {
        const $state = this.inject.get('$state');
        let key = $state.params.key;
        if (this.relationType !== 'event') {
            key = this.entityType + '/' + key;
        }
        this.inject.get('peopleService').getRelation({
            key: key.replace(/phone/,'phone_number'),
            type: this.relationType,
            pageNo: 1,
            pageSize: 101,
            sort: this.orderByDesc
        }).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0 && res.data && res.data.data) {
                    if(res.data.data.total > 100){
                        // new toast(this.inject, {
                        //     str: '暂不支持超过100条关联数据跳转'
                        // }).warn();
                        this.toaster.pop({type:'warning',title:'暂不支持超过100条关联数据跳转'});
                        return
                    }
                    this.batchIds = _.map(res.data.data.data, 'key')
                    const state = this.inject.get('$state');
                    if(['person','phone','company','internetcafe','vehicle'].includes(this.entityType)){
                        this.batchIds.push(state.params.key)
                    }
                    localStorage.removeItem("batchIds")
                    localStorage.setItem("batchIds", this.batchIds)
                    const stateData =  { type: 'normal', id: 'batch'};
                    window.open(state.href('main.porpoise' , stateData), '_blank');
                    // state.transitionTo('main.porpoise', {
                    //     type: 'normal',
                    //     id: 'batch'
                    // }, {
                    //     reload: false,
                    //     inherit: true,
                    //     notify: true,
                    //     relative: state.$current,
                    //     location: true
                    // })
                } else {
                    // new toast(this.inject, {
                    //     str: res.data.data.msg || '跳转失败,请稍后再试'
                    // }).warn();
                    this.toaster.pop({type:'warning',title:res.data.data.msg || '跳转失败,请稍后再试'});

                    return
                }
            }
        }, error => {});

    }
}

export const peopleRelationComponent = {
    bindings: {
        key: '<'
    },
    controller: peopleRelationController,
    controllerAs: 'peopleRelation',
    templateUrl: 'app/main/people/peopleRelation/peopleRelation.component.html',
};
