export class PersonalModelingController {
    constructor($injector) {
        'ngInject';

        this.inject = $injector;
        this.jsonData = {
            type: [],
            timeAxis: [],
            timeAxisIndex: 0,
        };
        this.init();
    }

    init(){
        const $this = this;
        $this.inject.get('applicationAPIService').getRecessivePersonIndex().then(result => {
            if (result.status === 200) {
                if (result.data && result.data.status === 0 && result.data.data) {
                    this.jsonData.type = result.data.data.count;
                    this.jsonData.timeAxis = result.data.data.logs.reverse();
                    this.jsonData.timeAxisIndex = this.jsonData.timeAxis.length;
                }
            }
        }, error => {
        });
        $this.inject.get('$timeout')(() => {
            angular.element('.jq_personal_main').addClass('personal-animate');
        }, 500);
    }

    getIntegralLogs(endDate) {
        const applicationAPIService = this.inject.get('applicationAPIService');
        applicationAPIService.getIntegralLogsList({endDate}).then(result => {
            if (result.status === 200) {
                if (result.data && result.data.status === 0 && result.data.data) {
                    const timeAxis = result.data.data.reverse();
                    const nowIndex = timeAxis.findIndex(i => i.sj === this.jsonData.timeAxis[0].sj);

                    if (nowIndex > -1) {
                        timeAxis.splice(nowIndex, timeAxis.length);
                    }

                    timeAxis.reverse().forEach(i => {
                       this.jsonData.timeAxis.unshift(i);
                    });

                    this.jsonData.timeAxisIndex = this.jsonData.timeAxis.findIndex(i => i.sj === endDate);
                }
            }
        }, error => {
        });
    }

    changeTimeAxis(index) {
        if (index <= 5) {
            this.getIntegralLogs(this.jsonData.timeAxis[index].sj);
        }
    }

    into_specific(item) {
        let $this = this;
        let state = $this.inject.get('$state');
        state.transitionTo('main.specificFactors', {type: item.lx}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
}
