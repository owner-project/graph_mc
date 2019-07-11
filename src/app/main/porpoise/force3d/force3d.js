import THREE from "../../../lib/force3d/three";
import ForceGraph3D from "../../../lib/force3d/3d-force-graph";

function Force3D (dom, options) {
    var data = options.data || {};
    var size = options.size || [300, 150];
    var elements = {
        nodes: (data.nodes || []).map(function (d) {
            var node = Object.assign({classes: d.classes}, d.style, d.data);
            return node;
        }),
        links: (data.edges || []).map(function (d) { return Object.assign({}, d.data); })
    };

    var imageClip = function (mesh, url) {
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        var imgSize = 80;
        var img = new Image();

        img.src = url;
        img.onload = function () {
            canvas.width = imgSize;
            canvas.height = imgSize;
            ctx.arc(imgSize / 2, imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 0, 0, imgSize, imgSize);

            var texture = new THREE.Texture(canvas), sprite;
            texture.needsUpdate = true;
            sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture }));
            sprite.scale.set(30, 30);
            sprite.renderOrder = 100;
            mesh.__sprite = sprite;
            mesh.add(sprite);
        };
    };

    var addNodeImage = function (node) {
        if (node.__mesh) return node.__mesh;
        var url = node["background-image"];
        var image = node.image;
        var geometry = new THREE.SphereGeometry(10, 10, 10, 0, Math.PI * 2),
            mesh, border;
        var isBase64;

        if (isBase64 = url.indexOf("url") !== -1) {
            url = url.substring(4, url.length - 1);
        }

        var noimg = 0;//Math.random() < 0.5;
        mesh = node.__mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ depthWrite: false, color: 0x0a244f, transparent: true, opacity: image ? 0 : 1 })
        );
        mesh.renderOrder = 99;
        if (!image) {
            border = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { color: 0x4168d6, side: THREE.BackSide } ));
            border.scale.multiplyScalar(1.1);
            border.renderOrder = 100;
            mesh.add(border);
        }

        if (!noimg) {
            if (isBase64) {
                imageClip(mesh, url);
            }
            else {
                new THREE.TextureLoader().load(url, function (image) {
                    var material = new THREE.SpriteMaterial({ map: image });
                    var sprite = new THREE.Sprite(material);
                    sprite.scale.set(30, 30);
                    mesh.__sprite = sprite;
                    sprite.renderOrder = 110;
                    mesh.add(sprite);
                });
            }
        }
        return mesh;
    };

    function update () {
        graph.linkWidth(3);
    }

    var selectedNodes = [];

    dom.__bbox = options.bbox;

    var graph = ForceGraph3D({controlType: "orbit"})(dom)
        .backgroundColor("rgba(0,0,0,0)")
        .backgroundImage("assets/images/theme_star_blue/graph/gallery.png")
        .width(size[0]).height(size[1])
        .dagMode("null")// ["td", "bu", "lr", "rl", "zout", "zin", "radialout", "radialin", "null"]
        .dagLevelDistance(120)
        .graphData(elements)//({nodes: elements.nodes, links: elements.edges})//data)
        //.nodeRelSize(15)
        .nodeOpacity(1)
        .nodeId("id")
        .nodeLabel("name")
        .nodeColor(function (node) {
            return selectedNodes.includes(node) ? "rgb(255,0,0,1)" : "#5182FF";
        })
        //.nodeAutoColorBy('group')
        .nodeThreeObject(function (node) {
            return addNodeImage(node);
            // return node.image || node["background-image"] ? addNodeImage(node) : null;
        })
        //.linkDirectionalParticles("value")
        //.d3Force('collision', d3.forceCollide(node => Math.cbrt(node.size) * 2)).distance(10)
        .linkDirectionalParticleWidth(2)
        .linkOpacity(0.75)
        .linkWidth(1)
        .linkColor(0x5182FF)
        //.linkDirectionalParticleSpeed(d => d.value * 0.001)
        .showNavInfo(false)

        .onNodeClick(function (node) {
            selectedNodes = node ? [node] : [];
            //console.log(selectedNodes)
            update();
        });

    this.graph = graph;
    this.controls = graph.controls();
}

export default Force3D;