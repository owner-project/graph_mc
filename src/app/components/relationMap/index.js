import cytoscape from '../../lib/cytoscape/cytoscape';

export function RelationMapGraph($rootScope, porpoiseService, $q,$timeout,$injector) {
    'ngInject';

    let linkFuc = (scope, element, attr) => {
        let cy = null;
        scope.$type = scope.type || 'normal';
        scope.$depth = 1;
        scope.baseUrl = '';
        scope.$mode = scope.mode || 'root-expand';
        scope.$feature = {
            tagSelect: angular.isDefined(attr.tagSelectEnabled),
            depthExpand: angular.isDefined(attr.depthExpandEnabled)
        };

        scope.$tags = [];

        scope.$expendMap = function (depth) {
            $injector.get('util').innerLoadingStart('relation-map-directive-wrap','#24263C');
            if (depth === scope.$depth) {
                porpoiseService.initPorpoise().then(() => {
                    _expend(scope.rootId, 1).then(result => {
                        _initGraph(result);
                        scope.$depth = 1;
                        $injector.get('util').innerLoadingEnd();
                    }, error => {
                        //
                    });
                });
            } else {
                porpoiseService.initPorpoise().then(() => {
                    _expend(scope.rootId, depth).then(result => {
                        _initGraph(result);
                        scope.$depth = depth;
                        $injector.get('util').innerLoadingEnd();
                    }, error => {
                        //
                    });
                });
            }

        };

        const _makeStyleSheet = function () {
            const isStarBlue = $('body').hasClass('theme_star_blue');
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
                {
                    selector: '.node-bk-0',
                    style: {
                        // 'background-color': '#5182FF'
                    }
                },
                {
                    selector: '.node-bk-1',
                    style: {
                        // 'background-color': '#165DA6'
                    }
                },
                {
                    selector: '.node-bk-2',
                    style: {
                        // 'background-color': '#2480A6'
                    }
                },
                {
                    selector: '.node-bk-3',
                    style: {
                        // 'background-color': '#199376'
                    }
                },
                {
                    selector: '.node-bk-4',
                    style: {
                        // 'background-color': '#30A1AF'
                    }
                },
                {
                    selector: '.node-bk-5',
                    style: {
                        // 'background-color': '#3435A7'
                    }
                },
            ]
        };

        const _expend = function (id, depth) {
            const defer = $q.defer();

            const params = {
                depth,
                id,
                start: 0
            };
            if (scope.graphName) {
                params.graphName = scope.graphName;
            }
            porpoiseService.getPorpoiseData(params).then(result => {
                if (result.data && result.data.data) {
                    defer.resolve(result.data.data);
                }
            }, error => {
                defer.reject();
            });

            return defer.promise;
        };

        const _getNodeImage = function (item, zoom) {
            let url = '';

            function _elementTypeImage(data) {
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
        };

        function _formatElementData(item, type) {
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
                element.classes = `node-bk-${(Number(item.type) - 1) % 6}`;
                element.style = {
                    'background-image': _getNodeImage(item, 1)
                }
            }

            return element;
        }

        const _setNodeTagSelect = function () {
            if (!scope.$feature.tagSelect) return;
            const tags = {};

            scope.$tags.forEach(item => {
                if (item.selected) {
                    tags[item.value] = true;
                }
            });

            cy.nodes().unselect();
            cy.nodes().filter(function (node) {
                return tags[node.data().dataType];
            }).select();
        };

        const _differenceRenewal = function (graph, refresh) {
            const existNodesMap = {};
            const existEdgesMap = {};
            const newNodesMap = {};
            const newEdgesMap = {};
            const addNodes = [];
            const addEdges = [];
            let removeElements = cy.collection();

            cy.nodes().forEach((ele) => {
                const item = ele.data();
                existNodesMap[item.id] = ele;
            });

            cy.edges().forEach((ele) => {
                const item = ele.data();
                existEdgesMap[item.id] = ele;
            });

            graph.vertices.forEach((item) => {
                if (item.id) {
                    addNodes.push(_formatElementData(item, 'nodes'));
                }

                if (refresh) {
                    newNodesMap[item.id] = true;
                }
            });

            graph.edges.forEach((item) => {
                if (item.id) {
                    addEdges.push(_formatElementData(item, 'edges'))
                }

                if (refresh) {
                    newEdgesMap[item.id] = true;
                }
            });

            if (refresh) {
                cy.nodes().forEach(function (ele) {
                    const item = ele.data();
                    if (!newNodesMap[item.id] || (existNodesMap[item.id] && newNodesMap[item.id])) {
                        removeElements = removeElements.add(ele);
                    }
                });

                cy.edges().forEach(function (ele) {
                    const item = ele.data();
                    if (!newEdgesMap[item.id] || (existEdgesMap[item.id] && newEdgesMap[item.id])) {
                        removeElements = removeElements.add(ele);
                    }
                });
            }



            if (!attr.noLock) {
                cy.nodes().lock();
            }

            cy.remove(removeElements);

            cy.add({
                nodes: addNodes,
                edges: addEdges
            });

            const layout = cy.elements().layout({
                name: 'cose',
                ready(event) {
                    event.cy.center();
                    event.cy.nodes().unlock();
                },
                fit: false,
                idealEdgeLength: 150
            });

            layout.run();
        };

        const _formatElements = function (items, group) {
            return items.map(i => (_formatElementData(i, group)));
        };

        const _initGraph = function (graph) {
            if (!cy) {
                const elements = {
                    nodes: _formatElements(graph.vertices, 'nodes'),
                    edges: _formatElements(graph.edges, 'edges')
                };

                cy = cytoscape({
                    container: element.find('div.map-content').get(0),
                    zoom: 1,
                    minZoom: 0.1,
                    maxZoom: 3,
                    elements,
                    boxSelectionEnabled: !attr.single,
                    style: _makeStyleSheet(),
                    layout: {
                        name: 'cose',
                        ready(event) {
                            event.cy.zoom(1);
                            event.cy.center();
                        },
                        fit: false,
                        idealEdgeLength: 120
                    }
                });

                cy.on('zoom', (event) => {
                    event.cy.nodes().forEach((node) => {
                        node.style('background-image', _getNodeImage(node.data(), event.cy.zoom()));
                    });
                });

                cy.on('click', 'node', (event) => {
                    if (attr.single && !event.cy.elements(':selected').empty()) {
                        event.cy.elements().unselect();
                    }
                    attr.onClickNode && scope.onClickNode({
                        data: event.target.data()
                    });
                });

                cy.on('click', 'edge', (event) => {
                    if (attr.single && !event.cy.elements(':selected').empty()) {
                        event.cy.elements().unselect();
                    }
                    attr.onClickLink && scope.onClickLink({
                        data: event.target.data()
                    });
                });

                cy.on('unselect', (event) => {
                    scope.$unSelectAll();
                });
            } else {
                _differenceRenewal(graph, true);
            }

            cy.edges().filter(edge => {
                return edge.data('isArrow') == 1 || edge.data('dataType') === '0000';
            }).addClass('has-arrow');

            cy.nodes().removeClass('octagon');
            cy.nodes().filter(node => node.data().dataType === '0102').addClass('octagon');
            if (scope.$feature.tagSelect) {
                const tags = {};
                const existTags = {};

                scope.$tags.forEach(item => {
                    existTags[item.value] = true;
                });

                cy.nodes().forEach(ele => {
                    const item = ele.data();
                    if (!existTags[item.dataType]) {
                        existTags[item.dataType] = true;
                        scope.$tags.push({
                            selected: false,
                            value: item.dataType,
                            label: item.dataLabel
                        });
                    }
                    tags[item.dataType] = true;
                });

                for (let i = 0; i < scope.$tags.length; i++) {
                    const item = scope.$tags[i];
                    if (!tags[item.value]) {
                        scope.$tags.splice(i, 1);
                        i--;
                    }
                }
            }
        };
        const _initExpand = function () {
            porpoiseService.initPorpoise().then(() => {
                _expend(scope.rootId, 0).then(result => {
                    _initGraph(result);
                    cy.style(_makeStyleSheet());
                    $timeout(() => {
                        scope.baseUrl = cy.png({full: true, scale: 1})
                    },400)
                }, error => {
                    //
                });
            });
        };

        if (scope.$mode === 'root-expand') {
            _initExpand();
        } else if (scope.$mode === 'node-link') {
            scope.$watchGroup(['nodes', 'links'], () => {
                _initGraph({
                    vertices: scope.nodes,
                    edges: scope.links
                });
            });
        }

        scope.$unSelectAll = _.debounce(function () {
            if (cy && cy.elements(':selected').empty()) {
                attr.onUnselectAll && scope.onUnselectAll();
            }
        }, 100);
        scope.$clickMap = function () {
            scope.$unSelectAll();
        };
        scope.$selectTag = function (tag) {
            tag.selected = !tag.selected;
            _setNodeTagSelect();
        };

        const cancel = $rootScope.$on('updateTheme', () => {
            cy.style(_makeStyleSheet());
        });

        scope.$on('$destroy', function () {
            cancel();

            if (cy) {
                cy.destroy();
                cy = null;
            }
        });
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            nodes: '=',
            links: '=',
            baseUrl: '@',
            mode: '@',
            rootId: '@',
            type: '@',
            graphName: '@',
            onClickNode: '&',
            onClickLink: '&',
            onUnselectAll: '&'
        },
        templateUrl: 'app/components/relationMap/template.html',
        link: linkFuc
    };

    return directive;
}
