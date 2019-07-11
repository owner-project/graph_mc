// import toast from '../../../components/modal/toast/toast';

export default class addNodeModal {
    constructor($injector) {
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/addNode/modal.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            options: {
                typeList: [],
                dataTypeList: []
            },
            putData: {
                dataType: undefined,
                type: undefined,
                key: '',
                name: '',
                
            },
            hasSearchNode: false,
            searchNodeType: '',
            searchNodeDataType: '',
            searchNodeDataLabel:'',
            searchNodeTypeLabel:'',
            searching: false,
            verticesItem: null
        };
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init();
    }

    init() {
        const scope = this.$modal.$scope;
        this.bindFn();

        this.injector.get('porpoiseService').getRelationEntity({
            type: 'entity'
        }).then(result => {
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
            sure: function () {
                if (!scope.data.putData.dataType || !scope.data.putData.key || !scope.data.putData.name) {
                    self.toaster.pop({type:'warning',title:'查无此实体'});
                    return;
                }
                if (scope.data.verticesItem && scope.data.verticesItem.key.toUpperCase() == scope.data.putData.key.toUpperCase() && scope.data.verticesItem.type == scope.data.putData.type) {
                    self.close(scope.data.verticesItem);
                } else {
                    scope.data.options.typeList.forEach(type => {
                        if (type.id === scope.data.putData.type) {
                            scope.data.putData.label = type.name;
                            type.child.forEach(dataType => {
                                if (dataType.id === scope.data.putData.dataType) {
                                    scope.data.putData.dataLabel = dataType.name;
                                }
                            });
                        }
                    });
                    self.close(scope.data.putData);
                }
            },
            getDataTypeList() {
                scope.data.putData.dataType = undefined;
                scope.data.options.dataTypeList = scope.data.options.typeList.filter(type => type.id === scope.data.putData.type)[0].child;
            },
            searchNode: _.debounce(function () {
                const scopeData = scope.data
                scopeData.verticesItem = null;

                if (scopeData.putData.key) {
                    if (scopeData.searching || (scopeData.verticesItem && scopeData.verticesItem.key === scopeData.putData.key)) {
                        return;
                    }
                    scopeData.searching = true;

                    self.injector.get('porpoiseService').getNodeInfo({
                        // type: scopeData.putData.dataType,
                        ids: [scopeData.putData.key]
                    }).then((res) => {
                        if (res.status === 200 && res.data.status === 0) {
                            if (res.data.count > 0) {
                                let verticesData = res.data.data
                                scopeData.showName = true;
                                scopeData.putData.name = verticesData[0].name;
                                scopeData.verticesItem = verticesData[0];
                                scopeData.hasSearchNode = true;
                                scopeData.searchNodeType = verticesData[0].dataLabel
                                scopeData.searchNodeDataType = verticesData[0].typeLabel
                                scopeData.putData.dataType = verticesData[0].dataType
                                scopeData.putData.type = verticesData[0].type
                                scopeData.putData.name = verticesData[0].name
                                // self.injector.get('$timeout')(() => {

                                // },5000)

                            } else {
                                scopeData.putData.name = '';
                                scopeData.verticesItem = null
                                scopeData.hasSearchNode = false;
                                scopeData.searchNodeType = ''
                                scopeData.searchNodeDataType = ''
                                scopeData.putData.dataType = undefined
                                scopeData.putData.type = undefined
                                scopeData.showName = false;
                            }
                        } else {
                            // new toast(self.injector, {
                            //     str: '查无该实体'
                            // }).warn();
                            self.toaster.pop({type:'warning',title:'查无该实体'});

                            scopeData.showName = false;
                            scopeData.verticesItem = null
                            scopeData.hasSearchNode = false;
                            scopeData.searchNodeType = ''
                            scopeData.searchNodeDataType = ''
                            scopeData.putData.dataType = undefined
                            scopeData.putData.type = undefined
                            scopeData.putData.name = '' //修改输入的实体标识之后,重新初始化标识名
                        }
                        scopeData.searching = false;
                    }, error => {
                        scopeData.showName = false;
                        scopeData.searching = false;
                    });
                } else {
                    scopeData.putData.key = null;
                    scopeData.showName = false;
                    scopeData.hasSearchNode = false;
                    scopeData.searchNodeType = ''
                    scopeData.searchNodeDataType = ''
                    scopeData.putData.name = '' //修改输入的实体标识之后,重新初始化标识名
                    // new toast(self.injector, {
                    //     str: '请输入实体标识'
                    // }).warn();
                    self.toaster.pop({type:'warning',title:'请输入实体标识'});

                    return;
                }
            }, 300)
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
