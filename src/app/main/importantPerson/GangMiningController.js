export class ImportantPersonController {
    constructor($injector, $scope) {
        'ngInject';
        this.inject = $injector;
        this.applicationAPIService = $injector.get('applicationAPIService');

        this.searchData = {
            name: '',
            type: -1
        };

        this.jsonData = {
            counts: [],
            option: [],
            resultData: [],
            gangDetailInfo: {}
        };

        this.pager = {
            pageNo: 1,
            pageSize: 20
        };
        this.init($scope);
    }

    init($scope) {
        let $this = this;
        let timeout = $this.inject.get('$timeout');

        //初始化动画
        timeout(() => {
            angular.element('.jq_gang-mining_left').addClass('gang-animate');
            angular.element('.jq_gang-mining_right').addClass('gang-animate');
        }, 500);

        this.getPageData(true);
    }

    changePage() {
        this.getPageData();
    }

    getPageData(init) {
        const defer = this.inject.get('$q').defer();

        let params = {};
        params.type = this.searchData.type != -1 ? this.searchData.type : undefined;
        params.name = this.searchData.name;
        params.pageNo = this.pager.pageNo;
        params.pageSize = this.pager.pageSize;

        params = init ? globalLoading(params) : params;

        function _getNumber(number) {
            return number.indexOf('%') > -1 ? number.split('%')[0] : number;
        }

        {
            defer.resolve();

            this.jsonData.counts = [];
            const per = [{"sfzh":"131025199004223016","xm":"高贺运","wxd":10},{"sfzh":"420621198509116815","xm":"龚传波","wxd":55},{"sfzh":"420104196605243627","xm":"陈凤兰","wxd":20},{"sfzh":"511203197709241374","xm":"吴天明","wxd":69},{"sfzh":"420112196812172112","xm":"江永忠","wxd":17},{"sfzh":"420621199305240536","xm":"周俊龙","wxd":71},{"sfzh":"320303200003141236","xm":"张天麒","wxd":56},{"sfzh":"411325197712041939","xm":"柳刚","wxd":4},{"sfzh":"420984197109095610","xm":"胡红军","wxd":26},{"sfzh":"420117199110048315","xm":"黄毓","wxd":82},{"sfzh":"450204195202161017","xm":"刘振营","wxd":41},{"sfzh":"520121198708150035","xm":"孙瑜","wxd":29},{"sfzh":"421181198705054447","xm":"黄梦婷","wxd":52},{"sfzh":"429004197411281358","xm":"毛军洲","wxd":82},{"sfzh":"420683198305191281","xm":"程霞","wxd":25},{"sfzh":"522128197012103515","xm":"吴科均","wxd":80},{"sfzh":"420106195606140433","xm":"王武斌","wxd":42},{"sfzh":"422724196405172238","xm":"田文法","wxd":72},{"sfzh":"421126198808160053","xm":"高佳","wxd":67},{"sfzh":"420103198511282812","xm":"郭纯","wxd":69},{"sfzh":"52242519841015095X","xm":"黄龙顺","wxd":43},{"sfzh":"141124197807090052","xm":"高博渐","wxd":30},{"sfzh":"422202198203302413","xm":"夏卫东","wxd":19},{"sfzh":"422825199307220633","xm":"姚玉林","wxd":35},{"sfzh":"412801199008201755","xm":"李永刚","wxd":82},{"sfzh":"430621198610184654","xm":"张富","wxd":20},{"sfzh":"500110198910174011","xm":"张承杰","wxd":30},{"sfzh":"422801197907132434","xm":"郑承勇","wxd":28},{"sfzh":"411102198311295638","xm":"李灿","wxd":6},{"sfzh":"421126198809010014","xm":"顾亮亮","wxd":81}];
            this.jsonData.resultData = per.filter((i, index) => {
                return new Date().getDay() % 3 === index % 3;
            });
            this.jsonData.resultData.sort((a, b) => {
                return b.wxd - a.wxd
            });
            this.pager.total = 10;
            this.jsonData.resultData.length && this.getGangDetailInfo(this.jsonData.resultData[0]);

            this.init_table_color();

            this.jsonData.option.unshift({
                name: '全部',
                value: -1
            });
        }

        return defer.promise;
    }

    getGangDetailInfo(item) {
        this.jsonData.gangDetailInfo = item;
    }

    //初始化表格颜色
    init_table_color() {
        function _color(number) {
            if(number >= 80){
                return 'bfb-color-red';
            }else if(number >= 30 && number < 80) {
                return 'bfb-color-orange';
            }else if(number >= 0 && number < 30) {
                return 'bfb-color-green';
            }
        }
        angular.forEach(this.jsonData.resultData, (item) => {
            item.lColor = _color(item.wxd);
        });
    }

    toPorpoise(item) {
        const state = this.inject.get('$state');

        state.transitionTo('main.porpoise', {type: 'normal', id: encodeURIComponent(`person/${item.sfzh}`)}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
}
