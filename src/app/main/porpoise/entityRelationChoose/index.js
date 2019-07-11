// import toast from '../../../components/modal/toast/toast';
// import moment from 'moment';
export default class entityRelationChooseModal {
    constructor($injector, resolveData, beforeData) {
        // resolveData 第一步的数据项
        // beforeData 第一步+第二步的数据
        this.injector = $injector;
        this.toaster = this.injector.get('toaster');
        this.resolveData = resolveData.result;
        this.firstStepData = resolveData;
        this.$modal = $injector.get('$modal')({
            backdrop: 'static',
            keyboard: false,
            placement: 'center',
            templateUrl: 'app/main/porpoise/entityRelationChoose/template.html',
            onHide: () => {
                this.$modal.destroy();
                this.$modal = null;
            }
        });
        this.$modal.$scope.data = {
            state: 'choose',
            graphName: 'graphName',
            entityList: [],
            recordList: [],
            btnStr: '确定',
            relationList: [],
            onLoading: false,
            depth: -1,
            selectType: 'none',
            addNode: {
                entityChildList: []
            },
            addEdge: {
                relationChildList: []
            },
            relationMap: {
                nodes: [],
                links: []
            },
            options: {
                headerInfo: [],
                entity: [],
                relation: [],
                level: [{id: -1, name: '不推演'}, {id: 1, name: '1'}, {id: 2, name: '2'}, {id: 3, name: '3'}, {id: 4, name: '4'}]
            },
            pager: {
                pageNo: 1,
                pageSize: 5,
                total: 0
            },
            entityRelationTab: 'entity',
            before: false
        };
        if (beforeData && !beforeData.uploadFileData.deleteFile) {
            beforeData.before = false;
            this.$modal.$scope.data = beforeData;
        }
        if (beforeData && beforeData.uploadFileData.deleteFile) {
            this.firstStepData.deleteFile = false;
        }
        if (angular.isArray(resolveData.result) && resolveData.result.length) {
            this.$modal.$scope.data.options.headerInfo = resolveData.result.map(({id, value}) => ({id, name: value}));
        }
        this.$defer = $injector.get('$q').defer();
        this.$promise = this.$defer.promise;
        this.init(resolveData.result);
    }

    init() {
        this.bindFn();
        this.initEntityRelationData();
    }

    initEntityRelationData() {
        const porpoiseService = this.injector.get('porpoiseService');
        const scope = this.$modal.$scope;

        porpoiseService.getRetrieveType().then(result => {
            if (result.data && result.data.status === 0) {
                scope.data.graphNameList = result.data.data;
            }
        });

        porpoiseService.getRelationEntity({type: 'entity'}).then(result => {
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
                    scope.data.options.entity.push(item);
                });
            }
        });

        porpoiseService.getRelationEntity({type: 'relation'}).then(result => {
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
                    scope.data.options.relation.push(item);
                });

                scope.data.options.relation.push({
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


    updateEntityListInfo() {
        const scope = this.$modal.$scope;

        scope.data.entityList.forEach((item, index) => {
            item.id = index;
            item.name = `实体${index + 1}`;
        })
    }

    bindFn() {
        const self = this;
        const data = this.$modal.$scope.data;

        this.$modal.$scope.fn = {
            chooseAddType (type) {
                data.entityRelationTab = type;
            },
            getDataEntityChildList(item) {
                item.dataType = undefined;
                item.entityChildList = data.options.entity.filter(type => type.id === item.type)[0].child;
            },
            getDataRelationChildList(item) {
                item.dataType = undefined;
                item.relationChildList = data.options.relation.filter(type => type.id === item.type)[0].child;
            },
            pushNode() {
                if (!data.addNode.type || !data.addNode.dataType || !data.addNode.keyLine || !data.addNode.nameLine) {
                    self.toaster.warning({
                        title: '请依次添加数据项'
                    });
                    return;
                }
                data.entityList.push(_.assign({}, data.addNode, {
                    id: new Date().getTime() + '' + parseInt(Math.random() * 1000),
                    name: data.options.headerInfo[data.addNode.nameLine].name
                }));

                data.entityList = angular.copy(data.entityList);
                data.addNode = {
                    entityChildList: []
                };
            },
            pushRelation() {
                if (!data.addEdge.type || (data.addEdge.type != '00' && !data.addEdge.dataType) || !data.addEdge.from || !data.addEdge.to) {
                    self.toaster.warning({
                        title: '请依次添加数据项'
                    });
                    return;
                }
                data.relationList.push(_.assign({}, data.addEdge, {
                    id: new Date().getTime() + '' + parseInt(Math.random() * 1000),
                    customDataLabel: ((edge) => {
                        if (edge.isCustomDataLabel) {
                            return data.options.headerInfo[edge.customDataLabelLine].name
                        } else if (edge.type === '00') {
                            return data.options.headerInfo[edge.dataLabel].name
                        } else if (edge.type !== '00') {
                            return edge.relationChildList.filter(type => type.id === edge.dataType)[0].name
                        }
                    })(data.addEdge),
                    isArrow: '1'
                }));

                data.relationList = angular.copy(data.relationList);

                data.addEdge = {
                    relationChildList: []
                };
            },
            modifyNode() {
                const list = data.entityList;
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === data.addNode.id) {
                        _.assign(list[i], data.addNode, {
                            name: data.options.headerInfo[data.addNode.nameLine].name
                        });
                    }
                }

                data.entityList = angular.copy(data.entityList);
            },
            modifyRelation() {
                const list = data.relationList;
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === data.addEdge.id) {
                        _.assign(list[i], data.addEdge, {
                            customDataLabel: ((edge) => {
                                if (edge.isCustomDataLabel) {
                                    return data.options.headerInfo[edge.customDataLabelLine].name
                                } else if (edge.type === '00') {
                                    return data.options.headerInfo[edge.dataLabel].name
                                } else if (edge.type !== '00') {
                                    return edge.relationChildList.filter(type => type.id === edge.dataType)[0].name
                                }
                            })(data.addEdge)
                        });
                    }
                }

                data.relationList = angular.copy(data.relationList);
            },
            nodeChoose(node) {
                data.entityRelationTab = 'entity';
                const $timeout = self.injector.get('$timeout');
                $timeout(() => {
                    data.selectType = 'node';
                    data.addNode = _.assign({}, node);
                });
            },
            deleteElement(list, item) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === item.id) {
                        list.splice(i, 1);
                    }
                }
                data.relationList = angular.copy(data.relationList);
                data.entityList = angular.copy(data.entityList);
                this.unselectAll();
            },
            relationChoose(edge) {
                data.entityRelationTab = 'relation';
                const $timeout = self.injector.get('$timeout');
                $timeout(() => {
                    data.selectType = 'edge';
                    data.addEdge = _.assign({}, edge);
                });
            },
            unselectAll() {
                const $timeout = self.injector.get('$timeout');
                $timeout(() => {
                    data.selectType = 'none';
                    data.addNode = {
                        entityChildList: []
                    };
                    data.addEdge = {
                        relationChildList: []
                    };
                });
            },
            close: function (data) {
                self.close(data);
            },
            dismiss: function () {
                self.close();
            },
            deleteItem(index, list) {
                list.splice(index, 1);
            },
            changePage() {
                const porpoiseService = self.injector.get('porpoiseService');
                const data = this.$modal.$scope.data;
                const {pageNo, pageSize} = data.pager;

                const params = {
                    pageNo,
                    pageSize,
                    type: '02',
                    graphName: data.graphName
                };

                porpoiseService.getImportRecordList(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        data.pager.total = result.data.data.total;
                        data.recordList = result.data.data.data;
                    }
                }, function (error) {
                    //
                });
            },
            viewComponent(item) {
                const porpoiseService = self.injector.get('porpoiseService');
                const params = {
                    id: item.id
                };

                porpoiseService.getGraphComponent(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        self.close(result.data);
                    }
                }, function (error) {
                    //
                });
            },
            before: function () {
                data.before = true;
                data.uploadFileData = self.firstStepData; //第一步保留的所有数据项
                self.close(data);
            },
            showChoose: function () {
                data.btnStr = '确定';
                data.state = 'choose';
            },
            sure: function () {
                const porpoiseService = self.injector.get('porpoiseService');
                const scope = self.$modal.$scope;

                scope.data.onLoading = true;

                const getIndex = (list, item) => {
                    let index = 0;

                    for (let i = 0; i < list.length; i++) {
                        if (list[i].id === item.id) {
                            index = i;
                            break;
                        }
                    }

                    return index;
                };



                const params = {
                    edgeCollections: (scope.data.deduce_graphName && scope.data.deduce_graphName.length > 0) ? ([...scope.data.deduce_graphName].join(',')) : ('test_graph'),
                    entityList: scope.data.entityList.map(item => ({
                        type: item.type,
                        dataType: item.dataType,
                        key: item.keyLine + '',
                        name: item.nameLine + ''
                    })),
                    relationList: scope.data.relationList.map(item => {
                        const relation = {
                            type: item.type,
                            dataType: item.dataType,
                            from: getIndex(scope.data.entityList, {id: item.from}) + '',
                            to: getIndex(scope.data.entityList, {id: item.to}) + ''
                        };

                        if (item.type === '00') {
                            relation.dataType = '0000';
                            relation.typeLabel = '自定义关系';
                            relation.dataLabel = item.dataLabel;
                        } else {
                            if (item.isCustomDataLabel) {
                                relation.customDataLabel = item.customDataLabelLine;
                            }
                        }

                        return relation;
                    })
                };

                if (data.depth > 0) {
                    params.depth = data.depth;
                }

                scope.data.btnStr = '正在分析, 请稍后';

                porpoiseService.createGraph(params).then(result => {
                    if (result.status === 200 && result.data.status === 0) {
                        data.state = 'components';
                        data.recordList = result.data.data.data;
                        data.graphName = result.data.data.graphName;
                        data.pager.total = result.data.data.total;
                    } else {
                        self.toaster.warning({
                            title: result.data.msg
                        });
                        scope.data.btnStr = '确定';
                    }
                    scope.data.onLoading = false;
                }, function (error) {
                    self.toaster.warning({
                        title: '解析失败，请稍后再试'
                    });
                    scope.data.btnStr = '确定';
                });
            }
        }
    }

    destroy() {
        this.$modal.hide();
    }

}
