const defaults = {
    closenessWeight: 0.5,
    degreeWeight: 1,
    betweennessWeight: 1.5,
    hdistance: 60,
    vdistance: 100,
    step: 0.05,
    minLevel: 3,
    maxLevel: 20,

    // general layout options
    fit: true, // whether to fit to viewport
    padding: 30, // fit padding
    spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    nodeDimensionsIncludeLabels: undefined, // whether labels should be included in determining the space used by a node (default true)
    animate: false, // whether to transition the node positions
    animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
    ready: function(){}, // on layoutready
    stop: function(){} // on layoutstop
};

function GradationLayout(options) {
    this.options = Object.assign({}, defaults, options);
}

GradationLayout.prototype.run = function () {

    // console.log('endPosition:', Date.now());

    const options = this.options;
    const cy = options.cy; // cy is automatically populated for us in the constructor
    const eles = options.eles;
    const components = eles.components();

    components.forEach(component => {
        this.positionComponents(component);
    });

    this.separateComponents(components);

    eles.nodes().layoutPositions(this, options, function (node, index) {
        return node.scratch('position');
    });

    return this;
};


GradationLayout.prototype.separateComponents = function (components) {
    var boxlist = [];
    var componentSeparation = 400;

    components.sort((a, b) => {
        return b.size() - a.size();
    });

    boxlist[0] = this.getComponentBoundingBox(components[0].nodes());

    var startX = boxlist[0].x;
    var lineBox = [boxlist[0]];
    var MAX_WIDTH = 5000;

    function getMaxY(boxes) {
        let maxY = -Infinity;

        for (var i = 0; i < boxes.length; i++) {
            if ((boxes[i].y + boxes[i].height) > maxY) {
                maxY = boxes[i].y + boxes[i].height;
            }
        }

        return maxY;
    }

    for (var i = 1; i < components.length; i++) {
        var component = components[i];

        var prevBox = boxlist[i - 1];
        var box = this.getComponentBoundingBox(component.nodes());

        var offset = {x: 0, y: 0};

        if (prevBox.x + prevBox.width + componentSeparation - startX < MAX_WIDTH) {
            offset.y = (prevBox.y - box.y);
            offset.x = (prevBox.x - box.x) + prevBox.width + componentSeparation;
        } else {
            offset.y = (getMaxY(lineBox) - box.y) + componentSeparation;
            offset.x = (startX - box.x);

            lineBox = [];
        }

        this.translateNodes(component.nodes(), offset);

        boxlist[i] = this.getComponentBoundingBox(component.nodes());
        lineBox.push(boxlist[i]);
    }

};

GradationLayout.prototype.getComponentBoundingBox = function (component) {
    let height = 0;
    let width = 0;
    let x = Infinity;
    let y = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;


    component.forEach(node => {
        const position = node.scratch('position');

        if (x > position.x) {
            x = position.x;
        }
        if (y > position.y) {
            y = position.y;
        }
        if (maxX < position.x) {
            maxX = position.x;
        }

        if (maxY < position.y) {
            maxY = position.y;
        }
    });

    height = maxY - y;
    width = maxX - x;

    return {
        height: height,
        width: width,
        x: x,
        y: y
    }
};

GradationLayout.prototype.translateNodes = function (nodes, offset) {
    nodes.forEach((node, index) => {
        const position = node.scratch('position');

        position.x += offset.x;
        position.y += offset.y;
    });
}

GradationLayout.prototype.positionComponents = function (components) {
    const options = this.options;
    const cy = options.cy; // cy is automatically populated for us in the constructor
    const nodes = components.nodes();
    let step = options.step;

    const nodesMap = {};
    let gradation = [];
    let minWAC = Infinity;
    let maxWAC = 0;

    const closenessCentrality = components.closenessCentralityNormalized();
    const degreeCentrality = components.degreeCentralityNormalized();
    const betweennessCentrality = components.betweennessCentrality();

    // console.log('start:', Date.now());
    nodes.forEach(node => {
        const weightedAvgCentrality = (closenessCentrality.closeness(node) * options.closenessWeight + degreeCentrality.degree(node) * options.degreeWeight + betweennessCentrality.betweennessNormalized(node) * options.betweennessWeight) / 3;
        node.scratch().weightedAvgCentrality = weightedAvgCentrality;
        if (maxWAC < weightedAvgCentrality) {
            maxWAC = weightedAvgCentrality;
        }
        if (minWAC > weightedAvgCentrality) {
            minWAC = weightedAvgCentrality
        }

        // console.log(weightedAvgCentrality, closenessCentrality.closeness(node), degreeCentrality.degree(node), betweennessCentrality.betweennessNormalized(node), node.data().name);
        nodesMap[node.id()] = node;
    });

    const levelCount = Math.ceil((maxWAC - minWAC) / step)  !== 0 ? Math.ceil((maxWAC - minWAC) / step) : 1;

    if (levelCount > options.maxLevel) {
        step = (maxWAC - minWAC) / options.maxLevel;
    } else if (levelCount < options.minLevel) {
        if ((maxWAC - minWAC) / options.minLevel !== 0) {
            step = (maxWAC - minWAC) / options.minLevel;
        }
    }

    // console.log('endWAC:', Date.now());

    const _getLevel = function (node) {
        return Math.floor((node.scratch().weightedAvgCentrality - minWAC) / step);
    };

    nodes.forEach(node => {
        if (!gradation[_getLevel(node)]) {
            gradation[_getLevel(node)] = cy.collection();
        }

        gradation[_getLevel(node)] = gradation[_getLevel(node)].add(node);
    });

    gradation = gradation.filter(g => !g.empty()).reverse();

    // console.log('endLevel:', Date.now());

    gradation.forEach(((nodes, level) => {
        const size = nodes.size();

        nodes.forEach((node, index) => {
            if (level === 0) {
                node.scratch().levelOrder = size - index;
            }

            if (node.scratch().levelOrder === undefined) {
                node.scratch().levelOrder = 0;
            }

            if (level < gradation.length - 1) {
                const nextNodes = node.edgesWith(gradation[level + 1]).connectedNodes().filter(n => node.id() !== n.id());

                nextNodes.forEach(n => {
                    n.scratch().levelOrder = node.scratch().levelOrder + size - index;
                });
            }
        });
    }));

    // console.log('endOrder:', Date.now());

    gradation.forEach((nodes, index) => {
        gradation[index] = nodes.sort((a, b) => {
            return b.scratch('levelOrder') - a.scratch('levelOrder');
        });
    });

    // console.log('endSort:', Date.now());

    const lastLevelSize = gradation[gradation.length - 1].size();
    const midX = cy.width() / 2;
    const graphWidth = lastLevelSize * 50;

    const _positionNode = function (node, level, index, levelSize) {
        let x = (index + 1 - levelSize / 2) * options.hdistance;
        let y = level * options.vdistance;

        return {x, y};
    };

    gradation.forEach((nodes, level) => {
        const levelSize = nodes.size();

        nodes.forEach((node, index) => {
            node.scratch('position', _positionNode(node, level, index, levelSize));
        });
    });
};

let register = function( cytoscape ){
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    cytoscape( 'layout', 'gradation', GradationLayout); // register with cytoscape.js
};

if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
}

export default register;
