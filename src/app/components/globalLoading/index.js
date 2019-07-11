function getUUID() {
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    const uuid = s.join("");
    return uuid;
}

function getHttpParam(config, paramName, deleteParams) {
    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    let param;

    switch (config.method) {
        case "DELETE":
        case "GET":
            if (isDefined(config.params) && paramName in config.params) {
                param = config.params[paramName];
                deleteParams && delete config.params[paramName];
            }
            break;
        case "POST":
        case "PUT":
            if (isDefined(config.data) && angular.isObject(config.data) && paramName in config.data) {
                param = config.data[paramName];
                deleteParams && delete config.data[paramName];
            }
    }

    return param;
}

class GlobalLoadingCenter {
    constructor() {
        this.timer = {};
        
        if (!window.globalLoading) {
            window.globalLoading = function (params, timeout) {
                const data = params || {};

                data.globalLoading = true;
                data.cancelTimeout = timeout > 0 ? timeout : 0;

                return data;
            }
        }
    }

    show(httpConfig, callBack) {
        const globalLoading = getHttpParam(httpConfig, 'globalLoading', true);

        if (globalLoading) {
            const id = getUUID();
            let timeout;
            //cancelTimeout 暂时没用到；
            const cancelTimeout = getHttpParam(httpConfig, 'cancelTimeout', true);

            //cancelTimeout 暂时没用到；
            if (cancelTimeout > 0) {
                //cancelTimeout 暂时没用到；
                timeout = setTimeout(function () {
                    //cancelTimeout 暂时没用到；
                }, 1000 * cancelTimeout);
            }

            const loading = {
                id,
                timeout
            };

            this.timer[id] = loading;

            callBack && callBack(loading);
        }
    }

    hasLoading() {
        let has = false;

        for (let key in this.timer) {
            if (this.timer.hasOwnProperty(key)) {
                has = true;
            }
        }

        return has;
    }

    close(id, callBack) {
        if (this.timer[id]) {
            delete this.timer[id];

            if (!this.hasLoading()) {
                callBack && callBack();
            }
        }
    }

    destroy() {
        this.timer = null;
    }
}

export default new GlobalLoadingCenter();
