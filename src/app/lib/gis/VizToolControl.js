//@ sourceURL=VizToolControl.js

// 工具栏控件
window.VizToolControl = {};
var bdpChart = window.bdpChart || null;
if (window.BMap) { 
    // 百度地图的控件实现
    window.VizToolControl = function(options) {
        this._gisMap = options.gisMap;
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
        this.defaultOffset = new BMap.Size(0, 0);
    }

    VizToolControl.prototype = new BMap.Control(); 

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    VizToolControl.prototype.initialize = function(map) {
        var div = this.init(map);
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div); 

        return div;
    }

} else if (window.L) {
    // Leaflet的控件实现
    window.VizToolControl = L.Control.extend({
        _gisMap: null,
        includes: L.Mixin.Events,
        onAdd: function(map) {
            this._gisMap = this.options.gisMap;
            this._disableRectangleZoom = !this.options.rectangleZoom;
            return this.init(map);
        },
    });
}

VizToolControl.prototype.init = function(map){
    var locale = bdpChart && bdpChart.language ||'zh';
    var me = this;
    var dragBox, drawingManager;

    this.map = map;
    if (window.BMapLib) {
        // 初始化拉框放大
        dragBox = this.dragBox = new BMapLib.RectangleZoom(map, {
            followText: locale=='zh'?"选择放大的区域":"Select the area to zoom in",
            followTextStyle: {
                color: '#666',
                borderColor: '#7ABCE9'
            },
            strokeColor: "#7ABCE9",
            fillColor: "rgba(122, 188, 233, 0.2)",
            autoClose: true,
            onClose: function() {
                $toolList.find('li.tool-select-zoomin').removeClass('active');
            }
        });

        // 初始化框选
        var styleOptions = {
            strokeColor:"#7ABCE9",    //边线颜色。
            fillColor:"#5182E4",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 2,       //边线的宽度，以像素为单位。
            strokeOpacity: 1,    //边线透明度，取值范围0 - 1。
            fillOpacity: 0.2,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
        }
        var styleCircleOptions = {
            strokeColor:"#7ABCE9",    //边线颜色。
            fillColor:"#5182E4",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 0.01,       //边线的宽度，以像素为单位。
            strokeOpacity: 1,    //边线透明度，取值范围0 - 1。
            fillOpacity: 0.2,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
        }
        drawingManager = this.drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: false, //是否开启绘制模式
            drawingMode: "polygon",
            enableDrawingTool: false, //是否显示工具栏
            polygonOptions: styleOptions, //多边形的样式
            circleOptions: styleCircleOptions, // 画圆样式
            followText: locale=="zh"?"双击完成框选":"Double click to complete selection",
            followTextStyle: {
                color: '#666',
                borderColor: '#7ABCE9',
            },
        });
        drawingManager.addEventListener('overlaycomplete', function(e) {
            handleFrameSelect(e.overlay);
            if ($('.selec-tooltip')) {
                $('.selec-tooltip').css({
                    opacity: 0
                });
            }
            drawingManager.close();
        });
        drawingManager.addEventListener('movelay', function(e) {
            handleFrameMoveSelect(e);
        });

    } else if (window.L) {
        if (this._disableRectangleZoom) {
            this.map.boxZoom.disable();

        } else {
            dragBox = this.dragBox = new L.RectangleZoom(map, {
                autoClose: true,
                onClose: function() {
                    $toolList.find('li.tool-select-zoomin').removeClass('active');
                }
            });
        }

        drawingManager = this.drawingManager = new L.DrawingManager(map, {
            drawingMode: 'polygon',
            autoClose: true,
            onFinishDrawing: function(polygon, e) {
                // console.log(polygon);
                handleFrameSelect(polygon, e);
            },
            onClose: function() {
                $toolList.find('li.select-frame').removeClass('active');
            }
        });

    }
    // 创建一个DOM元素
    var $ctrlDom = $("<div></div>");
    $ctrlDom.addClass('BMap_viztools');
    this.ctrlDom = $ctrlDom;
    var selectTooltipElStr = '<div class="selec-tooltip">'
                            +   '<p>范围'
                            +       '<span class="select-move-radius"></span>'
                            +   '</p>'
                            +   '<p>选择'
                            +       '<span class="select-move-total"></span>'
                            +   '</p>'
                            +'</div>';
    var $selectTooltip = $(selectTooltipElStr);
    $ctrlDom.append($selectTooltip);
    // 生成菜单
    var $toolList = this.$toolList = $('<ul class="tools-list"></ul>');
    var toolItems = [
        {
            name: 'select-frame',
            action: 0
        },
        {
            name: 'select-frame-circle',
            action: 1
        },
        {
            name: 'select-zoomin',
            action: 2
        },
        {
            name: 'layer-ctrl',
            action: 3
        },
        {
            name: 'layer-change',
            action: 4,
            handle: function ($wrap) {
                if(window.L === undefined){
                    // 目前只有leaflet才有该功能
                    $wrap.hide();
                    return;
                }
                var theme = window.usedThemeId == 1 ? 'dark' : 'light';
                var gisConfig = JSON.parse(window.GIS_CFG);
                var layers = theme === 'dark' ? gisConfig['DARK_LAYERS'] : gisConfig['LIGHT_LAYERS'];
                me.layerConfig = layers;
                // 默认的图层选择的序号
                me.layerIndex = 0;
                var $layers = $('<div class="layer-change-list"></div>');
                var $layersInner = $('<div class="layer-change-list-inner dropdown-wrap"></div>');
                for (var i = 0, len = layers.length; i < len; i++) {
                    var $layer = $('<div class="layer-change-item dropdown-item">' + layers[i].name + '</div>');
                    $layersInner.append($layer);
                    $layer.data('layer', layers[i]);
                    if (i === 0) {
                        $layer.addClass('click');
                    }
                }
                $wrap.css('position', 'relative');
                $layers.append($layersInner);
                $wrap.append($layers);
            }
        }
    ];
    var toolTips = {
        'select-frame': locale=="zh"?"框选":"Select Frame",
        'select-zoomin': locale=="zh"?"放大":"Select Zoomin",
        'layer-ctrl': locale=="zh"?"图层控制":"Layer Control",
        'select-frame-circle': locale=="zh"?"半径框选":"Select Frame Circle",
        'layer-change': locale=="zh"?"图层切换":"Change Layer",
    };


    for(var i = 0; i <toolItems.length; i++) {
        var $item = $('<li><i class="bdp-icon"></i></li>');
        $item.attr('title', toolTips[toolItems[i].name]);
        $item.attr('data-action', toolItems[i].action);
        $item.addClass('tool-' + toolItems[i].name);

        if (this._disableRectangleZoom && toolItems[i] == 'select-zoomin') {
            $item.css("display", "none");  // 隐藏框选放大功能       
        }
        toolItems[i].handle ? toolItems[i].handle($item) : null;
        
        $toolList.append($item);
    }

    $toolList.on('click', 'li', function(e) {
        var action = $(this).data('action');
        // 告诉我这是谁这么写的
        //$(this).siblings('.active:not(.tool-layer-ctrl)').removeClass('active');
        $(this).siblings('.active').removeClass('active');
        var active = $(this).hasClass('active');

        me._gisMap.hideLegend();

        switch(action) {
            case 0:
            case 1:
                // 框选
                me.clearFrameSelect();
                var drawingMode = action === 1 ? 'circle' : 'polygon';
                drawingManager && drawingManager.close();
                if (active) {
                    me.toggleChartLink(false);
                    $(this).removeClass('active');
                } else {
                    me._gisMap.pauseTimeAnimation();
                    drawingManager && drawingManager.open({
                        drawingMode: drawingMode
                    });
                    $(this).addClass('active');
                }
                dragBox && dragBox.close();
                break;

            case 2:
                // 放大
                if (active) {
                    dragBox && dragBox.close();
                    $(this).removeClass('active');

                } else {
                    me._gisMap.pauseTimeAnimation();
                    dragBox && dragBox.open();
                    $(this).addClass('active');

                }
                drawingManager && drawingManager.close();
                break;

            case 3:
                // 图层控制
                if (active) {
                    $(this).removeClass('active');
                    me._gisMap.hideLegend();

                } else {
                    $(this).addClass('active');
                    me._gisMap.showLegend();
                }
                drawingManager && drawingManager.close();
                dragBox && dragBox.close();
                break;
            case 4:
                // 图层切换
                me.layerChangeHandle(e);
                if (active) {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }
                break;
        };

        e.stopPropagation();
        return false;
    });


    // 创建框选结果列表的Dom

    var $selectResultBlock = this.$selectResultBlock = $('<div class="select-frame-result"><h4>'+(locale=='zh'?'所选信息':'Information selected')+' <span class="close"><i class="bdp-icon"></i></span></h4></div>');
    var $selectResultList = $('<ul></ul>');
    $selectResultBlock.append($selectResultList);

    $selectResultBlock.on('click', '.close', function() {
        me.toggleChartLink(false);
        me.clearFrameSelect();
    });


    // 框选后的回调，polygon为框选范围的多边形对象，用于检测在框选范围中的点
    function handleFrameSelect(polygon, e) {
        me.selectFrameOverlay = polygon;
        $toolList.find('li.select-frame').removeClass('active');
        // search points in the selected bounds
        var result = [];
        var layers = me._gisMap.getDrawedLayers();
        var layersInfo = me._gisMap.layerInfo;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i],
                layerCanvas = layer.getCanvas(),
                elements = layer.getDrawedElements(),
                shape = layer.getDrawOptions().shape,
                color = layer.getDrawOptions().fillStyle,
                layerIndex = i;
            if (/*layer.getType() !== 'bubble' || */!$(layerCanvas).is(":visible")) { // 框选对热力图和点状图及隐藏的图层无效
                continue;
            }

            for (var j = 0; j < elements.length; j++) {
                var data = elements[j].data,
                    point = window.BMap ? new BMap.Point(data.lng, data.lat) : {lat: data.lat, lng: data.lng};

                if (drawingManager.isPointInPolygon(point, polygon, e)) {
                    if (!data.color) {
                        data.color = color;
                    }
                    result.push({shape: shape, point: data, layerIndex: i});
                }
            }
        }

        if (result.length) {
            var $temp = $('<div>');
            result.forEach(function(item) {
                var point = item.point, shape = item.shape;
                var labels = point.labels;
                var $li = $('<li>');
                $li.attr('data-layerIndex', item.layerIndex);
                $li.append('<i class="icomoon icomoon-' + shape + '" style="color: ' + point.color + '">');

                var $texts = $('<div class="texts">');

                if (labels && labels.length) {
                    for (var i = 0; i < labels.length; i++) {
                        var label = labels[i];
                        $texts.append('<p><strong>' + label.name + ': </strong>' + label.value + '</p>');
                    }
                } else {
                    // 无标签和数值字段，默认显示经纬度
                    $texts.append('<p><strong>经度: </strong>' + formatLngAndLat(point.lng) + '</p>');
                    $texts.append('<p><strong>纬度: </strong>' + formatLngAndLat(point.lat) + '</p>');
                }

                $li.append($texts);
                $temp.append($li);
            });
            $selectResultList.html($temp.html());

            me.showSelectResult();

            if (me.panOffset > 0) {
                if (window.BMap) {
                    map.panBy(-(me.panOffset - $selectResultBlock.width()), 0);
                } else {
                    map.panBy([(me.panOffset - $selectResultBlock.width()), 0]);
                }

            } else {
                if (window.BMap) {
                    map.panBy(-$selectResultBlock.width(), 0);
                } else {
                    map.panBy([$selectResultBlock.width(), 0]);
                }
            }
            me.panOffset = $selectResultBlock.width();

        } else {
            if (me.panOffset > 0) {
                if (window.BMap) {
                    map.panBy(me.panOffset, 0);
                } else {
                    map.panBy([me.panOffset, 0]);
                }
                me.panOffset = 0;
            }

            me.hideSelectResult();
        }

        $toolList.find('li').removeClass('active');
        me.toggleChartLink(true, result);
    }
    // 框选移动回调，e 为传入的oprins对象,检测选中的点
    function handleFrameMoveSelect(e) {
        var polygon = e.overlay;
        var result = [];
        var layers = me._gisMap.getDrawedLayers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var elements = layer.getDrawedElements();
            var layerCanvas = layer.getCanvas();
            var shape = layer.getDrawOptions().shape;
            if (/*layer.getType() !== 'bubble' || */!$(layerCanvas).is(":visible")) { // 框选对热力图和点状图及隐藏的图层无效
                continue;
            }
            for (var j = 0; j < elements.length; j++) {
                var data = elements[j].data,
                    point = window.BMap ? new BMap.Point(data.lng, data.lat) : {lat: data.lat, lng: data.lng};

                if (drawingManager.isPointInPolygon(point, polygon)) {
                    result.push({shape: shape, point: data, layerIndex: i});
                }
            }
        }
        me.selectMoveTotal = result.length;
        me.radius = (polygon.getRadius() / 1000).toFixed(2);
        setSelectMoveOptions(e);
    }
    // 设置tootip里的信息
    function setSelectMoveOptions(e) {
        var BMapViztoolsEloOffset = me.ctrlDom.offset();
        var BMapViztoolsElOffsetX = BMapViztoolsEloOffset.left;
        var BMapViztoolsElOffsetY = BMapViztoolsEloOffset.top;
        var chartGisElOffset = me.ctrlDom.parents('.chart-gis').offset();
        var chartGisElOffsetX = chartGisElOffset.left;
        var chartGisElOffsetY = chartGisElOffset.top;
        me.ctrlDom.find('.selec-tooltip').css({
            left: e.offsetX - BMapViztoolsElOffsetX + chartGisElOffsetX + 10,
            top: e.offsetY - BMapViztoolsElOffsetY + chartGisElOffsetY + 10,
            opacity: 1
        });
        var selectMoveRadiusHtml = me.radius + 'Km';
        if (me.radius < 1) {
            me.radius *=  1000;
            selectMoveRadiusHtml = me.radius + 'm'
        }
        me.ctrlDom.find('.select-move-radius').html(selectMoveRadiusHtml);
        me.ctrlDom.find('.select-move-total').html(me.selectMoveTotal + '项');
    }
    $ctrlDom.on("mouseenter", ".tools-list", function(e) {
        if(window.L) {
            map.doubleClickZoom.disable();
        }
        e.stopPropagation();
        return false;
    });

    $ctrlDom.on("mouseleave", ".tools-list", function(e) {
        if(window.L) {
            map.doubleClickZoom.enable();
        }
        e.stopPropagation();
        return false;
    });



    // 当光标在图例控件上时，停止响应鼠标滚轮缩放
    $ctrlDom.on("mouseenter", ".select-frame-result", function(e) {
        // console.log('disableScrollWheelZoom');
        if(window.BMap) {
            map.disableScrollWheelZoom();
        } else {
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
        }
        e.stopPropagation();
        return false;
    });

    $ctrlDom.on("mouseleave", ".select-frame-result", function(e) {
        // console.log('enableScrollWheelZoom');
        if (window.BMap) {
            map.enableScrollWheelZoom();
        } else {
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
        }
        e.stopPropagation();
        return false;
    });


    // 构造结构以适应布局
    $ctrlDom.append($selectResultBlock);
    $(map.getContainer().parentNode).append($('<div style="float:right;" class="BMap_viztools">').append($toolList));//$("#chartBox")

    return $ctrlDom.get(0);
}

VizToolControl.prototype.reset = function() {
    var me = this;
    if (this.panOffset > 0) {
        if (window.BMap) {
            this.map.panBy(this.panOffset, 0);
        } else {
            this.map.panBy([this.panOffset, 0]);
        }
        this.panOffset = 0;
    }

    this.drawingManager && this.drawingManager.close();
    this.dragBox && this.dragBox.close();

    this.clearFrameSelect();

    this.$toolList.find('li.active:not(.tool-layer-ctrl)').removeClass('active');

}

VizToolControl.prototype.toggleLayerCtrl = function(active) {
    if (active === undefined) {
        active = !this.$toolList.find('li.tool-layer-ctrl').hasClass('active');
    }
    if (active) {
        this.$toolList.find('li.tool-layer-ctrl').addClass('active');
    } else {
        this.$toolList.find('li.tool-layer-ctrl').removeClass('active');
    }
}

/**
 * 切换图表联动的生效
 * @param  {boolean}   enable true: 联动生效 / false: 取消联动
 * @param  {array  }   points 框选选中的点数组
 * @return {void}          
 * @author linhuang@haizhi.com
 * @date   2018-03-14
 */
VizToolControl.prototype.toggleChartLink = function(enable, points) {
    var chart = this._gisMap.chartInstance;
    var pointsArr = enable ? points : [];
    // 图表编辑页和设置了联动的图表才触发联动
    if (chart.mode !== 'edit' && chart.optional.linked_chart_type == 2) {
        chart.emit('refreshLinkedCharts', pointsArr, chart);
    }
}

VizToolControl.prototype.showSelectResult = function() {
    this.$selectResultBlock.addClass('show');
    if (this._gisMap.legendControl) {
        if (window.BMap) {
            this._gisMap.legendControl.setOffset(new BMap.Size(this.$selectResultBlock.width(), 0));
        } else {
            $(this._gisMap.legendControl.getContainer()).css("right", this.$selectResultBlock.width());
        }
    }
    // this.$toolList.find("li.tool-layer-ctrl").removeClass("active");
    // this._gisMap.hideLegend();
}

VizToolControl.prototype.hideSelectResult = function() {
    this.$selectResultBlock.removeClass('show');
    if (this._gisMap.legendControl) {
        if (window.BMap) {
            this._gisMap.legendControl.setOffset(new BMap.Size(0, 0));
        } else {
            $(this._gisMap.legendControl.getContainer()).css("right", '');
        }
    }
}

// 清除框选状态和结果
VizToolControl.prototype.clearFrameSelect = function() {
    var me = this;
    // 重置的时候如果有圆心中心点需要去掉
    if (this.drawingManager.circleMarkers) {
        this.drawingManager.circleMarkers.forEach(function(item, index) {
            me.map.removeOverlay(item);
        });
    }
    this.hideSelectResult();
    if (this.selectFrameOverlay) {
        if (window.BMap) {
            this.map.removeOverlay(this.selectFrameOverlay);
        } else {
            this.map.removeLayer(this.selectFrameOverlay);
        }
        this.selectFrameOverlay = null;
    }

    this.$toolList.find('li.tool-select-frame').removeClass('active');
    $('.circle-click').css({
        opacity: 0
    });
}

VizToolControl.prototype.hideSelectResultInLayer = function(layerIndex) {
    if (this.$selectResultBlock) {
        this.$selectResultBlock.find('li[data-layerIndex=' + layerIndex + ']').hide();
    }
}

VizToolControl.prototype.showSelectResultInLayer = function(layerIndex) {
    if (this.$selectResultBlock) {
        this.$selectResultBlock.find('li[data-layerIndex=' + layerIndex + ']').show();
    }
}

VizToolControl.prototype.layerChangeHandle = function(e){
    var self = this;
    var data = $(e.target).data('layer');
    if (!data) {
        return;
    }
    var map = this.map;
    var index = this.layerConfig.indexOf(data);
    if (this.layerIndex === index) {
        // 点击的已经选择的项
        return;
    }
    // 找出当前图层
    var layer = _.find(map._layers, function (layer) {
        return layer.index === self.layerIndex;
    });

    // 删除当前图层，添加点击的图层
    map.removeLayer(layer);
    var tileLayer = L.tileLayer(data.url, data.options);
    this.layerIndex = tileLayer.index = index;
    tileLayer.addTo(map);

    // 样式适配
    $(e.target).siblings('.click').removeClass('click');
    $(e.target).addClass('click');
}

// 对经纬度进行格式化：保留小数点后2位，加上单位后缀°
function formatLngAndLat (num, count) {
  count = count === undefined ? 2 : count;
  return new Number(num).toFixed(count) + '°';
}
