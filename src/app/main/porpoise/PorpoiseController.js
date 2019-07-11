import judgeModal from './judge/judge';
import addNodeModal from './addNode/modal';
// import addEdgeModal from './addEdge/modal';
import addToMapModal from './addToMap/modal';
import seniorExpandModal from './seniorExpand/modal';
import combineExpandModal from './combineExpand/modal';
import directionalModal from './directional/modal';
import importModal from './import/modal'
import entityImportModal from './entityImport';
import historyImportModal from './historyImport';
import entityRelationChooseModal from './entityRelationChoose';
import mergeGraphModal from './mergeGraph';
import cytoscape from '../../lib/cytoscape/cytoscape';
import cyGradation from '../../lib/cytoscape/cytoscape-gradation';
import cyFlowDirection from '../../lib/cytoscape/cytoscape-flow-direction';
import cytoCoseBilkent from '../../lib/cytoscape/cytoscape-cose-bilkent';
import cyQtip from '../../lib/cytoscape/cytoscape-qtip';
import screenfull from 'screenfull';
import moment from 'moment';
import ClipboardJS from 'clipboard';

// import cssText from "./gis/gismapstyle";
// import GisMap from './gis/gismap';
// import GIS_CFG from "./gis/config";

// import Force3d from './force3d/force3d';

cyGradation(cytoscape);
cyFlowDirection(cytoscape);
cyQtip(cytoscape);
cytoscape.use(cytoCoseBilkent);

export class PorpoiseController {
    constructor($injector, $scope, $location) {
        'ngInject';
        this.inject = $injector;
        this.toaster = this.inject.get('toaster');
        this.chooseTag = 'retion_d3';
        this.showFooter = false;
        this.init();
        if(localStorage.getItem("isToGis") == 'true'){
            this.toggleMap(null, 'map');
        }
        this.$scope = $scope;
        this.$location = $location;
        this.$state = this.inject.get('$state');
        this.currentShowTab = 'por';
        this.tempTrees = {};
        this.seniorExpandTrees = {};
        this.showGeneralize = false;
        this.showSearch = false;
        this.relationHasNode = false;
        this.graphStatisticsAllEdges = [];
        this.showBodyRight = true;
        this.isFullscreen = false;
        this.clipStr = null;
        this.hasNodeSelected = false;
        this.hasNodeConnected = false;
        this.hasEdgeSelected = false;
        this.hasMultiEdgeSelected = false;
        this.showNavigator = false;
        this.searchWord = '';
        this.currentNodeDetailKey = '';
        this.chosenNodesIds = [];
        this.disabledNodes = {};
        this.mapOpenedOnce = false;
        this.mapData = {
            minDate: null,
            maxDate: null
        };
        this.gisParams = {
                "entity": {
                    "person": [],
                    "phone": [],
                    "company": [],
                    "internetcafe": [],
                    "vehicle": []
                },
                "dim": "province"
            },
        this.selectedEdge = '';
        this.dropdownShow = false;
        this.isPlayingLine = false;
        this.gisKeysList = {}
        this.selectedNodesNum = this.getChosenNodes.bind(this).length >= 2;
        this.initNavigatorThrottle = _.throttle(this.initNavigator.bind(this), 300);
        this.searchNodeDebounce = _.debounce(this.searchNode.bind(this), 500);
        this.getMapNodeTreeDebounce = _.debounce(this.getMapnodeTree.bind(this), 1000);
        this.statisticsDebounce = _.debounce(this.statistics.bind(this), 500);
        this.buttonStatus = {
            add: false,
            export: false,
            import: false
        }
        this.showPersonGraphTab = 1;
        this.statisticsActiveEdges = [];
        this.checkStatus = {
            normal: false,
            web: false,
            tree: false,
            flow: false,
            circle: false
        }
        this.bbox = document.getElementById("graph-full-screen-node").getBoundingClientRect();
        this.clientId = (function guid() {
            function S4() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        })()
    }

    /**
     * @description 页面初始化,点击空白区域关闭右键浮层会在这初始化
     *
     * @memberof PorpoiseController
     */
    init() {
        localStorage.setItem("canLeavePorpoise", "false")
        var $this = this
        const root = this.inject.get('$rootScope');
        const cache = this.inject.get('cache');
        // config信息改为从用户信息中获取
        this.config = cache.getLoginDataCache()['config']
        const $location = this.inject.get('$location');
        const porpoiseService = this.inject.get('porpoiseService');
        const Q = this.inject.get('$q');
        const titleList = cache.getBdpDataCache();
        root.urlData.chooseMenu = 'relation';

        this.permission = {
            menu: {
                mergeGraph: false
            }
        };
        this.gisMap = null;
        this.selectData = {};
        this.selectAllData = {}; // 保存全国的活动数据,半径检索功能

        
        Q.all([
            porpoiseService.initPorpoise(),
        ]).then(() => {
            const $state = this.inject.get('$state');
            let paramsId = $state.params.id
            if (paramsId.indexOf('tmpfile') > -1) {
                paramsId = this.transformId(paramsId)
            }
            const urlId = decodeURIComponent(paramsId)
            this.initRelation().then(() => {
                if ($state.params.type !== "snapshot" && $state.params.type !== "fromTextmining") {
                    angular.element("#porpoiseAuto").click() //初始化之后如果不是快照,自动调整一次图谱的位置和大小
                    setTimeout(() => {
                        if ($state.params.type == 'normal' && paramsId == 'batch') {
                            this.getDirectRelation()
                            setTimeout(() => {
                                this.$cy.nodes().addClass("selected").select(); //异步,因为getDirectRelation方法里面是then
                            }, 500);
                        }
                    }, 500);
                    const selectedNodes = this.$cy.nodes().filter(node => {
                        const item = node.data();
                        return (item.key == urlId.split('/')[1]);
                    });
                    if (selectedNodes.length > 0) {
                        selectedNodes.addClass("selected").select()
                    }
                } else if ($state.params.type == "fromTextmining") {
                    const data = {
                        data: {
                            data: JSON.parse(localStorage.getItem("fromTextmining"))
                        }
                    }
                    this.set_por_data(data)
                }
                this.$cy.center(); //如果是快照,则不重置节点的相对位置,只让图析实例在容器中居中
                if (this.showFooter) {
                    this.switchNavigator(true) //初始化右下角导航
                }
                this.$cy.container().focus();
                // this.toggleMap(null, 'map');
            });
            setTimeout(() => {
                this.$cy && this.$cy.resize();//kg715
            }, 2000);
            this.initChromeMenu();
            root.userInfoDefer.promise.then(result => {
                const user = cache.getLoginDataCache();
                const permission = user.permissionName.filter(permission => {
                    return /^porpoise:/.test(permission);
                });

                permission.forEach(p => {
                    const value = p.split(':');

                    this.permission[value[1]][value[2]] = true;
                });

            });

            if ($location.$$search.bdpGo) {
                new entityRelationChooseModal(this.inject, titleList).$promise.then(r => {
                    if (r) {
                        this.pushUndo({
                            type: 'net',
                            graph: this.getGraphData()
                        });
                        this.set_por_data(r);
                    }
                });
            }
            $(document).on('click', function (event) {
                const className = event.target.className
                if (className !== 'no-menu-close' && className !== 'menu-con-main' && className !== 'item' && className !== 'p-icon' && className !== 'p-icon-h' && className !== 'menu-side-wrap-select') {
                    $this.closeContextMenu()
                }
                if (className.indexOf('dropdown-show') > -1 || className.indexOf('ng-not-empty') > -1 || className.indexOf('search-box') > -1 || className.indexOf('pui-search-icon') > -1) {
                    $this.dropdownShow = true
                } else {
                    $this.dropdownShow = false
                }
                if (!$this.$scope.$$phase) {
                    $this.$scope.$digest();
                }
            })
        });
        
    }
    /**
     * @description 转换id
     *
     * @memberof PorpoiseController
     */
    transformId(id) {
        return id.split('&')[0]
    }
    /**
     * @description 初始化力学导向图
     *
     * @memberof PorpoiseController
     */
    initRelation() {
        const porpoiseService = this.inject.get('porpoiseService');
        const $state = this.inject.get('$state');
        const id = $state.params.id;
        const graphName = $state.params.graphName
        return new Promise((resolve, reject) => {
            this.operateStack = {
                stackLength: 5,
                undo: [],
                redo: []
            };

            this.porData = {
                porpoiseTitle: '新建图析',
                nodeStatistics: false,
                componentsCount: 1,
                fullScreenShowRight: true,
                trailGraphData: {},
                searchWord: '',
                zoomShowAll: true, //缩放全部显示
                searchNodeList: [],
                nodeDetail: [],
                menu: {
                    showSelect: false,
                    showLayout: false
                },
                navigator: {
                    isShow: false, //是否展示
                    show: false, //控制dom
                    width: 3200, //比例 高 / 宽： 0.6875
                    height: 2200,
                    lineWidth: 15,
                    initPan: {
                        x: 0,
                        y: 0
                    },
                    initOffset: {
                        x: 0,
                        y: 0
                    },
                    strokeStyle: '#5182FF',
                    fillStyle: 'rgba(81, 130, 228, 0.1)',
                    rect: {
                        width: 0,
                        height: 0,
                        x: 0,
                        y: 0
                    }
                },
                comparison: [{
                        value: '=',
                        name: '等于'
                    },
                    {
                        value: '<',
                        name: '小于'
                    },
                    {
                        value: '>',
                        name: '大于'
                    },
                    {
                        value: '<=',
                        name: '小于等于'
                    },
                    {
                        value: '>=',
                        name: '大于等于'
                    }
                ],
                defaultFilter: {
                    time: {
                        compare: '>',
                        number: '0'
                    }
                },
                edgeTree: {},
                nodeTree: {},
                cnodeTree: {},
                d3Config: {},
                viewConfig: {
                    showSearch: 'normal'
                },
                d3Data: {
                    showSameEdgeLinkData: true,
                    nodes: []
                },
                mapDataConfig: {
                    showDetail: 'count',
                    currentSelectNode: '',
                    currentSelectEvents: [],
                    eventTypeMap: {
                        flight: {
                            zh: '航班事件',
                            startTimeTitle: '出行日期',
                            endTimeTitle: '到达日期',
                            mainInfoTitle: '航班'
                        },
                        train: {
                            zh: '火车出行',
                            startTimeTitle: '出行日期',
                            endTimeTitle: '到达日期',
                            mainInfoTitle: '车次'
                        }
                    }
                }
            };
            this.porData.defaultFilterJSON = JSON.stringify(this.porData.defaultFilter);

            this.porData.d3Data.reqData = {
                showDetail: 'count',
                detailTypeMap: porpoiseService.getEventMap()
            };
            if (id !== 'initial' && id !== 'batch' && id !== 'fromTextmining') { //单个实体id处理,跳转到图谱的处理
                const params = {
                    start: 0,
                    id: decodeURIComponent(id).split(';'),
                    depth: 1,
                    title: 1,
                    type: '',
                    graphName:graphName
                };
                if (id.indexOf('tmpfile') > -1) {
                    params.type = 'tmpfile'
                    params.id = decodeURIComponent(this.transformId(id)).split(';')
                }
                this.init_d3_data(params, 'init').then(() => {
                    resolve();
                });

            } else if (id == 'batch') {
                //batch根据多个实体标识批量添加实体的逻辑
                this.init_graph({
                    vertices: [],
                    edges: []
                }).then(() => {
                    resolve();
                });
                const batchIds = localStorage.getItem("batchIds").split(',')
                if (batchIds) {
                    var addedLength = 0
                    this.inject.get('porpoiseService').getNodeInfo({
                        "ids": batchIds
                    }).then((res) => {
                        if (res.status == 200 && res.data.status != '1000') {
                            let pastedNodes = res.data.data
                            if (pastedNodes.length == 0) {
                                this.toaster.warning({
                                    title: '查无该实体,请手动添加'
                                });
                            } else {
                                pastedNodes.map((res) => {
                                    if (res) {
                                        let newNode = res;
                                        newNode.key = res.key || this.inject.get('util').idMaker();
                                        newNode.id = res.id || `add/${newNode.key}`;
                                        if (this.$cy.nodes().filter(node => node.id() === res.id).empty()) {
                                            this.pushUndo({
                                                type: 'net',
                                                graph: this.getGraphData()
                                            });
                                            addedLength++
                                            this.set_por_data({
                                                data: {
                                                    data: {
                                                        vertices: [newNode],
                                                        edges: []
                                                    }
                                                }
                                            });
                                        }
                                    }
                                })
                                if (addedLength == 0) {
                                    this.toaster.success({
                                        title: '图析上已存在该实体'
                                    });

                                } else {
                                    this.toaster.success({
                                        title: '添加成功' + addedLength + '个'
                                    });

                                }

                            }

                        } else {
                            this.toaster.warning({
                                title: res.data.msg || '系统内部错误请稍后再试'
                            });

                        }
                    })
                    resolve();
                }

            } else if (id == "fromTextmining") {
                const $rootScope = this.inject.get('$rootScope');
                if ($rootScope.openTemplateFile) {
                    $rootScope.openTemplateFile = false;
                    const file = JSON.parse(localStorage.getItem('fromTextmining'));
                    this.init_graph(file.data).then(() => {
                        resolve();
                    });
                } else {
                    this.init_graph({
                        vertices: [],
                        edges: []
                    }).then(() => {
                        resolve();
                    });
                }
            } else {
                this.init_graph({
                    vertices: [],
                    edges: []
                }).then(() => {
                    resolve();
                });
            }
        });
    }
    setCurrentitem(item) {
        const $state = this.inject.get('$state');
        $state.params = {
            type: "snapshot",
            id: encodeURIComponent(item.id)
        }
        let data = {
            vertices: [],
            edges: []
        };
        let nodes = this.$cy.nodes();
        let edges = this.$cy.edges();
        [].forEach.call(nodes, node => {
            if (!node.hasClass('hidden')) {
                data.vertices.push(_.assign({}, node.data(), {
                    x: node.position().x,
                    y: node.position().y,
                    isNodeSelected: +node.selected()
                }));
            }
        });
        [].forEach.call(edges, edge => {
            if (!edge.hasClass('hidden')) {
                data.edges.push(edge.data());
            }
        });
        this.currentItem = item.id
    }
    updateNodesZoomingVisibility() {
        const nodes = this.$cy.nodes()
        const maxDegree = nodes.maxDegree();
        const minDegree = nodes.minDegree();
        const nowZoom = this.$cy.zoom();

        if (this.porData.zoomShowAll) {
            nodes.removeClass('zoom-hidden');
        } else {
            nodes.forEach(node => {
                if (!node.hasClass('hidden')) {
                    if (nowZoom < 1) {
                        if ((1 - (node.degree() - minDegree) / (maxDegree - minDegree === 0 ? 1 : maxDegree - minDegree)) * 0.7 < nowZoom || node.degree() === maxDegree) {
                            node.removeClass('zoom-hidden');
                        } else {
                            node.addClass('zoom-hidden');
                        }
                    } else {
                        node.removeClass('zoom-hidden');
                    }
                }
            });
        }
    }

    menuSelect(type) {
        const cxtNode = this.$cy.nodes(':selected');
        this.$cy.nodes().unselect().removeClass("selected");
        // function hasArrow(edge) {
        //     return edge.data('isArrow') == 1 || edge.data('dataType') === '0000';
        // }
        let oneStepNode = cxtNode.connectedEdges().connectedNodes().difference(cxtNode)
        switch (type) {
            case 'oneStep':
                var nodes = oneStepNode
                if (nodes.empty()) {
                    this.toaster.warning({
                        title: res.data.msg || '该节点没有一步节点'
                    });

                } else {
                    nodes.addClass("selected").select();
                    this.toaster.success({
                        title: '选择成功'
                    });

                }
                break;
            case 'twoStep':
                nodes = cxtNode.connectedEdges().connectedNodes().connectedEdges().connectedNodes().difference(cxtNode).difference(oneStepNode)
                if (nodes.empty()) {
                    this.toaster.warning({
                        title: '该节点没有二步节点'
                    });

                } else {
                    nodes.addClass("selected").select();
                    this.toaster.success({
                        title: '选择成功'
                    });

                }
                break;
            case 'allStep':
                nodes = cxtNode.connectedEdges().connectedNodes().connectedEdges().connectedNodes().difference(cxtNode)
                if (nodes.empty()) {
                    this.toaster.warning({
                        title: '该节点没有全步节点'
                    });

                } else {
                    nodes.addClass("selected").select();
                    this.toaster.success({
                        title: '选择成功'
                    });

                }
                break;
        }

        this.porData.menu.showSelect = false;
        this.porData.menu.showCollspanSelect = false;
        this.porData.menu.showRegainSelect = false;
        this.porData.menu.showConnectSelect = false;
        this.closeContextMenu();
    }

    menuLayout(type) {
        switch (type) {
            case 'auto':
                break;
            case 'grid':
                break;
            case 'gradation':
                break;
            case 'circle':
                break;
        }
    }

    showExpendType() {
        if (!this.selectedNodesNum) {
            let porpoiseService = this.inject.get('porpoiseService');
            if (!ids) {
                var ids = this.$cy.nodes(':selected').map(node => node.data().id)
            } else {
                var ids = ids
            }
            porpoiseService.getRelatedRoot({
                key: ids[0],
                type: 1
            }).then((res) => {
                this.relatedRoot = res.data.result
                this.customRootRelationType = _.map(this.relatedRoot, 'mappedRuleKeyWord')
            })
            this.porData.menu.showCollspanSelect = !this.porData.menu.showCollspanSelect;
            this.porData.menu.showSelect = false
            this.porData.menu.showConnectSelect = false
            this.porData.menu.showRegainSelect = false
        } else {
            this.toaster.warning({
                title: '暂不支持多个实体进行条件扩展'
            });
        }
    }
    showRegainType() {
        if (!this.selectedNodesNum) {
            let porpoiseService = this.inject.get('porpoiseService');
            if (!ids) {
                var ids = this.$cy.nodes(':selected').map(node => node.data().id)
            } else {
                var ids = ids
            }
            porpoiseService.getRelatedRoot({
                key: ids[0],
                type: 2
            }).then((res) => {
                this.regainRoot = res.data.result
            })
            this.porData.menu.showRegainSelect = !this.porData.menu.showRegainSelect;
            this.porData.menu.showConnectSelect = false;
            this.porData.menu.showSelect = false
            this.porData.menu.showCollspanSelect = false
        } else {
            this.toaster.warning({
                title: '暂不支持多个实体进行关系收回'
            });
        }
    }
    showConnectType() {
        this.porData.menu.showConnectSelect = !this.porData.menu.showConnectSelect;
        this.porData.menu.showSelect = false
        this.porData.menu.showCollspanSelect = false
        this.porData.menu.showRegainSelect = false
    }

    fullScreen(id) {
        if (screenfull.enabled) {
            screenfull.toggle(document.getElementById(id));
        }
        if(screenfull.enabled){
            this.showFooter = false;
        }else{
            this.showFooter = true;
        }
    }

    fullScreenToggleRight() {
        this.porData.fullScreenShowRight = !this.porData.fullScreenShowRight;
        this.inject.get('$timeout')(() => {
            this.$cy.resize();
        }, 800)
    }
    initGraphEvent() {
        const $timeout = this.inject.get('$timeout');
        this.$cy.on('zoom', (event) => {
            // event.cy.nodes().forEach((node) => {
            //     node.style('background-image', `url(${this._getNodeImage(node.data(), event.cy.zoom())})`);
            // });//缩放切换人员真实照片影响性能,暂时关闭 @2018-10-22
            event.stopPropagation()
            this.updateNodesZoomingVisibility();
            this.updateZoomTrack();
        });
        this.$cy.on('cxttap', 'node', (event) => {
            event.stopPropagation()
            this.porpoiseItemRightClick(event.originalEvent, event.target.data());
        });

        this.$cy.on('click', 'node', (event) => { //点击节点
            event.stopPropagation()
        });

        this.$cy.on('mouseover', 'node', () => {
            graphContent.addClass('cursor-pointer')
            graphContent.removeClass('cursor-move')
        });
        this.$cy.on('mouseout', 'node', () => {
            graphContent.removeClass('cursor-pointer')
            graphContent.addClass('cursor-move')
        });
        this.$cy.on('mouseover', 'edge', (event) => {
            graphContent.addClass('cursor-pointer')
            graphContent.removeClass('cursor-move')
        });
        this.$cy.on('mouseout', 'edge', (event) => {
            graphContent.removeClass('cursor-pointer')
            graphContent.addClass('cursor-move')
        });
        this.$cy.on('click', 'edge', (event) => {
            event.stopPropagation()
            const eventTarget = event.target
            this.hasEdgeSelected = true;
            this.porData.nodeStatistics = false;
            this.hasNodeConnected = true;
            const cy = this.$cy
            const eles = cy.elements()
            this.hasNodeSelected = false;
            cy.nodes().unselect();
            const selectedEdges = cy.edges(':selected')
            if (!event.originalEvent.ctrlKey && !event.originalEvent.metaKey) {
                const connectedNodes = eventTarget.connectedNodes();
                const nodesData = connectedNodes.add(eventTarget);
                eles.difference(nodesData).addClass('opacity').removeClass('selected').unselect();
                this.porData.d3Data.reqData.showDetail = 'detail';
                // this.porData.d3Data.showSameEdgeLinkData = false; KG-100
                // this.porpoiseLineClick(event, eventTarget.data());
            } else {
                cy.elements('.opacity').removeClass('opacity');
                this.porData.d3Data.reqData.showDetail = 'count';
                if (eventTarget.selected()) {
                    eventTarget.connectedNodes().addClass("opacity").addClass("unselected").unselect();
                    eventTarget.addClass("opacity").addClass("unselected")
                    let edgeData = selectedEdges.difference(eventTarget)
                    let eleData = edgeData.connectedNodes().add(edgeData.connectedNodes()).add(edgeData)
                    eleData.removeClass('opacity')
                    eles.difference(eleData).addClass('opacity');
                } else {
                    eles.difference(eventTarget).difference(selectedEdges).difference(selectedEdges.connectedNodes()).addClass('opacity');
                    eventTarget.removeClass("opacity").removeClass("unselected").addClass("selected")
                    eventTarget.connectedNodes().removeClass("opacity")
                }
            }
            this.inject.get('$timeout')(() => {
                const selectedEdges = this.$cy.edges(':selected')
                if (selectedEdges.length > 1) {
                    this.hasMultiEdgeSelected = true
                    this.cstatistics(selectedEdges.connectedNodes())
                    this.estatistics(selectedEdges,'selected')
                } else if (selectedEdges.length == 1) {
                    this.hasMultiEdgeSelected = false
                    this.porpoiseLineClick(event, selectedEdges.data())
                } else {
                    this.hasMultiEdgeSelected = false
                    this.hasEdgeSelected = false
                }
                
                if(this.showFooter){
                    this.parseEdgesForRealtion(selectedEdges,false,true)
                }
            })
        });

        this.$cy.on('click', (event) => {
            event.stopPropagation()
            if (event.target == this.$cy && !this.hasNodeSelected) {
                if(this.showFooter){
                    this.parseEdgesForRealtion(this.$cy.edges())
                }
                this.resetChoose(true)
            }
            if (!this.$scope.$$phase) {
                this.$scope.$digest();
            }
        });

        this.$cy.container().addEventListener('contextmenu', (event) => {
            if (event.target == this.$cy) {
                this.$cy.container().focus();
                this.statistics(this.$cy.elements());
                this.$cy.nodes().removeClass('search-node');
                this.porData.d3Data.reqData.showDetail = 'count' //fix:没有实体被选中则跳到统计tab
            }
        });

        this.$cy.container().addEventListener('keydown', event => {
            this.inject.get('$timeout')(() => {
                const $this = this
                const code = event.which || event.keyCode;
                if (code === 46) {
                    if (event.ctrlKey || event.metaKey) {
                        this.inverseDelete(event);
                    } else {
                        this.deleteItem(event);
                    }
                } else if (code === 91) {
                    graphContent.removeClass('cursor-pointer').removeClass('cursor-move').addClass('cursor-cross')
                } else if (code === 67) {

                    if (event.ctrlKey || event.metaKey) {
                        let copyNodes = []
                        const selectedNodes = this.$cy.nodes(':selected')
                        selectedNodes
                            .map(node => {
                                copyNodes.push(node.data())
                            });
                        this.clipStr = JSON.stringify(copyNodes)

                        if (copyNodes.length > 0) {
                            const clipboard = new ClipboardJS('.clip-btn', {
                                text: function (trigger) {
                                    return trigger.nextElementSibling.value;
                                }
                            });
                            clipboard.on('success', function (e) {
                                $this.toaster.success({
                                    title: '复制成功'
                                });
                                e.clearSelection(); //这个能实现点选一次 复制一次 不需要重新reset
                                clipboard.destroy();
                            });

                            clipboard.on('error', function (e) {
                                $this.toaster.warning({
                                    title: '复制失败'
                                });
                                e.clearSelection();
                                clipboard.destroy();
                            });
                            angular.element('.clip-btn').click()
                        } else {
                            this.toaster.warning({
                                title: '请点击选择要复制的实体,按住Ctrl或command键可多选和框选'
                            });
                        }
                    }
                }
                if (!$this.$scope.$$phase) {
                    $this.$scope.$digest();
                }
            })
        });
        this.$cy.container().addEventListener('keyup', () => {
            graphContent.removeClass('cursor-cross').addClass('cursor-move')
        });

        document.addEventListener('paste', (e) => {
            if (this.$cy) {
                if (document.activeElement.className.indexOf('porpoise-svg') == -1) {
                    return
                }
                const clipboardData = window.clipboardData || e.clipboardData;
                let pastedNodes = null
                if (clipboardData.getData('Text').indexOf('dataType') > -1) {
                    var addedLength = 0
                    try {
                        pastedNodes = JSON.parse(clipboardData.getData('Text'));
                    } catch (error) {
                        pastedNodes = clipboardData.getData('Text');
                    }
                    pastedNodes.map((res) => {
                        if (res) {
                            let newNode = res;
                            newNode.key = res.key || this.inject.get('util').idMaker();
                            newNode.id = res.id || `add/${newNode.key}`;
                            if (this.$cy.nodes().filter(node => node.id() === res.id).empty()) {
                                this.pushUndo({
                                    type: 'net',
                                    graph: this.getGraphData()
                                });
                                addedLength++
                                this.set_por_data({
                                    data: {
                                        data: {
                                            vertices: [newNode],
                                            edges: []
                                        }
                                    }
                                });

                            }
                        }
                    })
                    if (addedLength == 0) {
                        this.toaster.warning({
                            title: '图析上已存在该实体'
                        });

                    } else {
                        this.toaster.success({
                            title: '添加成功' + addedLength + '个'
                        });

                    }

                } else { //根据多个实体标识批量添加实体的逻辑
                    var addedLength = 0
                    pastedNodes = clipboardData.getData('Text')
                    pastedNodes = pastedNodes.trim().replace(/\s+/g, ",").replace('\n', ",");
                    this.inject.get('porpoiseService').getNodeInfo({
                        "ids": pastedNodes.split(',')
                    }).then((res) => {
                        if (res.status == 200) {
                            pastedNodes = res.data.data
                            if (pastedNodes.length == 0) {
                                this.toaster.warning({
                                    title: '查无该实体,请手动添加'
                                });

                            } else {
                                pastedNodes.map((res) => {
                                    if (res) {
                                        let newNode = res;
                                        newNode.key = res.key || this.inject.get('util').idMaker();
                                        newNode.id = res.id || `add/${newNode.key}`;
                                        if (this.$cy.nodes().filter(node => node.id() === res.id).empty()) {
                                            addedLength++
                                            this.set_por_data({
                                                data: {
                                                    data: {
                                                        vertices: [newNode],
                                                        edges: []
                                                    }
                                                }
                                            });

                                        }
                                    }
                                })
                                if (addedLength == 0) {
                                    this.toaster.success({
                                        title: '图析上已存在该实体'
                                    });

                                } else {
                                    this.pushUndo({
                                        type: 'net',
                                        graph: this.getGraphData()
                                    });
                                    this.toaster.success({
                                        title: '添加成功' + addedLength + '个'
                                    });

                                }
                            }

                        } else {
                            this.toaster.warning({
                                title: res.statusText || '系统内部错误请稍后再试'
                            });

                        }
                    })
                }
            }

        })
        this.$cy.on('pan', (e) => {
            e.stopPropagation()
            localStorage.setItem("canLeavePorpoise", "false")
            this.closeContextMenu()
            if (this.porData.navigator.show) {
                this.initNavigatorThrottle()
            }
        });

        this.$cy.on('mouseup', 'node', (e) => {
            e.stopPropagation()
            if (this.porData.navigator.show) {
                this.initNavigatorThrottle();
            }
        });
        this.$cy.on('select', 'node', (evt) => { //选择节点
            this.hasNodeSelected = true;
            // this.$cy.nodes().removeClass('search-node');性能优化,少一次全部的遍历
            this.porData.nodeStatistics = true;
            const cy = this.$cy
            const selectedNodes = cy.nodes(':selected')
            const cntdEdges = selectedNodes.connectedEdges()
            const secondNodes = cntdEdges.connectedNodes()
            this.statisticsDebounce(selectedNodes, true);
            this.hasNodeConnected = true;
            this.hasEdgeSelected = false
            this.cstatistics(secondNodes.difference(selectedNodes));
            this.estatistics(cntdEdges,'connected');
            let eleData = cntdEdges.add(secondNodes).add(selectedNodes)
            eleData.removeClass('opacity')
            cy.elements().difference(eleData).addClass('opacity');
            if (this.showFooter) {
                this.inject.get('$timeout')(() => {
                    this.parseEdgesForRealtion(cntdEdges)
                })
            }
            this.getNodeDetail(evt.target.data())

            if (!this.$scope.$$phase) {
                this.$scope.$digest();
            }
        });
        this.$cy.on('unselect', 'node', (evt) => {
            const selectedNodes = this.$cy.nodes(':selected')
            if (selectedNodes.empty()) {
                this.hasNodeSelected = false;
                this.porData.nodeStatistics = false;
                this.statisticsDebounce(this.$cy.elements());
                this.hasNodeConnected = false;
            } else {
                this.porData.nodeStatistics = true;
                this.statisticsDebounce(selectedNodes);
                this.hasNodeConnected = true;
                this.cstatistics(selectedNodes.connectedEdges().connectedNodes().difference(selectedNodes));
                if (this.showFooter) {
                    this.inject.get('$timeout')(() => {
                        this.parseEdgesForRealtion(selectedNodes.connectedEdges())
                    })
                }
            }
            _.remove(this.chosenNodesIds, function (i) {
                return i == evt.target.data().id;
            });
            _.remove(this.porData.nodeDetail, function (n) {
                return n.data.keys == evt.target.data().key;
            });
            if (!this.$scope.$$phase) {
                this.$scope.$digest();
            }
        });

        const cancel = this.inject.get('$rootScope').$on('updateTheme', () => {
            this.$cy.style(this._makeStyleSheet());
        });

        const cancelSave = this.inject.get('$rootScope').$on('saveGraphTemporary', () => {
            this.saveGraph();
        });

        if (screenfull.enabled) {
            screenfull.on('change', (event) => {
                $(event.target).toggleClass('screen-full', screenfull.isFullscreen);
                $('.graph-full-screen-btn').toggleClass('screen-full', screenfull.isFullscreen);
                if (screenfull.isFullscreen) {
                    this.porData.showRightSave = this.porData.fullScreenShowRight;
                    this.porData.fullScreenShowRight = false;
                } else {
                    this.porData.fullScreenShowRight = this.porData.showRightSave;
                }
                this.inject.get('$timeout')(() => {
                    this.$cy.resize();
                }, 800)
                $timeout(() => {
                    this.isFullscreen = !this.isFullscreen;
                }, 10);
            })
        }
        // 获取临时文件存储时间
        let temporaryTime = 0 //分钟
        let timer = null
        this.inject.get('headerService').getTemporaryFileTime().then(result => {
            if (result.data && result.data.status === 0) {
                temporaryTime = Number(result.data.data)
                if (temporaryTime > 0) {
                    // 页面在指定时间内无任何操作则将当前图析文件保存为临时文件
                    let user = angular.copy(localStorage.user);
                    let userId = JSON.parse(user.replace(/%<%/g, '{').replace(/%>%/g, '}')).userId;
                    this.temporaryFileId = "con/" + userId + "" + new Date().getTime()
                    let remainTime = temporaryTime
                    $(document).on('keydown mousemove mousedown', function (e) {
                        remainTime = temporaryTime; // reset
                    });
                    timer = setInterval(() => {
                        remainTime--
                        if (remainTime <= 0) {
                            this.saveGraph(); //保存临时文件
                            remainTime = temporaryTime
                        }
                    }, 60000)
                }
            }
        }, error => {
            //
        });

        this.$scope.$on('$destroy', () => {
            localStorage.setItem('isToGis','false')
            localStorage.setItem('canUpdateGraph','false')
            cancel();
            cancelSave();
            screenfull.off('change');
            clearInterval(timer);
            $(document).off("click")
            $(document).off("paste")
            this.$cy.destroy(); //深坑!!!!!!!这个api没生效,只会在angularjs下有这个问题,所有的图谱实例都不会被销毁!!!!!每点一次图析就会生成一个图析实例!!!!!!
            this.$cy = null //不要动这行代码.
            // cytoscape.removeRegistrationForInstance(this.$cy)  https://github.com/cytoscape/cytoscape.js/issues/663 也不行,没有这个方法了,应该是版本更新掉了
        });

        const trackContent = $('#graph_scale_track');
        const trackWidth = trackContent.width();
        const tracer = trackContent.find('.scale-tracer');
        const track = trackContent.find('.scale-track');
        const minX = 0;
        const maxX = trackWidth - tracer.width();
        const graphContent = $('.body-left');

        trackContent.on('mousedown.scale', event => {
            if ($(event.target).is('.scale-tracer')) {
                const trackContentBox = trackContent.get(0).getBoundingClientRect();

                graphContent.on('mousemove.scale', event => {
                    const moveX = event.clientX - trackContentBox.x;

                    if (moveX >= minX && moveX <= maxX) {
                        tracer.css('left', moveX);
                        track.width(moveX);

                        if (this.$cy) {
                            const scale = (moveX / (maxX - minX)) * (this.$cy.maxZoom() - this.$cy.minZoom()) + this.$cy.minZoom();

                            this.$cy.zoom({
                                level: scale,
                                renderedPosition: {
                                    x: this.$cy.width() / 2,
                                    y: this.$cy.height() / 2
                                }
                            });
                        }
                    }
                });

                graphContent.on('mouseup.scale', event => {
                    // const move = event.clientX - trackContentBox.x;
                    graphContent.off('mousemove.scale');
                    graphContent.off('mouseup.scale');
                });
            }
        });
    }

    getGraphData() {
        const graph = {
            vertices: [],
            edges: []
        };

        if (this.$cy) {
            graph.vertices = this.$cy.nodes().map(node => node.data());
            graph.edges = this.$cy.edges().map(edge => edge.data());
        }
        return graph;
    }

    pushUndo(data, notClear) {
        localStorage.setItem("canLeavePorpoise", "false")
        if (this.operateStack.undo.length >= this.operateStack.stackLength) {
            this.operateStack.undo.shift();
        }
        if (!notClear) {
            const params = {
                clientId:this.clientId,
                operateId:data.operateId || (function guid() {
                    function S4() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                    }
                    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
                })(),
                operateContext:data.operateContext || JSON.stringify(data)
            }
            this.operateStack.undo.push(params);
            this.operateStack.redo = [];
        }
        else{
            this.operateStack.undo.push(data);
        }
    }

    undo() {
        localStorage.setItem("canLeavePorpoise", "false")
        if (!this.operateStack.undo.length) {
            return;
        }
        const data = this.operateStack.undo.pop();
        const params = {
            clientId:this.clientId,
            operateId:(function guid() {
                function S4() {
                   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
            })(),
            operateContext:{
                type:'net',
                graph:this.getGraphData()
            }
        }
        
        this.operateStack.redo.push(params);
        this.init_graph(data.operateContext.graph? data.operateContext.graph : JSON.parse(data.operateContext).graph, 'replace');
        
    }

    pushRedo(data) {
        localStorage.setItem("canLeavePorpoise", "false")
        if (this.operateStack.redo.length >= this.operateStack.stackLength) {
            this.operateStack.redo.shift();
        }
        this.operateStack.redo.push(data);
    }

    redo() {
        if (!this.operateStack.redo.length) {
            return;
        }
        const data = this.operateStack.redo.pop();
        const params = {
            clientId:this.clientId,
            operateId:(function guid() {
                function S4() {
                   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
            })(),
            operateContext:{
                type:'net',
                graph:this.getGraphData()
            }
        }
        this.operateStack.undo.push(params);
        this.init_graph(data.operateContext.graph, 'replace');
    }

    changeStep(flag) {
        this.inject.get('porpoiseService').changeStep(flag).then(result => {
            if (result.data.data) {
                this.init_graph(result.data.data, 'replace');
            }
        });
    }

    updateZoomTrack() {
        const trackContent = $('#graph_scale_track');
        const trackWidth = trackContent.width();
        const tracer = trackContent.find('.scale-tracer');
        const track = trackContent.find('.scale-track');
        const maxX = trackWidth - tracer.width();

        const moveX = (this.$cy.zoom() - this.$cy.minZoom()) / (this.$cy.maxZoom() - this.$cy.minZoom()) * maxX;
        tracer.css('left', moveX);
        track.width(moveX);
    }

    zoomIn() {
        if (this.$cy) {

            this.$cy.zoom({
                level: this.$cy.zoom() - 0.5,
                renderedPosition: {
                    x: this.$cy.width() / 2,
                    y: this.$cy.height() / 2
                }
            });

            this.updateZoomTrack();
        }
    }

    zoomOut() {
        if (this.$cy) {

            this.$cy.zoom({
                level: this.$cy.zoom() + 0.5,
                renderedPosition: {
                    x: this.$cy.width() / 2,
                    y: this.$cy.height() / 2
                }
            });

            this.updateZoomTrack();
        }
    }
    delWord() {
        //this.$cy.nodes().removeClass('search-node');
        this.porData.searchNodeList = [];
        this.porData.searchWord = ''
    }
    statisticsNameClick(searchWord, $event) {
        this.searchWord = searchWord
        this.searchNode(searchWord)

    }

    showCurrentDetail(key) {
        if (key) {
            if (this.currentNodeDetailKey !== key) {
                this.currentNodeDetailKey = key
            } else {
                this.currentNodeDetailKey = ''
            }

        }
    }

    searchNode(searchWord) {
        const nodes = this.$cy.nodes()
        nodes.removeClass('search-node');
        this.dropdownShow = true
        if (this.porData.searchWord.trim().length > 0 || searchWord !== '') { //搜索逻辑
            nodes.filter(node => {
                const item = node.data();
                if(item.isTreauryShow == "1"){
                    return (item.name && item.name.indexOf(this.porData.searchWord.length > 0 ? this.porData.searchWord:searchWord) !== -1) || (item.des && item.des.indexOf(this.porData.searchWord.length > 0 ? this.porData.searchWord:searchWord) !== -1 );
                }
                else{
                    return (item.name && item.name.indexOf(this.porData.searchWord.length > 0 ? this.porData.searchWord:searchWord) !== -1) || (item.key && item.key.indexOf(this.porData.searchWord.length > 0 ? this.porData.searchWord:searchWord) !== -1 );
                }
            }).addClass('search-node');

            if (this.$cy.nodes('.search-node').empty()) {
                this.toaster.warning({
                    title: '未搜索到结果'
                });
                this.porData.searchNodeList = [];
            } else {
                if (this.$cy.nodes('.search-node').size() === 1) {
                    this.$cy.center(this.$cy.nodes('.search-node'));
                    this.porData.searchNodeList = [];
                } else {
                    this.porData.searchNodeList = this.$cy.nodes('.search-node').map(node => node.data());
                }
            }
        } else if (searchWord) { //右侧点击人员姓名选中节点逻辑
            nodes.filter(node => {
                const item = node.data();
                return ((item.key && item.key == searchWord));
            }).addClass('search-node');
            this.$cy.center(this.$cy.nodes('.search-node'));
        } else {
            this.porData.searchNodeList = [];

        }
        if (!this.$scope.$$phase) {
            this.$scope.$digest();
        }
    }
    moveToNode(data) {
        const cy = this.$cy
        const nodes = cy.nodes()
        const ele = nodes.filter(node => node.data().id === data.id);
        nodes.difference(ele).removeClass('search-node');
        ele.addClass('search-node');
        cy.center(ele);
    }

    toggleEdge(edge, needStatistics) {
        if (edge.isParent) {
            edge.showIndeterminate = false;
            angular.forEach(edge.child, function (e) {
                e.show = edge.show;
            });
        } else {
            let hasDiff = false;

            angular.forEach(this.porData.edgeTree[edge.parentType].child, function (e) {
                if (e.show !== edge.show) {
                    hasDiff = true;
                }
            });

            if (hasDiff) {
                this.porData.edgeTree[edge.parentType].showIndeterminate = true;
                this.porData.edgeTree[edge.parentType].show = false;
            } else {
                this.porData.edgeTree[edge.parentType].showIndeterminate = false;
                this.porData.edgeTree[edge.parentType].show = edge.show;
            }
        }
        this.updateFilterEdgesAndNodes(null, needStatistics);
    }

    toggleNode(entityNode, e) {
        if (e) {
            e.stopPropagation();
        }
        if (!entityNode) {
            var selectedNodes = this.$cy.nodes(':selected');
            var node = selectedNodes.data()
            this.toggleMap(null, 'map')
        } else {
            var node = entityNode
        }
        new addToMapModal(this.inject, node, this.tempTrees).$promise.then((tempTrees) => {
            if(tempTrees){
                this.tempTrees = _.cloneDeep(tempTrees)
            }
            if (tempTrees && tempTrees[node.key] && tempTrees[node.key].allSelected || tempTrees && tempTrees[node.key] && tempTrees[node.key].showIndeterminate) {
                node.show = true;
                this.isFromCircleSearch = false
                const $state = this.inject.get('$state');
                let paramsId = $state.params.id
                if (!entityNode && $state.params.type == 'normal' && paramsId == 'batch') {
                    const currentKey = Object.keys(this.tempTrees)[0]
                    selectedNodes.map(node => {
                        node.data().show = true
                        const _key = node.data().key
                        this.tempTrees[_key] = _.cloneDeep(this.tempTrees[currentKey])
                        this.tempTrees[_key].key = _key
                        this.tempTrees[_key].type = node.data().id.split('/')[0].split('_')[0]
                    })
                }
                
            }
            //特殊处理
            else if(this.isFromCircleSearch && this.selectData[node.key] && this.selectData[node.key].data.length > 0 && this.selectData[node.key].visible){
                node.show = true
            }
            else {
                node.show = false
            }
            if (tempTrees && tempTrees[node.key]) {
                const params = {
                    "entity": {
                        "person": [],
                        "phone": [],
                        "company": [],
                        "internetcafe": [],
                        "vehicle": []
                    },
                    "dim": "province"
                }
                setTimeout(() => {
                    this.getGeoData(params)
                }, 100);
            }
            for (let keys in this.gisKeysList) { //添加实体时,清除播放
                if (this.gisKeysList[keys].isInit) {
                    this.clearLine(keys)
                }
            }
            if(!this.gisKeysList[node.key]){
                this.gisKeysList[node.key] = {}
            }
            this.gisKeysList[node.key].show = true;
            this.gisKeysList[node.key].isPlaying = false;
            this.gisKeysList[node.key].showClearBtn = false;
        })
        localStorage.setItem("isToGis", false)
        // this.updateFilterEdgesAndNodes();
    }
    groupByKey(key) {
        const keyData = _.cloneDeep(this.selectAllData[key]);
        let allLabels = [];
        if(keyData && keyData.visible && keyData.data && keyData.data.length) {
            // 筛选与 key 对应的所有 labels
            keyData.data.forEach(d => {
                if (d.labels && d.labels.length) {
                    for(let i of d.labels){
                        if(i.key === key){
                            allLabels.push(i)
                        }
                    }
                }
            });
        }
        return allLabels;
    }
    // 查看人员轨迹详情 
    viewPersonDetail(entityNode) {
        // if (entityNode.show) {
            // 实体选中
            this.porData.mapDataConfig.currentSelectNode = entityNode;
            this.porData.mapDataConfig.currentSelectEvents = this.groupByKey(entityNode.key)
            this.porData.mapDataConfig.showDetail = 'detail';
        // } 
        // else {
        //     this.toaster.warning({
        //         title: '只能查看在地图上打过点的实体详情'
        //     });
        // }
    }
    showDetailFunc() {
        if (this.porData.mapDataConfig.currentSelectNode.show) {
            this.porData.mapDataConfig.showDetail = 'detail';
            this.viewPersonDetail(this.porData.mapDataConfig.currentSelectNode);
        } else {
            this.toaster.warning({
                title: '只能查看在地图上打过点的实体详情'
            });
        }
    }

    getGeoData(params, eventTree, entityTree, isFromCircleSearch) {
        if ((JSON.stringify(this.tempTrees) !== '{}' || JSON.stringify(eventTree)) && JSON.stringify(params) !== '{}' || this.isFromCircleSearch) {
            const self = this
            let tempTrees = (eventTree && eventTree.nodeTree) || self.tempTrees;
            let parseTree = {}
            let nodeKeysList = []
            if (!entityTree) {
                const nodes = self.$cy.nodes()
                nodes.forEach((node) => {
                    if(node.inside()){
                        let key = node.data().key
                        nodeKeysList.push(key)
                    }
                })
            } else if (eventTree && entityTree) {
                const parseTypeMap = {
                    '01': 'person',
                    '02': 'vehicle',
                    '03': 'phone',
                    '04': 'company',
                    // '??':'internetcafe',暂时没有网吧类型
                }
                var type = parseTypeMap[entityTree.type]
                const currentTypeMapNodeTree = self.porData.mapNodeTree[entityTree.type].child //设置右侧树的check状态
                if (isFromCircleSearch) {
                    angular.forEach(currentTypeMapNodeTree, function (x) {
                        angular.forEach(x.child, function (item) {
                            item.show = false
                        })
                    })
                }
                if (type in params.entity) {
                    angular.forEach(entityTree.child, function (e) {
                        angular.forEach(e.child, function (i) {
                            if (i.isChecked) {
                                nodeKeysList.push(i.key)
                                angular.forEach(currentTypeMapNodeTree, function (x) {
                                    angular.forEach(x.child, function (item) {
                                        if (i.key == item.key) {
                                            item.show = true
                                        }
                                    })
                                })
                                parseTree[i.key] = {
                                    nodeTree: eventTree.nodeTree,
                                    key: i.key,
                                    showIndeterminate: true,
                                    type: type,
                                    allSelected: false,
                                }
                            }
                        })
                    })
                }
                tempTrees = parseTree
            }
            var type
            let keyArr = []
            for (let p in tempTrees) {
                let item = tempTrees[p];
                type = item.type;

                if (nodeKeysList.includes(item.key)) {
                    var key = item.key;
                    let typeIds = []
                    angular.forEach(item.nodeTree, (i) => {
                        angular.forEach(i.child, (item) => {
                            if (item.isChecked) {
                                typeIds.push({
                                    "eventId": item.type,
                                    "startTime": self.getdate(i.startTime),
                                    "endTime": self.getdate(i.endTime)
                                })
                            }
                        })
                    });
                    if(params.entity[type].length > 0){
                        if (params.entity[type].length > 0) {
                            for (let i of params.entity[type]) {
                                if (!keyArr.includes(key)) {
                                    keyArr.push(key)
                                    params.entity[type].push({
                                        key: key,
                                        eventIds: typeIds
                                    })
                                } else {
                                    i.eventIds = typeIds
                                }
                            }
                        }
                    }
                    else{
                        keyArr.push(key)
                        params.entity[type].push({
                            key: key,
                            eventIds: typeIds
                        })
                    }
                }
            }
            // self.tempTrees = Object.assign(self.tempTrees,parseTree)
            /// mark
            function arrToString(objValue, othValue) {
                return ((othValue.key == objValue.key))
            }
            params.entity[type] = _.uniqWith(params.entity[type], arrToString);
            this.gisParams = params
            self.inject.get('porpoiseService').getMutilEntityData(
                params
            ).then((res) => {
                var newData = res.data.data
                for (let keys in tempTrees) {
                    if (!isFromCircleSearch) {
                        if (nodeKeysList.includes(keys)) {
                            self.selectData[keys] = {
                                visible: true,
                                data: newData
                            }; //设置gis地图数据
                            self.selectAllData[keys] = { //重新设置需要播放的地图数据
                                visible: true,
                                data: newData
                            };
                        } else {
                            self.selectData[keys] = {
                                visible: false,
                                data: newData
                            }; //设置gis地图数据
                            self.selectAllData[keys] = { //重新设置需要播放的地图数据
                                visible: false,
                                data: newData
                            };
                        }
                    } else {
                        self.selectData = {}
                        self.selectData[keys] = {}
                        self.selectAllData = {}
                        self.selectAllData[keys] = {}
                        if (nodeKeysList.includes(keys)) {
                            self.selectData[keys] = {
                                visible: true,
                                data: newData
                            }; //设置gis地图数据
                            self.selectAllData[keys] = { //重新设置需要播放的地图数据
                                visible: true,
                                data: newData
                            };
                        } else {
                            self.selectData[keys] = {
                                visible: false,
                                data: newData
                            }; //设置gis地图数据
                            self.selectAllData[keys] = { //重新设置需要播放的地图数据
                                visible: false,
                                data: newData
                            };
                        }
                    }

                    let alldata = [];
                    for (let p in self.selectData) {
                        var d = self.selectData[p];
                        if (nodeKeysList.includes(p)) {
                            if (d.visible) {
                                [].push.apply(alldata, d.data);
                            }
                        }
                    }
                    if (self.gisMap) {
                        self.gisMap.layers[0].set(alldata, false);
                    }

                    if (self.mapData.minDate) {
                        self.mapData.minDate = null
                        self.mapData.maxDate = null
                    }
                }
            })
        }
    }

    getdate(timestamp) {
        if(timestamp){
            var now = new Date(timestamp),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();
            return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
        }
        else{
            return ''
        }
    }
    compareNumber(operate, a, b) {
        switch (operate) {
            case '=':
                return a === b;
            case '>':
                return a > b;
            case '<':
                return a < b;
            case '>=':
                return a >= b;
            case '<=':
                return a <= b;
        }
    }

    updateFilterEdgesAndNodes(edge, noStatistics) {
        const hiddenEdgeMap = {};
        var edge = edge || this.porData.edgeTree
        angular.forEach(edge, function (edge) {
            angular.forEach(edge.child, e => {
                hiddenEdgeMap[e.type] = {
                    filter: e.show ? (JSON.stringify(e.filter) === e.filterJSON ? e.filter : null) : null
                };
            });
        });

        this.$cy.elements().removeClass('hidden');
        const edges = this.$cy.edges()
        edges.filter(edge => {
            const item = edge.data();
            let hide = false;
            let hiddenInfo;
            hiddenInfo = hiddenEdgeMap[item.dataType];

            if (hiddenInfo) {
                const config = hiddenInfo;

                if (!config.filter) {
                    hide = true;
                } else {
                    for (let key in config.filter) {
                        if (config.filter.hasOwnProperty(key)) {
                            switch (key) {
                                case 'time':
                                    let times = item.times || 1;
                                    if (times != undefined) {
                                        hide = !this.compareNumber(config.filter[key].compare, Number(times), Number(config.filter[key].number));
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }

            return hide;
        }).addClass('hidden');
        // this.$cy.nodes().filter(node => {
        //     return !node.connectedEdges().empty() && node.connectedEdges().filter(edge => !edge.hasClass('hidden')).empty();
        // }).addClass('hidden');
        // this.resetChoose(noStatistics)
        if(this.showFooter){
            this.parseEdgesForRealtion(edges)
        }
    }

    drawNavigator(img) {

        if (!this.porData.navigator.show) {
            return;
        }

        const canvas = $('#graph_navigator').get(0);
        const context = canvas.getContext('2d');
        const boundingBox = this.$cy.elements().boundingBox(); //{"x1":32.75,"y1":20.75,"w":1723.3694281715098,"h":1432.2772123506393};

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, boundingBox.x1 + this.porData.navigator.initOffset.x, boundingBox.y1 + this.porData.navigator.initOffset.y, boundingBox.w, boundingBox.h);

        context.beginPath();
        context.lineWidth = this.porData.navigator.lineWidth;
        context.strokeStyle = this.porData.navigator.strokeStyle;
        context.fillStyle = this.porData.navigator.fillStyle;


        const extent = this.$cy.extent();
        const rectWidth = extent.x2 - extent.x1;
        const rectHeight = extent.y2 - extent.y1;
        this.porData.navigator.rect.width = rectWidth;
        this.porData.navigator.rect.height = rectHeight;

        this.porData.navigator.rect.x = extent.x1 + this.porData.navigator.initOffset.x;
        this.porData.navigator.rect.y = extent.y1 + this.porData.navigator.initOffset.y;

        const {
            width,
            height,
            x,
            y
        } = this.porData.navigator.rect;

        context.rect(x, y, width, height);
        context.stroke();
        context.fill();
    }

    switchNavigator() {
        const $timeout = this.inject.get('$timeout');
        this.showNavigator = !this.showNavigator;
        if (this.showNavigator) {
            this.porData.navigator.show = true;
            $timeout(() => {
                this.initNavigator('init');
            }, 20);
        } else {
            const canvas = $('#graph_navigator').get(0);
            canvas.removeEventListener('click', this.navigatorMove.bind(this));
            this.porData.navigator.show = false;
        }
    }
    toggleFooter() {

        // this.inject.get('$timeout')(() => {
            if(!this.showFooter){
                const cy = this.$cy
                let edges
                const selectedEdges = cy.edges(':selected')
                if(selectedEdges.length > 0){
                    edges = selectedEdges
                }
                else if(cy.nodes(':selected').length  > 0){
                     edges = cy.nodes(':selected').connectedEdges()
                }
                else{
                     edges = cy.edges()
                }
                this.parseEdgesForRealtion(edges,true)
            }else{
                this.relationNodes = null;
                this.personGraphData = null;
            }
            this.showFooter = !this.showFooter;
        // }, 100)
        // this.showFooter = !this.showFooter;
        setTimeout(() => {
            this.$cy && this.$cy.resize();
       }, 500);
        
    }
    navigatorMove(event) {
        const box = event.target.getBoundingClientRect();
        const canvas = event.target;
        const extent = this.$cy.extent();
        const position = {
            x: event.offsetX / box.width * canvas.width,
            y: event.offsetY / box.height * canvas.height
        };

        const viewport = {
            width: extent.x2 - extent.x1,
            height: extent.y2 - extent.y1
        };

        const pan = {
            x: (this.porData.navigator.rect.x - position.x + viewport.width / 2) * (this.$cy.width() / viewport.width),
            y: (this.porData.navigator.rect.y - position.y + viewport.height / 2) * (this.$cy.height() / viewport.height)
        };

        this.$cy.panBy(pan);
    }

    initNavigator(type) {
        if (!this.porData.navigator.show) {
            return;
        }
        const imgBase64 = this.$cy.png({
            full: true,
            scale: 0.2
        });
        const canvas = $('#graph_navigator').get(0);

        if (type === 'init') {
            const extent = this.$cy.extent();

            this.porData.navigator.initOffset = {
                x: canvas.width / 2 - extent.x1 - extent.w / 2,
                y: canvas.height / 2 - extent.y1 - extent.h / 2
            };

            canvas.addEventListener('click', this.navigatorMove.bind(this));
        }

        const img = new Image();
        img.src = imgBase64;

        img.onload = result => {
            this.drawNavigator(img);
        };
    }

    initNodesPosition() {
        let hasNodeWithoutPosition = false;
        const nodes = this.$cy.nodes()
        const nodesHasPosition = nodes.filter(node => {
            if (node.data('x') == undefined || node.data('y') == undefined) {
                hasNodeWithoutPosition = true;
            }
            return node.data('x') != undefined && node.data('y') != undefined;
        });

        nodesHasPosition.forEach(node => {
            node.position({
                x: node.data().x,
                y: node.data().y
            })
        });

        if (hasNodeWithoutPosition) {
            nodesHasPosition.lock();

            const layout = this.$cy.elements().layout({
                name: 'cose-bilkent',
                nodeDimensionsIncludeLabels: true,
                ready: (event) => {
                    this.$cy.center();
                    nodes.unlock();
                    this.initNavigator('init');
                },
                animate: false,
                fit: false,
                idealEdgeLength: 120,
                numIter: 1 // max iterator count
            });

            layout.run();
        } else {
            this.initNavigator('init');
        }
    }

    init_graph(graph, type) {
        let init = false;
        return new Promise((resolve, reject) => {
            if (!this.$cy) {
                const $state = this.inject.get('$state');
                const isSnapShot = $state.params.type === 'snapshot';
                if(isSnapShot){
                    localStorage.setItem('isToGis','false')
                }
                init = true;
                const elements = {
                    nodes: this._formatElements(graph.vertices, 'nodes'),
                    edges: this._formatElements(graph.edges, 'edges')
                };
                this.elements = elements;
                this.$cy = cytoscape({
                    container: $('.jq_relation_d3').get(0),
                    zoom: 1,
                    minZoom: 0.1,
                    maxZoom: 3,
                    elements,
                    boundingBox: {
                        x1: 0,
                        y1: 0,
                        w: 3200,
                        h: 2200
                    },
                    style: this._makeStyleSheet(),
                    layout: !isSnapShot ? {
                        name: 'cose-bilkent',
                        nodeDimensionsIncludeLabels: true,
                        ready: (event) => {
                            event.cy.zoom(1);
                            event.cy.center();
                        },
                        animate: false,
                        fit: false,
                        idealEdgeLength: 120,
                    } : undefined
                });
                if (isSnapShot) {
                    this.initNodesPosition();
                }

                this.initGraphEvent();
            } else {
                this._differenceRenewal(graph, type);
            }
            const edges = this.$cy.edges()

            edges.forEach(i => {
                if (i.data().isArrow == 1 || i.data().dataType === '0000') { //添加箭头逻辑
                    i.addClass('has-arrow')
                }
                let times = parseInt((i.data().times || 1) / 10);
                i.style('width', times < 1 ? 1 : (times > 10 ? 10 : times));
                // if (i.data().times && Number(i.data().times) > 1) {
                //     const size = (Number(i.data().times) - 1) * 0.5 + 1;

                //     i.style('width', size > 5 ? 5 : size);
                // }
            });
            if (!this.hasNodeSelected) { //如果有相关联实体,则不统计所有实体
                this.statisticsDebounce(this.$cy.elements());
            }
            setTimeout(() => {
                this.getMapNodeTreeDebounce() //异步生成
            }, 0);
            const nodes = this.$cy.nodes()
            const maxDegree = nodes.maxDegree();
            const minDegree = nodes.minDegree();

            nodes.forEach((node) => {
                const size = maxDegree !== minDegree ? (node.degree() - minDegree) / (maxDegree - minDegree) * 30 + 30 : 40;
                node.style('height', size);
                node.style('width', size);
                if (node.data().isImport === '1') {
                    node.addClass('hexagon'); //六边形
                }
                if (node.data().isNodeSelected && node.data().isNodeSelected === '1') {
                    node.addClass("selected").select();
                }
                if (node.data().type == "01") {
                    if (node.data().dataType == "0102") {
                        node.addClass('import_people').qtip({
                            content: function () {
                                return Array.isArray(this.data().label) ? this.data().label.join('，') : '无';
                            },
                            position: {
                                container: $('.jq_relation_d3'),
                                my: 'left center',
                                at: 'right center',
                            },
                            show: {
                                event: 'mouseover'
                            },
                            hide: {
                                event: 'mouseout contextmenu drag',
                                target: $('.float-menu-box')
                            },
                            style: {
                                classes: 'qtip-blue',
                                style: {
                                    width: 10
                                }
                            }
                        })
                    } else {
                        node.removeClass('import_people').qtip({
                            content: function () {
                                return Array.isArray(this.data().label) ? this.data().label.join('，') : '无';
                            },
                            position: {
                                container: $('.jq_relation_d3'),
                                my: 'left center',
                                at: 'right center',
                            },
                            show: {
                                event: 'mouseover'
                            },
                            hide: {
                                event: 'mouseout contextmenu drag',
                                target: $('.float-menu-box')
                            },
                            style: {
                                classes: 'qtip-blue',
                                style: {
                                    width: 10
                                }
                            }
                        });
                    }
                }
            })
            if (!init) { //性能优化,不再在nodes.foreach里遍历执行下面的方法了,减少了非常多的遍历
                const layout = this.$cy.elements().layout({
                    name: 'cose-bilkent',
                    nodeDimensionsIncludeLabels: true,
                    ready: () => {
                        if (type !== 'delete') {
                            this.updateFilterEdgesAndNodes();
                        }
                        this.$cy.center();
                        nodes.unlock();
                        this.initNavigator();
                    },
                    animate: false,
                    fit: false,
                    idealEdgeLength: 120
                });

                layout.run();
            }
            resolve();
            if(this.showFooter){
                this.parseEdgesForRealtion(edges,true)
            }
        })
    }
    /********* graph functions ************/
    /**
     * @description 格式化
     */
    _formatElements(items, group) {
        return items.map(i => (this._formatElementData(i, group)));
    }

    _formatElementData(item, type) {
        const element = {};
        if (type === 'edges') {
            if(item.isTreauryShow && item.isTreauryShow == '1'){
                element.data = Object.assign({}, item, {
                    source: item.from,
                    target: item.to,
                    labelFormat: `${item.des || ''}${item.times && Number(item.times) > 1 ? `（${item.times}次）` : ''}`
                });
            }
            else{
                element.data = Object.assign({}, item, {
                    source: item.from,
                    target: item.to,
                    labelFormat: `${item.customDataLabel || (item.dataLabel || '')}${item.times && Number(item.times) > 1 ? `（${item.times}次）` : ''}`
                });
            }
            
        } else if (type === 'nodes') {
            element.data = item;
            // element.classes = `node-bk-${(Number(item.type) - 1) % 6}`;
            element.style = {
                'background-image': `url(${this._getNodeImage(item, 1)})`
            }
        }
        return element;
    }

    _differenceRenewal(graph, type) {
        const existNodesMap = {};
        const existEdgesMap = {};
        const newNodesMap = {};
        const newEdgesMap = {};
        const addNodes = [];
        const addEdges = [];
        const nodes = this.$cy.nodes()
        const edges = this.$cy.edges()
        let removeElements = this.$cy.collection();
        graph.vertices = graph.vertices || [];
        graph.edges = graph.edges || [];

        nodes.forEach((ele) => {
            const item = ele.data();
            existNodesMap[item.id] = ele;
        });

        edges.forEach((ele) => {
            const item = ele.data();
            existEdgesMap[item.id] = ele;
        });
        if (type === 'delete') {

            graph.vertices.forEach((node) => {
                if (existNodesMap[node.id]) {
                    removeElements = removeElements.add(existNodesMap[node.id]);
                }
            });

            graph.edges.forEach((edge) => {
                if (existEdgesMap[edge.id]) {
                    removeElements = removeElements.add(existEdgesMap[edge.id]);
                }
            });
        } else {

            graph.vertices.forEach((item) => {
                if (!existNodesMap[item.id]) {
                    addNodes.push(this._formatElementData(item, 'nodes'));
                }

                if (type === 'replace') {
                    newNodesMap[item.id] = true;
                }
            });

            graph.edges.forEach((item) => {
                if (item.id) {
                    addEdges.push(this._formatElementData(item, 'edges'))
                }

                if (type === 'replace') {
                    newEdgesMap[item.id] = true;
                }
            });

            if (type === 'replace') {
                nodes.forEach(function (ele) {
                    const item = ele.data();
                    if (!newNodesMap[item.id]) {
                        removeElements = removeElements.add(ele);
                    }
                });

                edges.forEach(function (ele) {
                    const item = ele.data();
                    if (!newEdgesMap[item.id]) {
                        removeElements = removeElements.add(ele);
                    }
                });
            }

        }

        nodes.lock();

        this.$cy.add({
            nodes: addNodes,
            edges: addEdges
        });
        // this.$cy.center(this.$cy.nodes(addNodes));
        this.$cy.remove(removeElements);
        this.resetChoose()
    }

    _getNodeImage(item, zoom) { //获取头像逻辑
        let url = '';

        function _elementTypeImage(data) { //todo 现在的图析上的实体类型是写死的,会根据这个类型显示不同的图标
            if (['0101', '0102', '0201', '0301', '0302', '0303', '0401'].includes(data.dataType)) {
                return `assets/images/theme_star_blue/graph/entity-${data.dataType}.png`;
            } else {
                return `assets/images/theme_star_blue/graph/entity-unknown.png`;
            }
        }

        if (zoom > 0.8 && item.image) {
            url = `data:image/jpeg;base64,${item.image.replace(/\n/g, '')}`;
        } else {
            url = _elementTypeImage(item);
        }

        return url;
    }

    _makeStyleSheet(isBlue) {
        let isStarBlue = angular.isUndefined(isBlue) ? $('body').hasClass('theme_star_blue') : isBlue;

        return [{
                selector: 'core',
                style: {
                    'selection-box-border-color': isStarBlue ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)',
                    'selection-box-color': 'rgba(255, 255, 255, 0)'
                }
            },
            {
                selector: 'node',
                style: {
                    width: 40,
                    height: 40,
                    'background-color': '#0D254E',
                    'background-fit': 'cover',
                    'border-color': '#5182FF',
                    'border-width': 2,
                    'opacity': 1,
                    // 'border-opacity': 0.3,
                    label: 'data(name)',
                    color: isStarBlue ? '#ffffff' : 'rgba(10, 18, 32, 0.64)',
                    'font-size': 12,
                    'text-valign': 'bottom',
                    'text-halign': 'right',
                    'font-weight': 100
                }
            },
            {
                selector: 'node.import_people',
                style: {
                    color: 'rgba(237, 90, 75,1)',
                    'border-color': 'rgba(237, 90, 75,1)',
                    'border-width': 2,
                    'background-color': 'rgba(237, 90, 75,1)',
                    'font-weight': 500,
                }
            },
            {
                selector: 'node.hexagon',
                style: {
                    shape: 'hexagon'
                }
            },
            {
                selector: '.opacity',
                style: {
                    opacity: 0.3
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    width: 1,
                    'line-color': '#5182FF',
                    label: 'data(labelFormat)',
                    'text-rotation': "autorotate",
                    'font-size': 12,
                    color: '#5182FF',
                    'text-margin-y': -10,
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    width: 3,
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 4,
                    'outer-border-width': 6,
                    'border-color': 'transparent',
                    'outer-border-color': 'rgba(64,133,251,.35)',
                    'border-opacity': isStarBlue ? 0.8 : 0.4,
                    'border-color': isStarBlue ? '#2979FF' : '#000',
                }

            },
            {
                selector: 'node.import_people:selected',
                style: {
                    'border-width': 6,
                    'outer-border-color': 'rgba(237,90,75,.35)',
                    'border-opacity': isStarBlue ? 1 : 0.4,
                    'border-color': isStarBlue ? 'rgba(237, 90, 75 , 1)' : '#000',
                }
            },
            {
                selector: 'node.search-node',
                style: {
                    'overlay-color': isStarBlue ? '#4D8CF6' : '#4D8CF6',
                    'overlay-opacity': 0.25,
                    'border-width': 4,
                    'border-color': '#3DE4FF',
                }

            },
            {
                selector: 'node.disabled-node',
                style: {
                    'background-color': 'rgba(0,0,0,1)',
                    'opacity': 0.4,
                    'border-width': 0,
                }
            },
            {
                selector: 'edge.has-arrow',
                style: {
                    'target-arrow-shape': 'triangle',
                    // 'target-arrow-fill': '#5182FF',
                    'target-arrow-color': '#5182FF'
                }
            },
            {
                selector: '.hidden',
                style: {
                    display: 'none'
                }
            },
            {
                selector: 'node.zoom-hidden',
                style: {
                    display: 'none'
                }
            },
        ]
    }

    /******** end graph functions ************/

    /**
     * @description 添加实体
     */
    addNode(e) {
        e.stopPropagation();
        this.closeContextMenu()
        if (this.isFullscreen) {
            return
        }
        new addNodeModal(this.inject).$promise.then((res) => {
            if (res) {
                let newNode = res;
                let nodes = this.$cy.nodes()
                newNode.key = res.key || this.inject.get('util').idMaker();
                newNode.id = res.id || `add/${newNode.key}`;
                if (nodes.filter(node => node.id() === res.id).empty() && nodes.filter(node => node.id().split('/')[1] == res.id.split('/')[1]).empty()) { //坑,添加的实体的实体标识在前台是add/****的格式,点击合并图谱后,返回的实体标识是type/****格式,只能取/符号之后的id进行比较来判断当前画布上是否有key值为****的实体,前提条件是实体标识只有一个,即不会出现类型不同的phone_number/1和person/1实体
                    this.toaster.success({
                        title: '添加成功'
                    });

                    this.pushUndo({
                        type: 'net',
                        graph: this.getGraphData()
                    });
                    this.set_por_data({
                        data: {
                            data: {
                                vertices: [newNode],
                                edges: []
                            }
                        }
                    }, true);
                } else {
                    this.toaster.warning({
                        title: '图析上已存在该实体'
                    });
                }
            }
        });
    }

    /**
     * @description 跳转档案
     * @param {*} e
     */
    goRecord(e, toSelectedRecord) {
        var item = []
        if (toSelectedRecord) {
            var choosenNode = this.getChosenNodes()
            this.$cy.elements().nodes(':selected').forEach(node => {
                item.push(node.id())
            })
        } else {
            var choosenNode = this.getChosenNodes()
            this.$cy.elements().nodes().forEach(node => {
                item.push(node.id())
            })
        }
        if (Array.isArray(choosenNode) && choosenNode[0]) {
            this.inject.get('util').popToFirst(item, choosenNode[0].id)
            localStorage.setItem('porpoiseNodeIds', JSON.stringify(item))
            const state = this.inject.get('$state');
            const stateData = {
                key: 'fromGraph',
                type: 'normal'
            };
            window.open(state.href('main.file', stateData), '_blank');
        }
    }

    /**
     * @description 初始化D3数据
     * @param {*} type
     * @param {*} data
     */
    init_d3_data(data, type) {
        return this.init_porpoise(data);
    }

    closeContextMenu() {
        if (this.porData && this.porData.menu) {
            if (this.porData.menu.showRegainSelect || this.porData.menu.showCollspanSelect || this.porData.menu.showSelect || this.porData.menu.showLayout || this.porData.viewConfig.showMenuFloat || this.porData.menu.showConnectSelect) {
                this.porData.menu.showSelect = false;
                this.porData.menu.showCollspanSelect = false;
                this.porData.menu.showRegainSelect = false;
                this.porData.menu.showConnectSelect = false;
                this.porData.menu.showLayout = false;
                this.porData.viewConfig.showMenuFloat = false;
                angular.element('.jq_float_menu').css('transform', 'translate(-50%, -50%) scale(0)');
            }
        }
    }

    /**
     * @description 关系收回
     * @param {*event} e
     */
    regain(e, type) {
        e.stopPropagation();
        this.closeContextMenu()
        const selectedNodes = [];
        this.$cy.nodes(":selected").forEach(node => {
            selectedNodes.push(node.data().id);
        });
        if (this.porData.viewConfig.chooseItemType === 'node') {
            this.pushUndo({
                type: 'net',
                graph: this.getGraphData()
            });
            let params = {
                id: selectedNodes,
                wheres: type
            }
            this.inject.get('porpoiseService').regain(
                params
            ).then((res) => {
                if (res.status === 200) {
                    if (res.data.status === 0) {
                        this.closeContextMenu();
                        const edges = []; //特殊处理,图析上新增了关系但是没合并图谱,这部分关系的关系收回逻辑在前端处理
                        this.$cy.nodes(":selected").connectedEdges().forEach(edge => {
                            if (edge.data().id && edge.data().id.indexOf("add/") > -1) {
                                edges.push(edge.data());
                            }
                        });
                        res.data.data.edges.push(...edges)
                        this.toaster.success({
                            title: '关系收回成功'
                        });
                        this.set_por_data(res, 'delete');
                    }
                }
            })
        }
    }

    onDeleteNodes() {
        this.resetChoose(true);
        setTimeout(() => {
            this.getMapNodeTreeDebounce() //异步生成
            if(this.showFooter){
                this.parseEdgesForRealtion(this.$cy.edges(),true)
            }
        }, 300);
    }
    /**
     * @description 删除选中节点
     * @param {*} e
     */
    deleteItem(e) {
        e.stopPropagation();
        this.closeContextMenu()
        let deleteNodeList = [];
        let deleteLinkList = [];
        const chooseItemList = this.getChosenNodes();
        if (chooseItemList.length > 0) {
            deleteNodeList = chooseItemList;
            this.pushUndo({
                type: 'net',
                graph: this.getGraphData()
            });
            deleteLinkList = this.chosenNodes.connectedEdges()
            this.chosenNodes.add(deleteLinkList).remove()

            this.inject.get('porpoiseService').deleteNode(deleteNodeList.map(node => node.id)).then((res) => {
                this.toaster.success({
                    title: '删除成功'
                });
                this.onDeleteNodes()
            });

        } else {
            this.toaster.error({
                title: '请选择实体'
            });

        }
    }

    /**
     * @description 反选删除未选中节点
     * @param {*} e
     */
    inverseDelete(e) {
        e.stopPropagation();
        this.closeContextMenu()
        let deleteLinkList = [];
        const selectedNodes = this.getChosenNodes();
        const unselectedNodes = this.$cy.nodes().difference(this.$cy.nodes(':selected'));//待优化
        if (selectedNodes.length > 0) {
            deleteLinkList = unselectedNodes.connectedEdges();
            this.pushUndo({
                type: 'net',
                graph: this.getGraphData()
            });
            unselectedNodes.add(deleteLinkList).remove()
            this.inject.get('porpoiseService').deleteNode(unselectedNodes.map(node => node.data().id)).then((res) => {
                this.toaster.success({
                    title: '删除成功'
                });

            });

            this.onDeleteNodes()
        } else {
            this.toaster.error({
                title: '请选择实体'
            });

        }
    }

    regainEvent(e) {
        e.stopPropagation();
        this.closeContextMenu()
    }

    forcePan(x, y) {
        let graph, controls;
        let ratio = 10;

        if (this.force3d) {
            graph = this.force3d.graph;
            controls = this.force3d.controls;
            controls.pan(x * ratio, y * ratio);
            graph.force().resetCountdown();
            graph.pauseAnimation();
            graph._animationCycle();
        }
    }

    toggleMap(e, type) {
        const self = this
        let vis = document.getElementById("gismap"),
            force = document.getElementById("force3d"),
            bbox;
        self.previous = undefined;
        self.currentShowTab = type

        if (self.$cy && type == "por") {
            self.inject.get('$timeout')(() => {
                this.$cy.resize();
                this.$cy.center();
            }, 100)
        }

        if (type === "3d") {
            bbox = this.bbox; // force.getBoundingClientRect();
            if (!this.force3d) {
                this.force3d = new Force3d(force, {
                    size: [bbox.width, bbox.height],
                    bbox: bbox,
                    data: this.elements,
                    style: cssText
                });
            }
        } else if (type === "map") {
            self.mapOpenedOnce = true;
            if (!self.gisMap && vis) {
                bbox = vis.getBoundingClientRect();
                self.gisMap = new GisMap(vis, {
                    size: [bbox.width, bbox.height],
                    zoom: GIS_CFG.DEFAULT_ZOOM,
                    center: GIS_CFG.DEFAULT_CENTER,
                    data: [{
                        data: []
                    }],
                    autoViewport: true,
                    style: cssText // document.getElementById("giscss")
                }).onChange(function (e, dim, $, zooming) {
                    // if (!zooming) return; // handle zoom
                    if (self.isUpdateDataZoom === false) return;
                    if (dim !== self.previous) {
                        const params = {
                            "entity": {
                                "person": [],
                                "phone": [],
                                "company": [],
                                "internetcafe": [],
                                "vehicle": []
                            },
                            "dim": dim
                        }
                        const tempTrees = self.tempTrees;
                        for (let p in tempTrees) {
                            let item = {}
                            item = _.cloneDeep(tempTrees[p]);
                            let type = item.type;
                            let keyArr = []
                            if (self.currentNodeKeysList.includes(item.key)) {
                                var key = item.key;
                                if (type in params.entity) {
                                    const typeIds = []
                                    angular.forEach(item.nodeTree, (i) => {
                                        angular.forEach(i.child, (item) => {
                                            if (item.isChecked) {
                                                    typeIds.push({
                                                        "eventId": item.type,
                                                        "startTime": self.getdate(i.startTime),
                                                        "endTime": self.getdate(i.endTime)
                                                    })
                                            }
                                        })
                                    });
                                    if (params.entity[type].length > 0) {
                                        for (let i of params.entity[type]) {
                                            if (!keyArr.includes(key)) {
                                                keyArr.push(key)
                                                params.entity[type].push({
                                                    key: key,
                                                    eventIds: typeIds
                                                })
                                            } else {
                                                i.eventIds = typeIds
                                            }
                                        }
                                    }
                                    else{
                                        keyArr.push(key)
                                        params.entity[type].push({
                                            key: key,
                                            eventIds: typeIds
                                        })
                                    }
                                    
                                }
                            }
                        }
                        this.gisParams = params
                        /// mark
                        function arrToString(objValue, othValue) {
                            return ((othValue.key == objValue.key))
                        }
                        params.entity[type] = _.uniqWith(params.entity[type], arrToString);
                        self.inject.get('porpoiseService').getMutilEntityData(
                            params
                        ).then((res) => {
                            var newData = res.data.data
                            for (let keys in self.tempTrees) {
                                self.selectData[keys] = {
                                    visible: self.currentNodeKeysList.includes(keys),
                                    data: newData
                                }; //设置gis地图数据
                            }

                            let alldata = [];
                            for (let p in self.selectData) {
                                var d = self.selectData[p];
                                if (d.visible) {
                                    [].push.apply(alldata, d.data);
                                }
                            }
                            self.gisMap.layers[0].set(alldata, false);
                            if (self.mapData.minDate) {
                                self.mapData.minDate = null
                                self.mapData.maxDate = null
                            }
                        });
                    }
                    self.previous = dim;
                }).onComplete(function () {
                    bbox = vis.getBoundingClientRect();
                    this.resize([bbox.width, bbox.height]);
                    self.gisMap.map.reset();
                    console.log('onComplete')
                    self.getGeoData(self.gisParams, self.tempTrees)
                }).onTooltip(function (e, point) {
                    return `
                        <ul>
                        ${point.labels.map((d) =>
                        `<li>
                        <img src = "assets/images/theme_star_blue/home/tag3.svg" class="gis-tooltip-list-icon"></img>
                        <span>${d.name}(${d.key})，在${d.startTime}从${d.startArea}前往${d.endArea}并于${d.endTime}到达</span>
                        </li>
                        `).join('')}
                        </ul>
                    `;
                });
            }
        }
    }

    /**
     * @description 处理关系图数据
     *
     * @param {any} res
     * @memberof PorpoiseController
     */
    set_por_data(res, type) {
        if (res.data.data && _.keys(res.data.data).length > 0) {
            this.init_graph(res.data.data, type);
        }
    }

    getMapnodeTree() {
        this.porData.mapverticesSum = 0;
        this.porData.mapNodeTree = [];
        const nodeMap = {};
        const nodeTree = {};
        const allNodes = this.$cy.nodes()
        let treeKeysList = Object.keys(this.tempTrees)
        for(let i of treeKeysList){
            this.gisKeysList[i] = {}
            this.gisKeysList[i].show = true;
            this.gisKeysList[i].isPlaying = false;
            this.gisKeysList[i].showClearBtn = false;
        }
        let _show;
        const $state = this.inject.get('$state');
        let paramsId = $state.params.id
        this.currentNodeKeysList = []
        console.log("getMapnodeTree")
        allNodes.forEach(node => {
            const item = node.data();
            this.currentNodeKeysList.push(item.key)
            item.isChecked = false
            nodeMap[node.id()] = item;
            let _key = node.id().split('/')[1]
            if (treeKeysList.includes(_key)) {
                if (this.tempTrees[_key] && (this.tempTrees[_key].allSelected || this.tempTrees[_key].showIndeterminate)) {
                    _show = true
                    item.show = _show
                }
            }
            if (!nodeTree[item.type]) {
                nodeTree[item.type] = {
                    child: {},
                    showIndeterminate: false,
                    type: item.type,
                    isChecked: false,
                    label: item.typeLabel,
                    sum: 0,
                    isParent: true,
                };
            }
            if (!nodeTree[item.type].child[item.dataType]) {
                nodeTree[item.type].child[item.dataType] = {
                    child: [],
                    showIndeterminate: false,
                    label: item.dataLabel,
                    type: item.dataType,
                    isChecked: false,
                    sum: 0,
                    isParent: true,
                    parentType: item.type
                };
            }
            nodeTree[item.type].child[item.dataType].child.push(item);
            nodeTree[item.type].child[item.dataType].sum++;
            nodeTree[item.type].sum++;
        });
        this.porData.mapNodeTree = nodeTree;
        this.porData.mapverticesSum = allNodes.size();
        if (allNodes.length > 0 && $state.params.type == 'normal' && paramsId == 'batch' && localStorage.getItem("isToGis") == 'true') { //从检索结果批量跳转gis的逻辑
            this.toggleNode(null)
        }
        if (allNodes.length > 0 && paramsId !== 'initial' && paramsId !== 'batch' && paramsId !== 'fromTextmining' && localStorage.getItem("isToGis") == 'true') { //从检索结果单个跳转gis的逻辑
            this.toggleNode(null)
        }
    }


    /**
     * @description 统计实体和关系
     * @param {*} graph
     */
    statistics(elements, onlyNode) {
        this.porData.verticesSum = 0;
        this.porData.verticesTypeCountOpen = true;
        this.porData.nodeTree = [];
        this.porData.edgesNumTree = [];
        const nodeMap = {};
        const nodeTree = {};
        const nodes = elements.nodes()
        nodes.forEach(node => {
            const item = node.data();
            nodeMap[node.id()] = item;
            if (!nodeTree[item.type]) {
                nodeTree[item.type] = {
                    child: {},
                    showIndeterminate: false,
                    type: item.type,
                    label: item.typeLabel,
                    sum: 0,
                    isParent: true,
                };
            }
            if (!nodeTree[item.type].child[item.dataType]) {
                nodeTree[item.type].child[item.dataType] = {
                    child: [],
                    showIndeterminate: false,
                    type: item.dataType,
                    label: item.dataLabel,
                    sum: 0,
                    isParent: true,
                };
            }
            nodeTree[item.type].child[item.dataType].child.push(item);
            nodeTree[item.type].child[item.dataType].sum++;
            nodeTree[item.type].sum++;

        });

        this.porData.nodeTree = nodeTree;
        this.porData.verticesSum = nodes.size();
        if(onlyNode) {
            return;
        }
        this.porData.edgesSum = 0;
        this.porData.edgesTypeCountOpen = true;
        const oldEdgeTree = JSON.parse(JSON.stringify(this.porData.edgeTree));
        const edgeTree = {};
        const edges = elements.edges()
        edges.forEach(edge => {
            const item = edge.data();
            item._target = nodeMap[item.to];
            item._source = nodeMap[item.from];
            let typeChild = {};
            if (!edgeTree[item.type]) {
                if (oldEdgeTree[item.type]) {
                    edgeTree[item.type] = this.porData.edgeTree[item.type];
                    typeChild = this.porData.edgeTree[item.type].child;
                    edgeTree[item.type].child = {};
                    edgeTree[item.type].sum = 0;
                } else {
                    edgeTree[item.type] = {
                        child: {},
                        type: item.type,
                        label: item.typeLabel || '自定义关系',
                        show: !edge.hasClass('hidden'),
                        showIndeterminate: false,
                        isParent: true,
                        sum: 0
                    };
                }
            }

            const itemDataType = item.dataType;

            if (!edgeTree[item.type].child[itemDataType]) {
                if (oldEdgeTree[item.type] && typeChild[itemDataType]) {
                    edgeTree[item.type].child[itemDataType] = oldEdgeTree[item.type].child[itemDataType];
                    edgeTree[item.type].child[itemDataType].child = [];
                    edgeTree[item.type].child[itemDataType].sum = 0;
                } else {
                    edgeTree[item.type].child[itemDataType] = {
                        child: [],
                        label:  item.dataLabel || '自定义关系',
                        type: itemDataType,
                        show: !edge.hasClass('hidden'),
                        filter: angular.copy(this.porData.defaultFilter),
                        filterJSON: this.porData.defaultFilterJSON,
                        parentType: item.type,
                        sum: 0
                    };
                }
            }

            edgeTree[item.type].child[itemDataType].child.push(item);
            edgeTree[item.type].child[itemDataType].sum++;
            edgeTree[item.type].sum++;
        });
        this.porData.edgeTree = edgeTree;
        this.porData.edgesSum = edges.size();
        this.porData.componentsCount = elements.components().length;
        if (this.porData.edgesSum > 0) {
            const allNodes = this.$cy.nodes()
            allNodes.forEach(node => {
                const tempObj = {}
                tempObj.key = node.data().key
                tempObj.sum = node.connectedEdges().length
                tempObj.name = node.data().name
                tempObj.des = node.data().des
                tempObj.isTreauryShow = node.data().isTreauryShow
                this.porData.edgesNumTree.push(tempObj)
            })

            function sortId(a, b) {
                return b.sum - a.sum
            }
            this.porData.edgesNumTree.sort(sortId);
            if (this.porData.edgesNumTree.length > 20) { //对前20个进行排序
                this.porData.edgesNumTree.length = 20
            }
        }


        if (!this.$scope.$$phase) {
            this.$scope.$digest();
        }
    }
    /**
     * @description 相关联实体统计
     * @param {*} graph
     */
    cstatistics(elements) {
        this.porData.cverticesSum = 0;
        this.porData.connectedverticesSum = 0
        this.porData.cverticesTypeCountOpen = false;
        this.porData.cnodeTree = [];
        const nodeMap = {};
        const nodeTree = {};
        const nodes = elements.nodes()
        nodes.forEach(node => {
            const item = node.data();
            nodeMap[node.id()] = item;
            if (!nodeTree[item.type]) {
                nodeTree[item.type] = {
                    child: {},
                    showIndeterminate: false,
                    type: item.type,
                    label: item.typeLabel,
                    sum: 0,
                    isParent: true,
                };
            }
            if (!nodeTree[item.type].child[item.dataType]) {
                nodeTree[item.type].child[item.dataType] = {
                    child: [],
                    showIndeterminate: false,
                    label: item.dataLabel,
                    type: item.dataType,
                    sum: 0,
                    isParent: true,
                };
            }
            nodeTree[item.type].child[item.dataType].child.push(item);
            nodeTree[item.type].child[item.dataType].sum++;
            nodeTree[item.type].sum++;
        });
        this.porData.cnodeTree = nodeTree;
        for (let keys in nodeTree) {
            if (nodeTree[keys].sum) {
                this.porData.connectedverticesSum += nodeTree[keys].sum
            }

        }
        this.porData.cverticesSum = this.$cy.nodes(":selected").size()
    }
    estatistics(elements,type) {//已选择关系统计和相关联关系统计
        this.porData.sedgesSum = 0;
        if(type == "selected"){
            this.porData.sedgesTypeCountOpen = true;
        }
        else if(type == "connected"){
            this.porData.cedgesTypeCountOpen = true;
        }
        
        const oldEdgeTree = JSON.parse(JSON.stringify(this.porData.edgeTree));
        const edgeTree = {};
        const edges = elements.edges()
        edges.forEach(edge => {
            const item = edge.data();
            let typeChild = {};

            if (!edgeTree[item.type]) {
                if (oldEdgeTree[item.type]) {
                    edgeTree[item.type] = this.porData.edgeTree[item.type];
                    typeChild = this.porData.edgeTree[item.type].child;
                    edgeTree[item.type].child = {};
                    edgeTree[item.type].sum = 0;
                } else {
                    edgeTree[item.type] = {
                        child: {},
                        type: item.type,
                        label: item.typeLabel || '自定义关系',
                        show: !edge.hasClass('hidden'),
                        showIndeterminate: false,
                        isParent: true,
                        sum: 0
                    };
                }
            }

            const itemDataType = item.dataType;

            if (!edgeTree[item.type].child[itemDataType]) {
                if (oldEdgeTree[item.type] && typeChild[itemDataType]) {
                    edgeTree[item.type].child[itemDataType] = oldEdgeTree[item.type].child[itemDataType];
                    edgeTree[item.type].child[itemDataType].child = [];
                    edgeTree[item.type].child[itemDataType].sum = 0;
                } else {
                    edgeTree[item.type].child[itemDataType] = {
                        child: [],
                        label: item.dataLabel || '自定义关系',
                        type: itemDataType,
                        show: !edge.hasClass('hidden'),
                        filter: angular.copy(this.porData.defaultFilter),
                        filterJSON: this.porData.defaultFilterJSON,
                        parentType: item.type,
                        sum: 0
                    };
                }
            }
            edgeTree[item.type].child[itemDataType].child.push(item);
            edgeTree[item.type].child[itemDataType].sum++;
            edgeTree[item.type].sum++;
        });
        if(type == "selected"){
            this.porData.sedgeTree = edgeTree;
            this.porData.sedgesSum = edges.size();
            this.porData.scomponentsCount = elements.components().length;
        }
        else if(type == "connected"){
            this.porData.cedgeTree = edgeTree;
            this.porData.cedgesSum = edges.size();
            this.porData.ccomponentsCount = elements.components().length;
        }

    }
    resetChoose(needStatistics) {
        const $cy = this.$cy
        const elements = $cy.elements()
        elements.unselect().removeClass('selected').removeClass('search-node');
        this.porData.viewConfig.choosePorpoiseItem = null;
        this.hasNodeSelected = false;
        this.hasEdgeSelected = false;
        this.hasNodeConnected = false;
        this.porData.nodeStatistics = false;
        this.hasMultiEdgeSelected = false;
        this.porData.nodeDetail = [];
        this.porData.d3Data.linkTimeList = {
            list: [],
            sortKey: ''
        };
        this.porData.d3Data.chooseEdge = '';
        this.currentNodeDetailKey = '';
        this.searchWord = '';
        this.delWord();
        $cy.elements('.opacity').removeClass('opacity');
        // $cy.nodes().removeClass('search-node').removeClass('selected');
        this.porData.d3Data.reqData.showDetail = 'count' //fix:没有实体被选中则跳到统计tab
        this.selectedEdge = null;
        $cy.container().focus();
        for (let keys in this.gisKeysList) {//添加实体时,清除播放
            if (this.gisKeysList[keys].isInit) {
                this.clearLine(keys)
            }
        }
        if(this.mapOpenedOnce){
           setTimeout(() => {
            console.log('update gis')
            const params = {
                "entity": {
                    "person": [],
                    "phone": [],
                    "company": [],
                    "internetcafe": [],
                    "vehicle": []
                },
                "dim": "province"
            }
            this.getGeoData(params)
           }, 100);
        }
        if (needStatistics) {
            console.log("reStatistics")
            this.statistics(elements); //需要重新统计
        }
        if (!this.$scope.$$phase) {
            this.$scope.$digest();
        }
        console.log("reset")
    }

    /**
     * @description 初始化porpoise
     *
     * @param {any} data
     * @returns
     * @memberof PorpoiseController
     */
    init_porpoise(data) {
        let Q = this.inject.get('$q');
        let $state = this.inject.get('$state');
        let porpoiseService = this.inject.get('porpoiseService');
        let promise = Q.defer();

        if ($state.params.type === 'phoneBook') {
            data.graphName = $state.params.graphName;
        } else if ($state.params.type.indexOf('tradeGraph_') !== -1) {
            data.graphName = $state.params.type.replace(/tradeGraph_/g, '');
            data.function = 'Treasury';
        }
        let service = 'getPorpoiseData';
        if (data.type === 'combineExpand') {
            service = 'combineExpand'
        }
        porpoiseService[service](globalLoading(data)).then((res) => { // /person/expand
            if (res.status === 200) {
                if (res.data.status === 0) {
                    if (data.type !== 'combineExpand') {
                        this.porData.isForbidden = res.data.data.isForbidden;
                    }
                    this.porData.porpoiseTitle = decodeURIComponent($state.params.type).includes('snapshot') ? res.data.data.title : '新建图析';
                    if (res.data.data && ((res.data.data.vertices && res.data.data.vertices.length > 0) || (res.data.data.edges && res.data.data.edges.length > 0))) {
                        this.set_por_data(res);
                        promise.resolve();
                    } else {
                        this.set_por_data(res); //2018-06-25 fix:返回节点和关系数据为空,也需要初始化出来一个图表,不然空白图析增加node会报错
                        promise.resolve();
                        this.toaster.warning({
                            title: '未获取更多实体和关系'
                        });

                    }
                } else {
                    this.set_por_data({
                        data: {
                            data: {
                                vertices: [],
                                edges: []
                            }
                        }
                    }); //2018-06-25 fix:返回节点和关系数据为空,也需要初始化出来一个图表,不然空白图析增加node会报错
                    promise.resolve();
                    this.toaster.warning({
                        title: res.data.msg
                    });

                }
                if (res.data.data && res.data.data.gisData) {
                    this.gisParams = res.data.data.gisData
                    this.tempTrees = res.data.data.gisTree
                    if($state.params.type !== "snapshot" && $state.params.type !== "fromTextmining"){
                        this.getGeoData(this.gisParams, this.tempTrees)
                    }
                    
                }
            }
        });
        return promise.promise;
    }

    /**
     *
     * @param data
     * @description 格式化案件关系的数据
     */
    formatCaseDetail(result) {
        this.porData.d3Data.linkTimeList.nameMap = result.nameMap;
        this.porData.d3Data.linkTimeList.list = this.porData.d3Data.linkTimeList.list.concat(result.data);
    }

    formatVehicleViolation(result) {
        function _formatInfo(data) {
            const info = {};

            data.forEach((d) => {
                const key = d.key;
                if (!info[key]) {
                    info[key] = [];
                }
                delete d.key;
                info[key].push(d);
            });

            return info;
        }

        result.forEach(r => {
            r.data = _formatInfo(r.data);
        });

        this.porData.d3Data.linkTimeList.list = result;
    }

    formatEdgeDetail(result) {
        const timeList = [];
        const timeMap = {};
        const {
            sortKey,
            list
        } = this.porData.d3Data.linkTimeList;

        list.forEach(item => {
            timeMap[item.keyTime] = item;
        });

        result.forEach(item => {
            const dayTime = +moment(item[sortKey]).startOf('date');

            if (!timeMap[dayTime]) {
                timeMap[dayTime] = {
                    keyTime: dayTime
                };
            }

            const map = timeMap[dayTime];

            if (!map[item.key]) {
                map[item.key] = [];
            }

            map[item.key].push(item);
        });

        for (let key in timeMap) {
            if (timeMap.hasOwnProperty(key)) {
                timeMap[key].time = +moment(+key);
                timeList.push(timeMap[key]);
            }
        }

        timeList.sort((a, b) => {
            if (a.time > b.time) {
                return -1;
            }
            if (b.time > a.time) {
                return 1;
            }

            return 0;
        });

        this.porData.d3Data.linkTimeList.list = timeList;
    }

    getChosenNodes() {
        const nodes = [];
        this.chosenNodes = this.$cy.$('node:selected')
        this.chosenNodes.forEach(node => {
            nodes.push(node.data());
        });

        return nodes;
    }

    edgeDetailFormat(edge, result, type) {
        switch (edge.type) {
            case '08':
            case '98':
                if (type === 'init') {
                    this.porData.d3Data.linkTimeList.nameMap = {};
                    this.porData.d3Data.linkTimeList.list = [];
                }
                this.formatCaseDetail(result);
                break;
            case '09':
                this.formatVehicleViolation(result.data);
                break;
            default:
                this.porData.d3Data.linkTimeList.sortKey = result.key;
                this.formatEdgeDetail(result.data);

        }
    }

    /**
     * @description 点击关系
     *
     * @param {any} e
     * @param {any} d
     * @memberof PorpoiseController
     */
    porpoiseLineClick(e, d) {
        if (d.type === '00') {
            this.toaster.warning({
                title: '不支持查询自定义关系'
            });

            return;
        }
        
        const selectedEdge = this.$cy.edges().filter(edge => {
            const item = edge.data();
            return (item.key == d.key);
        })
        if(!selectedEdge.hasClass('hidden')){
            this.hasEdgeSelected = true
            this.porData.nodeStatistics = false;
            this.$cy.elements().addClass('opacity').unselect();
            this.$cy.nodes().unselect();
            this.hasNodeSelected = false;
            this.selectedEdge = d.key
            this.$cy.center(selectedEdge);
            selectedEdge.addClass("selected").select().removeClass("opacity").connectedNodes().removeClass("opacity")
            this.porData.d3Data.reqData.showDetailType = 'link';
            this.porData.d3Data.reqData.edgeFlag = 0;
            this.porData.d3Data.chooseEdge = d;
            this.porData.d3Data.linkTimeList = {
                list: [],
                sortKey: ''
            };

            this.getEdgeData(d).then((res) => {
                if (res.data && res.data.length) {
                    this.edgeDetailFormat(d, res, 'init');
                }
            });
            this.inject.get('$timeout')(() => {
                this.cstatistics(selectedEdge.connectedNodes());
                this.estatistics(selectedEdge,'selected');
                this.parseEdgesForRealtion(selectedEdge,false);
            })

        }
        else{
            this.toaster.warning({
                title: '该关系已被隐藏,先显示该关系'
            });
        }
    }

    changeShowEdgeLinkData() {
        this.porData.d3Data.reqData.showDetail = 'detail';
        this.porData.d3Data.reqData.showDetailType = 'link';
        this.porData.d3Data.reqData.edgeFlag = 0;
        this.porData.d3Data.linkTimeList = {
            list: [],
            sortKey: ''
        };
        this.getEdgeData(this.porData.d3Data.chooseEdge).then((res) => {
            if (res.data && res.data.length) {
                this.edgeDetailFormat(this.porData.d3Data.chooseEdge, res, 'init');
            }
        });
    }

    porpoiseItemRightClick(event, d) {
        const timeout = this.inject.get('$timeout');
        if (this.disabledNodes[d.key]) {
            timeout(() => {
                this.toaster.warning({
                    title: '该节点已被禁用,请重新启用'
                });
            })
            return false;
        }
        this.selectedNodesNum = this.getChosenNodes().length >= 2;
        this.$cy.nodes().filter(node => {
            const item = node.data();
            return (item.id == d.id);
        }).addClass("selected").select();
        if (!this.porData.viewConfig.showMenuFloat) {
            this.porData.viewConfig.showMenuFloat = true;
            angular.element('.jq_float_menu').css('top', event.offsetY + 48).css('left', event.offsetX); //修复右键偏移的问题
            timeout(() => {
                angular.element('.jq_float_menu').css('transform', 'translate(-50%, -50%) scale(1)');
            });
            this.porData.viewConfig.chooseItemType = 'node';
            this.porData.viewConfig.choosePorpoiseItem = d;
        } else {
            this.closeContextMenu();
        }
    }

    /**
     * @description 点击关系实体
     *
     * @param {any} e
     * @param {any} d
     * @memberof PorpoiseController
     */
    porpoiseItemClick(e, d) {
        this.getNodeDetail(d);
    }

    resetFilter($event, edge) {
        edge.filter = angular.copy(this.porData.defaultFilter);
        edge.filterJSON = this.porData.defaultFilterJSON;
        this.updateFilterEdgesAndNodes();
    }

    confirmFilter($event, edge) {
        if (!edge.filter.time.number.length || isNaN(Number(edge.filter.time.number))) {
            this.toaster.warning({
                title: '请输入数字'
            });
            return;
        }
        edge.filterJSON = JSON.stringify(edge.filter);
        this.updateFilterEdgesAndNodes();
    }

    chooseNodes(item, e) {
        e.stopPropagation();
        this.closeContextMenu()
        const elements = this.$cy.elements()
        const nodes = this.$cy.nodes()
        elements.unselect();
        if (item.type && item.type.length <= 2) {
            nodes.filter(node => node.data('type') === item.type).addClass("selected").select();
        } else {
            nodes.filter(node => node.data('dataType') === item.type).addClass("selected").select();
        }
    }

    disableNodes(item, $event) {
        $event.stopPropagation();
        this.closeContextMenu()
        this.disabledNodes[item.key] = !this.disabledNodes[item.key]
        const nodes = this.$cy.nodes()
        nodes.filter(node => {
            const i = node.data();
            return ((i.key && i.key == item.key));
        }).toggleClass('disabled-node');
        this.$cy.center(this.$cy.nodes('.disabled-node'));
    }


    getMoreEdge(e) {
        e.stopPropagation();
        this.closeContextMenu()
        const $this = this;
        $this.porData.d3Data.reqData.edgeFlag++;
        $this.getEdgeData($this.porData.d3Data.chooseEdge).then((res) => {
            if (res.data && res.data.length) {
                this.edgeDetailFormat(this.porData.d3Data.chooseEdge, res);
            } else {
                $this.toaster.error({
                    title: '没有更多了'
                });

            }
        });
    }

    /**
     * @description 获取实体详情
     * @param d
     * @param type
     */
    getNodeDetail(d) {
        const _id = d.id || d
        if (this.chosenNodesIds.length > 0) {
            this.hasNodeSelected = true;
        }
        if (!this.chosenNodesIds.includes(_id)) {
            this.inject.get('porpoiseService').getNodeDetail(_id).then((res) => {
                if (res.status === 200) {
                    if (res.data.data && res.data.data.keys && res.data.status === 0) {
                        this.porData.d3Data.reqData.showDetail = 'detail';
                        this.porData.d3Data.reqData.showDetailType = 'node';
                        this.porData.nodeDetail.push(res.data);
                        this.currentNodeDetailKey = res.data.data.keys
                    }
                }
            });
        } else {
            this.currentNodeDetailKey = _id.split('/')[1]
        }
    }

    /**
     * @description 注销鼠标右键事件
     *
     * @memberof PorpoiseController
     */
    initChromeMenu() {
        $(document).on('contextmenu', ".porpoise-main", (e) => {
            e.preventDefault();
        });
    }

    /**
     * @description 导入文件
     */
    importFile(type, e, data = null) {
        e.stopPropagation();
        this.closeContextMenu();
        if (this.isFullscreen) {
            return
        }
        switch (type) {
            case 1: // 模板导入
                new importModal(this.inject).$promise.then(res => {
                    if (res) {
                        this.pushUndo({
                            type: 'net',
                            graph: this.getGraphData()
                        });
                        this.set_por_data(res);
                    }
                });
                break;
            case 2: //自定义模板导入
                new entityImportModal(this.inject, data).$promise.then(res => {
                    if (res && res.result) {
                        // res 第一步的所有数据项
                        new entityRelationChooseModal(this.inject, res, data).$promise.then(r => {
                            // r 第一步的所有数据项和第二步的所有数据项
                            if (r) {
                                if (r.before) {
                                    this.importFile(type, e, r);
                                } else {
                                    this.pushUndo({
                                        type: 'net',
                                        graph: this.getGraphData()
                                    });
                                    this.set_por_data(r);
                                }
                            }
                        });
                    }
                });
                break;
            case 3: // 历史导入
                new historyImportModal(this.inject).$promise.then(r => {
                    if (r) {
                        this.pushUndo({
                            type: 'net',
                            graph: this.getGraphData()
                        });
                        this.set_por_data(r);
                    }

                });
                break;
        }
    }

    exportPNG($event) {
        $event.stopPropagation();
        this.closeContextMenu()
        if (!this.$cy) {
            return;
        }
        this.$cy.style(this._makeStyleSheet(false));
        const element = document.createElement('a');
        let imgBlob;

        if (window.URL) {
            imgBlob = this.$cy.png({
                full: true,
                scale: 2,
                output: 'blob'
            });

            element.setAttribute('download', this.porData.porpoiseTitle + '_' + moment().format('YYYY_MM_DD_HH_mm'));
            element.setAttribute('href', URL.createObjectURL(imgBlob));
        } else {
            imgBlob = this.$cy.png({
                full: true,
                scale: 2
            });

            element.setAttribute('download', moment().format('YYYY_MM_DD_HH_mm'));
            element.setAttribute('href', imgBlob);
        }

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        this.$cy.style(this._makeStyleSheet());

        setTimeout(() => {
            document.body.removeChild(element);
        }, 20);
    }

    exportEXCEL($event) {
        $event.stopPropagation();
        this.closeContextMenu()

        if (!this.$cy) {
            return;
        }

        const porpoiseService = this.inject.get('porpoiseService');
        const params = {
            vertices: [],
            edges: []
        };

        params.vertices = this.$cy.nodes().map(node => {
            const item = node.data();

            return item;
        });

        params.edges = this.$cy.edges().map(edge => {
            const item = edge.data();

            return {
                from: item.from,
                to: item.to,
                dataLabel: item.customDataLabel || (item.dataLabel || ''),
                id: item.id
            };
        });

        porpoiseService.exportExcel(globalLoading(params)).then(result => {
            if (result.status === 200) {
                const blob = new Blob([result.data], {
                    type: "application/vnd.ms-excel"
                });
                const objectUrl = URL.createObjectURL(blob);

                const element = document.createElement('a');

                element.setAttribute('download', `${this.porData.porpoiseTitle}_${moment().format('YYYY_MM_DD_HH_mm')}导出.xls`);
                element.setAttribute('href', objectUrl);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                setTimeout(() => {
                    document.body.removeChild(element);
                }, 20);
            }
        }, error => {
            //
        });
    }

    exportBDP($event) {
        $event.stopPropagation();
        this.closeContextMenu()

        if (!this.$cy) {
            return;
        }

        const porpoiseService = this.inject.get('porpoiseService');
        const newWin = window.open("about:blank");
        const params = {
            vertices: [],
            edges: []
        };

        params.vertices = this.$cy.nodes().map(node => {
            const item = node.data();

            return item;
        });

        params.edges = this.$cy.edges().map(edge => {
            const item = edge.data();

            return {
                from: item.from,
                to: item.to,
                dataLabel: item.customDataLabel || (item.dataLabel || ''),
                id: item.id
            };
        });

        porpoiseService.exportBDP(globalLoading(params)).then(result => {
            if (result.status === 200) {
                if (result.data.status === 0) {
                    newWin.location.href = result.data.data;
                } else {
                    this.toaster.warning({
                        title: result.data.message
                    });

                }
            }
        }, error => {
            //
        });
    }

    saveGraph() {
        let putData = {
            vertices: [],
            edges: []
        };

        putData.vertices = this.$cy.nodes()
            .filter(node => !node.hasClass('hidden'))
            .map(node => {
                return _.assign({}, node.data(), {
                    x: node.position().x,
                    y: node.position().y,
                })
            });

        putData.edges = this.$cy.edges()
            .filter(edge => !edge.hasClass('hidden'))
            .map(edge => edge.data());

        let png = this.$cy.png({
            full: true,
            maxWidth: 400,
            maxHeight: 180
        });

        if (png === 'data:,') {
            //1x1最小透明的png；
            png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        }
        for(let keys in this.tempTrees){
            if(!this.currentNodeKeysList.includes(keys)){
                delete this.tempTrees[keys]
            }
        }
        this.inject.get('porpoiseService').saveTemporatyJudge({
            themeName: `${moment().format('YYYY-MM-DD HH:mm')} 暂存快照`,
            description: `${moment().format('YYYY-MM-DD HH:mm')} 暂存快照`,
            data: putData,
            screenShot: png,
            id: this.temporaryFileId,
            gisData: {
                "entity": {
                    "person": [],
                    "phone": [],
                    "company": [],
                    "internetcafe": [],
                    "vehicle": []
                },
                "dim": "province"
            },
            // gisData:this.gisParams,
            gisTree: this.tempTrees
        });
    }

    /**
     * @description 保存图析
     * @param e
     */
    sliceImg(e) {
        e.stopPropagation();
        this.closeContextMenu()
        if (this.isFullscreen) {
            return
        }

        const $state = this.inject.get('$state');
        let paramsId = $state.params.id
        if (paramsId.indexOf('tmpfile') > -1) {
            paramsId = this.transformId(paramsId)
        }
        const route_id = paramsId || null;

        let putData = {
            vertices: [],
            edges: [],
        };
        putData.vertices = this.$cy.nodes()
            .filter(node => !node.hasClass('hidden'))
            .map(node => {
                if (node.selected()) {
                    return _.assign({}, node.data(), {
                        x: node.position().x,
                        y: node.position().y,
                        isNodeSelected: 1
                    })
                } else {
                    return _.assign({}, node.data(), {
                        x: node.position().x,
                        y: node.position().y,
                        isNodeSelected: 0
                    })
                }
            });
        putData.edges = this.$cy.edges()
            .filter(edge => !edge.hasClass('hidden'))
            .map(edge => edge.data());
        let png = this.$cy.png({
            full: true,
            maxWidth: 400,
            maxHeight: 180
        });

        if (png === 'data:,') {
            //1x1最小透明的png；
            png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        }
        for(let keys in this.tempTrees){
            if(!this.currentNodeKeysList.includes(keys)){
                delete this.tempTrees[keys]
            }
        }
        new judgeModal(this.inject, png, putData, route_id, this.gisParams, this.tempTrees).$promise.then(() => {
        });
    }

    /**
     * @description 关闭右键菜单
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    closePorpoise(e) {
        this.closeContextMenu();
    }

    /**
     * @description 节点内部关系推演,与关系推演不同的是,该方法不会引入新的实体
     *
     * @param null
     * @memberof PorpoiseController
     */
    getDirectRelation() {
        let porpoiseService = this.inject.get('porpoiseService');
        const nodes = this.$cy.nodes()
        if(nodes.length > 0){
            let ids = nodes.map(node => node.data().id);
            this.pushUndo({
                type: 'net',
                graph: this.getGraphData()
            });
            porpoiseService.getDirectRelation(ids).then((res) => {
                if (res.data && res.data.data && res.data.status == 0) {
                    this.toaster.success({
                        title: '内部推演成功'
                    });
                    this.set_por_data(res);
                } else {
                    this.toaster.warning({
                        title: res.data.msg || '内部推演失败'
                    });

                }
            });
        }
    }


    /**
     * @description 关系推演
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    relationCol(e) {
        let porpoiseService = this.inject.get('porpoiseService');
        const chooseItemList = this.getChosenNodes();

        if (chooseItemList.length >= 2 || !e) {
            let req = chooseItemList.map(item => item.id);

            let vertices = this.$cy.nodes().map(node => node.data());
            let edges = this.$cy.edges().map(node => node.data());

            this.pushUndo({
                type: 'net',
                graph: this.getGraphData()
            });

            porpoiseService.getLineRelation({
                data: {
                    edges: edges,
                    vertices: vertices
                },
                entityids: req
            }).then((res) => {
                if (res.data && res.data.data && res.data.status == 0) {
                    if ((res.data.data.vertices && res.data.data.vertices.length > 0) || (res.data.data.edges && res.data.data.edges.length > 0)) {
                        this.toaster.success({
                            title: '关系推演成功'
                        });

                        this.set_por_data(res);
                    } else {
                        this.toaster.warning({
                            title: '未获取到关系'
                        });

                    }
                } else {
                    this.toaster.warning({
                        title: res.data.msg || '关系推演失败'
                    });

                }
            });
            this.closeContextMenu();
        } else {
            this.toaster.error({
                title: '请选择两个及以上实体'
            });

        }
    }

    /**
     * @description 关联实体
     *
     * @param {any} e
     * @param {any} type 需要选中的关联实体的类型
     * @memberof PorpoiseController
     */

    getConnect(e, type) {
        if (e) {
            e.stopPropagation();
        }
        var typeRuleMap = {
            "person": /^(01)/, //相关人
            "thing": /^(02)/, //相关物
            "area": /^(00000)/, //相关地,暂无
            "virtual": /^(03)/, //相关虚拟身份
            "organization": /^(04)/, //相关企业
        }
        this.closeContextMenu()
        const selectedNodesTemp = this.$cy.nodes(':selected')
        const computedNodes = selectedNodesTemp.connectedEdges().connectedNodes().filter(
            node => {
                return typeRuleMap[type].test(node.data().dataType)
            }
        ).difference(selectedNodesTemp)
        if (computedNodes.length > 0) {
            selectedNodesTemp.removeClass('selected').unselect().connectedEdges().connectedNodes().addClass("opacity")
            computedNodes.addClass('selected').removeClass("opacity").select()
            this.toaster.success({
                title: '实体选择成功'
            });
        } else {
            this.toaster.success({
                title: '无符合条件的相关实体'
            });

        }
    }

    /**
     * @description 关系扩展
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    collspanBean(e, type, ids) {
        if (e) {
            e.stopPropagation();
        }
        if (!ids) {
            var ids = this.$cy.nodes(':selected').map(node => node.data().id)
        } else {
            var ids = ids
        }
        const porpoiseService = this.inject.get('porpoiseService');
        porpoiseService.getRelatedRoot({
            key: ids[0]
        }).then((res) => {
            this.relatedRoot = res.data.result
            this.customRootRelationType = _.map(this.relatedRoot, 'mappedRuleKeyWord')
            if (this.customRootRelationType.length == 0) {
                this.toaster.warning({
                    title: '未配置相关选项,请前往管理页进行相关配置'
                });
                return false
            }
        })
        this.closeContextMenu()
        const $state = this.inject.get('$state');
        const $location = this.inject.get('$location');
        let params = null
        console.log($state.params)
        if (type == "EXPAND_ALL") {
            if($state.params.id.indexOf('AP_DOCUMENT') > -1 || $state.params.graphName.indexOf('APA') > -1){//从应用跳转过来的特殊处理
                params = {
                    start: 0,
                    id: ids,
                    depth: 1,
                    // expandType: type,
                    graphName:$state.params.graphName + "_union"
                };
            }
            else{
                params = {
                    start: 0,
                    id: ids,
                    depth: 1,
                    expandType: type
                };
            }
            
            this.init_d3_data(params, 'update');
            return
        } else if (type == "EXPAND_MANAGE_RELATION_CUSTOM") {
            params = {
                start: 0,
                id: ids,
                depth: 1,
                expandType: type
            };
            this.init_d3_data(params, 'update');
            return
        } else {
            params = {
                start: 0,
                id: ids,
                depth: 1,
            };
        }
        setTimeout(() => {
            if ($state.params.type === 'phoneBook') {
                params.graphName = $location.search().graphName;
            } else if (type === 'EXPAND_MANAGE_RELATED_EXPAND_COMBINATION') { // 组合扩展
                new combineExpandModal(this.inject, ids[0]).$promise.then((params) => {
                    if(params){
                        params.type = 'combineExpand';
                        this.init_d3_data(params);
                        this.closeContextMenu();
                    }
                    else{
                        this.toaster.warning({
                            title: '已取消'
                        });
                    }
                    
                })
            } else if (this.customRootRelationType.includes(type)) {
                const _id = ids[0]
                if (!this.seniorExpandTrees[_id]) {
                    this.seniorExpandTrees[_id] = {}
                }
                const typeTree = {}
                new seniorExpandModal(this.inject, _id, typeTree, type).$promise.then((tempTrees) => {
                    if (tempTrees) {
                        const typeIds = []
                        angular.forEach(tempTrees[type].nodeTree, (i) => {
                            angular.forEach(i.child, (item) => {
                                if (item.isChecked) {
                                    typeIds.push(item.type)
                                }
                            })
                        })
                        const params = {
                            start: 0,
                            id: [_id],
                            depth: 1,
                            expandIds: typeIds,
                            expandType: type
                        }
                        this.closeContextMenu();
                        this.pushUndo({
                            type: 'net',
                            graph: this.getGraphData()
                        });
                        this.init_d3_data(params, 'update');
                    }
                })
            } else if ($state.params.type.indexOf('tradeGraph_') !== -1) {
                params.graphName = $state.params.type.replace(/tradeGraph_/g, '');
                params.function = 'Treasury';
            }
        }, 100);
    }
    /**
     * @description 深度扩展
     * @param e
     */
    directional(e) {
        e.stopPropagation();
        this.closeContextMenu()
        if (this.isFullscreen) {
            return
        }
        const $this = this;
        const putData = this.$cy.nodes().map(node => node.data());

        new directionalModal(this.inject, putData, this.getChosenNodes()).$promise.then((res) => {
            if (res) {
                const putData = {
                    start: 0,
                    id: res.node,
                    depth: parseInt(res.depth)
                };
                this.pushUndo({
                    type: 'net',
                    graph: this.getGraphData()
                });
                $this.init_d3_data(putData, 'update');
            }
        });
    }

    mergeGraph(e) {
        if (this.isFullscreen) {
            return
        }
        e.stopPropagation();
        this.closeContextMenu()
        if (this.$cy) {
            this.inject.get('puiModal').confirm({
                title: '提示',
                content: '合并图谱后将无法撤回，确定继续合并？'
            }).then(confirm => {

                const params = {
                    "vertices": this.$cy.nodes().map(item => item.data()),
                    "edges": this.$cy.edges().map(edge => {
                        const item = edge.data();

                        return {
                            id: item.id,
                            key: item.key,
                            from: item.from,
                            fromType: item._source.type,
                            to: item.to,
                            toType: item._target.type,
                            type: item.type,
                            dataType: item.dataType,
                            label: item.label,
                            dataLabel: item.dataLabel,
                        }
                    })
                };

                this.inject.get('porpoiseService').mergeGraph(params).then(result => {
                    if (result.data.status == 0) {
                        this.toaster.success({
                            title: '合并成功'
                        });

                        this.set_por_data(result, 'replace');
                    } else {
                        this.toaster.warning({
                            title: result.message || '合并失败,请稍后再试'
                        });

                    }

                }, error => {
                    this.toaster.warning({
                        title: '合并失败,请稍后再试'
                    });

                });
            });
        }
    }

    /**
     *
     * @description 合并图析
     * @param e
     */
    cooperateAnalysis(e) {
        if (this.isFullscreen) {
            return
        }
        e.stopPropagation();
        this.closeContextMenu()
        new mergeGraphModal(this.inject).$promise.then(result => {
            if (result) {
                this.pushUndo({
                    type: 'net',
                    graph: this.getGraphData()
                });
                this.set_por_data(result);
            }
        });
    }

    /**
     * @description 事件拓展
     * @param {*} e
     */
    eventCol(e) {
        if (this.isFullscreen) {
            return
        }
        e.stopPropagation();
        this.closeContextMenu()
    }

    /**
     * @description 获取关系数据
     * @param {any} data
     * @returns
     * @memberof PorpoiseController
     */
    getEdgeData(data) {
        const promise = this.inject.get('$q').defer();
        const params = {
            id: data.key,
            type: data.type,
            dataType: data.dataType,
            flag: this.porData.d3Data.reqData.edgeFlag + '',
            isSameDay: this.porData.d3Data.showSameEdgeLinkData,
            from: data.from,
            to: data.to,
            eventId: data.eventId || ''
        };

        if (data.caseNum) {
            params.caseNum = data.caseNum;
        }

        this.inject.get('porpoiseService').getLinkData(params).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    promise.resolve(res.data.data);
                }  else {
                    this.toaster.warning({
                        title: res.data.message
                    });
                }
            }
        });
        return promise.promise;
    }

    getVisibleElements() {
        return this.$cy.elements().diff('.hidden').left;
    }

    getSelectedNodesAndConnectedEdges() {
        const selectedNodes = this.$cy.nodes(':selected');
        const innerEdges = selectedNodes.edgesWith(selectedNodes);
        return selectedNodes.union(innerEdges);
    }

    /**
     * @description 切换关系图
     * @param {any} e
     * @memberof PorpoiseController
     */

    changeNormal(e, layoutSelected) {
        e.stopPropagation();
        this.closeContextMenu();
        this.checkStatusChange('normal');
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    this.toaster.warning({
                        title: '没有选中元素'
                    });

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'cose-bilkent',
                    nodeDimensionsIncludeLabels: true,
                    ready: () => {
                        const newPosition = elements.boundingBox();
                        const offset = {
                            x: oldPosition.x1 - newPosition.x1,
                            y: oldPosition.y1 - newPosition.y1
                        };
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {
                                x: pos.x + offset.x,
                                y: pos.y + offset.y
                            };
                        });

                        this.initNavigator();
                    },
                    animate: false,
                    fit: false,
                    idealEdgeLength: 120
                });
            } else {
                layout = this.getVisibleElements().layout({
                    name: 'cose-bilkent',
                    nodeDimensionsIncludeLabels: true,
                    ready: (event) => {
                        event.cy.zoom(1);
                        event.cy.center();
                        this.initNavigator();
                    },
                    animate: false,
                    fit: false,
                    idealEdgeLength: 120
                });
            }

            layout.run();
        }
    }

    /**
     * @description 切换树形图
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    changeTree(e, layoutSelected) {
        e.stopPropagation();
        this.closeContextMenu();
        this.checkStatusChange('tree');
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    this.toaster.warning({
                        title: '没有选中元素'
                    });

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'gradation',
                    vdistance: 120,
                    ready: (event) => {
                        const newPosition = elements.boundingBox();
                        const offset = {
                            x: oldPosition.x1 - newPosition.x1,
                            y: oldPosition.y1 - newPosition.y1
                        };
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {
                                x: pos.x + offset.x,
                                y: pos.y + offset.y
                            };
                        });

                        this.initNavigator();
                    },
                    fit: false
                });
            } else {
                layout = this.getVisibleElements().layout({
                    name: 'gradation',
                    vdistance: 120,
                    ready: (event) => {
                        event.cy.zoom(1);
                        event.cy.center();
                        this.initNavigator();
                    },
                    fit: false
                });
            }

            layout.run();
        }
    }

    /**
     * @description 切换环形图
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    changeCircle(e, layoutSelected) {
        e.stopPropagation();
        this.closeContextMenu();
        this.checkStatusChange('circle');
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    this.toaster.warning({
                        title: '没有选中元素'
                    });

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'concentric',
                    fit: false,
                    boundingBox: oldPosition,
                    levelWidth() {
                        return 1;
                    },
                    minNodeSpacing: 30,
                    ready: (event) => {
                        this.initNavigator();
                    }
                });
            } else {
                layout = this.getVisibleElements().layout({
                    name: 'concentric',
                    fit: false,
                    levelWidth() {
                        return 1;
                    },
                    minNodeSpacing: 30,
                    ready: (event) => {
                        event.cy.zoom(1);
                        event.cy.center();
                        this.initNavigator();
                    }
                });
            }

            layout.run();
        }
    }

    changeFlow(e, layoutSelected) {
        e.stopPropagation();
        let layout;
        this.closeContextMenu();
        this.checkStatusChange('flow');
        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    this.toaster.warning({
                        title: '没有选中元素'
                    });

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'flowDirection',
                    vdistance: 120,
                    ready: (event) => {
                        const newPosition = elements.boundingBox();
                        const offset = {
                            x: oldPosition.x1 - newPosition.x1,
                            y: oldPosition.y1 - newPosition.y1
                        };
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {
                                x: pos.x + offset.x,
                                y: pos.y + offset.y
                            };
                        });

                        this.initNavigator();
                    },
                    fit: false
                });
            } else {
                layout = this.getVisibleElements().layout({
                    name: 'flowDirection',
                    vdistance: 120,
                    ready: (event) => {
                        event.cy.zoom(1);
                        event.cy.center();
                        this.initNavigator();
                    },
                    fit: false
                });
            }

            layout.run();
        }
    }

    /**
     * @description 切换网格图
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    changeWeb(e, layoutSelected) {
        e.stopPropagation();
        let layout;
        this.closeContextMenu();
        this.checkStatusChange('web');
        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    this.toaster.warning({
                        title: '没有选中元素'
                    });
                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'grid',
                    boundingBox: oldPosition,
                    fit: false,
                    ready: () => {
                        this.initNavigator();
                    }
                });

            } else {
                layout = this.getVisibleElements().layout({
                    name: 'grid',
                    fit: false,
                    ready: (event) => {
                        event.cy.zoom(1);
                        event.cy.center();
                        this.initNavigator();
                    }
                });
            }

            layout.run();
        }
    }
    /**
     * @description 按钮状态变化时箭头指向
     *
     * @param {any} type
     * @memberof PorpoiseController
     */
    buttonStatusChange(type) {
        type && (this.buttonStatus[type] = !this.buttonStatus[type]);
        for (let key in this.buttonStatus) {
            if (key != type) {
                this.buttonStatus[key] = false;
            }
        }
    }

    /**
     * @description 图谱排列类型改变时高亮状态改变
     *
     * @param {any} type
     * @memberof PorpoiseController
     */
    checkStatusChange(type) {
        this.checkStatus[type] = true;
        for (let key in this.checkStatus) {
            if (key != type) {
                this.checkStatus[key] = false;
            }
        }
    }
    searchPersonGraph(dateParam,isFirst) {
        this.graphDateParam = dateParam
        //更改逻辑 搜索是按照目前选中的节点进行搜索
        this.getRelationGraphData();
        return false;
    }
    /**
     * @description 设置轨迹统计所需要的edges数据
     */
    setStatisticsAllEdges(edges) {
        this.graphStatisticsAllEdges = edges;
    }

    /**
     * @description 当点击某个轨迹的时候暴露出来key的列表
     */
    onSelectedGraphKeyList(keyList) {
        const edges = this.$cy.edges()
        this.hasEdgeSelected = true
        this.hasNodeConnected = true;
        this.porData.nodeStatistics = false;
        this.hasNodeSelected = false;
        const eles = this.$cy.elements()
        let selectedEdge = null
        if (keyList.length == 1) {
            const eventTarget = edges
                .filter(edge => {
                    return !edge.hasClass('hidden') && edge.data().id == keyList[0]
                })
            eventTarget.select()
            selectedEdge = this.$cy.edges(':selected')
            const connectedNodes = eventTarget.connectedNodes();
            const nodesData = connectedNodes.add(eventTarget);
            eles.difference(nodesData).addClass('opacity').removeClass('selected').unselect();
            this.porData.d3Data.reqData.showDetail = 'detail';
            this.hasMultiEdgeSelected = false
            this.porpoiseLineClick(event, eventTarget.data());
        } else {
            eles.removeClass('opacity').unselect().removeClass('selected');
            this.porData.d3Data.reqData.showDetail = 'count';
            angular.forEach(keyList, (i) => {
                const eventTarget = edges
                    .filter(edge => {
                        return !edge.hasClass('hidden') && edge.data().id == i
                    })
                eventTarget.select()
                selectedEdge = this.$cy.edges(':selected')
                eles.difference(eventTarget).difference(selectedEdge).difference(selectedEdge.connectedNodes()).addClass('opacity');
                eventTarget.removeClass("opacity").removeClass("unselected").addClass("selected")
                eventTarget.connectedNodes().removeClass("opacity")
                this.hasMultiEdgeSelected = true
            })
        }
        this.cstatistics(selectedEdge.connectedNodes())
        this.estatistics(selectedEdge)
        
    }
    /**
     * @desc 人员轨迹点击返回的时候暴露的事件
     */
    onGraphBack() {
        this.resetChoose()
    }

    parseEdgesForRealtion(edges,needSetEdges,fromEdgeClick){//需要传给请求轨迹信息接口的参数列表
        const params = {
            edges: []
        }
        params.edges = edges.filter(edge => !edge.hasClass('hidden')).map(edge => {
            const item = edge.data();
            return {
                from: item.from,
                to: item.to,
                type: item.type,
                id: item.id,
                ids:item.ids || [],
                dbType:item.dbType,
                eventId:item.eventId
            };
        });
        this.setRelationNode(params.edges,fromEdgeClick)
        // if(needSetEdges){
            this.setStatisticsAllEdges(params.edges) 
        // }
        
    }


    /**
     * @description 设置轨迹的数据
     */
    setRelationNode(edges,fromEdgeClick) {
        this.relationNodes = edges;
        if(fromEdgeClick){
            this.statisticsActiveEdges = edges
        }else if(this.statisticsActiveEdges.length != 0){
            this.statisticsActiveEdges = []
        }
        if (this.showFooter && this.showPersonGraphTab == 1) {
            this.getRelationGraphData()
        } else {
            return false;
        }
    }

    


    /**
     * @description 获取轨迹的数据
     */
    getRelationGraphData() {
        if(!this.graphDateParam){
            return false;
        }
        this.inject.get('util').innerLoadingStart('person-graph-main', '#24263C');
        this.inject.get('peopleService').getTrailInfo({
            fromSource: 'defGraphShot',
            edges: this.relationNodes,
            start: this.graphDateParam.start,
            end: this.graphDateParam.end,
        }).then(res => {
            this.inject.get('util').innerLoadingEnd();
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.personGraphData = {
                        data: res.data.data,
                        node: 'relationNode'
                    }
                }
            }
        })
    }

    playTip(key) {
        // 加载选中节点的省级轨迹数据
        const keyData = this.selectAllData[key];
        if(keyData && keyData.visible && keyData.data && keyData.data.length) {
            let allLabels = [];

            // 筛选与 key 对应的所有 labels
            keyData.data.forEach(d => {
                if (d.labels && d.labels.length) {
                    for(let i of d.labels){
                        if(i.key === key){
                            allLabels.push(i)
                        }
                    }
                }
            });

            if (allLabels.length === 0) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    // 开始播放
    playLine(key, e){
        e.stopPropagation();
        if (!this.playTip(key)) {
            this.toaster.warning({
                title: '该实体在gis上没有轨迹事件'
            });
            return false;
        }
        if (!this.selectAllData[key] || !this.selectAllData[key].visible || !this.selectAllData[key].data || this.selectAllData[key].data.length == 0) {
            this.toaster.warning({
                title: '该实体在gis上没有轨迹事件'
            });
            return false;
        }
        if(!this.gisKeysList[key]){
            this.gisKeysList[key] = {};
        }
        this.gisKeysList[key].show = true;
        this.gisKeysList[key].isPlaying = true;
        this.gisKeysList[key].showClearBtn = true;
        let trackLineLayer = this.gisKeysList[key] && this.gisKeysList[key].trackLineLayer;
        let trackPointLayer = this.gisKeysList[key] && this.gisKeysList[key].trackPointLayer;
        let isTrackLineFininsh = this.gisKeysList[key] && this.gisKeysList[key].isTrackLineFininsh;
        let isTrackPointFininsh = this.gisKeysList[key] && this.gisKeysList[key].isTrackPointFininsh;
        if(this.gisKeysList[key].isInit) {
            // 播放途中暂停，则继续播放
            if (isTrackLineFininsh) {
                if (isTrackPointFininsh) {
                   trackPointLayer && trackPointLayer.timeline.start();
                    this.gisKeysList[key].isTrackPointFininsh = false;
                } else {
                   trackPointLayer && trackPointLayer.timeline.start();
                }
            } else {
                trackLineLayer && trackLineLayer.timeline.start();
            }
        } else {
            for (let keys in this.gisKeysList) {
                if (this.gisKeysList[keys].isInit) {
                    this.clearLine(keys) //播放前先清除
                }
            }
            // 清除聚合图层
            this.gisMap.layers[0].set([], false);
            // 第一次播放
            this.gisKeysList[key].isInit = true;
            // 记录地图状态
            this.gisKeysList[key].mapViewPort = this.gisMap.map.getViewport();
            
            // 禁止地图缩放时请求数据
            this.isUpdateDataZoom = false;
            // 加载选中节点的省级轨迹数据
            const keyData = this.selectAllData[key];
            if(keyData && keyData.visible && keyData.data && keyData.data.length) {
                let allLabels = [];

                // 筛选与 key 对应的所有 labels
                keyData.data.forEach(d => {
                    if (d.labels && d.labels.length) {
                        for(let i of d.labels){
                            if(i.key === key){
                                allLabels.push(i)
                            }
                        }
                    }
                });

                if (allLabels.length) {
                    allLabels = JSON.parse(JSON.stringify(allLabels));

                    // 按地点分类
                    let areaKeyObj = {};
                    allLabels.forEach(item => {
                        if (!areaKeyObj[item.area]) {
                            areaKeyObj[item.area] = [];
                        }
                        areaKeyObj[item.area].push(item);
                    });

                    // 将同名地点经纬度设为一致
                    for (let a in areaKeyObj) {
                        if (areaKeyObj.hasOwnProperty(a) && areaKeyObj[a].length > 1) {
                            let lat = areaKeyObj[a][0].lat;
                            let lng = areaKeyObj[a][0].lng;
                            areaKeyObj[a].forEach((item, index) => {
                                if (index) {
                                    item.lat = lat;
                                    item.lng = lng;
                                }
                            });
                        }
                    }
                    // 每个地点内部事件按时间排序
                    for (let area in areaKeyObj) {
                        if (areaKeyObj.hasOwnProperty(area)) {
                            areaKeyObj[area].sort((a, b) => a.start - b.start);
                        }
                    }

                    // 构造图层点数据
                    let data = [];
                    for (let area in areaKeyObj) {
                        if (areaKeyObj.hasOwnProperty(area)) {
                            let item = areaKeyObj[area][0];
                            data.push({
                                lng: item.lng,
                                lat: item.lat,
                                labels: areaKeyObj[area],
                                count: 0
                            });
                        }
                    }

                    // 加载点图层
                    this.gisKeysList[key].allPointLayer = this.gisMap.addMapVLayer({
                        dataType: 'point',
                        data: data,
                        drawType: 'simple',
                        drawOptions: {
                            icon: {
                                url: '/assets/theme-sb/graph/timeplay-point.svg',
                                offsetX: 0,
                                offsetY: 0,
                                width: 16,
                                height: 16
                            }
                        }
                    });  

                    // 缩放地图到全国范围
                    this.gisMap.setCenterAndZoom( { lng: 109.449911, lat: 34.550079 }, 4);

                    //执行动画
                    // const cloneData = JSON.parse(JSON.stringify(allLabels));
                    this.gisMap.drawAnimationLayer(key, allLabels, this);
                }
            }
        }
        
    }

    // 暂停播放
    pauseLine(key) {
        this.gisKeysList[key].isPlaying = false;
        this.gisKeysList[key].showClearBtn = true;
        let trackLineLayer = this.gisKeysList[key] && this.gisKeysList[key].trackLineLayer;
        let trackPointLayer = this.gisKeysList[key] && this.gisKeysList[key].trackPointLayer;
        let isTrackLineFininsh = this.gisKeysList[key] && this.gisKeysList[key].isTrackLineFininsh;
        let isTrackPointFininsh = this.gisKeysList[key] && this.gisKeysList[key].isTrackPointFininsh;

        if (!isTrackLineFininsh) {
            trackLineLayer && trackLineLayer.timeline.pause();
        } else if (isTrackLineFininsh && !isTrackPointFininsh) {
            trackPointLayer && trackPointLayer.timeline.pause();
        }
        if (!this.$scope.$$phase) {
            this.$scope.$digest();
        }
    }
    
    // 清除动画
    clearLine(key,isFromClearBtn) {
        this.gisKeysList[key].isPlaying = false;
        this.gisKeysList[key].showClearBtn = false;
        this.gisKeysList[key].trackLineLayer && this.gisKeysList[key].trackLineLayer.timeline.cancel();
        this.gisKeysList[key].trackPointLayer && this.gisKeysList[key].trackPointLayer.timeline.cancel();
        this.gisMap.removeMapVLayer(this.gisKeysList[key].allPointLayer);
        this.gisMap.removeMapVLayer(this.gisKeysList[key].trackLineLayer);
        this.gisMap.removeMapVLayer(this.gisKeysList[key].trackPointLayer);

        this.gisMap.removeTextIcon();
        this.gisMap.removeRotateMarker();

        this.gisKeysList[key].isInit = false;
        this.gisKeysList[key].allPointLayer = null;
        this.gisKeysList[key].trackLineLayer = null;
        this.gisKeysList[key].trackPointLayer = null;
        this.gisKeysList[key].isTrackPointFininsh = false;
        this.gisKeysList[key].isTrackLineFininsh = false;
        this.isUpdateDataZoom = true;

        // 回到初始状态
        if(isFromClearBtn){
            this.previous = undefined;
            this.gisMap.layers[0].set([], true);
            let currentViewPort = this.gisMap.map.getViewport();
            let prevViewPort = this.gisKeysList[key].mapViewPort;
            if (currentViewPort.zoom === prevViewPort.zoom) {
                // 如果前后地图状态未改变，强制触发更新
                this.gisMap.map.zoomIn();
                this.gisMap.map.zoomOut();
            } else {
                this.gisMap.map.setViewport(this.gisKeysList[key].mapViewPort);
            }
        }
    }
    /**
     * @description 半径检索
     */
    circleSearch() {
        if(!this.isUpdateDataZoom && this.isUpdateDataZoom !== undefined){
            this.toaster.warning({
                title: '播放轨迹过程中不支持半径检索'
            });
            return;
        }
        const _this = this
        _this.isFromCircleSearch = true
        this.gisMap.drawCircle(function(e){
            // 画圆完成回调
            const center = e.center
            const radius = e.radius
            new circleSearchEntity(_this.inject, _this.porData.mapNodeTree).$promise.then((entityTree) => {
                if (entityTree) {
                    if(entityTree.allSelected || entityTree.showIndeterminate){
                            const type = entityTree.type
                            new circleSearchEvent(_this.inject, type, {}).$promise.then((eventTree) => {
                                const params = {
                                    "latitude":`${center.lat}`,
                                    "longitude":`${center.lng}`,
                                    "radius":`${radius}`,
                                    "entity": {
                                        "person": [],
                                        "phone": [],
                                        "company": [],
                                        "internetcafe": [],
                                        "vehicle": []
                                    },
                                    "dim": "province"
                                }
                                _this.getGeoData(params,eventTree,entityTree,true) 
                            })
                    }
                    
                }
                else{
                    _this.toaster.warning({
                        title: '已取消'
                    });
                }
                if(_this.gisMap){
                    _this.gisMap.clearCircle()
                }
            })
        });
    }
}
