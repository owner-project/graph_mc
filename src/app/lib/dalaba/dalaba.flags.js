function factoy (Dalaba) {

    var hasOwnProperty = ({}).hasOwnProperty;

    var Dash = Dalaba.Geometry.Line.Dash;

    var Event = Dalaba.Chart.Event;

    var Numeric = Dalaba.Numeric;

    var pack = Dalaba.pack;
    var interpolate = Dalaba.Numeric.interpolate;

    var isFunction = Dalaba.isFunction;
    var isArray = Dalaba.isArray;

    var PI = Math.PI;

    var FLAG_CLASS_NAME = "flags-data-labels";
    var FLAG_SELECTED_NAME = "flags-selected-labels";

    var NODE_RADIUS = 5;

    var less = function (a, b) {
        return a.x < b.x;
    };

    var distance = function (a, b, r) {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return dx * dx + dy * dy <= (r * 2) * (r * 2);
    };

    //@see Dalaba.Numeric.indexOfRange
    var indexOfRange = function (range, d) {
        var l = 0, r, n;
        var m;

        if (!isArray(range) || (isArray(range) && (r = range.length) === 0))
            return -1;

        if (distance(range[0], d, NODE_RADIUS)) return 0;
        if (r > 1 && distance(range[~-r], d, NODE_RADIUS)) return r - 1;

        n = r;

        while (l < r) {
            m = (r + l) >> 1;
            if (!m) return -1;
            if ((less(range[m], d) || !(less(range[m], d) || less(d, range[m]))) && m < n - 1 && less(d, range[m + 1])) {
                return distance(range[m], d, NODE_RADIUS) ? m : distance(range[m + 1], d, NODE_RADIUS) ? m + 1 : -1;
            }
            if (less(d, range[m])) r = m;
            else if (less(range[m], d)) l = m + 1;
        }
        return -1;
    };
    

    function setStyle (domel, props) {
        if (domel) for (var p in props) if (hasOwnProperty.call(props, p)) {
            domel.style[p.replace(/\-(\w)/g, function (all, s) {
                return s.toUpperCase();
            })] = props[p];
        }
    }

    function getSVGBBox (url, transform) {
        var xmlns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(xmlns, "svg"),
            path = document.createElementNS(xmlns, "path");
        svg.setAttribute("width", 0);
        svg.setAttribute("height", 0);
        svg.setAttribute("xmlns", xmlns);
        path.setAttribute("d", url);
        transform && path.setAttribute("transform", "scale(" + pack("number", transform.scale, 1) + ")");

        svg.appendChild(path);
        document.body.appendChild(svg);

        return path = path.getBoundingClientRect(), document.body.removeChild(svg), path;
    }

    function reset () {
        var args = [].slice.call(arguments, 0),
            prop = args[0],
            p;
        var i = 1, n = args.length;
        var label;
        if (n > i && prop) for (; i < n; i++) {
            label = args[i];
            for (p in prop) if (hasOwnProperty.call(prop, p)) {
                label.style[typeof prop[p] === "undefined" ? "removeProperty" : "setProperty"](p, prop[p]);
            }
        }
    }

    function flags (symbols) {

        var chart;

        var data;

        var symbol = "ball";

        var format = "day";//day, month or year

        var size = [1, 1];

        var translate = [0, 0];

        var domain = [0, 1];

        var zoom = 0;
        var level = 0;

        var series = null;

        var onceHTML = false;

        var globalClick = true;// is drilldown

        var minValue, maxValue;

        var ranger = [0, 100];
        var prevranger = [0, 100];

        var onClick = function () {};
        var onMoving = function () {};

        function parseData (values) {
            var domLabel;
            var n = values.length,
                i = 0;
            var d, value;
            var label, timestamp;

            minValue = Number.MAX_VALUE;
            maxValue = -minValue;

            if (isArray(data) && data.length) {
                while (d = data.pop()) {
                    label = d.label;
                    domLabel = label.parentNode;
                    label && domLabel && domLabel.removeChild(label);
                }
            }
            else data = [];

            for (; i < n; i++) {
                label = document.createElement("div");
                d = values[i];
                value = d.value;
                timestamp = value[0][0].value[1];
                maxValue = Math.max(maxValue, timestamp);
                minValue = Math.min(minValue, timestamp);

                label.className = FLAG_CLASS_NAME;
                label.__index__ = i;
                setStyle(label, {
                    position: "absolute"
                });
                data.push({
                    data: d,
                    date: d.detail,
                    timestamp: timestamp,
                    value: d.value,
                    label: label,
                    bbox: label.getBoundingClientRect()
                });
            }
        }

        function pointTo (axis, x, y, index) {
            var domLabel = series.domLabel,
                label = axis.label,
                formatter = (series.dataLabels || {}).formatter;
            var verticalAlign = index & 1;
            
            var margin = 20;

            var bbox;
            var dy;

            if (data.length < 2) {
                //x = (size[0] - symbol.width) / 2;
            }
            axis.x = x;
            dy = y + (margin * (verticalAlign || -1));

            if (label && !onceHTML) {
                if (isFunction(formatter)) {
                    label.innerHTML = formatter.call(axis.data, axis.value);
                }
                domLabel && domLabel.appendChild(label);
            }
            bbox = label.getBoundingClientRect();
            setStyle(label, {
                left: (x + bbox.width > size[0] ? x - bbox.width : axis.x - 1.5) + "px",
                top: dy + ((verticalAlign - 1) * bbox.height - (verticalAlign || -1) * 2) + "px"
            });
            axis.y = y;
        }

        function markerTo (x, y, index) {
            var context = chart.context;
            var scale = pack("number", symbol.transform.scale, 1),
                translate = symbol.transform.translate,
                tx = pack("number", translate[0]),
                ty = pack("number", translate[1]);
            var path = new Path2D(symbol.url);

            var verticalAlign = index & 1;

            var margin = 3;
            var r2 = NODE_RADIUS * 2;
            var dataLabel = {x: symbol.width / scale / 2, y: (verticalAlign || -1) * (margin + r2)};

            context.save();
            context.beginPath();
            context.fillStyle = "#5384E1";
            context.arc(x, y, NODE_RADIUS * 2, 0, PI * 2, true);
            context.fill();
            context.lineWidth = 0;
            context.translate(x + tx - symbol.width / 2, y + pack("number", translate[1]) - symbol.height / 2);
            context.scale(scale, scale);
            context.fillStyle = "#fff";
            context.fill(path, symbol.fillRule ? "evenodd" : "nonzero");
            context.strokeStyle = "#5384E1";
            context.beginPath();
            context.lineWidth = 1;
            Dash.shortdot(context, dataLabel.x - tx, verticalAlign ? dataLabel.y : -2, dataLabel.x - tx, verticalAlign ? dataLabel.y * 2 : dataLabel.y);
            context.stroke();
            context.restore();
        }

        function navTo (axis) {
            var width = size[0],
                dx = NODE_RADIUS * 2;
            var x = interpolate(axis.timestamp, minValue, maxValue, 0, width - symbol.width) + translate[0] + dx,
                y = size[1] + 35;

            var path = new Path2D(symbol.url);
            var context = chart.context;

            if (x + symbol.width * 2 >= size[0])
                x -= ~~symbol.width * 2;

            context.save();
            context.fillStyle = "#999";
            context.lineWidth = 0;
            context.translate(x, y);
            context.fill(path, symbol.fillRule ? "evenodd" : "nonzero");
            context.restore();
        }

        function axisTo (axis, i) {
            var context = chart.context;
            var diff = domain[1] - domain[0];
            var width = size[0] / (diff === 0 ? 0.1 : diff),
                dx = -(width * domain[0]);
            var y = size[1] / 2;
            var x = interpolate(axis.timestamp, minValue, maxValue, 0, width - symbol.width - NODE_RADIUS * 2) + translate[0] + dx;
            x += NODE_RADIUS * 2;//symbol.width / 2 + 4;
            if (data.length < 2) {
                //x = (size[0] - symbol.width) / 2;
            }
            if (!i) {
                context.beginPath();
                context.strokeStyle = "#5384E1";
                context.moveTo(translate[0], y);
                context.lineTo(translate[0] + size[0], y);
                context.lineWidth = 2;
                context.stroke();
            }
            pointTo(axis, x, y, i);
            markerTo(x, y, i);
            navTo(axis);
        }

        function init (_) {
            chart = _;
            series = _.series.length ? _.series[0] : null;
            bind(_.container);
            render();
        }

        function render () {
            data.forEach(function (d, i) {
                var value = d.value;
                if (isArray(value) && value.length) {
                    flags.symbol({
                        0: "train",
                        1: "fly",
                        2: "ball",
                        3: "hotel",
                        5: "car"
                    }[value[0][0].value[0]]);
                    axisTo(d, i);
                }
            });

            onceHTML = true;
        }

        function bind (_) {
            var execed = 0;
            var prevflags = [];
            var prevparent;
            var selectflags = new Set();

            function insert (container, targets) {
                targets.forEach(function (target) {
                    var parent;
                    if (target && (parent = target.parentNode)) {
                        container.appendChild(parent.removeChild(target));
                    }
                });
            }
            function reduce () {
                var sourceParent = series.domLabel;
                [].forEach.call(sourceParent.children, function (target) {
                    sourceParent.removeChild(target);
                });
                data.forEach(function (target) {
                    sourceParent.appendChild(target.label);
                });
            }

            function selection (e) {
                var target = e.target || e.srcElement,
                    parent;
                var checkIn = target && (parent = target.offsetParent) && parent.classList.contains(FLAG_CLASS_NAME);
                var point = Event.normalize(e, _);
                var index;
                if (!checkIn && (index = indexOfRange(data, point)) !== -1) {
                    checkIn = index !== -1;
                    parent = data[index].label;//reset checkin
                }
                return checkIn ? parent : null;
            }
            function moving (e) {
                var parent = selection(e),
                    checkIn = parent !== null,
                    overlap = checkIn && parent !== prevparent;
                var elements;
                
                if (execed ^ checkIn) {
                    _.classList[checkIn ? "add" : "remove"]("selected");
                    !(checkIn || _.classList.length) && _.removeAttribute("class");
                    if (checkIn) {
                        reset.apply(null, [{/*opacity: 0.75, */"z-index": undefined}].concat(prevflags));//reset a xor b
                        prevflags = [parent];
                        reset.apply(null, [{"z-index": 2}].concat(prevflags));
                        //reset.apply(null, [{opacity: 1}].concat(Array.from(selectflags)));//use ...selectflags
                    }
                    else {
                        reset.apply(null, [{/*opacity: undefined, */"z-index": undefined}].concat(prevflags));
                        reduce();
                        prevflags = [];//check out
                        prevparent = null;
                        onMoving && onMoving.call(parent, e, null, checkIn);
                    }
                }
                if (overlap) {
                    elements = [parent].concat(Array.from(selectflags));
                    reduce();
                    insert(_, elements);
                    onMoving && onMoving.call(parent, e, data[(parent || prevparent).__index__], checkIn);
                    prevparent = parent;
                }
                execed = +checkIn;
            }
            
            _ && (_.addEventListener("click", function (e) {
                var parent = selection(e),
                    classList;
                var target = e.target || e.srcElement;
                var newData;
                if (parent) {
                    var title = [].includes.call(parent.children, target && target.tagName === "H2" && target);
                    newData = data[parent.__index__];
                    // 不能简化的表达
                    if (title || (!globalClick && title)) {
                        classList = parent.classList;
                        selectflags.has(parent)
                            ? (selectflags.delete(parent), classList.remove(FLAG_SELECTED_NAME))
                            : (selectflags.add(parent), classList.add(FLAG_SELECTED_NAME));
                    }
                    else if (globalClick && !title) {
                        selectflags.clear();
                        prevflags = [];
                        this.removeAttribute("class");
                        newData = data[parent.__index__].value.map(function (d) {
                            var drill = {detail: d[0].time, time: d[0].time, value: []};
                            var timevalue = d[0].value;
                            var arr = d.map(function (d) {
                                var ret = {};
                                for (var p in d) if (hasOwnProperty.call(d, p) && p !== "value") {
                                    ret[p] = d[p];
                                }
                                ret.value = timevalue;
                                return ret;
                            });
                            drill.value.push(arr);
                            return drill;
                        });
                        prevranger = [ranger[0], ranger[1]];
                        flags.range([0, 100]);
                        chart.setOptions({
                            rangeSelector: {
                                start: 0 + "%",
                                end: 100 + "%"
                            }
                        });
                        flags.data(newData)();
                        globalClick = false;// once
                    }
                    
                    onClick && onClick.call(this, e, newData, !title);
                }
            }), _.addEventListener("mousemove", moving));
        }

        function flags (_) {
            chart ? render() : init(_);
        }

        flags.data = function (_, backed) {
            if (arguments.length) {
                parseData(_);
                onceHTML = false;
                globalClick = true;
                if (backed) {
                    globalClick = false;
                    //flags.range(globalClick);
                }
                else {
                    flags.range([[0, 100]]);
                    chart && chart.setOptions({
                        rangeSelector: {
                            start: ranger[0] + "%",
                            end: ranger[1] + "%"
                        }
                    });
                }
                chart && chart.render({type: "update"});
                return flags;
            }
            return data;
        };

        flags.size = function (_) {
            return arguments.length ? (size = _, flags) : size;
        };

        flags.format = function (_) {
            return arguments.length ? (format = _, flags) : format;
        };

        flags.translate = function (_) {
            return arguments.length ? (translate = _, flags) : translate;
        };

        flags.domain = function (_) {
            return arguments.length ? (domain = _, flags) : domain;
        };

        flags.symbol = function (_) {
            var bbox;
            if (arguments.length) {
                symbol = symbols[_];
                if (!(symbol = symbols[_])) {
                    symbol = symbols.ball;
                }
                bbox = getSVGBBox(symbol.url, symbol.transform);
                symbol = {
                    url: symbol.url,
                    transform: symbol.transform,
                    width: bbox.width,
                    height: bbox.height
                };

                return flags;
            }
            return symbol;
        };

        flags.onClick = function (_) {
            onClick = function () {
                _ && _.apply(this, arguments);
            };
            return flags;
        };
        flags.onMoving = function (_) {
            onMoving = function () {
                _ && _.apply(this, arguments);
            };
            return flags;
        };

        flags.range = function (_) {
            if (arguments.length) {
                if (!isArray(_)) {
                    chart.setOptions({
                        rangeSelector: {
                            start: prevranger[0] + "%",
                            end: prevranger[1] + "%"
                        }
                    });
                }
                else {
                    ranger = [pack("number", _[0], 0), pack("number", _[1], 100)];
                }
                return flags;
            }
            return ranger;
        };
        
        flags.onchange = function (event, _) {
            var delta = pack("number", event.wheelDelta / 120, -event.detail / 3);
            var curLevel = 0;
            //if (delta && time - oldTime > 0) {
            delta /= Math.abs(delta);
            zoom += (delta === 1 || -1) * 0.03;
            zoom = Math.max(0, Math.min(10, zoom));
            curLevel = Numeric.indexOfRange([0, 4, 7, 10], zoom);
            
            _ && _.call(flags, event, curLevel, curLevel !== -1 && !!(curLevel ^ level), delta);
            level = curLevel;
        };

        return flags;
    }

    return function () {
        return flags({
            ball: {
                url: "M1.40579 9.45197H4.87168C4.89397 9.61356 4.91626 9.77516 4.91626 9.95904C4.91626 10.9787 3.89655 10.9787 3.89655 10.9787C3.61794 10.9787 3.38948 11.0958 3.38948 11.2351C3.38948 11.3744 3.61794 11.4914 3.89655 11.4914H7.94752C8.22612 11.4914 8.45458 11.3744 8.45458 11.2351C8.45458 11.0958 8.22612 10.9787 7.94752 10.9787C7.94752 10.9787 6.92781 10.9787 6.92781 9.95904C6.92781 9.77516 6.9501 9.61356 6.97239 9.45197H10.4661C11.0234 9.45197 11.4858 8.98948 11.4858 8.43226V1.38348C11.4858 0.826259 11.0234 0.36377 10.4661 0.36377H1.37793C0.820717 0.36377 0.358227 0.826259 0.358227 1.38348V8.43784C0.386087 8.98948 0.848577 9.45197 1.40579 9.45197ZM1.40579 1.38348H10.4661V7.44042H1.37793V1.38348H1.40579Z",
                transform: {angle: 0, translate: [0, 0], scale: 1}
            },
            train: {
                url: "M2.92852 1.0972H4.64919C4.92494 1.0972 5.15106 0.851378 5.15106 0.551597C5.15106 0.24582 4.92494 0 4.64368 0H2.92852C2.65277 0 2.42666 0.24582 2.42114 0.545601C2.42114 0.851378 2.64726 1.0972 2.92852 1.0972ZM7.57758 2.8961V8.502C7.57758 9.23947 7.09778 9.881 6.43046 10.0369L7.57758 11.7217H6.2981L5.05172 10.0729H2.69682L1.34565 11.7217H0L1.24638 10.0429C0.573558 9.92896 0.0330899 9.26944 0.0330899 8.502V2.8961C0.0386048 2.05072 0.667312 1.36122 1.45044 1.35522H6.16023C6.94336 1.36122 7.57206 2.05072 7.57758 2.8961ZM1.51662 9.19749C1.86958 9.19749 2.15636 8.88572 2.15636 8.502C2.15636 8.11828 1.86958 7.80651 1.51662 7.80651C1.16366 7.80651 0.876881 8.11828 0.876881 8.502C0.876881 8.88572 1.16366 9.19749 1.51662 9.19749ZM5.38813 8.502C5.38813 8.88572 5.67491 9.19749 6.02787 9.19749C6.38083 9.19749 6.66761 8.88572 6.67312 8.502C6.65658 8.14227 6.39186 7.85448 6.06096 7.83649C5.70249 7.8185 5.40468 8.11828 5.38813 8.502ZM1.37874 6.26564H6.2981C6.67864 6.25365 6.98196 5.9119 6.97093 5.4982C6.97093 5.4982 6.93233 3.78945 6.93233 3.77746C6.9213 3.36376 6.60694 3.034 6.22641 3.04599H1.34565C0.965121 3.05798 0.661797 3.39973 0.672827 3.81343V5.53417C0.683857 5.94787 0.998211 6.27763 1.37874 6.26564Z",
                transform: {angle: null, translate: [-0.5, -0.5], scale: 1},
                fillRule: "evenodd"
            },
            fly: {
                url: "M11.9986 1.83678C12.0155 1.44202 11.8858 1.08673 11.6207 0.821678C11.3669 0.567902 11.0342 0.432555 10.662 0.432555C9.39877 0.432555 7.76896 2.14695 7.00763 3.04363L2.37763 2.13003C2.14642 2.08492 1.90956 2.15823 1.74601 2.32178L1.06928 2.99287C0.792944 3.26921 0.792944 3.71472 1.06928 3.99106C1.12567 4.04745 1.18771 4.09257 1.25538 4.1264L4.49807 5.73929L3.62396 6.82771L2.43967 6.64161C2.21409 6.60777 1.98851 6.68108 1.83061 6.83899L1.15387 7.51008C0.877536 7.78642 0.877536 8.23194 1.15387 8.50827C1.2159 8.5703 1.28922 8.62106 1.36817 8.6549L3.03181 9.3993L3.77622 11.0629C3.93413 11.4182 4.35145 11.5761 4.70673 11.4182C4.78568 11.3844 4.859 11.3336 4.91539 11.2716L5.59213 10.6005C5.72184 10.4708 5.79515 10.3016 5.80079 10.1212L5.84026 8.82408L6.7313 7.93304L8.30471 11.1701C8.4739 11.5197 8.89686 11.6664 9.2465 11.4972C9.31418 11.4633 9.38185 11.4182 9.43824 11.3618L10.115 10.6907C10.2842 10.5272 10.3518 10.2847 10.3067 10.0535L9.39313 5.42912C10.2616 4.67343 11.9365 3.06618 11.9986 1.83678Z",
                transform: {angle: 90, translate: [-0.5, -0.5], scale: 1}
            },
            hotel: {
                url: "M13.9724 6.39259H1.9768V0.814209H0.565552V9.34585H1.9768V8.03329H11.8555V9.34585H13.2668V8.03329H13.9724V6.39259ZM2.89253 2.89855C2.75982 2.77513 2.75983 2.57502 2.89253 2.4516L4.40778 1.04231C4.54048 0.91889 4.75563 0.91889 4.88834 1.04231L6.40359 2.4516C6.53629 2.57502 6.53629 2.77513 6.40359 2.89855L4.97741 4.225H13.3428C13.6794 4.225 13.9522 4.49784 13.9522 4.8344V5.06305C13.9522 5.39962 13.6794 5.67246 13.3428 5.67246H2.38794V4.225H4.31871L2.89253 2.89855Z",
                transform: {angle: 90, translate: [0, 0], scale: 1},
                fillRule: "evenodd"
            },
            car: {
                url: "M0.247272727,7.31615385 C0.708363636,7.00461538 1.13527273,6.65153846 1.536,6.27076923 C2.03127273,5.70307692 2.56872727,5.16307692 3.12290909,4.65076923 C3.44727273,4.25615385 3.94254545,4.01384615 4.46327273,4 L9.04509091,4 C10.3083636,4 11.648,6.79692308 12.5185455,6.79692308 L14.0887273,6.79692308 C15.1381818,6.79 15.9912727,7.60692308 16,8.61769231 C16,8.63846154 16,8.64538462 16,8.65923077 L16,10.7915385 C16,11.1376923 15.7098182,11.4215385 15.3512727,11.4215385 L14.3527273,11.4215385 C14.3614545,10.2307692 13.3629091,9.26153846 12.1345455,9.26153846 L12.1258182,9.26153846 C10.9141818,9.29615385 9.94981818,10.2307692 9.92436364,11.4007692 L5.76,11.4007692 C5.84509091,10.21 4.90690909,9.17846154 3.67781818,9.10230769 C2.44072727,9.02615385 1.37381818,9.92615385 1.29672727,11.1169231 C1.28872727,11.2138462 1.28872727,11.3038462 1.29672727,11.4007692 L0.64,11.4007692 C0.290181818,11.3938462 0.00872727273,11.1307692 0,10.7915385 L0,7.82846154 C0.00872727273,7.63461538 0.0938181818,7.44769231 0.247272727,7.31615385 Z M2.73890909,6.82461538 L6.10109091,6.82461538 C6.28,6.82461538 6.42545455,6.68615385 6.42545455,6.52 L6.42545455,4.98307692 C6.43345455,4.81 6.30545455,4.66461538 6.12654545,4.65076923 C6.11781818,4.65076923 6.10981818,4.65076923 6.10981818,4.65076923 L4.352,4.65076923 C4.15563636,4.65769231 3.968,4.74769231 3.84,4.88615385 L2.60218182,6.58230769 C2.50836364,6.71384615 2.60218182,6.82461538 2.73890909,6.82461538 Z M6.99709091,6.52 C6.99709091,6.69307692 7.14254545,6.83153846 7.32145455,6.83153846 L10.496,6.83153846 C10.6749091,6.83153846 10.7265455,6.72769231 10.6327273,6.59615385 L9.42909091,4.94846154 C9.30981818,4.78230769 9.12218182,4.68538462 8.91709091,4.66461538 L7.33890909,4.66461538 C7.15927273,4.65769231 7.00581818,4.78230769 6.99709091,4.95538462 C6.99709091,4.96923077 6.99709091,4.99692308 6.99709091,5.01076923 L6.99709091,6.52 Z M13.7723636,11.47 C13.7723636,12.3146154 13.0647273,13 12.1854545,13 C11.3061818,13 10.5985455,12.3146154 10.5985455,11.47 C10.5985455,10.6184615 11.2981818,9.94 12.1767273,9.94 C13.0472727,9.92615385 13.7556364,10.5976923 13.7643636,11.4353846 C13.7723636,11.4423077 13.7723636,11.4492308 13.7723636,11.47 Z M5.11127273,11.47 C5.11127273,12.3146154 4.40290909,13 3.52436364,13 C2.64509091,13 1.93672727,12.3146154 1.93672727,11.47 C1.92872727,10.6184615 2.64509091,9.94 3.52436364,9.94 C4.38618182,9.91923077 5.09454545,10.5769231 5.11127273,11.4076923 C5.11127273,11.4284615 5.11127273,11.4423077 5.11127273,11.47 Z",
                transform: {angle: 90, translate: [0, -4], scale: 1},
                fillRule: "evenodd"
            }
        });
    };
}

var exports = {
    deps: function () {
        return factoy.apply(window, [].slice.call(arguments));
    }
};

module.exports = exports;