export class tradeDetailCtrl {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        switch ($injector.get('$state').params.rmbType) {
            case 'rmb':
                this.rmb_type = '人民币';
                break;
            case 'wb':
                this.rmb_type = '外币';
                break;
        }
        this.name = $injector.get('$state').params.name;
        this.type = $injector.get('$state').params.type;
        this.thList = {
            zrj: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'toName'
                },
                {
                    name: '身份证',
                    type: 'toCard'
                },
                {
                    name: '金额',
                    type: 'totalMoney'
                }
            ],
            zcj: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '身份证',
                    type: 'fromCard'
                },
                {
                    name: '金额',
                    type: 'totalMoney'
                }
            ],
            gcjz: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '身份证',
                    type: 'fromCard'
                },
                {
                    name: '金额',
                    type: 'netting'
                }
            ],
            gcjf: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '身份证',
                    type: 'fromCard'
                },
                {
                    name: '金额',
                    type: 'netting'
                }
            ],
            zrr: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'toName'
                },
                {
                    name: '账户',
                    type: 'toAccount'
                },
                {
                    name: '金额',
                    type: 'totalMoney'
                }
            ],
            zcr: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '账户',
                    type: 'fromAccount'
                },
                {
                    name: '金额',
                    type: 'totalMoney'
                }
            ],
            gcrz: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '账户',
                    type: 'fromAccount'
                },
                {
                    name: '金额',
                    type: 'netting'
                }
            ],
            gcrf: [
                {
                    name: '序号',
                    type: 'index'
                },
                {
                    name: '姓名',
                    type: 'fromName'
                },
                {
                    name: '账户',
                    type: 'fromAccount'
                },
                {
                    name: '金额',
                    type: 'netting'
                }
            ]
        }
        console.log(this.thList[this.type])

        this.init();
    }
    urlBack(){
        window.history.back()
    }

    init() {
        let service = null;
        const putData = {
            transactionType: this.rmb_type,
            excelName: this.name,
        };
        
        switch (this.type) {
            case 'zcj':
                service = this.inject.get('tradeAPIService').getzczjAcountData(globalLoading(putData));
                break;
            case 'zrj':
                service = this.inject.get('tradeAPIService').getzrzjAcountData(globalLoading(putData));
                break;
            case 'gcjz':
                service = this.inject.get('tradeAPIService').getzjzczAcountData(globalLoading(putData));
                break;
            case 'gcjf':
                service = this.inject.get('tradeAPIService').getzjzcfAcountData(globalLoading(putData));
                break;
            case 'zcr':
                service = this.inject.get('tradeAPIService').getzczhAcountData(globalLoading(putData));
                break;
            case 'zrr':
                service = this.inject.get('tradeAPIService').getzrzhAcountData(globalLoading(putData));
                break;
            case 'gcrz':
                service = this.inject.get('tradeAPIService').getzhzczAcountData(globalLoading(putData));
                break;
            case 'gcrf':
                service = this.inject.get('tradeAPIService').getzhzcfAcountData(globalLoading(putData));
                break;
        }

        

        service.then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.jsonData = res.data.data;
                }
            }
        });
    }

}