export default function ($window, $parse, $q, $dateFormatter, $dateParser, $datepicker, $timeout) {
    'ngInject';

    var isNative = /(ip[ao]d|iphone|android)/ig.test($window.navigator.userAgent);

    let linkFuc = function(scope, ele, attr, controller) {
        var element = ele.find('input');
        scope.$readonly = false;
        scope.$selectTime = false;
        scope.$dateMode = scope.dateMode || 'date';
        scope.$dateTimeData = {
            hours: new Array(24).fill(undefined).map((i, index) => ({selected: false, label: index < 10 ? `0${index}` : `${index}`, value: index, disabled: false})),
            minutes: new Array(60).fill(undefined).map((i, index) => ({selected: false, label: index < 10 ? `0${index}` : `${index}`, value: index, disabled: false})),
            seconds: new Array(60).fill(undefined).map((i, index) => ({selected: false, label: index < 10 ? `0${index}` : `${index}`, value: index, disabled: false}))
        };

        const _setTimeDataSelected = function(date) {
            const d = new Date(date);

            for (let key in scope.$dateTimeData) {
                if (scope.$dateTimeData.hasOwnProperty(key)) {
                    scope.$dateTimeData[key].forEach(i => i.selected = false);
                }
            }

            scope.$dateTimeData.hours[d.getHours()].selected = true;
            scope.$dateTimeData.minutes[d.getMinutes()].selected = true;
            scope.$dateTimeData.seconds[d.getSeconds()].selected = true;
        }

        // Directive options
        var options = {scope: scope};
        angular.forEach(['template', 'templateUrl', 'controller', 'controllerAs', 'placement', 'container', 'delay', 'trigger', 'html', 'animation', 'autoclose', 'dateType', 'dateFormat', 'timezone', 'modelDateFormat', 'dayFormat', 'strictFormat', 'startWeek', 'startDate', 'useNative', 'lang', 'startView', 'minView', 'iconLeft', 'iconRight', 'daysOfWeekDisabled', 'id', 'prefixClass', 'prefixEvent', 'hasToday', 'hasClear'], function (key) {
            if (angular.isDefined(attr[key])) options[key] = attr[key];
        });

        // use string regex match boolean attr falsy values, leave truthy values be
        var falseValueRegExp = /^(false|0|)$/i;
        angular.forEach(['html', 'container', 'autoclose', 'useNative', 'hasToday', 'hasClear'], function (key) {
            if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) {
                options[key] = false;
            }
        });
        // bind functions from the attrs to the show and hide events
        angular.forEach(['onBeforeShow', 'onShow', 'onBeforeHide', 'onHide'], function (key) {
            var bsKey = 'bs' + key.charAt(0).toUpperCase() + key.slice(1);
            if (angular.isDefined(attr[bsKey])) {
                options[key] = scope.$eval(attr[bsKey]);
            }
        });

        // Initialize datepicker
        var datepicker = $datepicker(element, controller, Object.assign({}, {
            templateUrl: 'app/PUIComponents/Datepicker/datepicker.tpl.html',
            autoclose: scope.$dateMode === 'date',
            dateType: 'number',
            iconLeft: 'left-arrow',
            iconRight: 'right-arrow',
            hasClear: true,
            hasToday:true,
            dateFormat: scope.$dateMode === 'datetime' ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd',
            onBeforeShow() {                
                scope.datepicker.$date = new Date(scope.controller.$viewValue);
                scope.controller.$viewValue && scope.datepicker.update(scope.datepicker.$date )
                scope.$readonly = true;
                scope.$apply();
            },
            onBeforeHide() {
                scope.$readonly = false;
                if (scope.$dateMode === 'datetime') {
                    scope.$selectTime = false;
                }
            }
        }, options));
        options = datepicker.$options;

        const _select = datepicker.select;
        scope.datepicker = datepicker;
        scope.controller  = controller;
        datepicker.select = function(date, keep) {
            const oldMode = datepicker.$scope.$mode;
            _select(date, keep);

            if (!oldMode || keep) {
                datepicker.update(date);
            }
        };

        const _sameDay = function (date, dateCompared) {
            if (!angular.isDate(date)) return false;
            var startTime = +new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            var endTime = startTime + (24 * 60 * 60 * 1000) - 1;

            return startTime <= +dateCompared && +dateCompared <= endTime;
        };

        const _cleaDateTimeDisabled = function (date, type) {
            for (let key in scope.$dateTimeData) {
                if (scope.$dateTimeData.hasOwnProperty(key)) {
                    scope.$dateTimeData[key].forEach(i => i.disabled = false);
                }
            }
        };

        const _setDateTimeDisabled = function (dateSelected, type) {
            var hour = undefined;
            var minute = undefined;
            var second = undefined;

            if (type === 'min') {
                hour = datepicker.$options.minDate.getHours();
                minute = datepicker.$options.minDate.getMinutes();
                second = datepicker.$options.minDate.getSeconds();

                for (let key in scope.$dateTimeData) {
                    if (scope.$dateTimeData.hasOwnProperty(key)) {
                        switch (key) {
                            case 'hours':
                                scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < hour));
                                break;
                            case 'minutes':
                                if (dateSelected.getHours() === hour) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < minute));
                                }
                                break;
                            case 'seconds':
                                if (dateSelected.getHours() === hour && dateSelected.getMinutes() === minute) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < second));
                                }
                                break;
                        }
                    }
                }
            } else if (type === 'max') {
                hour = datepicker.$options.maxDate.getHours();
                minute = datepicker.$options.maxDate.getMinutes();
                second = datepicker.$options.maxDate.getSeconds();

                for (let key in scope.$dateTimeData) {
                    if (scope.$dateTimeData.hasOwnProperty(key)) {
                        switch (key) {
                            case 'hours':
                                scope.$dateTimeData[key].forEach(i => i.disabled = (i.value > hour));
                                break;
                            case 'minutes':
                                if (dateSelected.getHours() === hour) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value > minute));
                                }
                                break;
                            case 'seconds':
                                if (dateSelected.getHours() === hour && dateSelected.getMinutes() === minute) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value > second));
                                }
                                break;
                        }
                    }
                }
            } else {
                var minHour = datepicker.$options.minDate.getHours();
                var minMinute = datepicker.$options.minDate.getMinutes();
                var minSecond = datepicker.$options.minDate.getSeconds();
                var maxHour = datepicker.$options.maxDate.getHours();
                var maxMinute = datepicker.$options.maxDate.getMinutes();
                var maxSecond = datepicker.$options.maxDate.getSeconds();

                for (let key in scope.$dateTimeData) {
                    if (scope.$dateTimeData.hasOwnProperty(key)) {
                        switch (key) {
                            case 'hours':
                                scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < minHour || i.value > maxHour));
                                break;
                            case 'minutes':
                                if (dateSelected.getHours() === minHour) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < minMinute));
                                } else if (dateSelected.getHours() === maxHour) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value > maxMinute));
                                }
                                break;
                            case 'seconds':
                                if (dateSelected.getHours() === minHour && dateSelected.getMinutes() === minMinute) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value < minSecond));
                                } else if (dateSelected.getHours() === maxHour && dateSelected.getMinutes() === maxHour) {
                                    scope.$dateTimeData[key].forEach(i => i.disabled = (i.value > maxSecond));
                                }
                                break;
                        }
                    }
                }
            }
        };

        const _updateDateTimeMinMax = function(date) {
            _cleaDateTimeDisabled();
            if (angular.isDate(datepicker.$options.minDate) && angular.isDate(datepicker.$options.maxDate) && _sameDay(datepicker.$options.minDate, datepicker.$options.maxDate) && _sameDay(datepicker.$options.minDate, date)) {
                _setDateTimeDisabled(date, 'both');

                if (date < datepicker.$options.minDate) {
                    var d = new Date(datepicker.$options.minDate);
                    d.setMilliseconds(0);

                    controller.$dateValue = d;
                } else if (date > datepicker.$options.maxDate) {
                    var d = new Date(datepicker.$options.maxDate);
                    d.setMilliseconds(0);

                    controller.$dateValue = d;
                }
            } else {
                if (angular.isDate(datepicker.$options.minDate) && _sameDay(datepicker.$options.minDate, date)) {
                    _setDateTimeDisabled(date, 'min');
                    if (date < datepicker.$options.minDate) {
                        var d = new Date(datepicker.$options.minDate);
                        d.setMilliseconds(0);

                        controller.$dateValue = d;
                    }
                }
                if (angular.isDate(datepicker.$options.maxDate) && _sameDay(datepicker.$options.maxDate, date)) {
                    _setDateTimeDisabled(date, 'max');
                    if (date > datepicker.$options.maxDate) {
                        var d = new Date(datepicker.$options.maxDate);
                        d.setMilliseconds(0);
                        controller.$dateValue = d;
                    }
                }
            }

            /*if (!isNaN(datepicker.$options.minDate) && _sameDay(datepicker.$options.minDate, date)) {

            }
            if (!isNaN(datepicker.$options.maxDate) && _sameDay(datepicker.$options.maxDate, date)) {
                if (!isNaN(datepicker.$options.minDate) && _sameDay(datepicker.$options.minDate, date)) {

                } else {
                    _setDateTimeDisabled(datepicker.$options.maxDate, date, 'max');
                }
            }*/
        };

        // Set expected iOS format
        if (isNative && options.useNative) options.dateFormat = 'yyyy-MM-dd';

        var lang = options.lang;

        var formatDate = function (date, format) {
            return $dateFormatter.formatDate(date, format, lang);
        };

        var dateParser = $dateParser({format: options.dateFormat, lang: lang, strict: options.strictFormat});

        // Visibility binding support
        if (attr.bsShow) {
            scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!datepicker || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue)) newValue = !!newValue.match(/true|,?(datepicker),?/i);
                if (newValue === true) {
                    datepicker.$promise.then(() => {
                        datepicker.show();
                    });
                } else {
                    datepicker.$promise.then(() => {
                        datepicker.hide();
                    });
                }
            });
        }

        // Observe attributes for changes
        angular.forEach(['minDate', 'maxDate'], function (key) {
            // console.warn('attr.$observe(%s)', key, attr[key]);
            if (angular.isDefined(attr[key])) {
                attr.$observe(key, function (newValue) {
                    // console.warn('attr.$observe(%s)=%o', key, newValue);
                    datepicker.$options[key] = dateParser.getDateForAttribute(key, newValue);
                    // Build only if dirty
                    if (!isNaN(datepicker.$options[key])) datepicker.$build(false);
                    validateAgainstMinMaxDate(controller.$dateValue);
                    _updateDateTimeMinMax(controller.$dateValue);
                });
            }
        });

        scope.$chooseDateTime = function () {
            scope.$selectTime = !scope.$selectTime;
        };

        scope.$setDateTime = function (type, time) {
            if (time.disabled) {
                return;
            }
            let date = '';
            const todayStart = new Date();
            todayStart.setHours(0);
            todayStart.setMinutes(0);
            todayStart.setSeconds(0);
            todayStart.setMilliseconds(0);

            if (angular.isDate(controller.$dateValue) && !isNaN(controller.$dateValue.getTime())) {
                date = controller.$dateValue;
            } else {
                date = todayStart;
            }

            function _clearSelected(key) {
                scope.$dateTimeData[key].forEach(i => i.selected = false);
            }

            switch (type) {
                case 'hour':
                    date.setHours(time.value);
                    _clearSelected('hours');
                    time.selected = true;
                    datepicker.select(date, true);
                    break;
                case "minute":
                    date.setMinutes(time.value);
                    _clearSelected('minutes');
                    time.selected = true;
                    datepicker.select(date, true);
                    break;
                case 'second':
                    date.setSeconds(time.value);
                    _clearSelected('seconds');
                    time.selected = true;
                    datepicker.select(date, true);
                    break;
            }
        };

        scope.$onFocus = function ($event) {
            attr.ngFocus && scope.ngFocus({$event});
        };

        scope.$onBlur = function ($event) {
            attr.ngBlur && scope.ngBlur({$event});
        };

        // Observe date format
        if (angular.isDefined(attr.dateFormat)) {
            attr.$observe('dateFormat', function (newValue) {
                datepicker.$options.dateFormat = newValue;
            });
        }

        // Watch model for changes
        scope.$watch(attr.ngModel, function (newValue, oldValue) {
            datepicker.update(controller.$dateValue);
        }, true);

        // Normalize undefined/null/empty array,
        // so that we don't treat changing from undefined->null as a change.
        function normalizeDateRanges (ranges) {
            if (!ranges || !ranges.length) return null;
            return ranges;
        }

        if (angular.isDefined(attr.disabledDates)) {
            scope.$watch(attr.disabledDates, function (disabledRanges, previousValue) {
                disabledRanges = normalizeDateRanges(disabledRanges);
                previousValue = normalizeDateRanges(previousValue);

                if (disabledRanges) {
                    datepicker.updateDisabledDates(disabledRanges);
                }
            });
        }

        function validateAgainstMinMaxDate (parsedDate) {
            if (!angular.isDate(parsedDate)) return;
            var isMinValid = isNaN(datepicker.$options.minDate) || parsedDate.getTime() >= datepicker.$options.minDate;
            var isMaxValid = isNaN(datepicker.$options.maxDate) || parsedDate.getTime() <= datepicker.$options.maxDate;
            var isValid = isMinValid && isMaxValid;
            controller.$setValidity('date', isValid);
            controller.$setValidity('min', isMinValid);
            controller.$setValidity('max', isMaxValid);
            // Only update the model when we have a valid date
            if (isValid) controller.$dateValue = parsedDate;
        }

        // viewValue -> $parsers -> modelValue
        controller.$parsers.unshift(function (viewValue) {
            // console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
            var date;
            // Null values should correctly reset the model value & validity
            if (!viewValue) {
                controller.$setValidity('date', true);
                // BREAKING CHANGE:
                // return null (not undefined) when input value is empty, so angularjs 1.3
                // ngModelController can go ahead and run validators, like ngRequired
                return null;
            }
            var parsedDate = dateParser.parse(viewValue, controller.$dateValue);
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                controller.$setValidity('date', false);
                // return undefined, causes ngModelController to
                // invalidate model value
                return;
            }
            validateAgainstMinMaxDate(parsedDate);

            if (options.dateType === 'string') {
                date = dateParser.timezoneOffsetAdjust(parsedDate, options.timezone, true);
                return formatDate(date, options.modelDateFormat || options.dateFormat);
            }
            date = dateParser.timezoneOffsetAdjust(controller.$dateValue, options.timezone, true);

            if (scope.$dateMode === 'datetime') {
                _updateDateTimeMinMax(date);
            }

            if (options.dateType === 'number') {
                return date.getTime();
            } else if (options.dateType === 'unix') {
                return date.getTime() / 1000;
            } else if (options.dateType === 'iso') {
                return date.toISOString();
            }
            return new Date(date);
        });

        // modelValue -> $formatters -> viewValue
        controller.$formatters.push(function (modelValue) {
            // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
            var date;
            if (angular.isUndefined(modelValue) || modelValue === null) {
                date = NaN;
            } else if (angular.isDate(modelValue)) {
                date = modelValue;
            } else if (options.dateType === 'string') {
                date = dateParser.parse(modelValue, null, options.modelDateFormat);
            } else if (options.dateType === 'unix') {
                date = new Date(modelValue * 1000);
            } else {
                date = new Date(modelValue);
            }
            // Setup default value?
            // if (isNaN(date.getTime())) {
            //   var today = new Date();
            //   date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            // }
            controller.$dateValue = dateParser.timezoneOffsetAdjust(date, options.timezone);
            return getDateFormattedString();
        });

        // viewValue -> element
        controller.$render = function () {
            // console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
            if (controller.$dateValue && !isNaN(controller.$dateValue.getTime()) && scope.$dateMode === 'datetime') {
                _setTimeDataSelected(controller.$dateValue);
            }
            element.val(getDateFormattedString());
        };

        function getDateFormattedString () {
            return !controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : formatDate(controller.$dateValue, options.dateFormat);
        }

        // Garbage collection
        scope.$on('$destroy', function () {
            if (datepicker) datepicker.destroy();
            options = null;
            datepicker = null;
        });

    }


    let directive = {
        restrict: 'EA',
        replace: true,
        require: 'ngModel',
        scope: {
            type: '@',
            dateMode: '@',
            ngDisabled: '=',
            placeholder: '@',
            ngFocus: '&',
            ngBlur: '&'
        },
        templateUrl: 'app/PUIComponents/Datepicker/template.html',
        link: linkFuc
    };

    return directive;
}
