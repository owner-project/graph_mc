//@ sourceURL=RectangleZoom.js
/*
 * 区域拉框放大功能类，在mapv/VizToolControl中被调用
 * inspired by https://github.com/consbio/Leaflet.ZoomBox 
 */
L.RectangleZoom = function(map, opts) {
    if (!map) {
        return;
    }

    this._map = map;
    this._opts = {
        autoClose: false,  // 是否在每次操作后，自动关闭拉框缩放状态
        onClose: null  // 关闭拉框状态的回调
    };
    for (var p in opts) {
        if (typeof(opts[p]) != "undefined") {
            this._opts[p] = opts[p];
        }
    }

    this._active = false;

    // Bind to the map's boxZoom handler
    var _origMouseDown = map.boxZoom._onMouseDown;
    map.boxZoom._onMouseDown = function(e){
        if (e.button === 2) return;  // prevent right-click from triggering zoom box
        _origMouseDown.call(map.boxZoom, {
            clientX: e.clientX,
            clientY: e.clientY,
            which: 1,
            shiftKey: true
        });
    };

    if (this._opts.autoClose) {
        map.on('boxzoomend', this.close, this);
    }
};

/* 
 * 开启拉框状态
 */
L.RectangleZoom.prototype.open = function() {
    if (!this._active) {
        this._active = true;
        this._map.dragging.disable();
        this._map.boxZoom.addHooks();
        L.DomUtil.addClass(this._map.getContainer(), 'leaflet-crosshair');
    }
};

/* 
 * 关闭拉框状态
 */
L.RectangleZoom.prototype.close = function() {
    if (this._active) {
        this._active = false;
        this._map.dragging.enable();
        this._map.boxZoom.removeHooks();
        L.DomUtil.removeClass(this._map.getContainer(), 'leaflet-crosshair');

        if (this._opts.onClose && typeof this._opts.onClose == 'function') {
            this._opts.onClose();
        }
    }
};

