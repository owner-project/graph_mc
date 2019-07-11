import moment from 'moment'
class seriesParallelEntityController {
    constructor($injector, $scope) {
        'ngInject';
        this.$scope = $scope;
        this.canSelect = false;
        this.injector = $injector;
        this.entityList = [];
        this.selectEntityList = [];
        this.searchStartTime = '';
        this.searchEndTime = moment().endOf('day').valueOf();
        this.todayTime = moment().endOf('day').valueOf();
        this.customEntities = [];
        this.customEntityName = '';
        this.isNoData = true;
        this.showCustomEntityInput = false;
    }
    $onInit() {
        this.entityList = []
    }
    $onChanges(changeObj) {
        if (changeObj && changeObj.entityList && changeObj.entityList.currentValue) {
            this.searchStartTime = '';
            this.searchEndTime = moment().endOf('day').valueOf();
            this.customEntities = [];
            this.showCustomEntityInput = false;
            this.onCombine && this.combine();
        }
    }

    //选择一个实体的时候
    selectEntity(entity) {
        if (!this.canSelect) {
            return false;
        }
        entity.selected = !entity.selected
    }
    // 添加自定义实体名称
    addCustomEntity(event){
        if((event.keyCode == 13 || event.type == 'blur') && this.customEntityName !== '' && this.customEntityName.trim()!== ''){
            this.customEntities.push(this.customEntityName.trim());
            console.log(this.customEntities)
            this.customEntityName ='';
            this.showCustomEntityInput = false;
        }else{
            return false;
        }
    }
    //删除自定义实体名称
    removeCustomEntity(index){
        console.log(index)
        this.customEntities.splice(index,1)
    }

    combine() {
        this.isNoData = this.entityList.every(entityType => entityType.list.length == 0);
        if(!this.canSelect){
            return false;
        }
        if(this.entityList.length == 0){
            return false;
        }
        if(this.isNoData){
            return false
        }
        let selectEntity = []
        this.entityList.forEach(item => {
            let selects = item.list.filter(entity => entity.selected)
            selectEntity = selectEntity.concat(selects)
        })
        // 如果没有选中默认全部
        if (selectEntity.length == 0) {
            selectEntity = this.entityList.map(item => item.list).flat()
        }
        let selectEntityMap = {};
        selectEntity.forEach(item => {
            selectEntityMap[item.entityType]?  selectEntityMap[item.entityType].push(item.name):selectEntityMap[item.entityType] = [item.name];
        })
        if(this.customEntities.length != 0){
            selectEntityMap['add'] = this.customEntities
        }
        this.onCombine({
            info: {
                time: {
                    startTime: this.searchStartTime ==''? '': moment(this.searchStartTime).startOf('day').valueOf(),
                    endTime: moment(this.searchEndTime).endOf('day').valueOf()
                },
                selectEntityMap
            }
        })
    }
}

export const seriesParallelEntityComponent = {
    controller: seriesParallelEntityController,
    bindings: {
        canSelect: '<',
        entityList: '<',
        onCombine: '&'
    },
    controllerAs: 'spec',
    templateUrl: 'app/main/seriesParallel/seriesParallelEntityInfo/seriesParallelEntityInfo.html',
}
