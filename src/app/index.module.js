import 'jquery';
import 'lodash';
import 'angular';
import 'angular-animate';
import 'angular-sanitize';
import 'angular-aria';
import 'selectize';
import 'angular-ui-router';
import 'angular-loading-bar';
import 'angular-strap';
import 'babel-polyfill';
import 'ui-select';
import 'angularjs-toaster';
import '../app/configs/localZh';
import './components/pagination/index';
/**
 * pui
 */
import './PUIComponents';
import PUIController from './PUIComponents/controller';


import { utilService } from './utils/utils';
import { cacheService } from './Services/cacheService';
import { loginService } from './Services/loginService';
import { porpoiseService } from './Services/porpoiseService';
import { textMiningService } from './Services/textMiningService';
import { homeService } from './Services/homeService';
import { seniorSearchService } from './Services/seniorSearchService';
import { adminAPIService } from './Services/adminAPIService';
import { applicationAPIService } from './Services/applicationAPIService';
import { authManagerService } from './Services/authManagerService';
import { roleManagerService } from './Services/roleManagerService';
import { logManagerService } from './Services/logManagerService';
import { extendManagerService } from './Services/extendManagerService';
import { otherManagerService } from './Services/otherManagerService';
import { peopleTypeService } from './Services/peopleTypeService';
import { relationTypeService } from './Services/relationTypeService';
import { addressTypeService } from './Services/addressTypeService';
import { cardTypeService } from './Services/cardTypeService';
import { communityTypeService } from './Services/communityTypeService';
import { carCardTypeService } from './Services/carCardTypeService';
import { phoneTypeService } from './Services/phoneTypeService';
import { assetManagerService } from './Services/assetManagerService';
import { tradeAPIService } from './Services/tradeAPIService';
import { settingService } from './Services/settingService';


import { voiceAPIService } from './Services/voiceAPIService';
import { headerService } from './Services/headerService';
import { peopleService } from './Services/peopleService';
import { cooperateService } from "./Services/cooperateService";
import { treeTplComponent } from "./main/cooperate/treeTpl/treeTpl";
import { seriesParallelService } from "./Services/seriesParallelService";

import { ajFilter,propsFilter,fzlxFilter, managerDisplay, edgeEvent, entityTableNameFilter, rmb_wy, num_total } from './filters/filter';

import { httpInterceptor } from '../app/Services/httpInterceptor';
import { nocacheInterceptor } from '../app/Services/nocacheInterceptor';

import { HeaderDirective } from '../app/components/header/headerDirective';
import { TimeAxisDirective } from '../app/components/timeAxis/timeAxisDirective';
import { fileUpload } from '../app/components/fileUpload/fileUpload';
import { RelationMapGraph } from './components/relationMap';
import { selectFolder } from './components/selectFolder';
import { waterMark } from "./components/waterMark/index";

import { MainController } from './main/MainController';
import { HomeController } from './main/home/HomeController';
import { PeopleController } from './main/people/PeopleController';
import { LoginController } from './login/LoginController';
import { PorpoiseController } from './main/porpoise/PorpoiseController';
import { GangMiningController } from './main/gangMining/GangMiningController';
import { ImportantPersonController  } from './main/importantPerson/GangMiningController';
import { CooperateController } from './main/cooperate/CooperateController';
import { EnterpriseRankingController } from './main/enterpriseRanking/EnterpriseRankingController';
import { SpecificFactorsController } from './main/specificFactors/SpecificFactorsController';
import { CorporatePortraitController } from './main/corporatePortrait/CorporatePortraitController';
import { PersonalModelingController } from './main/personalModeling/PersonalModelingController';
import { EnterpriseOverviewController } from './main/enterpriseOverview/EnterpriseOverviewController';
import { VoiceModelController } from './main/voiceModel/VoiceModelController';
import { IntegralRuleController } from './main/integralRule/IntegralRuleController';
import { ApplicationController } from './main/application/ApplicationController';
import { textMiningController } from './main/textMining/textMiningController';
import { VoiceListController } from './main/voiceList/VoiceListController';
import { openOuterURLController } from './main/openOuterURL';
import { VoiceTableController } from './main/voiceTable/VoiceTableController';
import { phoneBookController } from './main/phoneBook/phoneBookController.js';
import { TicketTableController } from './main/ticketTable/TicketTableController';
import { gcrCertificateChainCtrl } from './main/gcrCertificateChain/index';
import { tradeListCtrl } from './main/tradeList/index';
import { tradeReportCtrl } from './main/tradeReport/index';
import { tradeReportAppCtrl } from './main/tradeReportApp/index';
import { tradeDetailCtrl } from './main/tradeDetail/index';
import { yzDataController } from './main/yzData/index';
import { consensusController } from './main/consensus/index';
import { SettingController } from './main/setting/SettingController';

import { knowledgeManagerCtrl } from './main/admin/knowledgeManager/index';
import { PeopleTypeController } from './main/admin/knowledgeManager/peopleType/PeopleTypeController';
import { RelationTypeController } from './main/admin/knowledgeManager/relationType/RelationTypeController';
import { AddressTypeController } from './main/admin/knowledgeManager/addressType/AddressTypeController';
import { CardTypeController } from './main/admin/knowledgeManager/cardType/CardTypeController';
import { CommunityTypeController } from './main/admin/knowledgeManager/communityType/CommunityTypeController';
import { CarCardTypeController } from './main/admin/knowledgeManager/carCardType/CarCardTypeController';
import { PhoneTypeController } from './main/admin/knowledgeManager/phoneType/PhoneTypeController';
import {seriesParallelController} from './main/seriesParallel/seriesParallel.controller'

/* admin */
import { AdminController } from './main/admin/AdminController';
import { RoleManagerController } from './main/admin/roleManager/RoleManagerController';
import { AuthManagerController } from './main/admin/authManager/AuthManagerController';
import { MemberManagerController } from './main/admin/memberManager/MemberManagerController';
import { RedListManagerController } from './main/admin/redListManager/RedListManagerController';

import { assetManagerCtrl } from './main/admin/assetManager/index';
import { AssetManagerController } from './main/admin/assetManager/sourceAsset/AssetManagerController';
import { EntityManagerController } from './main/admin/assetManager/entityManager/EntityManagerController';
import { RelationManagerController } from './main/admin/assetManager/relationManager/RelationManagerController';
import { TagManagerController } from './main/admin/assetManager/tagManager/TagManagerController';

import { LogManagerController } from './main/admin/logManager/LogManagerController';
import { ExtendManagerController } from './main/admin/extendManager/extendManagerController';
import { otherController } from './main/admin/other/otherController';
import { logoController } from './main/admin/other/logoManager/logoController';
import { loginLogoController } from './main/admin/other/loginLogoManager/loginLogoController';

import { personCardToGraphController } from './main/personCardToGraph/personCardToGraphController';


import { httpConfig } from '../app/configs/httpConfig';
import { routerConfig } from '../app/configs/route';
import { config } from '../app/configs/config';
import { ngAnimateConfig } from '../app/configs/ngAnimateConfig';

import { runBlock } from './index.run';

/* 通用component */
import {noDataComponent} from './components/no-data/no-data.component'
/* 业务component */
import {personGraphComponent} from "./main/porpoise/personGraphComponent/personGraph.component";
import {graphStatisticsComponent} from "./main/porpoise/graphStatistics/graphStatistics.component";
import {recordChartsComponent} from "./main/people/recordCharts/recordCharts.component";
import {recordLeftMenuComponent} from "./main/people/recordLeftMenu/recordLeftMenu.component"

// 图析
import { statisticEntityTplComponent } from "./main/porpoise/statistics/entity";
import { statisticRelationTplComponent } from "./main/porpoise/statistics/relation";

import {peopleRelationComponent} from "./main/people/peopleRelation/peopleRelation.component";
import {seriesParallelEntityComponent} from "./main/seriesParallel/seriesParallelEntityInfo/seriesParallelEntityInfo.component";

import {focusPeopleComponent} from "./main/home/focusPeople/focusPeople.component";
import { strapModalConfig } from './configs/strapModalConfig';
import { focusManagerService } from './Services/focusManager.service';
import { focusManagerController } from './main/admin/focusManager/focusManager.controller';

angular.module('wuhanProject',
	[
        'ngAnimate',
		'ngSanitize',
		'ui.select',
		'toaster',
        'ngAria',
		'ui.router',
		'ui.bootstrap.module.pagination',
		'cfp.loadingBar',
		'mgcrea.ngStrap',
		'mgcrea.ngStrap.helpers.dimensions',
		'ngLocale',
        'puiComponents'
	])
	.service('util', utilService)
	.service('cache', cacheService)
	.service('loginService', loginService)
	.factory('cooperateService', cooperateService)
    .factory('seriesParallelService', seriesParallelService)
	.factory('porpoiseService', porpoiseService)
	.factory('nocacheInterceptor', nocacheInterceptor)
	.factory('httpInterceptor', httpInterceptor)
	.factory('textMiningService', textMiningService)
	.factory('voiceAPIService', voiceAPIService)
	.factory('authManagerService', authManagerService)
	.factory('roleManagerService', roleManagerService)
	.factory('otherManagerService', otherManagerService)
    .factory('logManagerService', logManagerService)
	.factory('extendManagerService', extendManagerService)
	.factory('focusManagerService',focusManagerService)
    .factory('peopleTypeService', peopleTypeService)
    .factory('relationTypeService', relationTypeService)
    .factory('cardTypeService', cardTypeService)
    .factory('communityTypeService', communityTypeService)
    .factory('carCardTypeService', carCardTypeService)
    .factory('phoneTypeService', phoneTypeService)
    .factory('addressTypeService', addressTypeService)
    .factory('assetManagerService', assetManagerService)
	.factory('homeService', homeService)
	.factory('seniorSearchService',seniorSearchService)
	.factory('adminAPIService', adminAPIService)
	.factory('applicationAPIService', applicationAPIService)
	.factory('tradeAPIService', tradeAPIService)
	.factory('headerService', headerService)
	.factory('peopleService', peopleService)
	.factory('settingService', settingService)
	.filter('ajFilter', ajFilter)
	.filter('propsFilter',propsFilter)
	.filter('fzlxFilter', fzlxFilter)
	.filter('managerDisplay', managerDisplay)
    .filter('edgeEvent', edgeEvent)
	.filter('entityTableNameFilter', entityTableNameFilter)
	.filter('rmb_wy', rmb_wy)
	.filter('num_total', num_total)
  	.config(httpConfig)
	.config(config)
	.config(routerConfig)
	.config(ngAnimateConfig)
	.config(strapModalConfig)
	.directive('header', HeaderDirective)
    .directive('timeAxis', TimeAxisDirective)
    .directive('fileUpload', fileUpload)
    .directive('relationMapGraph', RelationMapGraph)
    .directive('selectFolder', selectFolder)
	.directive('waterMark', waterMark)
	/* 通用组件部分 */
	.component('noData',noDataComponent)
	/* 业务组件部分 */
    .component('recordCharts',recordChartsComponent)
    .component('recordLeftMenu',recordLeftMenuComponent)
    .component('personGraph',personGraphComponent)
	.component('peopleRelation',peopleRelationComponent)
	.component('graphStatistics',graphStatisticsComponent)
	.component('seriesParallelEntity',seriesParallelEntityComponent)
	.component('focusPeople',focusPeopleComponent)
	.component('folderTree',treeTplComponent)
	.component('statisticEntity',statisticEntityTplComponent)
	.component('statisticRelation',statisticRelationTplComponent)
    .controller('PUIController', PUIController)
	.controller('MainController', MainController)
	.controller('HomeController', HomeController)
	.controller('PeopleController', PeopleController)
	.controller('LoginController', LoginController)
	.controller('PorpoiseController', PorpoiseController)
	.controller('GangMiningController', GangMiningController)
    .controller('ImportantPersonController', ImportantPersonController)
	.controller('CooperateController', CooperateController)
	.controller('EnterpriseRankingController', EnterpriseRankingController)
	.controller('SpecificFactorsController', SpecificFactorsController)
	.controller('CorporatePortraitController', CorporatePortraitController)
	.controller('PersonalModelingController', PersonalModelingController)
	.controller('EnterpriseOverviewController', EnterpriseOverviewController)
	.controller('VoiceModelController', VoiceModelController)
	.controller('IntegralRuleController', IntegralRuleController)
    .controller('openOuterURLController', openOuterURLController)
    .controller('ApplicationController', ApplicationController)
	.controller('textMiningController', textMiningController)
	.controller('seriesParallelController', seriesParallelController)
	.controller('AdminController', AdminController)
	.controller('RoleManagerController', RoleManagerController)
	.controller('AuthManagerController', AuthManagerController)
	.controller('MemberManagerController', MemberManagerController)
    .controller('RedListManagerController', RedListManagerController)
    .controller('VoiceListController', VoiceListController)
	.controller('VoiceTableController', VoiceTableController)
	.controller('phoneBookController', phoneBookController)
	.controller('TicketTableController', TicketTableController)
	.controller('assetManagerCtrl', assetManagerCtrl)
    .controller('AssetManagerController', AssetManagerController)
    .controller('RelationManagerController', RelationManagerController)
    .controller('TagManagerController', TagManagerController)
    .controller('EntityManagerController', EntityManagerController)
	.controller('LogManagerController', LogManagerController)
	.controller('ExtendManagerController', ExtendManagerController)
	.controller('focusManagerController',focusManagerController)
	.controller('otherController',otherController)
	.controller('logoController',logoController)
	.controller('loginLogoController',loginLogoController)

	.controller('knowledgeManagerCtrl', knowledgeManagerCtrl)
    .controller('PeopleTypeController', PeopleTypeController)
    .controller('RelationTypeController', RelationTypeController)
    .controller('AddressTypeController', AddressTypeController)
    .controller('CardTypeController', CardTypeController)
    .controller('CommunityTypeController', CommunityTypeController)
    .controller('CarCardTypeController', CarCardTypeController)
    .controller('PhoneTypeController', PhoneTypeController)
	.controller('gcrCertificateChainCtrl', gcrCertificateChainCtrl)
	.controller('tradeListController', tradeListCtrl)
	.controller('tradeReportController', tradeReportCtrl)
	.controller('tradeReportAppController', tradeReportAppCtrl)
	.controller('tradeDetailController', tradeDetailCtrl)
	.controller('yzDataController', yzDataController)
	.controller('consensusController', consensusController)
	.controller('personCardToGraphController', personCardToGraphController)
	.controller('SettingController', SettingController)

	.run(runBlock)
