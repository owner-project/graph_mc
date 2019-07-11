/**
 * @description 
 */
class relationTplController {
    constructor($injector, $scope) {
        'ngInject';
        this.$scope = $scope;
        this.inject = $injector;
        this.toaster = this.inject.get('toaster');
        this.$scope.$on('$destroy', () => {
            $(document.body).unbind('click');
        });
    }
    toggleEdgeFunc(item, tag) {
        this.toggleEdge({
            item: item,
            tag: tag
        });
    }
    porpoiseLineClickFunc(e, edge) {
        this.porpoiseLineClick({
            e: e,
            edge: edge
        });
    }
    resetFilterFunc(e, v) {
        v.filterShow = !v.filterShow;
        this.resetFilter({
            e: e,
            v: v
        });
    }
    confirmFilterFunc(e, v) {
        v.filterShow = !v.filterShow;
        this.confirmFilter({
            e: e,
            v: v
        });
    }
    showFilter(e, v) {
        e.stopPropagation();
        if (!v.show) {
            this.toaster.warning({
                title: '请先勾选当前关系'
            });
            return;
        }
        for(let item in this.edgeTree) {
            for (let c in this.edgeTree[item].child) {
                if (v.label != this.edgeTree[item].child[c].label) {
                    this.edgeTree[item].child[c].filterShow = false;
                }
            }
        }
        v.filterShow = !v.filterShow;
        this.settingShow(v);
    }
    settingShow(v) {
        $(document.body).unbind('click');
        $(document.body).bind('click', (e) => {
            for(let item in this.edgeTree) {
                for (let c in this.edgeTree[item].child) {
                    this.edgeTree[item].child[c].filterShow = false;
                }
            }
        });
    }
}
  
  export const statisticRelationTplComponent = {
    bindings: {
        openStatus: '=',
        allEdgesSum: '<', // 关系统计
        edgesSum: '<', // 关系统计/相关联关系/已选择关系
        type: '<', // 1.关系统计/2.相关联关系/3.已选择关系
        edgeTree: '=',
        toggleEdge: '&',
        porpoiseLineClick: '&',
        resetFilter: '&',
        confirmFilter: '&',
        selectedEdge: '<',
        defaultFilterJson: '=',
        comparison: '<'
    },
    controller: relationTplController,
    controllerAs: 'relation',
    templateUrl: 'app/main/porpoise/statistics/relation.html'
  };