export default class circleSearchEntity {
    constructor($injector,tempTrees) {
        this.injector = $injector;
        this.tempTrees = tempTrees
        this.oldTree = _.cloneDeep(tempTrees)
        this.tempTreesKeysList = Object.keys(this.tempTrees).sort()
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/circleSearchEntity/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        const _this = this
        this.$modal.$scope.root = {
            allSelected: false,
            showIndeterminate: false,
            chooseType:this.tempTreesKeysList[0],
            selectLeftMenu:function(i){
                this.chooseType = i
                const scope = _this.$modal.$scope;
                scope.data.currentTree = _.cloneDeep(_this.oldTree)//需要类型多选注释掉本行代码
                _this.bindFn(scope.data.currentTree[scope.root.chooseType]);
            }
        }
        this.$modal.$scope.data = {}
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        const scope = this.$modal.$scope;
        scope.data.currentTree = _.cloneDeep(this.tempTrees)
        scope.data.tempTreesKeysList = this.tempTreesKeysList
        this.bindFn(scope.data.currentTree[scope.root.chooseType]);
    }

    close(tree) {
        this.$defer.resolve(tree);
        this.destroy();
    }

    bindFn(tree) {
        const self = this;
        const scope = this.$modal.$scope;
        scope.fn = {
            close: function (tree) {
                self.close(tree);
            },
            toggleNode: function (node) {
                if (node.isParent) {
                    node.showIndeterminate = false;
                    angular.forEach(node.child, function (e) {
                        e.isChecked = node.isChecked;
                    });
                    let flag = false
                    angular.forEach(tree.child, function (e) {
                        if (e.isChecked !== node.isChecked || e.showIndeterminate) {
                            flag = true
                        }
                    });
                    if (flag) {
                        tree.allSelected = false;
                        tree.showIndeterminate = true;
                    } else {
                        tree.allSelected = node.isChecked;
                        tree.showIndeterminate = false;
                    }
                } else {
                    let hasDiff = false;
                    angular.forEach(tree.child, function (e) {
                        if(e.type == node.dataType){
                            angular.forEach(e.child, function (i) {
                                if (i.isChecked !== node.isChecked) {
                                    hasDiff = true;
                                }
                            })
                        }
                        
                    });
                    if (hasDiff) {
                        angular.forEach(tree.child, function (e) {
                            if(e.type == node.dataType){
                                e.showIndeterminate = true;
                                e.isChecked = false;
                            }
                        });
                        tree.allSelected = false;
                        tree.showIndeterminate = true;

                    } else {
                        angular.forEach(tree.child, function (e) {
                            if(e.type == node.dataType){
                                e.showIndeterminate = false;
                                e.isChecked = node.isChecked;
                            }
                        });
                        let flag = false
                        angular.forEach(tree.child, function (e) {
                            if (e.isChecked !== node.isChecked || e.showIndeterminate) {
                                flag = true
                            }
                        });
                        if (flag) {
                            tree.allSelected = false;
                            tree.showIndeterminate = true;
                        } else {
                            tree.allSelected = node.isChecked;
                            tree.showIndeterminate = false;
                        }
                    }
                }
            },
            selectAll: function () {
                tree.showIndeterminate = false;
                angular.forEach(tree.child, function (e) {
                    e.isChecked = tree.allSelected
                    e.showIndeterminate = false;
                    angular.forEach(e.child, function (i) {
                        i.isChecked = tree.allSelected
                    });
                });
            },
            dismiss: function () {
                self.close(null);
            },
            sure: function () {
                    self.close(tree);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
