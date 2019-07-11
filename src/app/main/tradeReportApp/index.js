export class tradeReportAppCtrl {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.tradeType = $injector.get('$state').params.id;
        this.hbType = $injector.get('$state').params.type;
        this.toaster = this.inject.get('toaster');
        switch (this.hbType) {
            case 'rmb':
                this.hbTypec = '人民币';
                this.inject.get('$state').params.id.replace('APA_FM_', 'APA_RM_')
                this.inject.get('$state').transitionTo('main.tradeReportApp', {
                    id: this.inject.get('$state').params.id,
                    type: ''
                }, {
                    reload: false,
                    inherit: false,
                    notify: false,
                    location: 'replace',
                })
                break;
            case 'wb':
                this.hbTypec = '外币';
                this.inject.get('$state').params.id.replace('APA_RM_', 'APA_FM_')
                this.inject.get('$state').transitionTo('main.tradeReportApp', {
                    id: this.inject.get('$state').params.id,
                    type: 'wb'
                }, {
                    reload: false,
                    inherit: false,
                    notify: false,
                    location: 'replace',
                })
                break;
        }
        this.chooseType = 'jl';
        this.reportList = [];
        this.graphData = {
            vertices: [],
            edges: []
        };
        this.chooseDetailList = [];

        this.init();
    }

    init() {
        this.getReportList();
    }

    getReportList() {
        this.checkAll = false;
        this.inject.get('tradeAPIService').getReportList(globalLoading({
            transactionType: this.hbTypec,
            excelName: this.tradeType,
            searchContent: this.searchContent
        })).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.reportList = res.data.data;
                }
            }
        });
    }
    historyBack() {
        this.inject.get('$state').transitionTo('main.tradeReport',{type:this.inject.get('$state').params.id.replace('APA_FM_','APA_RM_' )}, {
            reload: true,
            inherit: true,
            notify: true,
            location: 'replace',
        })
    }
    getReportGraph() {
        const putData = {
            graphName: `${this.tradeType}`,
            id: [],
            start: 0,
            depth: 1
        };

        this.reportList.forEach((item) => {
            if (item.selected) {
                putData.id.push(item.fromId)
                putData.id.push(item.toId)
            }
        });
        if(putData.id.length == 0){
            this.toaster.warning({
                title: '请至少勾选一个实体进行分析'
            });
            return
        }
        this.inject.get('tradeAPIService').getReportGraph(globalLoading(putData)).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.graphData = res.data.data;
                    this.toaster.success({
                        title: '分析成功'
                    });
                }
            }
        });
    }

    myKeyup() {
        this.getReportList();
    }

    selectAll() {
        this.reportList.forEach((item) => {
            if (this.checkAll) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });
    }

    isSelectAll(item) {
        if (item.selected) {
            let isAllCheck = true;
            this.reportList.forEach((n) => {
                if (!n.selected) {
                    isAllCheck = false;
                    return;
                }
            });
            this.checkAll = isAllCheck;
        } else {
            this.checkAll = false;
        }
    }

    toPorpoise(item, type) {
        let selectedId = []
        if (type == 'batch') {
            this.reportList.forEach((item) => {
                if (item.selected) {
                    selectedId.push(item.fromId)
                    selectedId.push(item.toId)
                }
            });
            if (selectedId.length > 0) {
                const state = this.inject.get('$state');
                const stateData = {
                    graphName: this.tradeType,
                    type: 'normal',
                    id: encodeURIComponent(selectedId.join(';'))
                };
                window.open(state.href('main.porpoise', stateData), '_blank'); //去porpoisecontroller 搜 跳转到图谱的处理
            } else {
                this.toaster.warning({
                    title: '请至少勾选一个实体进行分析'
                });
            }
        } else {
            const state = this.inject.get('$state');
            selectedId.push(item.singleId)
            // selectedId.push(item.toId)
            const stateData = {
                graphName: this.tradeType,
                type: 'normal',
                id: encodeURIComponent(selectedId.join(';'))
            };
            window.open(state.href('main.porpoise', stateData), '_blank');
        }

    }

    chooseReport(e, item) {
        e.stopPropagation();
        this.chooseItemDetail = true;
        this.chooseReportItem = item;
        const putData = {
            excelName: this.tradeType,
            transactionType: this.hbTypec,
            idCard: item.idCard
        };

        this.inject.get('tradeAPIService').getReportItem(globalLoading(putData)).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.chooseDetailList = res.data.data;
                    this.chooseDetailList.forEach((n) => {
                        if (n.fromCard === item.idCard) {
                            n.type = '付款';
                        } else if (n.toCard === item.idCard) {
                            n.type = '收款'
                        }
                    });
                }
            }
        })
    }

    chooseGrpahItem(item) {
        this.chooseItemDetail = true;
        this.chooseReportItem = {};
        const putData = {
            excelName: this.tradeType,
            transactionType: this.hbTypec,
            idCard: item.key
        };
        this.reportList.forEach((n) => {
            if (n.key === item.key) {
                this.chooseReportItem = Object.assign({}, n, item);
            }
        });
        console.log(item)
        this.inject.get('tradeAPIService').getReportItem(globalLoading(putData)).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.chooseDetailList = res.data.data;
                    this.chooseDetailList.forEach((n) => {
                        if (n.fromCard === item.idCard) {
                            n.type = '付款';
                        } else if (n.toCard === item.idCard) {
                            n.type = '收款'
                        }
                    });
                }
            }
        });
    }

    chooseGraphLink(item) {
        this.chooseReportItem = null;
        this.chooseItemDetail = true;

        const putData = {
            id: item.key,
            type: item.type,
            flag: 0,
            from: item.from,
            to: item.to,
            graphName: `${this.tradeType}`
        };

        this.inject.get('tradeAPIService').getReportLink(globalLoading(putData)).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.chooseDetailList = res.data.data;
                    this.chooseDetailList.forEach((n) => {
                        if (n.fromCard === item.idCard) {
                            n.type = '付款';
                        } else if (n.toCard === item.idCard) {
                            n.type = '收款'
                        }
                    });
                }
            }
        });
    }

    chooseTag(e, type) {
        if (this.chooseType !== type) {
            this.chooseType = type;

            switch (type) {
                case 'jl':
                    this.chooseItemDetail = false;
                    // this.getReportList();
                    this.graphData = {
                        vertices: [],
                        edges: []
                    }
                    break;
                case 'tx':
                    this.chooseItemDetail = false;
                    this.inject.get('porpoiseService').initPorpoise().then(() => {
                        this.getReportGraph();
                    })
                    break;
            }
        }

    }
}
