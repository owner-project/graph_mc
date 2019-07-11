import moment from 'moment'
export default class combineExpandModal {
    constructor($injector, checkNode) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/combineExpand/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            checkNode: checkNode,
            startTime: '',
            endTime: '',
            selectItems: [],
            allSelected: false,
            halfSelect: false
        }
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        this.bindFn();
        const scope = this.$modal.$scope;
        this.injector.get('porpoiseService').getCombineExpandTypeConfig().then((res) => {
            if(res.status == 200 && res && res.data){
                let option = res.data.result
                scope.data.selectItems = option.map(item => {
                    item.isChecked = false
                    item.selectId = ''
                    item.selectValue = ''
                    item.operation = item.operation.map(o => {
                        o.value = o.id
                        o.name = o.des
                        return o
                    })
                    return item
                })
            }
        })
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scope = this.$modal.$scope;
        scope.fn = {
            close: function () {
                self.close();
            },
            dismiss: function () {
                self.close();
            },
            sure: function () {
                let selectEvent = scope.data.selectItems.filter(item => {
                    return item.isChecked
                });
                if (!scope.data.startTime || !scope.data.endTime) {
                    self.toaster.error('日期不能为空');
                    return;
                } else if (selectEvent.length === 0) {
                    self.toaster.error('事件类型必须勾选');
                    return;
                }
                let term = [],
                    goback = false
                selectEvent.forEach((item, index) => {
                    if (!item.selectId || !item.selectValue) {
                        self.toaster.error('已选中事件类型频次不能为空');
                        goback = false
                        return;
                    } else if (!(Number(item.selectValue) >= 0)) {
                        self.toaster.error('频次请填写正整数');
                        goback = false
                        return;
                    }
                    goback = true
                    item.selectValue = Number(item.selectValue)
                    term[index] = {
                        operation: item.selectId,
                        type: item.id,
                        value: item.selectValue
                    }
                })
                if (!goback) {
                    return;
                }
                let params = {
                    checkNode: scope.data.checkNode,
                    startTime: moment(scope.data.startTime).format('YYYY-MM-DD'),
                    endTime: moment(scope.data.endTime).format('YYYY-MM-DD'),
                    term: term
                }
                self.close(params);
            },
            selectAll: function() {
                scope.data.selectItems.forEach(item => {
                    item.isChecked = scope.data.allSelected
                });
                scope.data.halfSelect = false
            },
            toggleNode: function() {
                let selectEvent = scope.data.selectItems.filter(item => {
                    return item.isChecked
                });
                // 全选
                if (selectEvent.length === scope.data.selectItems.length) {
                    scope.data.allSelected = true
                    scope.data.halfSelect = false
                } else if (selectEvent.length === 0) { // 全不选
                    scope.data.allSelected = false
                    scope.data.halfSelect = false
                } else {
                    scope.data.allSelected = false
                    scope.data.halfSelect = true
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
