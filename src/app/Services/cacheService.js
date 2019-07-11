export class cacheService {
    constructor($injector) {
        'ngInject';
        this.inject = $injector;
    }

    init() {
        let $this = this;
        let root = $this.inject.get('$rootScope');
        root.urlData = {};
        root.dicData = null;
        root.cacheData = {
            linkCache: {}
        };
    }

    loginDataCache(data) {
        let cache = JSON.stringify(data);
        cache = cache.replace(/{/g, '%<%');
        cache = cache.replace(/}/g, '%>%');
        localStorage.setItem('user', cache);
    }

    bdpDataCache(data) {
        let cache = JSON.stringify(data);
        cache = cache.replace(/{/g, '%<%');
        cache = cache.replace(/}/g, '%>%');
        localStorage.setItem('bdp_pro_data', cache);
    }

    peronCardToGraphDataCache(data) {
        let cache = JSON.stringify(data);
        localStorage.setItem('person_card_to_graph', cache);
    }

    getPeronCardToGraphDataCache() {
        let cache = localStorage.getItem('person_card_to_graph');
        if(cache) {
            cache = JSON.parse(cache);
        }
        return cache;
    }

    changeLoginStatus(cache) {
        localStorage.setItem('not_user_login', cache);
    }

    getLoginStatus() {
        let cache = localStorage.getItem('not_user_login');
        return cache;
    }

    setHeaderHide() {
        const root = this.inject.get('$rootScope');
        root.hideHeader = true;
    }

    setHeaderShow() {
        const root = this.inject.get('$rootScope');
        root.hideHeader = false;
    }

    getLoginDataCache() {
        let cache = localStorage.getItem('user');
        if(cache) {
            cache = cache.replace(/%<%/g, '{');
            cache = cache.replace(/%>%/g, '}');
            cache = JSON.parse(cache);
        }
        return cache;
    }

    getBdpDataCache() {
        let cache = localStorage.getItem('bdp_pro_data');
        if (cache) {
            cache = cache.replace(/%<%/g, '{');
            cache = cache.replace(/%>%/g, '}');
            cache = JSON.parse(cache);
        }
        return cache;
    }

    getDepartmentCache() {
        const $this = this;
        const promise = $this.inject.get('$q').defer();
        if($this.departmentCache) {
            promise.resolve($this.departmentCache)
        }
        else {
            $this.inject.get('cooperateService').getBranch().then((res) => {
                if(res.status === 200) {
                    if(res.data.status === 0) {
                        $this.departmentCache = res.data;
                        promise.resolve(res.data);
                    }
                    else {
                        promise.resolve({})
                    }
                }
                else {
                    promise.resolve({});
                }
            });
        }
        return promise.promise;
    }

}
