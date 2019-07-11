import toast from '../../../components/modal/toast/toast';

export default class mergeGraphModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.resolveData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/mergeGraph/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            pager: {
                pageNo: 1,
                pageSize: 10,
                total: 0
            },
            list: [],
            folderId: '',
            crumbList: [{
                name: '根目录',
                id: ''
            }],
            type: 1,
            loading: true,
            search: {
                minDate: null,
                maxDate: null,
                content: ''
            }
        };

        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        this.bindFn();
        this.getData();
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    getData() {
        const scope = this.$modal.$scope;
        const util = this.injector.get('util');
        const $timeout = this.injector.get('$timeout');
        const cooperateService = this.injector.get('cooperateService');
        let params = {},
            serviceFunc = '';
        if (scope.data.type === 4) {
            params = {
                pageSize: scope.data.pager.pageSize,
                pageNo: scope.data.pager.pageNo,
                searchContent: scope.data.search.content
            };
            serviceFunc = 'getTmpFolder';
        } else {
            params = {
                searchContent: scope.data.search,
                pageSize: scope.data.pager.pageSize,
                pageNo: scope.data.pager.pageNo,
                id: scope.data.folderId,
                graphShotType: scope.data.type,
                type: 'graphshot'
            };
            serviceFunc = 'getFolder';
        }

        scope.data.loading = true;
        $timeout(() => {
            util.innerLoadingStart('merge-graph-modal', '#24263C');
        });
        cooperateService[serviceFunc](params).then((res) => {
            if(res.status === 200 && res.data.status === 0) {
                if (scope.data.type === 4) {
                    scope.data.list.file = res.data.data;
                } else {
                    scope.data.list = res.data.data;
                }
                scope.data.pager.total = res.data.count;
            }
            util.innerLoadingEnd();
            scope.data.loading = false;
        }, (error) => {
            util.innerLoadingEnd();
            scope.data.loading = false;
        });
    }

    bindFn() {
        const self = this;
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            close: function (data) {
                self.close(data);
            },
            changeType: function (type) {
                if (type !== data.type) {
                    data.type = type;
                    data.folderId = '';
                    data.crumbList = [{
                        name: '根目录',
                        id: ''
                    }];
                    data.pager.pageNo = 1;
                    self.getData();
                }
            },
            crumbJump(folder, index) {
                data.folderId = folder.id;
                data.crumbList.splice(index + 1);
                self.getData();
            },
            openFolder(folder) {
                data.folderId = folder.id;
                data.crumbList.push(folder);
                self.getData();
            },
            changeDate: function () {
                data.pager.pageNo = 1;
                self.getData();
            },
            changeContent: function () {
                data.pager.pageNo = 1;
                self.getData();
            },
            changePage: function () {
                self.getData();
            },
            chooseSnapshot: function (item) {
                const porpoiseService = self.injector.get('porpoiseService');
                const util = self.injector.get('util');

                util.innerLoadingStart('merge-graph-modal', '#24263C');

                let params = {
                    id: item.id
                }
                if (data.type === 4) {
                    params.type = 'tmpfile';
                }

                porpoiseService.getSnapshotData(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        self.close(result.data);
                    }
                    util.innerLoadingStart();
                }, error => {
                    //
                    util.innerLoadingStart();
                });

            },
            dismiss: function () {
                self.close();
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
