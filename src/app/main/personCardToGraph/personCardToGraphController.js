import toast from '../../components/modal/toast/toast';
import cytoscape from '../../lib/cytoscape/cytoscape';
import cyGradation from '../../lib/cytoscape/cytoscape-gradation';
import cyFlowDirection from '../../lib/cytoscape/cytoscape-flow-direction';
import cytoCoseBilkent from '../../lib/cytoscape/cytoscape-cose-bilkent';
import cyQtip from '../../lib/cytoscape/cytoscape-qtip';
import screenfull from 'screenfull';

export class personCardToGraphController {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.toaster = this.inject.get('toaster');
        this.statisticsDebounce = _.debounce(this.statistics.bind(this), 300);

        this.init();
    }

    init() {
        this.initChromeMenu();
        this.initRelation();
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

    initRelation(graph) {
        const porpoiseService = this.inject.get('porpoiseService');
        const $state = this.inject.get('$state');
        const cache = this.inject.get('cache');
        const personList = cache.getPeronCardToGraphDataCache();

        this.porData = {
            nodeStatistics: false,
            componentsCount: 1,
            fullScreenShowRight: false,
            trailGraphData: {},
            searchWord: '',
            zoomShowAll: true, //缩放全部显示
            searchNodeList: [],
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
                strokeStyle: '#5182E4',
                fillStyle: 'rgba(81, 130, 228, 0.1)',
                rect: {
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0
                }
            },
            comparison: [
                {
                    value: '=',
                    name: '='
                },
                {
                    value: '<',
                    name: '<'
                },
                {
                    value: '>',
                    name: '>'
                },
                {
                    value: '<=',
                    name: '<='
                },
                {
                    value: '>=',
                    name: '>='
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
            d3Config: {},
            viewConfig: {
                showSearch: 'normal'
            },
            d3Data: {
                showSameEdgeLinkData: false,
                nodes: []
            }
        };

        this.porData.defaultFilterJSON = JSON.stringify(this.porData.defaultFilter);

        this.porData.d3Data.reqData = {
            showDetail: 'count',
            detailTypeMap: porpoiseService.getEventMap()
        };

        const params = {
            keyList: personList,
            edgeCollections: ""
        };

        this.init_d3_data(params, 'init');
    }

    /**
     * @description 初始化D3数据
     * @param {*} type
     * @param {*} data
     */
    init_d3_data(data, type) {
        this.init_porpoise(data);
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
        let $location = this.inject.get('$location');
        let $state = this.inject.get('$state');
        let porpoiseService = this.inject.get('porpoiseService');
        let promise = Q.defer();
        const service = this.inject.get('loginService');

        service.getPersonCardGraph(globalLoading(data)).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.porData.isForbidden = res.data.data.isForbidden;
                    if (res.data.data && ((res.data.data.vertices && res.data.data.vertices.length > 0) || (res.data.data.edges && res.data.data.edges.length > 0))) {
                        this.set_por_data(res);
                        promise.resolve();
                    } else {
                        // new toast(this.inject, {str: '未获取更多实体和关系'}).warn();
                        this.toaster.pop({type:'warning',title:'未获取更多实体和关系'});
                    }
                }
            }
        });
        return promise.promise;
    }

    init_graph(graph, type) {
        let init = false;

        if (!this.$cy) {
            const $state = this.inject.get('$state');
            const isSnapShot = $state.params.type === 'snapshot';
            init = true;

            const elements = {
                nodes: this._formatElements(graph.vertices, 'nodes'),
                edges: this._formatElements(graph.edges, 'edges')
            };
            this.$cy = cytoscape({
                container: $('.jq_relation_d3').get(0),
                zoom: 1,
                minZoom: 0.1,
                maxZoom: 3,
                elements,
                boundingBox: {x1: 0, y1: 0, w: 3200, h: 2200},
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
        }
        else {
            this._differenceRenewal(graph, type);
        }

        this.$cy.edges().forEach(i => {
            if (i.data().isArrow == 1 || i.data().dataType === '0000') {
                i.addClass('has-arrow')
            }

            if (i.data().times && Number(i.data().times) > 1) {
                const size = (Number(i.data().times) - 1) * 0.5 + 1;

                i.style('width', size > 10 ? 10 : size);
            }
        });

        this.statistics(this.$cy.elements());

        const maxDegree = this.$cy.nodes().maxDegree();
        const minDegree = this.$cy.nodes().minDegree();

        this.$cy.nodes().forEach((node) => {
            const size = maxDegree !== minDegree ? (node.degree() - minDegree) / (maxDegree - minDegree) * 30 + 30 : 40;

            node.style('height', size);
            node.style('width', size);

            if(node.data().isImport === '1') {
                node.addClass('hexagon');
            }

            switch (node.data().dataType) {
                case '0102':
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
                            event: 'mouseout'
                        },
                        style: {
                            classes: 'qtip-red',
                            style: {
                                width: 10
                            }
                        }
                    });
                    break;
                default:
                    node.removeClass('import_people');
                    break;
            }
        });

        if (!init) {
            const layout = this.$cy.elements().layout({
                name: 'cose-bilkent',
                nodeDimensionsIncludeLabels: true,
                ready: (event) => {
                    if (type !== 'delete') {
                        this.updateFilterEdgesAndNodes();
                    }
                    this.$cy.center();
                    this.$cy.nodes().unlock();
                    this.initNavigator();
                },
                animate: false,
                fit: false,
                idealEdgeLength: 120
            });

            layout.run();
        }
    }

    initGraphEvent() {
        const $timeout = this.inject.get('$timeout');

        this.$cy.on('zoom', (event) => {
            event.cy.nodes().forEach((node) => {
                node.style('background-image', `url(${this._getNodeImage(node.data(), event.cy.zoom())})`);
            });
            this.updateNodesZoomingVisibility();
            this.updateZoomTrack();
        });

        this.$cy.on('cxttap', 'node', (event) => {
            this.porpoiseItemRightClick(event.originalEvent, event.target.data());
        });

        this.$cy.on('click', 'node', (event) => {
            if (!event.originalEvent.metaKey && !event.originalEvent.ctrlKey) {
                this.porpoiseItemClick(event, event.target.data());
            }
        });

        this.$cy.on('mouseover', 'node', (event) => {
            const linkData = event.target.connectedEdges().add(event.target.connectedEdges().connectedNodes());

            this.$cy.elements().difference(linkData).addClass('opacity');
        });

        this.$cy.on('mouseout', 'node', (event) => {
            this.$cy.elements('.opacity').removeClass('opacity');
        });

        this.$cy.on('click', 'edge', (event) => {
            this.porData.d3Data.showSameEdgeLinkData = false;
            this.porpoiseLineClick(event, event.target.data());
        });

        this.$cy.container().addEventListener('click', (event) => {
            this.$cy.container().focus();
        });

        this.$cy.container().addEventListener('contextmenu', (event) => {
            this.$cy.container().focus();
        });

        this.$cy.container().addEventListener('keydown', (event) => {
            const code = event.which || event.keyCode;

            if (code === 46) {
                if (event.ctrlKey) {
                    this.inverseDelete(event);
                } else {
                    this.deleteItem(event);
                }
            }
        });

        this.$cy.on('pan', () => {
            if (this.porData.navigator.show) {
                this.initNavigatorThrottle();
            }
        });

        this.$cy.on('drag', 'node', () => {
            if (this.porData.navigator.show) {
                this.initNavigatorThrottle();
            }
        });

        this.$cy.on('select', 'node', () => {
            this.porData.nodeStatistics = true;
            this.statisticsDebounce(this.$cy.nodes(':selected'));
        });

        this.$cy.on('unselect', 'node', () => {
            if (this.$cy.nodes(':selected').empty()) {
                this.porData.nodeStatistics = false;
                this.statisticsDebounce(this.$cy.elements());
            } else {
                this.porData.nodeStatistics = true;
                this.statisticsDebounce(this.$cy.nodes(':selected'));
            }
        });

        if (screenfull.enabled) {
            screenfull.on('change', (event) => {
                $(event.target).toggleClass('screen-full', screenfull.isFullscreen);
                $('.graph-full-screen-btn').toggleClass('screen-full', screenfull.isFullscreen);
                this.$cy.resize();

                if (this.porData.navigator.isShow) {
                    $timeout(() => {
                        this.switchNavigator(!screenfull.isFullscreen);
                    }, 10);
                }
            });
        }

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
                                renderedPosition: {x: this.$cy.width() / 2, y: this.$cy.height() / 2}
                            });
                        }
                    }
                });

                graphContent.on('mouseup.scale', event => {
                    const move = event.clientX - trackContentBox.x;


                    graphContent.off('mousemove.scale');
                    graphContent.off('mouseup.scale');
                });
            }
        });
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

    /**
     * @description 切换关系图
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    changeNormal(e, layoutSelected) {
        e.stopPropagation();
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    // new toast(this.inject, {str: '没有选中元素'}).warn();
                    this.toaster.pop({type:'warning',title:'没有选中元素'});

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'cose-bilkent',
                    nodeDimensionsIncludeLabels: true,
                    ready: (event) => {
                        const newPosition = elements.boundingBox();
                        const offset = {x: oldPosition.x1 - newPosition.x1, y: oldPosition.y1 - newPosition.y1};
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {x: pos.x + offset.x, y: pos.y + offset.y};
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
                        this.initNavigator('init');
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
     * @description 切换网格图
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    changeWeb(e, layoutSelected) {
        e.stopPropagation();
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    // new toast(this.inject, {str: '没有选中元素'}).warn();
                    this.toaster.pop({type:'warning',title:'没有选中元素'});

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'grid',
                    boundingBox: oldPosition,
                    fit: false,
                    ready: (event) => {
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
                        this.initNavigator('init');
                    }
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
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    // new toast(this.inject, {str: '没有选中元素'}).warn();
                    this.toaster.pop({type:'warning',title:'没有选中元素'});

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'gradation',
                    vdistance: 120,
                    ready: (event) => {
                        const newPosition = elements.boundingBox();
                        const offset = {x: oldPosition.x1 - newPosition.x1, y: oldPosition.y1 - newPosition.y1};
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {x: pos.x + offset.x, y: pos.y + offset.y};
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
                        this.initNavigator('init');
                    },
                    fit: false
                });
            }

            layout.run();
        }
    }

    changeFlow(e, layoutSelected) {
        e.stopPropagation();
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    // new toast(this.inject, {str: '没有选中元素'}).warn();
                    this.toaster.pop({type:'warning',title:'没有选中元素'});

                    return;
                }
                const oldPosition = elements.boundingBox();

                layout = elements.layout({
                    name: 'flowDirection',
                    vdistance: 120,
                    ready: (event) => {
                        const newPosition = elements.boundingBox();
                        const offset = {x: oldPosition.x1 - newPosition.x1, y: oldPosition.y1 - newPosition.y1};
                        elements.nodes().positions((node) => {
                            const pos = node.position();

                            return {x: pos.x + offset.x, y: pos.y + offset.y};
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
                        this.initNavigator('init');
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
        let layout;

        if (this.$cy) {
            if (layoutSelected || e.altKey) {
                const elements = this.getSelectedNodesAndConnectedEdges();
                if (elements.empty()) {
                    // new toast(this.inject, {str: '没有选中元素'}).warn();
                    this.toaster.pop({type:'warning',title:'没有选中元素'});

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
                        this.initNavigator('init');
                    }
                });
            }

            layout.run();
        }
    }

    /**
     * @description 统计
     * @param {*} graph
     */
    statistics(elements) {
        this.porData.verticesSum = 0;
        this.porData.verticesTypeCountOpen = true;
        this.porData.nodeTree = [];
        const nodeMap = {};
        const nodeTree = {};

        elements.nodes().forEach(node => {
            const item = node.data();

            nodeMap[node.id()] = item;

            if (!nodeTree[item.type]) {
                nodeTree[item.type] = {
                    child: {},
                    type: item.type,
                    label: item.typeLabel,
                    sum: 0
                };
            }

            if (!nodeTree[item.type].child[item.dataType]) {
                nodeTree[item.type].child[item.dataType] = {
                    child: [],
                    label: item.dataLabel,
                    type: item.dataType,
                    sum: 0
                };
            }
            nodeTree[item.type].child[item.dataType].child.push(item);
            nodeTree[item.type].child[item.dataType].sum++;
            nodeTree[item.type].sum++;
        });

        this.porData.nodeTree = nodeTree;
        this.porData.verticesSum = elements.nodes().size();


        this.porData.edgesSum = 0;
        this.porData.edgesTypeCountOpen = true;

        const oldEdgeTree = JSON.parse(JSON.stringify(this.porData.edgeTree));
        const edgeTree = {};

        elements.edges().forEach(edge => {
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
                        label: item.typeLabel,
                        show: true,
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
                        label: item.dataType !== '0000' ? item.dataLabel : '自定义关系',
                        type: itemDataType,
                        show: true,
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
        this.porData.edgesSum = elements.edges().size();
        this.porData.componentsCount = elements.components().length;

        const $timeout = this.inject.get('$timeout');
        $timeout(() => {
            // refresh
        });
    }

    fullScreen() {
        if (screenfull.enabled) {
            this.porData.fullScreenShowRight = false;
            screenfull.toggle(document.getElementById('graph-full-screen-node'));
        }
    }

    /**
     * @description 格式化
     */
    _formatElements(items, group) {
        return items.map(i => (this._formatElementData(i, group)));
    }

    _formatElementData(item, type) {
        const element = {};

        if (type === 'edges') {
            element.data = Object.assign({}, item, {
                source: item.from,
                target: item.to,
                labelFormat: `${item.customDataLabel || (item.dataLabel || '')}${item.times && Number(item.times) > 1 ? `（${item.times}次）` : ''}`
            });
        } else if (type === 'nodes') {
            element.data = item;
            element.classes = `node-bk-${(Number(item.type) - 1) % 6}`;
            element.style = {
                'background-image': `url(${this._getNodeImage(item, 1)})`
            }
        }

        return element;
    }

    _getNodeImage(item, zoom) {
        let url = '';

        function _elementTypeImage(data) {
            return `assets/images/theme_star_blue/graph/entity-${data.dataType}.png`;
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

        return [
            {
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
                    'background-color': '#5182e4',
                    'background-fit': 'cover',
                    'border-color': '#5182E4',
                    'border-width': 1,
                    'border-opacity': 0.3,
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
                    color: isStarBlue ? 'rgba(238, 26, 26, 0.8)' : 'rgba(243, 39, 39, .8)',
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
                    opacity: 0.4
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    width: 1,
                    'line-color': '#5182e4',
                    label: 'data(labelFormat)',
                    'text-rotation': "autorotate",
                    'font-size': 12,
                    color: '#5182e4',
                    'text-margin-y': -10,
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 2,
                    'border-opacity': isStarBlue ? 0.8 : 0.4,
                    'border-color': isStarBlue ? '#fff' : '#000'
                }
            },
            {
                selector: 'node.search-node',
                style: {
                    'overlay-color': isStarBlue ? 'white' : '#5182e4',
                    'overlay-opacity': 0.3
                }
            },
            {
                selector: 'edge.has-arrow',
                style: {
                    'target-arrow-shape': 'triangle',
                    // 'target-arrow-fill': '#5182e4',
                    'target-arrow-color': '#5182e4'
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
            {selector: '.node-bk-0', style: {'background-color': '#5182e4'}},
            {selector: '.node-bk-1', style: {'background-color': '#165DA6'}},
            {selector: '.node-bk-2', style: {'background-color': '#2480A6'}},
            {selector: '.node-bk-3', style: {'background-color': '#199376'}},
            {selector: '.node-bk-4', style: {'background-color': '#30A1AF'}},
            {selector: '.node-bk-5', style: {'background-color': '#3435A7'}},
        ]
    }


    updateNodesZoomingVisibility() {
        const maxDegree = this.$cy.nodes().maxDegree();
        const minDegree = this.$cy.nodes().minDegree();
        const nowZoom = this.$cy.zoom();

        if (this.porData.zoomShowAll) {
            this.$cy.nodes().removeClass('zoom-hidden');
        } else {
            this.$cy.nodes().forEach(node => {
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
                renderedPosition: {x: this.$cy.width() / 2, y: this.$cy.height() / 2}
            });

            this.updateZoomTrack();
        }
    }

    zoomOut() {
        if (this.$cy) {

            this.$cy.zoom({
                level: this.$cy.zoom() + 0.5,
                renderedPosition: {x: this.$cy.width() / 2, y: this.$cy.height() / 2}
            });

            this.updateZoomTrack();
        }
    }

    searchNode() {
        this.$cy.nodes().removeClass('search-node');

        if (this.porData.searchWord.trim().length) {
            this.$cy.nodes().filter(node => {
                const item = node.data();

                return (item.name && item.name.indexOf(this.porData.searchWord) !== -1) || (item.key && item.key.indexOf(this.porData.searchWord) !== -1);
            }).addClass('search-node');

            if (this.$cy.nodes('.search-node').empty()) {
                // new toast(this.inject, {str: '未搜索到结果'}).warn();
                this.toaster.pop({type:'warning',title:'未搜索到结果'});

                this.porData.searchNodeList = [];
            } else {
                if (this.$cy.nodes('.search-node').size() === 1) {
                    this.$cy.center(this.$cy.nodes('.search-node'));
                    this.porData.searchNodeList = [];
                } else {
                    this.porData.searchNodeList = this.$cy.nodes('.search-node').map(node => node.data());
                }
            }
        } else {
            this.porData.searchNodeList = [];
        }
    }

    getVisibleElements() {
        return this.$cy.elements().diff('.hidden').left;
    }

    initNavigator(type) {
        if (!this.porData.navigator.show) {
            return;
        }
        const imgBase64 = this.$cy.png({full: true, scale: 0.2});
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

    porpoiseItemRightClick(event, d) {
        const timeout = this.inject.get('$timeout');
        if (!this.porData.viewConfig.showMenuFloat) {
            this.porData.viewConfig.showMenuFloat = true;
            angular.element('.jq_float_menu').css('top', event.offsetY).css('left', event.offsetX);
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
        if (!e.target.selected()) {
            this.getNodeDetail(d);
        }
    }

    /**
     * @description 获取实体详情
     * @param d
     * @param type
     */
    getNodeDetail(d) {
        this.porData.d3Data.reqData.showDetail = 'detail';
        this.porData.d3Data.reqData.showDetailType = 'node';
        this.inject.get('porpoiseService').getNodeDetail_out(d.id).then((res) => {
            console.log(res.data)
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.porData.nodeDetail = res.data;
                }
            }
        });
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
            // new toast(this.inject, {str: '无法查询自定义关系'});
            this.toaster.pop({type:'error',title:'无法查询自定义关系'});

            return;
        }
        this.porData.d3Data.reqData.showDetail = 'detail';
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
    }

    /**
     * @description 实体展开
     *
     * @param {any} e
     * @memberof PorpoiseController
     */
    collspanBean(e) {
        e.stopPropagation();
        const $state = this.inject.get('$state');
        const $location = this.inject.get('$location');
        const cache = this.inject.get('cache');
        const personList = cache.getPeronCardToGraphDataCache();

        if (this.porData.viewConfig.chooseItemType === 'node') {
            const params = {
                idList: [this.porData.viewConfig.choosePorpoiseItem.id],
                // keyList: personList,
                edgeCollections: ""
            };

            this.closeContextMenu();
            this.init_d3_data(params, 'update');
        }
    }

    closeContextMenu() {
        this.porData.menu.showSelect = false;
        this.porData.menu.showLayout = false;
        this.porData.viewConfig.showMenuFloat = false;
        angular.element('.jq_float_menu').css('transform', 'translate(-50%, -50%) scale(0)');
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

    _differenceRenewal(graph, type) {
        const existNodesMap = {};
        const existEdgesMap = {};
        const newNodesMap = {};
        const newEdgesMap = {};
        const addNodes = [];
        const addEdges = [];
        let removeElements = this.$cy.collection();

        graph.vertices = graph.vertices || [];
        graph.edges = graph.edges || [];

        this.$cy.nodes().forEach((ele) => {
            const item = ele.data();
            existNodesMap[item.id] = ele;
        });

        this.$cy.edges().forEach((ele) => {
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
        }
        else {

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
                this.$cy.nodes().forEach(function (ele) {
                    const item = ele.data();
                    if (!newNodesMap[item.id]) {
                        removeElements = removeElements.add(ele);
                    }
                });

                this.$cy.edges().forEach(function (ele) {
                    const item = ele.data();
                    if (!newEdgesMap[item.id]) {
                        removeElements = removeElements.add(ele);
                    }
                });
            }

        }

        this.$cy.nodes().lock();

        const addElements = this.$cy.add({
            nodes: addNodes,
            edges: addEdges
        });

        this.$cy.remove(removeElements);
    }

    updateFilterEdgesAndNodes() {
        const hiddenEdgeMap = {};

        angular.forEach(this.porData.edgeTree, function (edge) {
            angular.forEach(edge.child, e => {
                hiddenEdgeMap[e.type] = {
                    filter: e.show ? (JSON.stringify(e.filter) === e.filterJSON ? e.filter : null) : null
                };
            });
        });

        this.$cy.elements().removeClass('hidden');

        this.$cy.edges().filter(edge => {
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
                                    if (item.times != undefined) {
                                        hide = !this.compareNumber(config.filter[key].compare, Number(item.times), Number(config.filter[key].number));
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

        this.$cy.nodes().filter(node => {
            return !node.connectedEdges().empty() && node.connectedEdges().filter(edge => !edge.hasClass('hidden')).empty();
        }).addClass('hidden');
    }

    /**
     * @description 关系收回
     * @param {*event} e
     */
    regain(e) {
        e.stopPropagation();
        if (this.porData.viewConfig.chooseItemType === 'node') {

            // this.inject.get('porpoiseService').regain({
            //     id: this.porData.viewConfig.choosePorpoiseItem.id
            // }).then((res) => {
            //     if (res.status === 200) {
            //         if (res.data.status === 0) {
            //             this.closeContextMenu();
            //             new toast(this.inject, {str: '关系收回成功'}).success();
            //             this.set_por_data(res, 'delete');
            //         }
            //     }
            // })
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

        if (chooseItemList.length >= 2) {
            let req = chooseItemList.map(item => item.id);

            let vertices = this.$cy.nodes().map(node => node.data());
            let edges = this.$cy.edges().map(node => node.data());

            porpoiseService.getLineRelation_out({
                data: {
                    edges: edges,
                    vertices: vertices
                },
                entityids: req
            }).then((res) => {
                if (res.data && res.data.data) {
                    if ((res.data.data.vertices && res.data.data.vertices.length) || (res.data.data.edges && res.data.data.edges.length)) {
                        // new toast(this.inject, {str: '关系推演成功'}).success();
                        this.toaster.pop({type:'success',title:'关系推演成功'});

                        this.set_por_data(res);
                    } else {
                        // new toast(this.inject, {str: '未获取到关系'}).warn();
                        this.toaster.pop({type:'warning',title:'未获取到关系'});

                    }
                }
            });
            this.closeContextMenu();
        } else {
            // new toast(this.inject, {
            //     str: '请选择两个及以上实体'
            // }).error();
            this.toaster.pop({type:'error',title:'请选择两个及以上实体'});

        }
    }

    /**
     * @description 删除选中节点
     * @param {*} e
     */
    deleteItem(e) {
        e.stopPropagation();
        let deleteNodeList = [];
        let deleteLinkList = [];
        const chooseItemList = this.getChosenNodes();

        // if (chooseItemList.length > 0) {
        //     deleteNodeList = chooseItemList;
        //     deleteLinkList = this.$cy.$(':selected').connectedEdges().map(edge => edge.data());
        //
        //     this.closeContextMenu();
        //     this.set_por_data({
        //         data: {
        //             data: {
        //                 vertices: deleteNodeList,
        //                 edges: deleteLinkList
        //             }
        //         }
        //     }, 'delete');
        //     this.inject.get('porpoiseService').deleteNode(deleteNodeList.map(node => node.id)).then((res) => {
        //         new toast(this.inject, {
        //             str: '删除成功'
        //         }).success();
        //     });
        //
        //     this.resetChoose();
        // }
        // else {
        //     new toast(this.inject, {
        //         str: '请选择实体'
        //     }).error();
        // }
    }

    getChosenNodes() {
        const nodes = [];

        this.$cy.$('node:selected').forEach(node => {
            nodes.push(node.data());
        });

        return nodes;
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

    chooseNodes(item, $event) {
        $event.stopPropagation();

        if (item.type.length <= 2) {
            this.$cy.nodes().unselect();
            this.$cy.nodes().filter(node => node.data('type') === item.type).select();
        } else {
            this.$cy.nodes().unselect();
            this.$cy.nodes().filter(node => node.data('dataType') === item.type).select();
        }
    }

    /**
     * @description 获取关系数据
     *
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
            to: data.to
        };

        if (data.caseNum) {
            params.caseNum = data.caseNum;
        }

        this.inject.get('porpoiseService').getLinkData_out(params).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    promise.resolve(res.data.data);
                }
            }
        });
        return promise.promise;
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
}
