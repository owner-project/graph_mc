export default class addToMapModal {
    constructor($injector, outNode, tempTrees) {
        this.injector = $injector;
        this.oldTree = _.cloneDeep(tempTrees)
        this.tempTrees = tempTrees
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/addToMap/modal.html',
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
        this.init(outNode);
    }

    init(outNode) {
        const scope = this.$modal.$scope;
        if (!outNode) {
            return false
        }
        const type = outNode.id.split('/')[0].split('_')[0]
        this.injector.get('porpoiseService').getGeoConfig({}).then((res) => {
            scope.data = res.data.data
            if (scope.data[type]) {
                const self = this;
                var tree = self.tempTrees[outNode.key] || _.cloneDeep(scope.data[type])
                this.$modal.$scope.root = {
                    allSelected: tree.allSelected,
                    showIndeterminate: tree.showIndeterminate,
                }
                scope.data.currentType = tree
                this.bindFn(outNode, tree.nodeTree);
            } else {
                this.bindFn(outNode, {});
                return false
            }
        })
    }

    close(tempTrees) {
        this.$defer.resolve(tempTrees);
        this.destroy();
    }

    bindFn(outNode, tree) {
        const self = this;
        const scope = this.$modal.$scope;
        if (!outNode) {
            return false
        }
        const type = outNode.id.split('/')[0].split('_')[0]
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
                        scope.root.allSelected = tree[node.type].isChecked;
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

                self.tempTrees[outNode.key] = {
                    "nodeTree": {},
                    allSelected: scope.root.allSelected,
                    showIndeterminate: scope.root.showIndeterminate,
                    key: outNode.key,
                    type: type
                }
                self.tempTrees[outNode.key].nodeTree = _.cloneDeep(tree)
            },
            dismiss: function () {
                self.close(self.oldTree);
            },
            sure: function () {
                self.tempTrees[outNode.key] = {
                    "nodeTree": {},
                    allSelected: scope.root.allSelected,
                    showIndeterminate: scope.root.showIndeterminate,
                    key: outNode.key,
                    type: type
                }
                self.tempTrees[outNode.key].nodeTree = _.cloneDeep(tree)
                self.close(self.tempTrees);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
