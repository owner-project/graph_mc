class focusPeopleController {
    constructor($injector, $scope) {
        'ngInject';
        this.$scope = $scope;
        this.inject = $injector;
        this.$state = this.inject.get('$state')
        this.peopleService = this.inject.get('peopleService')
        this.PAGE_SIZE = 5;
        this.totalCount = 0;
        this.pageNo = 1;
        this.dynamicList = []
        this.appIconMap = {
            "01": 'assets/images/theme_star_blue/home/tag5.svg',
            "02": 'assets/images/theme_star_blue/home/focus-internet.svg',
            "03": 'assets/images/theme_star_blue/home/tag3.svg',
            "04": 'assets/images/theme_star_blue/home/tag2.svg',
            "default": 'assets/images/theme_star_blue/home/tag0201.svg'
        }
        // this.init()
    }
    $onInit() {
        if(this.showNoData && this.peopleKey == 0){
            this.dynamicList = [];
            return false;
        }
        this.getFocusDynamic();

        this.$scope.$on('$destroy', () => {
            this.inject.get('$interval').cancel(this.timer);
        });
    }
    $onChanges(changeObj){
        this.pageNo = 1;
        this.getFocusDynamic()
    }
    getFocusDynamic() {
        let keys = []
        if (this.peopleKey) {
            keys = this.peopleKey
        }
        let params = {key:keys};
        if(params.key.length !== 0){
            params.pageNo = this.pageNo;
            params.pageSize = this.PAGE_SIZE;
        }
        this.peopleService.getFocusDynamic(params).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    if (params.key.length == 0) {
                        this.dynamicList = res.data.data;
                    } else {
                        this.dynamicList = res.data.data.data;
                        this.totalCount =  res.data.data.total;
                    }
                    setTimeout(() => {
                        let line = Math.floor(angular.element('.focus-people-dynamic ul').height() / 65);
                        if (!this.showNoData && this.dynamicList.length > line) {
                            this.doscroll();
                            this.scrollEvent();
                        }
                    }, 1000);
                }
            }
        }, error => {
            //
        })
    }
    scrollEvent() {
        let $parent = angular.element('.focus-people-dynamic ul');
        $parent.on('mouseover', () => {
            this.stopScroll();
        })
        $parent.on('mouseleave', () => {
            this.startScroll();
        })
    }
    doscroll() {
        this.timer = this.inject.get('$interval')(() => {
            var $parent = angular.element('.focus-people-dynamic ul');
            if ($parent.length === 0) {
                this.inject.get('$interval').cancel(this.timer);
            }
            var $first = $parent.find('li:first');
            angular.element('.focus-people-dynamic ul li').removeClass('move');
            $first.addClass('move');
            this.timeoutTimer = this.inject.get('$timeout')(() => {
                if (this.timeoutTimer) {
                    $first.appendTo($parent);
                }
            }, 2000);
        }, 10);
    }
    stopScroll() {
        if (!this.showNoData) {
            this.inject.get('$timeout').cancel(this.timeoutTimer);
            this.timeoutTimer = null;
            this.inject.get('$interval').cancel(this.timer);
            angular.element('.focus-people-dynamic ul').addClass('autoStyle');
        }
    }
    startScroll() {
        if (!this.showNoData) {
            let $parent = angular.element('.focus-people-dynamic ul');
            let lis = $parent.find('li');
            for(let i = 0; i < lis.length; i++) {
                var $li = angular.element(lis[i]);
                if ($li.position().top < 0) {
                    $li.appendTo($parent);
                }
            }
            angular.element('.focus-people-dynamic ul').removeClass('autoStyle');
            this.doscroll();
        }
    }
    into_porpoise(id,isToGis) {
        localStorage.setItem("isToGis", isToGis)
        localStorage.setItem('canUpdateGraph','false')
        const $this = this;
        const state = $this.inject.get('$state');
        const stateData =  { type: 'normal', id: encodeURIComponent(id)};
        window.open(state.href('main.porpoise' , stateData), '_blank');
    }
}

export const focusPeopleComponent = {
    bindings: {
        peopleKey: '<',
        showNoData: '<'
    },
    controller: focusPeopleController,
    controllerAs: 'focusPeople',
    templateUrl: 'app/main/home/focusPeople/focusPeople.component.html',
};
