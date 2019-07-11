import Dalaba from "../../../lib/dalaba/dalaba";
import Events from "../../../lib/gis/events";
import "../../../lib/gis/bezier";
import "../../../lib/gis/Tween";
import "../../../lib/gis/Mapv";
import "../../../lib/gis/DrawingManager";

var isArray = Dalaba.isArray;
var isFunction = Dalaba.isFunction;

//var partition = Dalaba.Cluster.List.partition;

var pack = Dalaba.pack;

var reset = function (items, props) {
    var args = [].slice.call(arguments, 2),
        n = args.length,
        i = -1;
    var d, p;
    if (items && n) while (++i < n) {
        d = items[d = args[i]];
        for (p in props) {
            d[p] = props[p];
        }
    }
};

var clip = function (x, y, bounds) {
    var dy = y;
    var margin = 4;
    var tooltipHeight = bounds[1][0],
        tooltipWidth = bounds[0][0],
        width = bounds[0][1],
        height = bounds[1][1];
    
    x += margin;
    y += margin;
    
    if (x + tooltipWidth >= width) {
        x = x - tooltipWidth - margin;
    }
    if (x <= 0) {
        x = margin;
    }
    if (y + tooltipHeight >= height) {
        y = dy - tooltipHeight - margin / 2;
    }
    if (y <= 0) {
        y = 0;
    }
    return [x, y];
};

var classify = function (data) {
    var ret = [];
    /*partition(data, function (a, b) {
        return a.area === b.area;
    })*/
    data.forEach(function (group) {
        [].push.apply(ret, appendTo([group], group.labels.length));//group.count));
    });
    return ret;
};

/* range=[0, n] */
var dataRange = function (key0, key1) {
    var startKey = "" + key0,
        endKey = "" + key1;
    return function (data, start, end) {
        if (start == null) if (end == null) return data; else start = end;
        if (end == null) end = start;

        var n = data.length, i = -1, d;
        var ret = [];

        if (typeof arguments[3] === "string") startKey = arguments[3];
        if (typeof arguments[4] === "string") endKey = arguments[4];

        while (++i < n) if (d = data[i]) {
            if (d[startKey] >= start && d[endKey] <= end) {
                ret.push(d);
            }
        }
        return ret;
    };
};

function getZoom (zoom) {
    if (zoom < 7) {
        return 'province';
    }
    else if (zoom >= 7 && zoom < 11) {
        return 'city';
    }
    return "city";
}

function appendTo (data, length) {
    var newData = !isArray(data) ? [data] : data;
    reset.apply(null, [newData, {
        disabled: true,
        text: {
            value: length,
            dx: 0, dy: 3.75
        }
    }].concat(newData.map(Number.call, Number)));
    return newData;
}

function GisMap(vis, options) {
    var className, classList;

    if (vis == null || (vis && vis.nodeType !== 1))
        return this;

    classList = vis.classList;

    this.vis = vis;
    this.options = options;

    this.customMap = !!options.customMap;
    this.autoViewport = !!options.autoViewport;

    this.layers = [];

    this.size = options.size;

    this.globalFunctions = {
        onChange: function () { },
        onComplete: function () {
            this.tooltip = vis.appendChild(document.createElement("div"));
            this.tooltip.className = "gis-tooltip";
        },
        onTooltip: function () { return ""; }
    };
    this.style = options.style;
    this.cssParser = Dalaba.CSSParser(this.style.cssText, true);

    className = ["gis", this.theme = "dark"];
    this.namespace = "." + className.join(".");

    if (classList && !classList.contains(this.theme)) {
        className.forEach(function (d) { classList.add(d); });
    }

    this.data(options.data).render();
}

GisMap.Layer = function (map, layer) {
    this.map = map;
    this.layer = layer.layer;
    this.data = classify(layer.data || []);
    this.visible == null && (this.visible = true);
};
GisMap.Layer.prototype = {
    add: function (data) {
        var map = this.map;
        if (data != null) {
            [].push.apply(this.data, data);//appendTo(data));
            this.data = classify(this.data);
            if (!map.autoViewport) {
                this.layer && this.layer.draw();
            }
            else
                map.setViewport();
        }
        return this;
    },
    set: function (data, autoViewport) {
        var map = this.map,
            layer = this.layer;
        if (data != null) {
            this.data = classify(data);
            layer && layer.setData(this.data);
            if (!map.autoViewport || autoViewport === false) {
                layer && this.layer.draw();
            }
            else
                map.setViewport();
        }
        return this;
    }
};

GisMap.dataRange = dataRange("start", "end");

GisMap.prototype = {
    constructor: GisMap,

    data: function (data) {
        if (data == null) return this;

        (!isArray(data) ? [data] : data.slice()).forEach(function (d) {
            this.layers.push(new GisMap.Layer(this, d));
        }, this);
        
        return this;
    },
    addMapVLayer: function (options) {
        if (options.visible == null) {
            options.visible = true;
        }
        if (options.visible && options.data) {
            options = Object.assign({
                map: this,
                visible: true,
                coordType: "bd09ll",
                dataRangeControl: false,
                dataType: "ripple",
                drawType: "simple",
                zIndex: options.zIndex || (this.layers.length+1),
            }, options);
            options.mapv = this.mapv;
            options.layer = new Mapv.Layer(options);
            this.layers.push(options);
            return options.layer;
        }
    },
    removeMapVLayer: function (layer) {
        let index = this.layers.findIndex(opt => opt.layer === layer);
        if (index >=0 ) {
            let lyr = this.layers[index].layer;
            let map = lyr.getMap();
            map.removeOverlay(lyr.canvasLayer);
            lyr.setData([]);
            this.layers.splice(index, 1);
        }
    },
    addTextIcon: function() { 
        const options = {};
        const label = new BMap.Label('', options);
        label.setStyle({
            display: 'none',
            width: 0,
            border: 'none',
            padding: 0
        });
        this.map.addOverlay(label);
        this._textIcon = label;
        return label;
    },
    removeTextIcon: function() {
        if (this._textIcon && this._textIcon.getMap()) {
            this._textIcon.getMap().removeOverlay(this._textIcon);
            this._textIcon = null;
        }
    },
    updateTextIcon: function(content, position) {
        if (!this._textIcon || !this._textIcon.getMap()) {
            this.addTextIcon();
        }
        const htmlStr = `
        <div class="gismap-time-play gismap-animation-texticon-container">
           <div class="texticon-content">${content}</div>
           <div class="texticon-arrow"></div>
        </div>`; 
        this._textIcon.setContent(htmlStr);
        this._textIcon.setPosition(position);  
        this.showTextIcon();
    },
    showTextIcon: function () {
        if (this._textIcon) {
            this._textIcon.setStyle({
                display: 'inline'
            });
        }
    },
    hideTextIcon: function () {
        if (this._textIcon) {
            this._textIcon.setStyle({
                display: 'none'
            });
        }
    },
    
    addRotateMarker: function() { 
        const iconOptions = {
            src: '/assets/theme-sb/graph/timeplay-rotate-point.svg',
            width: 16,
            height: 16
        };
        const htmlStr = 
        `<div class='gismap-time-play gismap-animation-rotatecircle'>
            <img width="${iconOptions.width}" height="${iconOptions.height}" src='${iconOptions.src}'/>
        </div>`;
        const options = {
            offset: new BMap.Size(-iconOptions.width / 2, -iconOptions.height / 2)    //设置文本偏移量
        };
        const label = new BMap.Label(htmlStr, options);
        label.setStyle({
            display: 'none',
            width: 0,
            border: 'none',
            padding: 0
        });
        this.map.addOverlay(label);
        this._rotateMarker = label;
        return label;
    },
    removeRotateMarker: function() {
        if (this._rotateMarker && this._rotateMarker.getMap()) {
            this._rotateMarker.getMap().removeOverlay(this._rotateMarker);
            this._rotateMarker = null;
        }
    },
    updateRotateMarker: function(position) {
        if (!this._rotateMarker || !this._rotateMarker.getMap()) {
            this.addRotateMarker();
        }
        this._rotateMarker.setPosition(position);  
        this.showRotateMarker();
    },
    showRotateMarker: function () {
        if (this._rotateMarker) {
            this._rotateMarker.setStyle({
                display: 'inline'
            });
        }
    },
    hideRotateMarker: function () {
        if (this._rotateMarker) {
            this._rotateMarker.setStyle({
                display: 'none'
            });
        }
    },
    drawAnimationLayer: function(key, labels, porpoiseControllerInstance) {
        this.addTextIcon();
        this.addRotateMarker();

        const LINE_TIME = 1 * 1000; // 每条线播放时间，毫秒
        const LINE_DELAY = 0.5 * 1000; // 每条线播放延时，毫秒
        const POINT_TIME = 1 * 1000; // 每个点播放时间，毫秒
        const POINT_DELAY = 0.5 * 1000; // 每个点播放延时，毫秒
        // const MAX_TIME = 180 * 1000; // 最大播放时间，毫秒
        const GRADIENT_COLOR = { // 线的渐变色
                0: "#2F6AFF",
                1.0: "#9DFFFF"
                // 0: "#0d3fa7",
                // 0.5: '#3bbbee',
                // 1.0: "#9ae6fd"
        };
        const GRADIENT_COLOR_BOTTOM = { // 底线的渐变色
                0: "#6448FF",
                1.0: "#3DBEFF",
                // 0: "rgba(100, 72, 255, 0.3)",
                // 1.0: "rgba(61, 190, 255, 0.3)"
        };

        let trackLineLayer, pointLayer; // 线动画图层和点动画图层

        // 从所有 label 中提取事件
        // 事件包含一个点或两个点
        function isSameEvent(a, b) {
            return a.key === b.key && a.startTime === b.startTime && a.startArea === b.startArea && a.type === b.type;
        }
        function isSamePoint(a, b) {
            return a.lng === b.lng && a.lat === b.lat;
        }
        // 配对，情侣配成一对，单身狗单独一对
        let eventPairs = [];
        while(labels && labels.length) {
            let pair = [];
            let p1 = labels.shift();
            pair.push(p1);
            for (let i = 0; i < labels.length; i ++) {
                if (isSameEvent(labels[i], p1)) {
                    pair.push(labels[i]);
                    labels.splice(i, 1);
                    break;
                }
            }
            eventPairs.push(pair);
        }
        // 配对根据时间排序
        eventPairs.sort((a, b) => a[0].start - b[0].start);
        // 排序每个配对的起始点和终止点
        eventPairs.forEach(pair => {
            if (pair.length > 1) {
                let [a, b] = pair;
                if (a.startArea !== a.areaCode) {
                    // pair = [b, a];
                    let temp = pair[0];
                    pair[0] = pair[1];
                    pair[1] = temp;
                }
            }
        });
        // 扁平化
        eventPairs = eventPairs.flat(2);
        // 去除相邻重复点
        let pointer = 0;
        while (pointer < eventPairs.length-1) {
            if (eventPairs[pointer+1]) {
                if (isSamePoint(eventPairs[pointer+1], eventPairs[pointer])) {
                   eventPairs.splice(pointer+1, 1);
                } else {
                    pointer += 1;
                }          
            }
        }
         
        // console.log(eventPairs);
        // const lineCount = Math.max(eventPairs.length - 1, 0); 
        // const sumTime = Math.min(lineCount * LINE_TIME, MAX_TIME);
        const personName = eventPairs[0].name;
        const interpolate = new Mapv.Intensity({
            gradient: GRADIENT_COLOR,
            min: 0,
            max: 1
        });
        const interpolate_bottom = new Mapv.Intensity({
            gradient: GRADIENT_COLOR_BOTTOM,
            min: 0,
            max: 1
        });
        const pointData = eventPairs.map((pt,index) => ({lng: pt.lng, lat: pt.lat, count: index, t: index}));
        const lineData = [
            {
                geo: eventPairs.map(pt => [pt.lng, pt.lat])
            }
        ];
        const trackPointOptions = {
            dataType: 'trackPoint',
            data: pointData,
            drawType: 'simple',
            visible: true,
            drawOptions: {
                size: 2,
                fillStyle: '#2979FF'
            },
            animation: 'time',
            animationOptions: {
                duration: POINT_TIME,
                delay: POINT_DELAY,
                onAnimateFinish: function() {
                    porpoiseControllerInstance.gisKeysList[key].isTrackPointFininsh = true;
                    porpoiseControllerInstance.pauseLine(key);
                }
            },
            customOptions: {
                trackLineLayer: trackLineLayer
            }
        };
        const trackLineOptions = {
            dataType: 'trackline',
            data: lineData,
            drawType: 'simple',
            visible: true,
            drawOptions: {
                topLine: {
                    lineWidth: 2,
                    globalAlpha: 1
                },
                bottomLine: {
                    lineWidth: 6,
                    globalAlpha: 0.3
                },
                // 文字框样式
                iconText: {
                    text: personName
                }
            },
            animation: 'time',
            // 注：此处动画采用 TWEEN.js 实现
            animationOptions: {
                duration: LINE_TIME, // 每根线的播放时长
                delay: LINE_DELAY, // 开始播放前的延迟
                onAnimateFinish: function() { // 所有线播放完的回调
                    porpoiseControllerInstance.gisKeysList[key].isTrackLineFininsh = true;
                    pointLayer && pointLayer.timeline.start();
                }
            },
            customOptions: {
                interpolate: interpolate,
                interpolate_bottom: interpolate_bottom
            }
        };

        trackLineLayer = this.addMapVLayer(trackLineOptions);

        trackPointOptions.customOptions.trackLineLayer = trackLineLayer;
        pointLayer = this.addMapVLayer(trackPointOptions);

        porpoiseControllerInstance.gisKeysList[key].trackLineLayer = trackLineLayer;
        porpoiseControllerInstance.gisKeysList[key].trackPointLayer = pointLayer;
        porpoiseControllerInstance.gisKeysList[key].allPointLayer.setZIndex(this.layers.length+1);

        trackLineLayer && trackLineLayer.timeline.start();
    },
    /**
    * 绘制圆形
    * onFinishCallback: 绘制完成回调
    */
    drawCircle: function(onFinishCallback) {
        var me = this;
        var drawingManager = this.drawingManager;
        var styleCircleOptions = {
            strokeColor:"#2979FF",    //边线颜色。
            fillColor:"#2979FF",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 2,       //边线的宽度，以像素为单位。
            strokeOpacity: 1,    //边线透明度，取值范围0 - 1。
            fillOpacity: 0.2,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'dashed' //边线的样式，solid或dashed。
        }
        if (!this.drawingManager) {
            drawingManager = this.drawingManager = new BMapLib.DrawingManager(this.map, {
                isOpen: false, //是否开启绘制模式
                drawingMode: 'circle',
                enableCalculate: false,
                enableDrawingTool: false, //是否显示工具栏
                circleOptions: styleCircleOptions, // 画圆样式
            });  
            drawingManager.addEventListener('overlaycomplete', function(e, options) {
                var circle = options.overlay;
                var center = circle.getCenter();
                var radius = circle.getRadius(); // 单位：米

                drawingManager.circleOverlays = drawingManager.circleOverlays || [];
                drawingManager.circleOverlays.push(circle);
                drawingManager.close();

                var center_pixel = me.map.pointToPixel(center);
                var bounds = circle.getBounds();
                if (radius>0) {
                    var sw_pixel = me.map.pointToPixel(bounds.getSouthWest());
                    var ne_pixel = me.map.pointToPixel(bounds.getNorthEast());
                    var radius_pixel = Math.abs(sw_pixel.x - ne_pixel.x) / 2;
                    var label_x = center_pixel.x + radius_pixel * Math.cos(Math.PI/4);
                    var label_y = center_pixel.y + radius_pixel * Math.cos(Math.PI/4);
                    var labelPoint = me.map.pixelToPoint({x: label_x, y: label_y});
                    var content = radius > 1000 ? (radius/100).toFixed(2) + 'Km' : radius.toFixed(2) + 'm';
                    drawingManager.circleLabel = me.addCircleLabel(content, labelPoint);
                } else {
                    drawingManager.circleLabel = me.addCircleLabel('0m', center);
                }
                typeof onFinishCallback === 'function' && onFinishCallback.call(this, {
                    circle: circle,
                    center: center,
                    radius: radius
                });
            });
        } else {
            this.clearCircle();
        }
        drawingManager.open();
    },
    addCircleLabel: function (content, point) {
        var opts = {
          position: new BMap.Point(point.lng, point.lat),// 指定文本标注所在的地理位置
          offset: new BMap.Size(4, 4) //设置文本偏移量
        };
        var label = new BMap.Label(content, opts);  // 创建文本标注对象
        label.setStyle({
             color : "white",
             fontSize : "12px",
             lineHeight : "20px",
             padding: "6px",
             border: "none",
             backgroundColor: "#2979FF",
             fontFamily:"微软雅黑",
             maxWidth: "none"
         });
         this.map.addOverlay(label);
         return label;
    },
    clearCircle: function () {
        if (this.drawingManager) {
            // 移除圆心点
            this.drawingManager.circleMarkers.forEach(function(item, index) {
                item.getMap().removeOverlay(item);
            });
            this.drawingManager.circleMarkers = [];
            // 移除圆形
            this.drawingManager.circleOverlays.forEach(function(item) {
                item.getMap().removeOverlay(item);
            });
            this.drawingManager.circleOverlays = [];
            // 移除 circlelabel
            this.drawingManager.circleLabel && this.drawingManager.circleLabel.getMap().removeOverlay(this.drawingManager.circleLabel);
            this.drawingManager.circleLabel = null;
        }
    },
    onChange: function (_) {
        var gis = this;
        if (isFunction(_)) {
            this.globalFunctions.onChange = function () {
                _.apply(gis, arguments);
            };
        }
        return this;
    },
    onComplete: function (_) {
        var gis = this;
        var onComplete = this.globalFunctions.onComplete;
        if (isFunction(_)) {
            this.globalFunctions.onComplete = function () {
                onComplete.call(gis);
                _.apply(gis, arguments);
            };
        }
        return this;
    },

    onTooltip: function (_) {
        var gis = this;
        if (isFunction(_)) {
            this.globalFunctions.onTooltip = function () {
                return _.apply(gis.tooltip, arguments);
            };
        }
        return this;
    },

    render: function () {
        var gis = this;
        
        if (this.map) {
            this.clear();
            this.setMapStyle();
            this.setCenterAndZoom();
            this.addDataLayer();
        } else {
            this.initBaseMap();

            this.setMapStyle();
            this.setCenterAndZoom();

            this.once('tilesloaded', function () {
                this.initMapv();
                this.addDataLayer();
                this.setViewport();
                gis.globalFunctions.onComplete.call(gis);
                this.emit('loaded');
            });
        }
    },

    resize: function (size) {
        if (isArray(size)) {
            this.size = [pack("number", size[0], 1), pack("number", size[1], 1)];
            return this;
        }
        return this.size;
    },

    initBaseMap: function () {
        var map;
        var vis = this.vis,
            canvas = vis.querySelectorAll(".gis-canvas")[0];
        var options = this.options,
            newOptions;
        var _this = this;

        var zooming = false;

        var tilesloaded = function (e) {
            setTimeout(function () {
                _this.emit('tilesloaded');
            });
        };

        if (this.customMap) {
            var mapOption = {
                center: [this.mapOption.centerLat, this.mapOption.centerLng],
                zoom: this.mapOption.zoom,
                zoomControl: false,
                attributionControl: false,
                editable: true,
                editOptions: {
                    skipMiddleMarkers: true,
                }
            };

            if (CUSTOM_CRS) {
                if (typeof CUSTOM_CRS == 'string') {
                    if (["EPSG3395", "EPSG3857", "EPSG4326", "Earth", "Simple"].indexOf(CUSTOM_CRS) > -1) {
                        mapOption.crs = L.CRS[CUSTOM_CRS];
                    } else {
                        console.log("unsupport crs, please use L.Proj.CRS instead");
                    }

                } else {
                    var options = $.extend(true, {}, CUSTOM_CRS.options);
                    if (options.bounds) {
                        options.bounds = L.bounds(options.bounds);
                    }
                    mapOption.crs = new L.Proj.CRS(CUSTOM_CRS.code, CUSTOM_CRS.proj4def, options);
                }
            }

            if (MIN_ZOOM) {
                mapOption.minZoom = MIN_ZOOM;
            }
            if (MAX_ZOOM) {
                mapOption.maxZoom = MAX_ZOOM;
            }

            var bmap = this.map = L.map(vis, mapOption);

            var locale = bdpChart.language || 'zh';
            L.control.zoom({
                zoomInTitle: locale == 'zh' ? '放大' : 'Zoom in',
                zoomOutTitle: locale == 'zh' ? '缩小' : 'Zoom out'
            }).addTo(bmap);

            var tileLayer;

            if (WMTS_CFG) {
                var options = $.extend(true, options, WMTS_CFG.options);
                if (typeof options.style == 'object') {
                    options.style = options.style[this.theme] || 'default';
                }
                tileLayer = new L.TileLayer.WMTS(WMTS_CFG.url, options);

            } else {

                var mapServerLayers = this.theme == 'dark' ? DARK_LAYERS : LIGHT_LAYERS;
                if (mapServerLayers === undefined || mapServerLayers.length === 0) {
                    return;
                }
                var mapServerLayer = mapServerLayers[0];
                mapServerLayer.options = mapServerLayer.options || {};
                tileLayer = L.tileLayer(mapServerLayer.url, mapServerLayer.options);
                tileLayer.index = 0;
            }

            this.tileLayer = tileLayer;
            tileLayer.addTo(bmap);
            //tileLayer.on("tileload", tilesloaded);

        } else {
            newOptions = Dalaba.extend({
                enableMapClick: false,
                enableAnimation: false,
                // vectorMapLevel: 3
                enableHighResolution: true
            }, options);

            map = this.map = new BMap.Map(canvas, newOptions);
            map.enableAutoResize(); //多实例情况下,默认autoResize可能不生效,这里主动设置

            map.addEventListener('tilesloaded', tilesloaded);
            map.addEventListener("resize", function () {
                var bbox = vis.getBoundingClientRect();
                _this.resize([bbox.width, bbox.height]);
            });

            this.scrollWheelZoom(true);

            map.addEventListener("zoomstart", function (e) {
                zooming = true;
                //_this.clear();
                _this.hideTooltip();
                _this.hideTextIcon();
            });

            map.addEventListener('zoomend', function (e) {
                // console.log(_this.map.getViewport());
                var centerAndZoom = _this.getCenterAndZoom();
                var dimension = getZoom(centerAndZoom.zoom);
                _this.globalFunctions.onChange(e, dimension, centerAndZoom, zooming);
                zooming = false;
                _this.showTextIcon();
            });
            var top_left_control = new BMap.ScaleControl({offset: new BMap.Size(10, 60,0,0)});
            var top_left_navigation = new BMap.NavigationControl({offset: new BMap.Size(10, 60,0,0)});  //左上角，添加默认缩放平移控件
            map.addControl(top_left_control);
            map.addControl(top_left_navigation);
        }
    },
    scrollWheelZoom: function (enable) {
        if (enable) {
            this.map.enableScrollWheelZoom();
        } else {
            this.map.disableScrollWheelZoom();
        }
    },
    setViewport: function () {
        var points = [];
        var view;
        this.layers.forEach(function (layer) {
            points = points.concat(layer.data);
        });
        if (points.length) {
            view = this.map.getViewport(points);
            this.map.centerAndZoom(view.center, view.zoom);// autoViewport
        }
    },

    setMapStyle: function () {
        var cssParser = this.cssParser;
        var mapStyle;
        if (window.BMap) {
            if (this.style.mapStyle) {
                mapStyle = this.style.mapStyle;
            }
            else {
                mapStyle = ["all fill", "background geometry", "road geometry-fill", "road geometry-stroke", "administrative", "water",
                    "green", "poi", "subway", "arterial text-fill", "highway", "label", "boundary",
                    "arterial text-stroke", "road text-fill", "all text-stroke", "all stroke", "all text-fill"].map(function (d) {
                    var rule = cssParser.rule(this.namespace + " " + d);
                    return rule != null ? Dalaba.extend({}, rule) : null;
                }, this);
            }
            this.map.setMapStyle({
                styleJson: mapStyle.filter(Boolean)
            });
            this.map.getContainer().style.backgroundColor = cssParser.attr(this.namespace + " [backgroundColor]");
        } else {
            mapStyle = this.theme == 'dark' ? DARK_STYLE_TMS : LIGHT_STYLE_TMS;
            this.tileLayer.setUrl(mapStyle);
        }
    },

    setCenterAndZoom: function (center, zoom) {
        var options = this.options;
        if (center) {
            console.log(center)
            options.center = [center.lng, center.lat];
        }
        zoom && (options.zoom = zoom);

        if (this.customMap) {
            this.map.setView(new L.LatLng(options.centerLat, options.centerLng), options.zoom);
        } else {
            var point = new BMap.Point(options.center[0], options.center[1]);
            this.map.centerAndZoom(point, options.zoom);
        }
    },

    getCenterAndZoom: function () {
        var map = this.map;
        if (!map) {
            return {};
        }
        var zoom = map.getZoom();
        var center = map.getCenter();

        return {
            center: center,
            zoom: zoom
        };
    },

    initMapv: function () {
        var gis = this;
        var onTooltip = this.globalFunctions.onTooltip;
        var prevpoint, hoverpoint;
        this.mapv = new Mapv({
            useLeaflet: this.customMap,
            map: this.map,
            coordType: this.options.coordType || 'bd09ll',
            hover: function (points, e) {
                var point;
                if (points.length && (point = points[0])) {
                    if (hoverpoint !== point) {
                        gis.tooltip.innerHTML = onTooltip.call(gis.tooltip, e, point, points);
                    }
                    gis.showTooltip(point, point.px, point.py);
                    hoverpoint = point;
                }
                else {
                    setTimeout(function () {
                        e.relatedTarget || gis.hideTooltip();
                    }, 200);
                    hoverpoint = undefined;
                }
            },
            click: function (points) {
                var point;
                if (points.length && (point = points[0])) {
                    //if (prevpoint !== point) {
                        prevpoint && (prevpoint.disabled = true);
                        point.disabled = false;
                    //}
                    //else point.disabled = !point.disabled;
                    gis.layers.forEach(function (layer) {
                        layer.layer.draw();
                    });
                    prevpoint = point;
                }
            }
        });
    },

    getDrawedLayers: function () {
        return this.mapv.get('layers');
    },

    addDataLayer: function () {
        var _this = this;
        var namespace = this.namespace;

        this.layers.forEach(function (layer, i) {
            var data = layer.data,
                drawOptions,
                option;
            if (layer.visible && data) {
                drawOptions = _this.cssParser.rule(namespace + " shape ripple") || {
                    fps: 24,
                    rippleStyle: "fill",
                    size: 10
                };
                //layer.data = appendTo(data);
                option = Object.assign({
                    coordType: "bd09ll",
                    dataRangeControl: false,
                    dataType: "ripple",// "point",
                    drawType: "simple",
                    zIndex: i + 1,
                }, layer);
                option.mapv = _this.mapv;
                option.drawOptions = drawOptions;
                layer.layer = new Mapv.Layer(option);
            }
        });
    },

    hideTooltip: function () {
        if (this.tooltip) this.tooltip.style.display = "none";
    },
    showTooltip: function (point, x, y) {
        var bbox = this.tooltip.getBoundingClientRect();
        var bounds = [
            [bbox.width, this.size[0]],
            [bbox.height, this.size[1]]
        ];

        var xy = clip(x, y, bounds);

        this.tooltip.style.cssText = [
            "display: block",
            "left:" + xy[0] + "px",
            "top:" + xy[1] + "px"
        ].join(";") + ";";
    },

    clear: function () {
        this.mapv && this.mapv.clearAllLayer();
    },

    destroy: function () {
        this.clear();
        this.mapv = null;
        if (this.customMap) {  // 操蛋的百度地图没有类似的destroy方法，只针对leaflet
            this.bmap.remove();
        }
    }
};

Events.mixTo(GisMap);

export default GisMap;