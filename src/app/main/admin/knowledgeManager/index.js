class knowledgeManagerCtrl {
    constructor($injector) {
        'ng-inject';
        this.inject = $injector;
        this.init();
    }

    init() {
        const $this = this;
        const state = $this.inject.get('$state');
        $this.type = state.params.departId;
    }
}

knowledgeManagerCtrl.$inject = ['$injector'];

export {
    knowledgeManagerCtrl
}