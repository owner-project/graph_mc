/**
 * @description 
 */
class entityTplController {
    constructor($injector, $scope, $timeout) {
        'ngInject';
        this.$scope = $scope;
    }
    chooseNodesFunc(item, e) {
        this.chooseNodes({
            item: item,
            e: e
        });
    }
    statisticsNameClickFunc(key, e) {
        this.statisticsNameClick({
            key: key,
            e: e
        });
    }
    disableNodesFunc(vertice, e) {
        this.disableNodes({
            vertice: vertice,
            e: e
        });
    }
}
  
  export const statisticEntityTplComponent = {
    bindings: {
        association: '<',
        openStatus: '=',
        nodeTree: '=',
        verticesSum: '<',
        cverticesSum: '<',
        connectedverticesSum: '<',
        hasNodeSelected: '<',
        disabledNodes: '<',
        chooseNodes: '&',
        statisticsNameClick: '&',
        disableNodes: '&',
        searchWord: '<'
    },
    controller: entityTplController,
    controllerAs: 'entity',
    templateUrl: 'app/main/porpoise/statistics/entity.html'
  };