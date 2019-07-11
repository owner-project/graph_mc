// import toast from '../../../components/modal/toast/toast';
import moment from 'moment';

export default class historyImportModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/historyImport/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            type: '01',
            components: [],
            recordList: [],
            recordItem: null,
            loading: true,
            pager: {
                pageNo: 1,
                total: 0,
                pageSize: 5,
            }
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        this.bindFn();
        this.changePage();
    }

    changePage() {
        const porpoiseService = this.injector.get('porpoiseService');
        const data = this.$modal.$scope.data;
        const {pageNo, pageSize} = data.pager;
        const self = this;
        const params = {
            pageNo,
            pageSize,
            type: this.$modal.$scope.data.type
        };

        if (params.type === '02') {
            params.graphName = data.recordItem.graphName;
        }

        this.injector.get('util').innerLoadingStart('modal-body','#24263C');

        porpoiseService.getImportRecordList(params).then(result => {
            if (result.status === 200 && result.data.status === 0) {
                data.pager.total = result.data.data.total;
                data.recordList = result.data.data.data;
                if (data.type === '01') {
                    data.recordList.forEach(item => {
                        item.timeFormat = moment(item.time).format('YYYY-MM-DD HH:mm');
                    });
                }
            }
            self.injector.get('util').innerLoadingEnd();
        }, function (error) {
        });
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            goBack: function () {
                data.type = '01';
                data.pager.pageNo = 1;
                data.pager.total = 0;
                data.loading = true;
                self.changePage();
            },
            viewRecord: function (item) {
                self.injector.get('util').innerLoadingStart('modal-body','#24263C');
                
                data.recordItem = item;

                data.type = '02';
                data.pager.pageNo = 1;
                data.pager.total = 0;
                data.recordList = [];
                self.changePage();
            },
            deleteRecord: function (item) {
                const porpoiseService = self.injector.get('porpoiseService');

                porpoiseService.deleteImportRecord({graphName: item.graphName}).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        self.toaster.pop({type:'success',title:'删除成功'});
                        self.changePage();
                    }
                }, function (error) {
                    //
                });
            },
            changePage() {
                self.changePage();
            },
            viewComponent(item) {
                const porpoiseService = self.injector.get('porpoiseService');
                const params = {
                    id: item.id
                };
                self.injector.get('util').innerLoadingStart('modal-body','#24263C');
                porpoiseService.getGraphComponent(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        self.injector.get('util').innerLoadingEnd();
                        self.close(result.data);
                    }
                }, function (error) {
                    //
                });
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
