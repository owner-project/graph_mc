// import toast from '../../../components/modal/toast/toast';
export default class addEdgeModal {
    constructor($injector, resolveData) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/addEdge/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            options: {
                typeList: [],
                dataTypeList: [],
                nodeList: resolveData,
                customDataType: '',
                isCustomDataLabel: false,
                customDataLabel: ''
            }
        };

        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        const scope = this.$modal.$scope;

        this.bindFn();

        this.injector.get('porpoiseService').getRelationEntity({type: 'relation'}).then(result => {
            if (result.data && result.data.status === 0) {
                const typeList = {};
                const typeData = result.data.data;

                typeData.forEach(type => {
                    const parentTypeId = type.typeId.slice(0, 2);

                    if (!typeList[parentTypeId]) {
                        typeList[parentTypeId] = {
                            child: []
                        };
                    }
                    if (parentTypeId === type.typeId) {
                        typeList[parentTypeId].name = type.typeName;
                        typeList[parentTypeId].id = type.typeId;
                    } else {
                        typeList[parentTypeId].child.push({
                            id: type.typeId,
                            name: type.typeName
                        });
                    }
                });

                angular.forEach(typeList, function (item) {
                    scope.data.options.typeList.push(item);
                });

                scope.data.options.typeList.push({
                    id: '00',
                    name: '自定义关系'
                });
            }
        });
    }

    close(data) {
        this.$defer.resolve(data);
        this.destroy();
    }

    bindFn() {
        const self = this;
        const scope = self.$modal.$scope;
        scope.fn = {
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            getDataTypeList() {
                if (scope.data.putData.type !== '00') {
                    scope.data.putData.dataType = undefined;
                    scope.data.options.dataTypeList = scope.data.options.typeList.filter(type => type.id === scope.data.putData.type)[0].child;
                }
            },
            sure: function () {
                if (!scope.data.putData.type) {
                    // new toast(self.injector, {str: '请选择关系大类'}).warn();
                    self.toaster.pop({type:'warning',title:'请选择关系大类'});
                    return;
                }
                if (!scope.data.putData.firstNode) {
                    // new toast(self.injector, {str: '请选择来源实体'}).warn();
                    self.toaster.pop({type:'warning',title:'请选择来源实体'});

                    return;
                }
                if (!scope.data.putData.secondNode) {
                    // new toast(self.injector, {str: '请选择目标实体'}).warn();
                    self.toaster.pop({type:'warning',title:'请选择目标实体'});

                    return;
                }

                if (scope.data.putData.type !== '00') {
                    if (scope.data.putData.dataType === undefined) {
                        // new toast(self.injector, {str: '请选择关系类型'}).warn();
                        self.toaster.pop({type:'warning',title:'请选择关系类型'});

                        return;
                    } else {
                        if (scope.data.putData.isCustomDataLabel && !scope.data.putData.customDataLabel) {
                            // new toast(self.injector, {str: '请填写自定义关系内容'}).warn();
                            self.toaster.pop({type:'warning',title:'请填写自定义关系内容'});

                            return;
                        }
                    }
                } else {
                    if (!scope.data.putData.customDataType) {
                        // new toast(self.injector, {str: '请填写自定义关系类型'}).warn();
                        self.toaster.pop({type:'warning',title:'请填写自定义关系类型'});

                        return;
                    }
                }

                let relation = {};

                if (scope.data.putData.type !== '00') {
                    const parentTypeId = scope.data.putData.dataType.slice(0, 2);
                    scope.data.options.typeList.forEach(type => {
                        if (type.id === parentTypeId) {
                            relation.typeLabel = type.name;
                            relation.type = type.id;

                            type.child.forEach(t => {
                                if (t.id === scope.data.putData.dataType) {
                                    relation.dataLabel = t.name;
                                    relation.dataType = t.id;
                                }
                            });
                        }
                    });
                } else {
                    scope.data.options.typeList.forEach(type => {
                        if (type.id === scope.data.putData.type) {
                            relation.typeLabel = type.name;
                            relation.type = type.id;
                        }
                    });

                    relation.dataType = '0000';
                    relation.dataLabel = scope.data.putData.customDataType;
                }


                const edge = {
                    from: scope.data.putData.firstNode,
                    to: scope.data.putData.secondNode,
                    type: relation.type,
                    typeLabel: relation.typeLabel,
                    dataLabel: relation.dataLabel,
                    dataType: relation.dataType
                };

                if (scope.data.putData.type !== '00' && scope.data.putData.isCustomDataLabel) {
                    edge.customDataLabel = scope.data.putData.customDataLabel;
                }

                self.close(edge);
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
