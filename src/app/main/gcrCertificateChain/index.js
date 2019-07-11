export class gcrCertificateChainCtrl {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.jsonData = {};
        this.searchData = {
            pageNo: 1,
            pageSize: 10,
            text: ''
        }
        this.init();
    }

    init() {
        this.getData();
    }

    getData() {
        this.inject.get('applicationAPIService').getGccData(globalLoading(this.searchData)).then(res => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData = res.data.data;
                    this.total = res.data.total;
                }
            }
        });
    }

    seearchSubmit() {
        this.getData();
    }

    searchList() {
        this.getData();
    }

    toPorpoise(item) {
        this.inject.get('$state').go('main.porpoise', { type: 'normal', id: encodeURIComponent('multicard/' + item.id) });
    }

}
