export class utilService {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
        this.initReg();
    }

    encodeHTML(text) {
        return text.replace('<', '&lt;').replace('>', '&gt;');
    }
    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
     *
     * @param  {function} func        传入函数
     * @param  {number}   wait        表示时间窗口的间隔
     * @param  {boolean}  immediate   设置为ture时，调用触发于开始边界而不是结束边界
     * @return {function}             返回客户调用函数
     */
    debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            // 据上一次触发时间间隔
            var last = Date.now() - timestamp;

            // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
            if (last < wait && last > 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            // 如果延时不存在，重新设定延时
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    /**
     * @description 正则表达式
     *
     * @memberof utilService
     */
    initReg() {
        let $this = this;
        let root = $this.inject.get('$rootScope');
        root.regData = {
            'chinese': /[\u4e00-\u9fa5]/,
            'double': /[^\x00-\xff]/,
            'blank': /\s/,
            'email': /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
            'url': /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/,
            'phone': /0?(13|14|15|18|17)[0-9]{9}/,
            'tel': /[0-9-()（）]{7,18}/,
            'floal': /([1-9]\d*.\d*|0\.\d*[1-9]\d*)/,
            'point': /-?[1-9]\d*/,
            'qq': /[1-9]([0-9]{4,10})/,
            'postcode': /\d{6}/,
            'ip': /(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)/,
            'idcard': /\d{17}[\d|x]|\d{15}/,
            'date': /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/,
            'time': /([01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d/,
            'number': /[1-9]\d*/,
            'account': /[A-Za-z0-9_\-\u4e00-\u9fa5]+/
        };
    }

    closeAllModal() {
        var modals = angular.element(".modal");
        if (modals.length > 0) {
            for (let i = 0; i < modals.length; i++) {
                angular.element(modals[i]).scope().$hide();
            }
        }

    }

    /**
     *
     * @description 去除字符串两边空格
     * @param {any} str
     * @returns
     * @memberof utilService
     */
    trim(str) {
        if (!str) {
            return '';
        } else {
            return str.replace(/(^\s*)|(\s*$)/g, '');
        }
    }

    /**
     * @description 数组去重
     *
     * @param {any} arr
     * @returns
     * @memberof utilService
     */
    unique(arr) {
        let uniqueArr = [];
        arr.forEach(function (item) {
            if (uniqueArr.indexOf(item) == -1) uniqueArr.push(item);
        });
        return uniqueArr;
    }

    /**
     * @description 局部loading开始
     *
     * @param {any} className
     * @param {any} bgColor
     * @memberof utilService
     */
    innerLoadingStart(className, bgColor) {
        let $this = this;
        let timeout = $this.inject.get('$timeout');
        timeout(() => {
            angular.element('.' + className).append(() => {
                return '<div class="inner-loading-main jq_inner_loading">' +
                    '<img class="inner-loading-body" src="assets/theme-sb/common/loading_inner.svg" />' +
                    '</div>';
            });
        });
    }

    /**
     * @description 结束局部loading
     *
     * @memberof utilService
     */
    innerLoadingEnd() {
        let $this = this;
        let timeout = $this.inject.get('$timeout');
        $('.jq_inner_loading').fadeOut(500);
        timeout(() => {
            $('.jq_inner_loading').remove();
        }, 500);
    }


    /**
     * @description 进度条开始
     *
     * @memberof utilService
     */
    loadingStart() {
        let $this = this;
        let root = $this.inject.get('$rootScope');
        root.isLoading = true;
        angular.element('.loading-main').css('opacity', 1);
    }

    /**
     * @description 进度条结束
     *
     * @memberof utilService
     */
    loadingEnd() {
        let $this = this;
        let root = $this.inject.get('$rootScope');
        let timeout = $this.inject.get('$timeout');
        if (root.isLoading) {
            angular.element('.loading-main').css('opacity', 0);
            timeout(() => {
                root.isLoading = false;
            }, 500);
        }
    }

    getPorReqDate() {
        let endTime = new Date().getTime();
        endTime = endTime - (endTime % (24 * 60 * 60 * 1000));
        let startTime = endTime - (30 * 24 * 60 * 60 * 1000);
        return {
            startDate: startTime,
            endDate: endTime
        };
    }

    /**
     *
     * @description  设置table颜色
     *
     * @param {any} number
     * @returns
     * @memberof utilService
     */
    selectTableColor(number) {
        if (number > 90) {
            return 'font-color-red';
        } else if (number > 70 && number <= 90) {
            return 'font-color-orange';
        } else if (number > 50 && number <= 70) {
            return 'font-color-blue';
        } else if (number >= 0 && number <= 50) {
            return 'font-color-green';
        } else {
            return 'font-color-wihte';
        }
    }

    /**
     * @description 设置表格百分比背景颜色
     *
     * @param {any} number
     * @returns
     * @memberof utilService
     */
    selectTableBfbColor(number) {
        if (number > 90) {
            return 'bfb-color-red';
        } else if (number > 70 && number <= 90) {
            return 'bfb-color-orange';
        } else if (number > 50 && number <= 70) {
            return 'bfb-color-blue';
        } else if (number >= 0 && number <= 50) {
            return 'bfb-color-green';
        }
    }

    /**
     * @description 是否在数组内
     * @param {*} list
     * @param {*} item
     */
    isInArray(list, target, checkStr) {
        let res = false;
        list.forEach((item) => {
            if (checkStr) {
                if (item[checkStr] === target[checkStr]) {
                    res = true;
                    return;
                }
            } else {
                if (item === target) {
                    res = true;
                    return;
                }
            }
        });
        return res;
    }

    /**
     * @description ID生成
     * @param front
     * @returns {string}
     */
    idMaker(front) {
        let resId = (front) ? (front) : ('');
        resId += new Date().getTime() + parseInt(Math.random() * 1000);
        return resId;
    }

    /**
     * @description 获取相同的线
     * @param list
     * @param checkItem
     * @param checkStr1
     * @param checkStr2
     * @returns {Array}
     */
    getSameLink(list, checkItem, checkStr1, checkStr2) {
        let res = [];
        _.each(list, (item) => {
            if (checkItem[checkStr1] === item[checkStr1] && checkItem[checkStr2] === item[checkStr2]) {
                res.push(item);
            } else if (checkItem[checkStr1] === item[checkStr2] && checkItem[checkStr2] === item[checkStr1]) {
                res.push(item);
            }
        });
        return res;
    }

    /**
     * @description 计算曲线的中间点
     * @param p1 起始点
     * @param p2 结束点
     * @param h 高度
     * @param top 上下方
     * @returns {*}
     */
    getMiddlePoint(p1, p2, h, top) {
        const k = (p2.y - p1.y) / (p2.x - p1.x);
        const mk = -1 / k;
        const mp = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
        const dist = {
            x: 0,
            y: 0
        };
        dist.x = Math.sqrt(Math.pow(h, 2) / (1 + Math.abs(mk)));
        dist.y = Math.sqrt(Math.pow(h, 2) - Math.pow(dist.x, 2));
        if (top) {
            return {
                x: mp.x + dist.x * (mk < 0 ? -1 : 1),
                y: mp.y + (isFinite(mk) ? dist.y : h)
            };
        } else {
            return {
                x: mp.x - dist.x * (mk < 0 ? -1 : 1),
                y: mp.y - (isFinite(mk) ? dist.y : h)
            };
        }
    }

    /**
     * @description 冒泡排序
     * @param list 数组
     * @param desc 升降序
     * @param checkStr 排序字段
     */
    arraySortBy(list, desc, checkStr) {
        let temp;
        for (let index = 0; index < list.length; index++) {
            for (let index1 = index + 1; index1 < list.length; index1++) {
                let checkPress = (desc) ?
                    (((checkStr) ? (list[index][checkStr]) : (list[index])) < ((checkStr) ? (list[index1][checkStr]) : (list[index1]))) :
                    (((checkStr) ? (list[index][checkStr]) : (list[index])) > ((checkStr) ? (list[index1][checkStr]) : (list[index1])));
                if (checkPress) {
                    temp = list[index1];
                    list[index1] = list[index];
                    list[index] = temp;
                }
            }
        }
    }

    /**
     * @description 比较两个数组对象的差集并返回
     * @param array1 数组1
     * @param array2 数组2
     * @param key 对比维度
     */
    difference(array1, array2, key) {
        if (Array.isArray(array1) && Array.isArray(array2)) {
            var result = [];
            var key = key || "id" || "key";
            for (var i = 0; i < array2.length; i++) {
                var obj = array2[i];
                var num = obj[key];
                var flag = false;
                for (var j = 0; j < array1.length; j++) {
                    var aj = array1[j];
                    var n = aj[key];
                    if (n == num) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    result.push(obj);
                }
            }
            return result
        }
    }
    /**
     * @description key
     * @param key 需要排序的维度
     */
     sortBy(key) {
        return function(a,b) {
            return (Number(a[key]) - Number(b[key])) > 0;
        }
    }
    /**
     * @description 将数组arr中的key放到数组第一位并返回
     * @param arr 需要调整的数组
     * @param key 需要调整的key
     */
    popToFirst(arr,key){
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === key) {
                arr.splice(i, 1);
                break;
            }
        }
        arr.unshift(key);
        return arr
    }
    
}
