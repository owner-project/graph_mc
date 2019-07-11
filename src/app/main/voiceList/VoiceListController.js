import importExlModal from './importExl/modal'
import deleteModal from '../deleteDialog/modal'
export class VoiceListController {
    constructor($injector,util,toaster) {
        'ngInject';
        this.inject = $injector;
        this.$util = util;
        this.toaster = toaster;
        this.init();
        this.jsonData = {};
    }

    init() {
       this.initVoiceList();
    }

    initVoiceList() {
        const $this =  this;
        $this.inject.get('voiceAPIService').getVoiceList(globalLoading()).then(res => {
           if (res.status === 200) {
            if (res.data.status === 0) {
                $this.jsonData = res.data.data;
            }
        }
        }, error => {
        });
    }

    itemClick(id , type) {
        const $this = this;
        const state = $this.inject.get('$state');
        let transitionData;
        let transitionUrl;
        switch(type) {
            case 2:
                transitionData = { id: id, type: type };
                transitionUrl = 'main.phoneBook';
                break;
            default:
                transitionData = { id: id, type: type };
                transitionUrl = 'main.voiceModel';
                break;
        }
        state.transitionTo(transitionUrl, transitionData, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }

    itemDelete(e,id,type) {

        e.stopPropagation();
        const $this = this;
        new deleteModal($this.inject).$promise.then((res) => {
            if(res === 1){
                $this.inject.get('voiceAPIService').deleteVoiceListItem(globalLoading({
                    graphName: id,
                    type: type
                })).then(res => {
                    if (res.status === 200) {
                        if (res.data.status === 0) {
                            $this.toaster.success('删除成功')
                            $this.initVoiceList();
                        }else{
                            $this.toaster.error(res.data.message || '删除失败')
                        }
                    }
                }, error => {});
            }
        });
    }

    importExl(type) {
        new importExlModal(this.inject,type);
    }
}
