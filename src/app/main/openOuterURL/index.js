export class openOuterURLController {
    constructor ($injector, $scope) {
        'ngInject';
        this.inject = $injector;

        this.init();
    }

    init() {
        const $state = this.inject.get('$state');
        const homeService = this.inject.get('homeService');

        const url = $state.params.url;
        homeService.getBaiduHtml(url).then(result => {
            if (result.status === 200 && result.data.status === 0) {
                document.getElementById('html-content').innerHTML = result.data.data;
            }
        }, function (error) {
            //
        });

    }
}
