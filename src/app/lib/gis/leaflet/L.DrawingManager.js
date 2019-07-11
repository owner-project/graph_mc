//@ sourceURL=DrawingManager.js
/*
 * 绘制矢量图形的功能类，在mapv/VizToolControl中被调用，用于实现框选控能
 */
 //@see https://github.com/manuelbieh/Geolib
var geolib = {
    getKeys: function(point) {
        // GeoJSON Array [longitude, latitude(, elevation)]
        if (Object.prototype.toString.call(point) == '[object Array]') {
            return {
                longitude: point.length >= 1 ? 0 : undefined,
                latitude: point.length >= 2 ? 1 : undefined,
                elevation: point.length >= 3 ? 2 : undefined,
            };
        }

        var getKey = function(possibleValues) {
            var key;

            possibleValues.every(function(val){
                // TODO: check if point is an object
                if (typeof point !== 'object') {
                    return true;
                }
                return point.hasOwnProperty(val)
                    ? (function() {
                          key = val;
                          return false;
                      })()
                    : true;
            });

            return key;
        };

        var longitude = getKey(['lng', 'lon', 'longitude']);
        var latitude = getKey(['lat', 'latitude']);
        var elevation = getKey(['alt', 'altitude', 'elevation', 'elev']);

        // return undefined if not at least one valid property was found
        if (
            typeof latitude === 'undefined' &&
            typeof longitude === 'undefined' &&
            typeof elevation === 'undefined'
        ) {
            return undefined;
        }

        return {
            latitude: latitude,
            longitude: longitude,
            elevation: elevation,
        };
    },
    getElev: function(point) {
        return point[geolib.getKeys(point).elevation];
    },
    elevation: function(point) {
        return geolib.getElev.call(geolib, point);
    },
    getDistance: function(start, end, accuracy, precision) {
	    accuracy = Math.floor(accuracy) || 0.00001;
	    precision = Math.floor(precision) || 0;

	    var TO_RAD = Math.PI / 180;

	    var s = start;
	    var e = end;

	    var a = 6378137,
	        b = 6356752.314245,
	        f = 1 / 298.257223563; // WGS-84 ellipsoid params
	    var L = (e.longitude - s.longitude) * TO_RAD;

	    var cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM, sinSigma;

	    var U1 = Math.atan((1 - f) * Math.tan(parseFloat(s.latitude) * TO_RAD));
	    var U2 = Math.atan((1 - f) * Math.tan(parseFloat(e.latitude) * TO_RAD));
	    var sinU1 = Math.sin(U1),
	        cosU1 = Math.cos(U1);
	    var sinU2 = Math.sin(U2),
	        cosU2 = Math.cos(U2);

	    var lambda = L,
	        lambdaP,
	        iterLimit = 100;
	    do {
	        var sinLambda = Math.sin(lambda),
	            cosLambda = Math.cos(lambda);
	        sinSigma = Math.sqrt(
	            cosU2 * sinLambda * (cosU2 * sinLambda) +
	                (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
	        );
	        if (sinSigma === 0) {
	            return 0;//(geolib.distance = 0); // co-incident points
	        }

	        cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
	        sigma = Math.atan2(sinSigma, cosSigma);
	        sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
	        cosSqAlpha = 1 - sinAlpha * sinAlpha;
	        cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

	        if (isNaN(cos2SigmaM)) {
	            cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
	        }
	        var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
	        lambdaP = lambda;
	        lambda =
	            L +
	            (1 - C) *
	                f *
	                sinAlpha *
	                (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
	    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

	    if (iterLimit === 0) {
	        return NaN; // formula failed to converge
	    }

	    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);

	    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));

	    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

	    var deltaSigma =
	        B *
	        sinSigma *
	        (cos2SigmaM +
	            B /
	                4 *
	                (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
	                    B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

	    var distance = b * A * (sigma - deltaSigma);

	    distance = distance.toFixed(precision); // round to 1mm precision

	    //if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
	    if (typeof geolib.elevation(start) !== 'undefined' && typeof geolib.elevation(end) !== 'undefined') {
	        var climb = Math.abs(geolib.elevation(start) - geolib.elevation(end));
	        console.log(start, end, distance)
	        distance = Math.sqrt(distance * distance + climb * climb);
	    }

	    return Math.round(distance * Math.pow(10, precision) / accuracy) * accuracy / Math.pow(10, precision);

	    /*
	    // note: to return initial/final bearings in addition to distance, use something like:
	    var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
	    var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);
	    return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
	    */
	},
	isPointInCircle: function(latlng, center, radius) {
	    return geolib.getDistance(latlng, center) < radius;
	}
};

L.DrawingManager = function(map, opts) {
	if (!map) {
        return;
    }

    this._map = map;
    this._opts = {
    	drawingMode: 'polygon',
        autoClose: false,  // 是否在每次操作后，自动关闭绘制状态
        onFinishDrawing: null,  // 完成绘制后的回调
        onClose: null  // 关闭绘制状态的回调
    };
    for (var p in opts) {
        if (typeof(opts[p]) != "undefined") {
            this._opts[p] = opts[p];
        }
    }

    if (this._opts.onFinishDrawing && typeof this._opts.onFinishDrawing == 'function') {
    	var cb = this._opts.onFinishDrawing;
    	var self = this;
	    map.editTools.on("editable:drawing:commit", function(e) {
	    	if (e.target && e.target.featuresLayer) {
	    		var drawnLayers = e.target.featuresLayer.getLayers();
	    		cb.call(self, drawnLayers[drawnLayers.length - 1], e);
	    	}
	    });
    }
    
    this._active = false;
}

L.DrawingManager.prototype = {
	open: function(opts) {
		var map = this._map,
			drawingFuncs = {
				'marker': 'startMarker',
				'polyline': 'startPolyline',
				'polygon': 'startPolygon',
				'rectangle': 'startRectangle',
				'circle': 'startCircle'
			},
			drawing = drawingFuncs[opts.drawingMode || this._opts.drawingMode];

		if (!drawing) {
			drawing = drawingFuncs['polygon'];
		}
		this._opts.drawingMode = drawing;

		map.editTools[drawing]();

		var self = this;
		map.doubleClickZoom.disable();
		
		map.once("dblclick", function(e) {
			map.editTools.commitDrawing();
			setTimeout(function() {
				map.doubleClickZoom.enable();
			});
		});
	},

	close: function() {
		var map = this._map;

		map.editTools.stopDrawing();

		if (this._opts.onClose && typeof this._opts.onClose == 'function') {
            this._opts.onClose();
        }
	},

	isPointInPolygon: function(point, polygon, e) {
		var inside = false;
		if (this._opts.drawingMode === "startCircle") {
			var radius = e.layer._mRadius;
            var lonlat = e.layer._latlng;
			inside = geolib.isPointInCircle({latitude: point.lat, longitude: point.lng}, {latitude: lonlat.lat, longitude: lonlat.lng}, radius);
		}
		else {
			var polyPoints = polygon.getLatLngs()[0];       
		    var x = point.lat, y = point.lng;
		    
		    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
		        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
		        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

		        var intersect = ((yi > y) != (yj > y))
		            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		        if (intersect) inside = !inside;
		    }
		}

	    return inside;
	}
}