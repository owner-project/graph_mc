// import toast from "../../components/modal/toast/toast"
export class phoneBookController { //specific-map
    constructor($injector,$state) {
        'ngInject';
        this.inject = $injector;
        this.$state = $state;
        this.toaster = this.inject.get('toaster');
        this.jsonData = {};
        this.init();
    }

    init() {
        this.tableInit();
        this.inject.get('$rootScope').urlData.chooseMenu = 'application';
    }

    tableInit() {
        const $this = this;
        const $state = this.inject.get('$state');
        $this.inject.get('voiceAPIService').getSuspectsInfoTable(globalLoading({
            graphName: $state.params.id,
            type: parseInt($state.params.type)
        })).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    $this.jsonData = res.data.data;
                } else {
                    this.toaster.pop({type: 'error',title: res.data.message});
                }
            }
        }, error => {});
    }
    historyBack(){
        this.$state.transitionTo('main.voiceList',{
            reload: false,
            inherit: false,
            notify: false,
            location: 'replace',
        })
    }
    allChoose() {
        const $this = this;
        _.each($this.jsonData, (item) => {
            item.isChoosed = $this.isAllcheck;
        });
    }

    checkAll() {
        const $this = this;
        let allChoosed = true;
        _.each($this.jsonData, (item) => {
            if (!item.isChoosed) {
                allChoosed = false;
            }
        });
        $this.isAllcheck = allChoosed;
    }

    toPorpoise(item) {
        const $state = this.inject.get('$state');
        let stateData = {
            type: 'phoneBook',
            id: encodeURIComponent(item.id),
            graphName:$state.params.id
        };
        window.open($state.href('main.porpoise' , stateData), '_blank');
    }

    toPorpoiseAll() {
        const id = this.jsonData.filter(i => i.isChoosed).map(i => i.id).join(';');
        if (id == '') {
            // new toast(this.inject, {
            //     str: '请至少选择一条记录'
            // }).warn();
            this.toaster.pop({type:'warning',title:'请至少选择一条记录'});
            return
        }
        this.toPorpoise({
            id
        });
    }
}
