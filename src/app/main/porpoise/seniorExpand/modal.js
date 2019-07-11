// import toast from '../../../components/modal/toast/toast';
export default class seniorExpandModal {
    constructor($injector, outNode,tempTrees,type) {
        this.injector = $injector;
        this.tempTrees = tempTrees
        this.oldTree = _.cloneDeep(tempTrees)
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/seniorExpand/modal.html',
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
        this.init(outNode,type);
    }

    init(outNode,type) {
        const scope = this.$modal.$scope;
        this.injector.get('porpoiseService').getExpandTypeConfig({
            key:outNode
        }).then((res) => {
            if(res.status == 200 && res && res.data){
                scope.data = res.data.result.data
                if(this.tempTrees.nodeTree){
                    var tree = this.tempTrees
                }
                else{
                    if(scope.data[type]){
                        var tree = _.cloneDeep(scope.data[type])
                    }
                    else{
                        this.bindFn(outNode,null,type);
                    }
                }
                this.$modal.$scope.root = {
                    allSelected: tree.allSelected,
                    showIndeterminate: tree.showIndeterminate,
                }
                scope.data.currentTree = tree
                this.bindFn(outNode,tree.nodeTree,type);
            }
            else{
                this.bindFn(outNode,null,type);
            }
        })
    }

    close(tempTrees) {
        this.$defer.resolve(tempTrees);
        this.destroy();
    }

    bindFn(outNode,tree,type) {
        const self = this;
        const scope = this.$modal.$scope;
        scope.fn = {
            close: function () {
                self.close(self.oldTree);
            },
            toggleNode: function (node) {
                if (node.parent) {
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
                self.tempTrees[type] = {}
                self.tempTrees[type] = {"nodeTree":{},allSelected:scope.root.allSelected,showIndeterminate:scope.root.showIndeterminate}
                self.tempTrees[type].nodeTree = _.cloneDeep(tree)
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
                self.tempTrees[type] = {}
                self.tempTrees[type] = {"nodeTree":{},allSelected:scope.root.allSelected,showIndeterminate:scope.root.showIndeterminate}
                self.tempTrees[type].nodeTree = _.cloneDeep(tree)
            },
            dismiss: function () {
                self.close(null);
            },
            sure: function () {
                if(self.tempTrees[type]){
                    self.close(self.tempTrees);
                }
                else{
                self.tempTrees[type] = {}
                self.tempTrees[type].nodeTree = self.tempTrees
                self.close(self.tempTrees);
                }
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
