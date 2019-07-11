
export default class RelationDetail {
    constructor($injector, relationInfo,relationType) {
        this.injector = $injector;
        this.$state = this.injector.get('$state');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/people/relationDetail/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.relationType = relationType;
        this.$modal.$scope.data = {
            relations: {},
            pageNo: 1,
            pageSize: 5,
            relationInfo:relationInfo
        };
        this.init();
    }

    init() {
        this.bindFn();
    }

    close() {
        this.destroy();
    }
    /**
     * @description 获取关系明细列表
     */
    bindFn() {
        const self = this;
        const scope = self.$modal.$scope;
        let keys = [].concat(scope.data.relationInfo.key);
        if(this.relationType != 'event'){
            keys.push(this.$state.params.key);
        } 
        scope.fn = {
            dismiss: function () {
                self.close();
            },
            showRelationDetail: function() {
                const peopleService = self.injector.get('peopleService');
                self.injector.get('util').innerLoadingStart('relation-list-modal','#24263C');
                const params = {
                    key: keys, //'420106199307084011'
                    pageNo: scope.data.pageNo,
                    pageSize: scope.data.pageSize,
                    relationInfo:scope.data.relationInfo

                };
                peopleService.geEventsByIdAndRelation(params).then(result => {
                    self.injector.get('util').innerLoadingEnd('relation-list-modal');
                    if (result.data && result.data.status === 0) {
                        scope.data.relations = result.data.data;
                    }else{
                        scope.data.relations = {}
                    }
                });
            }
        }
        scope.fn.showRelationDetail();
    }

    destroy() {
        this.$modal.hide();
    }

}
