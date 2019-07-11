export class tradeReportCtrl {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.tradeType = $injector.get('$state').params.type;
        this.jsonData = {};
        this.chooseType = 'rmb';
        this.mType = '人民币';

        this.init();
    }
    historyBack(){
        window.history.back()
    }

    init() {

        this.getTotal();
        this.getzczjAcountData();
        this.getzrzjAcountData();
        this.getzjzcfAcountData();
        this.getzjzczAcountData();

        this.getzczhAcountData();
        this.getzrzhAcountData();
        this.getzhzcfAcountData();
        this.getzhzczAcountData();
    }

    chooseTag(e, type) {
        e.stopPropagation();
        if (this.chooseType !== type) {
            switch (type) {
                case 'rmb':
                    this.mType = '人民币'
                    this.chooseType = type;
                    this.inject.get('$state').transitionTo('main.tradeReport',{type:this.inject.get('$state').params.type.replace('APA_FM_','APA_RM_' )}, {
                        reload: false,
                        inherit: false,
                        notify: false,
                        location: 'replace',
                    })
                    break;
                case 'wb':
                    this.mType = '外币'
                    this.chooseType = type;
                    this.inject.get('$state').transitionTo('main.tradeReport',{type:this.inject.get('$state').params.type.replace('APA_RM_', 'APA_FM_')}, {
                        reload: false,
                        inherit: false,
                        notify: false,
                        location: 'replace',
                    })
                    break;
            }
            setTimeout(() => {
                this.init()
            }, 100);;
        }
    }

    openDetail(e) {
        e.stopPropagation();
        this.inject.get('$state').go('main.tradeReportApp', { id: this.inject.get('$state').params.type, type: this.chooseType});
    }

    /**
     * @description 获取统计数据
     */
    getTotal() {
        this.inject.get('tradeAPIService').getTradeListCount(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.totalData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 获取转出资金
     */
    getzczjAcountData() {
        this.inject.get('tradeAPIService').getzczjAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zczjData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 获取转入资金
     */
    getzrzjAcountData() {
        this.inject.get('tradeAPIService').getzrzjAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zrzjData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 资金轧差负
     */
    getzjzcfAcountData() {
        this.inject.get('tradeAPIService').getzjzcfAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zjzcfData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 资金轧差正
     */
    getzjzczAcountData() {
        this.inject.get('tradeAPIService').getzjzczAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zjzczData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 转出账户
     */
    getzczhAcountData() {
        this.inject.get('tradeAPIService').getzczhAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zczhData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 转入账户
     */
    getzrzhAcountData() {
        this.inject.get('tradeAPIService').getzrzhAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zrzhData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 账户轧差负
     */
    getzhzcfAcountData() {
        this.inject.get('tradeAPIService').getzhzcfAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zhzcfData = res.data.data;
                }
            }
        });
    }

    /**
     * @description 账户轧差正
     */
    getzhzczAcountData() {
        this.inject.get('tradeAPIService').getzhzczAcountData(globalLoading({
            transactionType: this.mType,
            excelName: this.inject.get('$state').params.type,
            top: 10
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData.zhzczData = res.data.data;
                }
            }
        });
    }

    goDetail(e, type) {
        this.inject.get('$state').go('main.tradeDetail',{
            rmbType: this.chooseType,
            name: this.inject.get('$state').params.type,
            type: type
        });
    }
}