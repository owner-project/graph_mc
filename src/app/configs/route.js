export function routerConfig($stateProvider, $urlRouterProvider, $injector) {
    'ngInject';
    $stateProvider
        .state('pui', {
            url: '/pui',
            templateUrl: 'app/PUIComponents/index.html',
            controller: 'PUIController',
            controllerAs: 'pui'
        })
        .state('main', {
            url: '/main',
            templateUrl: 'app/main/index.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('main.home', {
            url: '/home',
            templateUrl: 'app/main/home/index.html',
            controller: 'HomeController',
            controllerAs: 'home',
        })
        .state('main.senior', {
            url: '/home/:searchType',
            templateUrl: 'app/main/home/index.html',
            controller: 'HomeController',
            controllerAs: 'home',
        })
        .state('main.openURL', {
            url: '/openURL/:url',
            templateUrl: 'app/main/openOuterURL/template.html',
            controller: 'openOuterURLController',
            controllerAs: 'openURL'
        })
        .state('main.file', {
            url: '/file/:type/:key',
            templateUrl: 'app/main/people/index.html',
            controller: 'PeopleController',
            controllerAs: 'people'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/login/index.html',
            controller: 'LoginController',
            controllerAs: 'login'
        })
        .state('main.relation', {
            url: '/relation',
            templateUrl: 'app/main/relation/index.html',
            controller: 'RelationController',
            controllerAs: 'relation'
        })
        .state('main.gangMining', {
            url: '/gangMining',
            templateUrl: 'app/main/gangMining/index.html',
            controller: 'GangMiningController',
            controllerAs: 'gm',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.gangMining');
            }
        })
        .state('main.personcardtograph', {
            url: '/personCardToGraph',
            templateUrl: 'app/main/personCardToGraph/index.html',
            controller: 'personCardToGraphController',
            controllerAs: 'porpoise'
        })
        .state('main.importantPerson', {
            url: '/importantPerson',
            templateUrl: 'app/main/importantPerson/index.html',
            controller: 'ImportantPersonController',
            controllerAs: 'gm',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.importantPerson');
            }
        })
        .state('main.porpoise', {
            url: '/porpoise/:type/:id/:graphName',
            templateUrl: 'app/main/porpoise/index.html',
            controller: 'PorpoiseController',
            controllerAs: 'porpoise'
        })
        .state('main.cooperate', {
            url: '/cooperate',
            templateUrl: 'app/main/cooperate/index.html',
            controller: 'CooperateController',
            controllerAs: 'cooperate'
        })
        .state('main.enterpriseRanking', {
            url: '/enterpriseRanking',
            templateUrl: 'app/main/enterpriseRanking/index.html',
            controller: 'EnterpriseRankingController',
            controllerAs: 'er',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.enterpriseRanking');
            }
        })
        .state('main.specificFactors', {
            url: '/specificFactors',
            templateUrl: 'app/main/specificFactors/index.html',
            controller: 'SpecificFactorsController',
            controllerAs: 'sf',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.specificFactors');
            }
        })
        .state('main.corporatePortrait', {
            url: '/corporatePortrait/:id',
            templateUrl: 'app/main/corporatePortrait/index.html',
            controller: 'CorporatePortraitController',
            controllerAs: 'cp',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.corporatePortrait');
            }
        })
        .state('main.personalModeling', {
            url: '/personalModeling',
            templateUrl: 'app/main/personalModeling/index.html',
            controller: 'PersonalModelingController',
            controllerAs: 'pm',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.personalModeling');
            }
        })
        .state('main.enterpriseOverview', {
            url: '/enterpriseOverview',
            templateUrl: 'app/main/enterpriseOverview/index.html',
            controller: 'EnterpriseOverviewController',
            controllerAs: 'eo',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.enterpriseOverview');
            }
        })
        .state('main.voiceModel', {
            url: '/voiceModel/:id/:type',
            templateUrl: 'app/main/voiceModel/index.html',
            controller: 'VoiceModelController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.voiceModel');
            }
        })
        .state('main.integralRule', {
            url: '/integralRule',
            templateUrl: 'app/main/integralRule/index.html',
            controller: 'IntegralRuleController',
            controllerAs: 'integralRule',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.integralRule');
            }
        })
        .state('main.application', {
            url: '/application',
            templateUrl: 'app/main/application/index.html',
            controller: 'ApplicationController',
            controllerAs: 'app',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.application');
            }
        })
        // .state('main.textmining', {
        //     url: '/text_mining',
        //     templateUrl: 'app/main/textMining/index.html',
        //     controller: 'textMiningController',
        //     controllerAs: 'tm',
        //     onEnter($rootScope, cache, $state, $q,) {
        //         applicationFallBack($rootScope, cache, $state, $q, 'main.textmining');
        //     }
        // })
        .state('main.textmining', {
            url: '/text_mining',
            controller:'seriesParallelController',
            templateUrl: 'app/main/seriesParallel/seriesParallel.html',
            controllerAs:'spc',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.textmining');
            }
        })
        .state('main.tradeList', {
            url: '/trade_list',
            templateUrl: 'app/main/tradeList/index.html',
            controller: 'tradeListController',
            controllerAs: 'tl',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.tradeList');
            }
        })
        .state('main.yzdataList', {
            url: '/yz_data_list',
            templateUrl: 'app/main/yzData/index.html',
            controller: 'yzDataController',
            controllerAs: 'yd',
            onEnter($rootScope, cache, $state, $q, ) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.yzdataList');
            }
        })
        .state('main.consensus', {
            url: '/consensus',
            templateUrl: 'app/main/consensus/index.html',
            controller: 'consensusController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q, ) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.consensus');
            }
        })
        .state('main.tradeReport', {
            url: '/trade_report/:type',//这个路由的参数命名太烂了,但是我不敢改,怕还有别的地方按照type来取 by KI-WI
            templateUrl: 'app/main/tradeReport/index.html',
            controller: 'tradeReportController',
            controllerAs: 'tr',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.tradeReport');
            }
        })
        .state('main.tradeDetail', {
            url: '/trade_detail/:rmbType/:name/:type',
            templateUrl: 'app/main/tradeDetail/index.html',
            controller: 'tradeDetailController',
            controllerAs: 'td',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.tradeDetail');
            }
        })
        .state('main.tradeReportApp', {
            url: '/trade_report_app/:id/:type',
            templateUrl: 'app/main/tradeReportApp/index.html',
            controller: 'tradeReportAppController',
            controllerAs: 'tra',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.tradeReportApp');
            }
        })
        .state('main.phoneBook', {
            url: '/phoneBook/:id/:type',
            templateUrl: 'app/main/phoneBook/index.html',
            controller: 'phoneBookController',
            controllerAs: 'phonebook',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.phoneBook');
            }
        })
        .state('main.gcrCertificateChain', {
            url: '/gcrCertificateChain',
            templateUrl: 'app/main/gcrCertificateChain/index.html',
            controller: 'gcrCertificateChainCtrl',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.gcrCertificateChain');
            }
        })
        .state('main.voiceList', {
            url: '/voiceList',
            templateUrl: 'app/main/voiceList/index.html',
            controller: 'VoiceListController',
            controllerAs: 'voiceList',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.voiceList');
            }
        })
        .state('main.voiceTable', {
            url: '/voiceTable',
            templateUrl: 'app/main/voiceTable/index.html',
            controller: 'VoiceTableController',
            controllerAs: 'voiceTable',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.voiceTable');
            }
        })
        .state('main.ticketTable', {
            url: '/ticketTable',
            templateUrl: 'app/main/ticketTable/index.html',
            controller: 'TicketTableController',
            controllerAs: 'ticketTable',
            onEnter($rootScope, cache, $state, $q,) {
                applicationFallBack($rootScope, cache, $state, $q, 'main.ticketTable');
            }
        })

        .state('main.admin', {
            url: '/admin',
            templateUrl: 'app/main/admin/index.html',
            controller: 'AdminController',
            controllerAs: 'vm'
        })
        .state('main.admin.authManager', {
            url: '/authManager',
            templateUrl: 'app/main/admin/authManager/index.html',
            controller: 'AuthManagerController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'auth');
            }
        })
        .state('main.admin.roleManager', {
            url: '/roleManager',
            templateUrl: 'app/main/admin/roleManager/index.html',
            controller: 'RoleManagerController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'role');
            }
        })
        .state('main.admin.redListManager', {
            url: '/redListManager',
            templateUrl: 'app/main/admin/redListManager/index.html',
            controller: 'RedListManagerController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'redList');
            }
        })
        .state('main.admin.assetManager', {
            url: '/assetManager/:departId',
            templateUrl: 'app/main/admin/assetManager/index.html',
            controller: 'assetManagerCtrl',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'asset');
            }
        })
        .state('main.admin.memberManager', {
            url: '/memberManager/:departId',
            templateUrl: 'app/main/admin/memberManager/index.html',
            controller: 'MemberManagerController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'member');
            }
        })
        .state('main.admin.knowledgeManager', {
            url: '/knowledgeManager/:departId',
            templateUrl: 'app/main/admin/knowledgeManager/index.html',
            controller: 'knowledgeManagerCtrl',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'knowledge');
            }
        })
        .state('main.admin.logManager', {
            url: '/logManager',
            templateUrl: 'app/main/admin/logManager/index.html',
            controller: 'LogManagerController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'log');
            }
        })
        .state('main.admin.otherManager', {
            url: '/otherManager/:departId',
            templateUrl: 'app/main/admin/other/index.html',
            controller: 'otherController',
            controllerAs: 'vm',
            onEnter($rootScope, cache, $state, $q) {
                adminFallBack($rootScope, cache, $state, $q, 'other');
            }
        })
        .state('main.admin.extendManager', {
            url: '/extendManager/:departId',
            templateUrl: 'app/main/admin/extendManager/extendManager.html',
            controller: 'ExtendManagerController',
            controllerAs: 'vm',
            // onEnter($rootScope, cache, $state, $q) {
            //     adminFallBack($rootScope, cache, $state, $q, 'log');
            // }
        })
        .state('main.admin.focusManager', {
            url: '/focusManager',
            templateUrl: 'app/main/admin/focusManager/focusManager.html',
            controller:'focusManagerController',
            controllerAs: 'focus',
            // onEnter($rootScope, cache, $state, $q) {
            //     adminFallBack($rootScope, cache, $state, $q, 'log');
            // }
        })
        .state('main.setting', {
            url: '/setting',
            templateUrl: 'app/main/setting/index.html',
            controller: 'SettingController',
            controllerAs: 'setting'
        })

        function adminFallBack($rootScope, cache, $state, $q, auth) {
            const defer = $q.defer();
            $rootScope.userInfoDefer.promise.then(result => {
                const user = cache.getLoginDataCache();
                if (user.permissionName.indexOf(`admin:menu:${auth}`) >= 0) {
                    defer.resolve();
                } else {
                    if ($state.current.name === `main.admin.${auth}Manager`) {
                        $state.go('main.home');
                        defer.reject();
                    } else {
                        defer.resolve();
                    }
                }
            });

            return defer.promise;
        }

        function applicationFallBack($rootScope, cache, $state, $q, name) {
            const defer = $q.defer();
            $rootScope.userInfoDefer.promise.then(result => {
                const user = cache.getLoginDataCache();
                if (user.permissionName.indexOf(`header:nav:application`) >= 0) {
                    defer.resolve();
                } else {
                    if ($state.current.name === name) {
                        $state.go('main.home');
                        defer.reject();
                    } else {
                        defer.resolve();
                    }
                }
            });

            return defer.promise;
        }


    $urlRouterProvider.otherwise('/main/home');
}
