export class ApplicationController {
    constructor($injector){
        'ngInject';
        this.newApplications =[
            {
                name:'交易记录分析',
                imageSrc:'assets/images/theme_star_blue/application/jiaoyi-white.png',
                clickName: 'main.tradeList'
            },            {
                name:'话单记录分析',
                imageSrc:'assets/images/theme_star_blue/application/huadan-white.png',
                clickName: 'main.voiceList'
            },{
                name:'案件串并',
                imageSrc:'assets/images/theme_star_blue/application/anjian-white.png',
                clickName: 'main.textmining'
            }
        ]
        this.checked = true;
        this.jsonData = [
            {
                title: '数据分析工具',
                apps: [
                    {
                        id: "4",
                        image: "assets/images/theme_star_blue/application/vm.png",
                        name: "话单记录分析",
                        clickName: "main.voiceList"
                    },
                    {
                        id: '7',
                        image: "assets/images/theme_star_blue/application/jy.png",
                        name: '交易记录分析',
                        clickName: 'main.tradeList'
                    },
                    {
                        id: '10',
                        image: "assets/images/theme_star_blue/application/jy.png",
                        name: '因子分析数据',
                        clickName: 'main.yzdataList'
                    },
                    {
                        id: '11',
                        image: "assets/images/theme_star_blue/application/jy.png",
                        name: '舆情分析',
                        clickName: 'main.consensus'
                    }
                ]
            },
            {
                title: '数据分析应用',
                apps: [
                    {
                        id: '1',
                        image: 'assets/images/theme_star_blue/application/qiye.png',
                        name: '企业非吸预测',
                        clickName: 'main.enterpriseOverview'
                    },
                    {
                        id: '2',
                        image: 'assets/images/theme_star_blue/application/tuanhuo.png',
                        name: '团伙挖掘',
                        clickName: 'main.gangMining'
                    },
                    {
                        id: '3',
                        image: 'assets/images/theme_star_blue/application/zhongdian.png',
                        name: '危险人员积分预警',
                        clickName: 'main.importantPerson'
                    },
                    {
                        id: '8',
                        image: 'assets/images/theme_star_blue/application/zhongdian.png',
                        name: '隐性重点人发现',
                        clickName: 'main.specificFactors'
                    },
                    {
                        id: '6',
                        image: "assets/images/theme_star_blue/application/gcr.png",
                        name: '一人多证',
                        clickName: 'main.gcrCertificateChain'
                    }
                ]
            },
            {
                title: '文本挖掘应用',
                apps: [
                    {
                        id: '1',
                        image: 'assets/images/theme_star_blue/application/cba.png',
                        name: '案件串并',
                        clickName: 'main.textmining'
                    }
                ]
            }
        ];
        this.inject = $injector;
        this.init();
    }

    init(){
        let $this = this;
        let root = $this.inject.get('$rootScope');
        root.urlData.chooseMenu = 'application';
    }

    //app item点击事件
    appItemClick(clickName) {
        let $this = this;
        let state = $this.inject.get('$state');
        state.transitionTo(clickName, {}, {
            reload: false,
            inherit: true,
            notify: true,
            relative: state.$current,
            location: true
        });
    }
}
