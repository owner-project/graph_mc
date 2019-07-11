import importExlModal from './importExl/modal'
import deleteModal from '../deleteDialog/modal'
export class tradeListCtrl {
    constructor($injector,toaster) {
        'ngInject';
        this.inject = $injector;
        this.util = $injector.get('util');
        this.toaster = toaster;
        this.init();
        this.jsonData = {};
    }

    init() {
        this.initTradeList();
    }

    initTradeList() {
        this.inject.get('tradeAPIService').getTradeList(globalLoading()).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData = res.data.data;
                }
            }
        }, error => {
        });
    }

    itemClick(type) {
        this.inject.get('$state').transitionTo('main.tradeReport', {
            type: type
        }, {
            reload: false,
            inherit: true,
            notify: true,
            relative: this.inject.get('$state').$current,
            location: true
        });
    }

    itemDelete(e, item) {
        e.stopPropagation();
        const $this = this;
        new deleteModal($this.inject).$promise.then((res) => {
            if (res === 1) {
                $this.util.innerLoadingStart('main-view','#24263C');
                $this.inject.get('tradeAPIService').deleteTradeListItem({
                    graphName: item.graphName,
                    edgeCollection: item.edgeCollection,
                    persionCollection: item.persionCollection,
                    edgeCollection_w: item.edgeCollection_w
                }).then(res => {
                    $this.util.innerLoadingEnd();
                    if (res.status === 200) {
                        if (res.data.status === 0) {
                            $this.toaster.success('删除成功')
                            $this.initTradeList();
                        }else{
                            $this.toaster.error(res.data.message || '删除失败')
                        }
                    }
                }, error => { });
            }
        });
    }

    importExl(type) {
        new importExlModal(this.inject, type).$promise.then((res) => {
            if(res){
                this.initTradeList();
            }
        });
    }
}
