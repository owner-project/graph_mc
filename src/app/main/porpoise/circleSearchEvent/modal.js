export default class addToMapModal {
    constructor($injector, type, tempTrees) {
        this.injector = $injector;
        this.oldTree = _.cloneDeep(tempTrees)
        this.tempTrees = tempTrees
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/circleSearchEvent/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.root = {
            allSelected: false,
            showIndeterminate: false,
        }
        this.$modal.$scope.data = {}

        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init(type);
    }

    init(type) {
        const scope = this.$modal.$scope;
        if (!type) {
            return false
        }
        this.injector.get('porpoiseService').getGeoTerm(type).then((res) => {
            scope.data.currentTree = res.data.data.all.nodeTree
            this.$modal.$scope.root = {
                allSelected: scope.data.currentTree.allSelected,
                showIndeterminate: scope.data.currentTree.showIndeterminate,
            }
            for(let p in scope.data.currentTree){
                scope.data.currentTree[p].startTime = null
                scope.data.currentTree[p].endTime = null
            }
            this.bindFn(scope.data.currentTree,type);
        })
    }

    close(tempTrees) {
        this.$defer.resolve(tempTrees);
        this.destroy();
    }

    bindFn(tree, type) {
        const self = this;
        const scope = this.$modal.$scope;
        scope.fn = {
            close: function () {
                self.close(self.oldTree);
            },
            toggleNode: function (node) {
                if (node.isParent) {
                    node.showIndeterminate = false;
                    angular.forEach(node.child, function (e) {
                        e.isChecked = node.isChecked;
                    });
                    let flag = false
                    angular.forEach(tree, function (e) {
                        if (e.isChecked !== node.isChecked || e.showIndeterminate) {
                            flag = true
                        }
                    });
                    if (flag) {
                        scope.root.allSelected = false;
                        scope.root.showIndeterminate = true;
                    } else {
                        scope.root.allSelected = node.isChecked;
                        scope.root.showIndeterminate = false;
                    }
                } else {
                    let hasDiff = false;
                    angular.forEach(tree[node.parentType].child, function (e) {
                        if (e.isChecked !== node.isChecked) {
                            hasDiff = true;
                        }
                    });

                    if (hasDiff) {
                        tree[node.parentType].showIndeterminate = true;
                        tree[node.parentType].isChecked = false;
                        scope.root.allSelected = false;
                        scope.root.showIndeterminate = true;

                    } else {
                        tree[node.parentType].showIndeterminate = false;
                        tree[node.parentType].isChecked = node.isChecked;
                        let flag = false
                        angular.forEach(tree, function (e) {
                            if (e.isChecked !== tree[node.parentType].isChecked || e.showIndeterminate) {
                                flag = true
                            }
                        });
                        if (flag) {
                            scope.root.allSelected = false;
                            scope.root.showIndeterminate = true;
                        } else {
                            scope.root.allSelected = tree[node.parentType].isChecked;
                            scope.root.showIndeterminate = false;
                        }
                    }
                }
            },
            selectAll: function () {
                scope.root.showIndeterminate = false;
                angular.forEach(tree, function (e) {
                    e.isChecked = scope.root.allSelected
                    e.showIndeterminate = false;
                    angular.forEach(e.child, function (child) {
                        child.isChecked = scope.root.allSelected
                    });
                });

                self.tempTrees = {
                    "nodeTree": {},
                    allSelected: scope.root.allSelected,
                    showIndeterminate: scope.root.showIndeterminate,
                    type: type
                }
                self.tempTrees.nodeTree = _.cloneDeep(tree)
            },
            dismiss: function () {
                self.close(self.oldTree);
            },
            sure: function () {
                //赋值操作在这做
                self.tempTrees = {
                    "nodeTree": {},
                    allSelected: scope.root.allSelected,
                    showIndeterminate: scope.root.showIndeterminate,
                    type: type
                }
                self.tempTrees.nodeTree = _.cloneDeep(tree)
                self.close(self.tempTrees);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
