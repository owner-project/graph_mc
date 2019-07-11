//@ sourceURL=LegendControl.js
// 图例控件
window.LegendControl = {};

if (window.BMap) {
    // 百度地图的控件实现
    window.LegendControl = function(options){  
        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
        this.defaultOffset = new BMap.Size(0, 0);
        this._gisMap = options.gisMap;
    }

    LegendControl.prototype = new BMap.Control();

    LegendControl.prototype.initialize = function(map) {
        var div = this.init(map);
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div); 
        return div;
    }
} else if (window.L) {
    // Leaflet的控件实现
    window.LegendControl = L.Control.extend({
        _gisMap: null,
        includes: L.Mixin.Events,
        onAdd: function(map) {
            this._gisMap = this.options.gisMap;
            return this.init(map);
        },
    });
}

LegendControl.prototype.init = function(map){
    var locale = bdpChart.language || 'zh',
         me = this;                  

    this.map = map;

    var $ctrlDom = $("<div>").addClass("BMap_legend"),
        $layerList = $("<ul>").addClass("layer-list"); 

    $ctrlDom.append($layerList);

    this.$container = $ctrlDom;

    this.initContent();

     // 当光标在图例控件上时，停止响应鼠标滚轮缩放
    $ctrlDom.on("mouseenter", "ul.layer-list", function(e) {
        if (window.BMap) {
            map.disableScrollWheelZoom();

        } else {
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
        }
    });

    $ctrlDom.on("mouseleave", "ul.layer-list", function(e) {
        if (window.BMap) {
            map.enableScrollWheelZoom();

        } else {
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
        }

    });   

    // 隐藏和显示 legend 的 图层信息
    $ctrlDom.on('click','li.layer-item',function(e){
         var layerIndex = $(this).index();
         //如果看不见这个图层，就显示图层
        if ($(this).hasClass('invisible-layer')) {
            me._gisMap.showLayer(layerIndex);

        } else { //如果看见这个图层就隐藏图层
            me._gisMap.hideLayer(layerIndex);
        }
        $(this).toggleClass('invisible-layer');
        e.stopPropagation();
        return false;
    });

    return $ctrlDom.get(0);
}; 


LegendControl.prototype.initContent = function() {
    var layers = this._gisMap.layerInfo || [],
        $layerList = this.$container.find('.layer-list');
    var symbols = {
        train: {
            url: "M1.8623 3.22021C1.8623 4.9978 3.26758 6.4397 5 6.4397C6.73242 6.4397 8.13672 4.9978 8.13672 3.22021C8.13672 1.44214 6.73242 0 5 0C3.26758 0 1.8623 1.44214 1.8623 3.22021ZM10 9.12646C10 8.32288 9.36523 7.67188 8.58203 7.67188H1.41797C0.634766 7.67188 0 8.32288 0 9.12646L0.53418 15.2107L0.541992 15.3037L0.543945 15.3148C0.611328 15.7667 0.992188 16.114 1.45215 16.115H1.72559L1.76465 16.114L1.80469 16.115C2.09766 16.134 2.33594 16.3667 2.37207 16.6646C2.375 16.6846 2.37793 16.705 2.37793 16.726L2.86914 23.0422L2.88379 23.2246C2.95996 23.6655 3.33594 24 3.78613 24H6.20996C6.66797 24 7.04785 23.6549 7.11719 23.2046L7.12891 23.0632L7.62012 16.7356C7.62109 16.7076 7.62305 16.6808 7.62793 16.6528C7.66699 16.3612 7.90332 16.134 8.19531 16.115L8.23438 16.114L8.27344 16.115H8.55078C9 16.114 9.37305 15.7833 9.4541 15.3472L9.46973 15.1659L10 9.12646Z",
            transform: { angle: 0, translate: [6, 0]}
        },
        fly: {
            url: "M11.3205 0C10.1074 0.000172633 9.70338 5.89522 9.70312 9.75919L0.795819 16.478C0.294729 16.8559 6.47376e-05 17.4472 0 18.0749L0.000151054 18.298L9.88577 14.8564C10.0201 17.1161 10.2011 19.3383 10.3342 20.8498L7.74518 22.4772C7.4539 22.6603 7.27719 22.9801 7.27754 23.3236L7.27736 23.5845L11.3205 22.7711L15.3635 23.5844L15.3636 23.3236C15.3633 22.98 15.1869 22.66 14.8956 22.4771L12.3068 20.8496C12.4396 19.3382 12.6211 17.1159 12.7552 14.856L22.6413 18.2979L22.6411 18.0747C22.6412 17.4471 22.3468 16.8558 21.8455 16.4781L12.9376 9.75917C12.9375 5.91839 12.5332 0.000151054 11.3205 0Z",
            transform: { angle: 45, translate: [12, -10]}
        },
        police: {
            url: "M4.93848 5.95044C3.83691 5.95044 2.7998 5.69922 1.89062 5.26514C2.18359 6.82642 3.43652 8 4.93848 8C6.43945 8 7.69238 6.82642 7.98535 5.26514C7.07715 5.69922 6.04004 5.95044 4.93848 5.95044ZM8.87988 3.10474C9.01562 3.02368 9.65625 2.58716 9.39746 1.55225C9.13867 0.517334 7.6748 0.00390625 4.98242 0C2.29004 0.00390625 0.859375 0.776123 0.600586 1.55225C0.342773 2.32837 0.982422 3.02295 1.11816 3.10474C0.998047 6.20898 9.00195 6.20947 8.87988 3.10474ZM4.98438 1.52686L5.30859 2.14551L5.96875 2.27881L5.50586 2.79443L5.58887 3.49463L4.98242 3.19385L4.37598 3.49463L4.45898 2.79443L4.00098 2.27881L4.66016 2.14551L4.98438 1.52686ZM2.52246 2.58716H3.75293V2.948H2.52246V2.58716ZM6.21191 2.58716H7.44238V2.948H6.21191V2.58716ZM1.41797 8.67188H3.19238L5 15L6.80762 8.67188H8.58203C9.36523 8.67188 10 9.32275 10 10.1265L9.46973 16.1658L9.4541 16.3472C9.37305 16.7834 9 17.114 8.55078 17.115H8.27344L8.23438 17.114L8.19531 17.115C7.90332 17.134 7.66699 17.3611 7.62793 17.6528C7.62305 17.6807 7.62109 17.7078 7.62012 17.7356L7.12891 24.0632L7.11719 24.2046C7.04785 24.6548 6.66797 25 6.20996 25H3.78613C3.33594 25 2.95996 24.6655 2.88379 24.2246L2.86914 24.0422L2.37793 17.7261C2.37793 17.7048 2.375 17.6846 2.37207 17.6646C2.33594 17.3667 2.09766 17.134 1.80469 17.115L1.76465 17.114L1.72559 17.115H1.45215C0.992188 17.114 0.611328 16.7668 0.543945 16.3147L0.541992 16.3037L0.53418 16.2107L0 10.1265C0 9.32275 0.634766 8.67188 1.41797 8.67188ZM5.5 9.67188L6 8.67188H4L4.5 9.67188H5.5ZM5.33887 10L5.67871 11L5 13L4.32031 11L4.66016 10H5.33887Z",
            transform: { angle: 0, translate: [6, -2]}
        },
        car: {
            url: "M2.73134 1.61279C2.47743 1.70142 2.22255 1.73767 1.99208 1.72729C1.35438 2.40991 0.979384 3.24805 0.979384 4.15381L0.978407 7.38464L0.976454 9.13464C0.613173 9.25317 0.269423 9.4502 0.141493 9.69238C-0.176866 10.2931 0.141493 10.6155 0.141493 10.6155L0.976454 10.4186C0.976454 14.3934 0.984267 19.2139 0.984267 19.2139H0.998915C0.931532 20.3606 0.966688 22.5198 2.04774 23.5385C2.537 24 4.73036 24 6.45009 24C8.16884 24 10.2724 24 10.7606 23.5385C12.1737 22.204 11.7987 18.9199 11.745 18.5049V10.5715L12.8583 10.8344C12.8583 10.8344 13.1766 10.512 12.8583 9.91125C12.6972 9.60742 12.1981 9.37476 11.745 9.27881V6.29126C11.745 6.24561 11.7431 6.20056 11.7401 6.15625V4.15381C11.7401 3.30444 11.4091 2.51453 10.8427 1.85657C10.662 1.84656 10.4716 1.80969 10.2811 1.74316C9.66395 1.52722 9.25575 1.07214 9.27821 0.663818C8.43739 0.243774 7.43544 0 6.35927 0C5.40614 0 4.50966 0.191528 3.73329 0.527466C3.75966 0.937378 3.35145 1.39587 2.73134 1.61279ZM2.4452 7.38452C3.49891 5.06519 9.36122 5.06519 10.4149 7.38452C10.497 7.56506 9.78212 10.6155 9.29286 10.6155H3.42372C2.93446 10.6155 2.34169 7.61328 2.4452 7.38452ZM2.09755 6.46179C2.22548 6.21948 2.35438 5.82861 2.5077 5.3645C2.93934 4.0603 3.56141 2.17737 4.89052 1.38464C4.40028 1.38464 3.23622 1.91431 2.93446 2.76929C2.4452 4.15393 2.09755 6.00024 2.09755 6.46179ZM10.3495 5.3645C10.5028 5.82861 10.6317 6.21948 10.7597 6.46179C10.7597 6.00024 10.412 4.15393 9.92274 2.76929C9.62099 1.91431 8.45692 1.38464 7.96669 1.38464C9.29579 2.17737 9.91786 4.0603 10.3495 5.3645ZM2.09755 9.69226V16.1538C2.09755 16.8922 2.51063 18 2.99989 18L3.00087 17.5298C3.00575 15.0657 3.01454 10.5569 2.09755 9.69226ZM10.9013 16.1538V9.69226C9.98524 10.5563 9.99403 15.0592 9.99891 17.5245L9.99989 18C10.4891 18 10.9013 16.8922 10.9013 16.1538ZM6.49891 18C5.03212 18.0001 3.56434 18.1351 3.56434 18.4615C3.56337 19.385 3.56434 20.7693 4.05458 21.2308C5.03309 22.1528 7.96669 22.1539 8.9452 21.2308C9.43446 20.7693 9.43349 19.3848 9.43349 18.4615C9.43349 18.1346 7.96669 17.9999 6.49891 18Z",
            transform: { angle: 0, translate: [6, 0]},
        },
        policeStation: {
            url: "M11.669 0.602081L11 0L10.3311 0.602081L0.331097 9.60208C-0.0795472 9.97153 -0.11275 10.6038 0.256879 11.0143C0.626019 11.4248 1.25834 11.4581 1.66899 11.0887L11 2.69073L20.3311 11.0887C20.7417 11.4581 21.3741 11.4248 21.7432 11.0143C22.1128 10.6038 22.0796 9.97153 21.669 9.60208L11.669 0.602081ZM11 3.84537L19 10.8454V21.8454H3.00004V10.8454L11 3.84537ZM5.50004 10.8454L11 7.84537L16.5 10.8454V15.8454C16.5 18.8454 11 20.8454 11 20.8454C11 20.8454 5.50004 18.8454 5.50004 15.8454V10.8454ZM8.33354 17.8454L11 16.5822L13.6665 17.8454L13.2222 14.898L15 12.7927L12.3335 12.3717L11 9.84537L9.66655 12.3717L7.00004 12.7927L8.77787 14.898L8.33354 17.8454Z",
            transform: { angle: 0, translate: [2, -1], scale: 0.8},
        },
        hotel: {
            url: "M2 0H14V19H15V5H22V19H24V20H0V19H2V0ZM4 6H7V8H4V6ZM12 6H9V8H12V6ZM4 10H7V12H4V10ZM12 10H9V12H12V10ZM4 14H7V16H4V14ZM12 14H9V16H12V14ZM4 2H7V4H4V2ZM12 2H9V4H12V2ZM17 7H20V9H17V7ZM20 11H17V13H20V11ZM17 15H20V17H17V15Z",
            transform: { angle: 0, translate: [2, 0], scale: 0.7},
        }
    };

    var addSymbol = function (symbols, item) {
        var symbol = symbols[item.shape],
            transform = symbol.transform;
        return [
            '<path fill-rule="evenodd" clip-rule="evenodd" d="',
            symbol.url,
            '" transform="translate(' + transform.translate.join(" ") + ') rotate(' + transform.angle + ') scale(' + (transform.scale || 1) + ')" fill="' + item.color + '"/>',
        ].join(" ");
    };

    $layerList.html("");

    if (layers.length < 2) {  // 少于两个图层时不展示图例
        this.$container.hide();
        if (this._gisMap.vizToolControl) {
           this._gisMap.vizToolControl.toggleLayerCtrl(false); 
        }
        
    } else {
        this.$container.show();
        if (this._gisMap.vizToolControl) {
           this._gisMap.vizToolControl.toggleLayerCtrl(true); 
        }
    }

    var count = 0;
    for(var i = 0 ,len = layers.length; i < len; i++) {

        var layer = layers[i];
       
        if($.isEmptyObject(layer) || layer.invisible) {
            continue;
        }

        var layer_name = layer.layer_name,
            layer_type = layer.type,
            $layerItem = $("<li>").addClass("layer-item"),
            $layerTitle = $("<div>").addClass("layer-title"),
            $layerLegends = $("<ul>").addClass("layer-legends");

        var layerLegendsInfo = [], graph_type = layer_type;
        var hasIcon, icon;

        // generate layer data
        switch(layer_type) {
            case 'heatmap': 
                layerLegendsInfo.push({
                    type: 'gradient',
                    gradient: [
                      {
                        'pos': 'start',
                        'color': 'blue'
                      },
                      {
                        'pos': '60%',
                        'color': 'cyan'
                      },
                      {
                        'pos': '70%',
                        'color': 'lime'
                      },
                      {
                        'pos': '80%',
                        'color': 'yellow'
                      },
                      {
                        'pos': 'end',
                        'color': 'red'
                      }
                    ],
                    title: layer.y[0] ? layer.y[0].nick_name || layer.y[0].name : '数值',
                });
                break;

            case 'massive':
            case 'bubble':
                var defaultColor, shape;  // shape：图例的形状
                if (layer_type === 'massive') {
                    defaultColor = "#94afdf";
                    shape = "circle";

                } else {
                    defaultColor = "rgb(238, 75, 75)";
                    shape = graph_type = layer.bubble_symbol;

                    if (shape === 'ripple') {
                        shape = 'circle';
                        defaultColor = '#5182e4';
                    }
                }

                var color_setting = layer.color_setting;
                if (!color_setting) {  // 无颜色设置
                    var y = layer.y[0];
                    layerLegendsInfo.push({
                        type: 'enum',
                        color: defaultColor,
                        title: y ? (y.nick_name || y.name) : '数值',
                        shape: shape
                    });

                } else if (color_setting.mode === 1) {  // 渐变色
                    color_setting.range_color = color_setting.range_color || {
                        start_color:  'red',
                        end_color: 'blue'
                    };
                    layerLegendsInfo.push({
                        type: 'gradient',
                        gradient: [
                          {
                            'pos': 'start',
                            'color': color_setting.range_color.start_color
                          }, 
                          {
                            'pos': 'end',
                            'color': color_setting.range_color.end_color
                          }
                        ],
                        title: color_setting.field[0].nick_name || color_setting.field[0].name
                    });

                } else if (color_setting.mode === 0) {  // 枚举色
                    var colorMap = color_setting.enum_color_map;
                    Object.keys(colorMap).forEach(function(key) {
                        layerLegendsInfo.push({
                            type: 'enum',
                            color: colorMap[key].color,
                            title: key,
                            shape: shape
                        });
                    });
                }
                break;

            case 'graph':
                graph_type = layer.graph_type
                layer.y.forEach(function(yField) {
                    layerLegendsInfo.push({
                        type: 'enum',
                        color: yField.series_color,
                        title: yField.nick_name || yField.name,
                        shape: 'circle',
                    });
                });
                break;

        }

        icon = "<i class ='icomoon icomoon-" + graph_type + "'></i>";
        hasIcon = !!~(["police", "fly", "train", "car", "policeStation", "hotel"].indexOf(graph_type));
        // generate layer title
        if (hasIcon) {
            icon = [
                '<i class="icomoon">',
                '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
                addSymbol(symbols, { shape: graph_type, color:  "#A3ABB0"}),
                '</svg>',
                '</i>'
            ].join("");
        }
        $layerTitle.append(icon)  
                  .append("<span title = '" + layer_name + "' style='pointer-events: auto' class='nowrap'>" + layer_name + "</span>");

        $layerItem.append($layerTitle);

        // generate layer legends dom
        if (layerLegendsInfo.length > 0 && layer.lng.length > 0 && layer.lat.length > 0) {
              // 当有一个图层的图例超过5个时，显示"展开"按钮，默认只显示5项
              // 暂时不需要展开操作了，先注释掉，以后可能需要，勿删
              // if (layerLegendsInfo.length > 5 && $ctrlDom.find(".expand-btn").length === 0) { // 添加展开按钮
              //     var $expand = $("<div>").addClass("expand-btn").text(locale === 'zh' ? '展开' : 'expand');
              //     $layerList.addClass("need-expand");
              //     $ctrlDom.append($expand);

              //     this._gisMap.$elem.on("click", ".expand-btn", function(e) {
              //         if ($(this).hasClass("active")) {
              //             $ctrlDom.find(".layer-legends").removeClass("expanded");
              //             $(this).text(locale === 'zh' ? '展开' : 'expand');

              //         } else {
              //             $ctrlDom.find(".layer-legends").addClass("expanded");
              //             $(this).text(locale === 'zh' ? '收起' : 'retract');
              //         }

              //         $(this).toggleClass('active');

              //     });
              // }

              layerLegendsInfo.forEach(function(item, index) {
                var $legendItem = $("<li>").attr("style","pointer-events : auto");
                hasIcon = !!~(["police", "fly", "train", "car", "policeStation", "hotel"].indexOf(item.shape));
                
                if (item.type === 'gradient') {
                    var gradient = "left";
                    gradient = item.gradient.reduce(function(gradient, gradientItem) {
                        if (gradientItem.pos === 'end' || gradientItem.pos === 'start') {
                            gradientItem.pos = '';
                        }
                        return gradient  + ", " + gradientItem.color + " " + gradientItem.pos;

                    }, gradient);

                    $legendItem.append("<div class='linear-gradient-legend' style=' background:" + "-webkit-linear-gradient(" + gradient + ")'></div>")
                              .append("<span title = '"+ item.title +"'  class='nowrap'>" + item.title + "</span>");

                } else if (item.type === 'enum') {
                    icon = "<i class='icomoon icomoon-" + item.shape +  "' style='color:" + item.color + "'></i>";
                    if (hasIcon) {
                        icon = [
                            '<i class="icomoon">',
                            '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
                            addSymbol(symbols, item),
                            '</svg>',
                            '</i>'
                        ].join("");
                    }
                    $legendItem.append(icon).append("<span title = '"+ item.title +"' class='nowrap'>" + item.title + "</span>");
                }

                $layerLegends.append($legendItem);
            });

            $layerItem.append($layerLegends);
        } 

        $layerList.append($layerItem);

    }
 
}


LegendControl.prototype.reset = function() {
    this.initContent();
}

LegendControl.prototype.show = function() {
    this.$container.show();
}

LegendControl.prototype.hide = function() {
    this.$container.hide();
}

