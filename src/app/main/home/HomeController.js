import addNodeModal from './addNode/modal';
import tagModal from './tagModal/tagModal';
import focusManagerAddFocusModal from "../admin/focusManager/focusManagerAddFocus/focusManagerAddFocus.modal";
export class HomeController {
    constructor($injector, $scope,$timeout,toaster) {
        'ngInject'; 
        this.inject = $injector;
        this.$scope = $scope;
        this.$state = this.inject.get('$state');
        this.toaster = toaster;
        this.$location = this.inject.get('$location');
        this.$timeout = $timeout;
        this.seniorSearchService = this.inject.get('seniorSearchService');
        //高级搜索参数列表
        this.seniorSearchParams = {}
        //字典列表
        this.seniorSearchDics = {}
        this.emptyDic = []
        //已添加的实体属性,控制每条属性是否显示
        this.addedPeople = [];
        this.addedCase = [];
        this.addedPhone = [];
        this.addedBusiness = [];
        this.addedInternet = [];
        this.addedVehicleEntity = [];
        //已添加的事件属性,控制每条属性是否显示
        this.addedHotel = [];
        this.addedFlight = [];
        this.addedVehicle = [];
        this.addedTicket = [];
        this.addedTrain = [];
        //搜索结果保留
        this.resultData = {};
        this.basicFilterItem = [];
        this.entityTypeData = [];
        // 是否是高级搜索
        this.isSeniorSearch = false
        this.seniorSearchDates = ['trafficDate', 'offlineTime', 'onlineTime', 'startTime', 'endTime', 'date', 'reportTime', 'time', 'enterTime', 'levelTime', 'arrivalDate', 'departDate', 'portTime']
        this.entityAttrData = {
            peopleAttrData: {
                result: [],
                currentValue: ''
            },
            phoneAttrData: {
                result: [],
                currentValue: ''
            },
            businessAttrData: {
                result: [],
                currentValue: ''
            },
            caseAttrData: {
                result: [],
                currentValue: ''
            },
            vehicleAttrData: {
                result: [],
                currentValue: ''
            },
            internetAttrData: {
                result: [],
                currentValue: ''
            }
        }
        this.eventAttrData = { //事件小类
            hotelAttrData: {
                result: [],
                currentValue: ''
            },
            flightAttrData: {
                result: [],
                currentValue: ''
            },
            vehicleAttrData: {
                result: [],
                currentValue: ''
            },
            ticketAttrData: {
                result: [],
                currentValue: ''
            },
            trainAttrData: {
                result: [],
                currentValue: ''
            },

        }
        this.textAttrData = {
            reportCaseAttrData: {
                result: [],
                currentValue: ''
            }
        }
        //事件大类
        this.eventTypeData = []
        //初始化goryType和searchTypeTerm
        this.goryType = 0
        //基本检索小分类id值
        this.seniorSearchInput = false
        this.homeData = {
            choosetype: 1, //默认普通检索 2实体 3事件
            showBasicResult: false,
            // 基本检索value
            searchValue: '',
            // 基本检索二次检索value
            basicSearchValue: '',
            seniorSearchValue: '',
            appIconMap: {
                "main.voiceList": 'assets/images/theme_star_blue/application/vm.png',
                "main.gcrCertificateChain": 'assets/images/theme_star_blue/application/gcr.png',
                "main.enterpriseOverview": 'assets/images/theme_star_blue/application/qiye.png',
                "main.gangMining": 'assets/images/theme_star_blue/application/tuanhuo.png',
                "main.personalModeling": 'assets/images/theme_star_blue/application/zhongdian.png',
                "main.textmining": 'assets/images/theme_star_blue/application/cba.png',
                "main.tradeList": 'assets/images/theme_star_blue/application/jy.png'
            },
            init: false,
            myAppList: [],
            search: {
                type: 3,
                baiduPageStart: 2,
                baiduTotal: 36,
                baiduPageNo: 1,
                showBaidu: false,
                baiduSearchCache: [],
                selectLabel: '默认',
                option: [{
                        value: 0,
                        label: '前缀匹配',
                        chosen: false
                    },
                    {
                        value: 1,
                        label: '后缀匹配',
                        chosen: false
                    },
                    {
                        value: 2,
                        label: '模糊匹配',
                        chosen: false
                    }
                ]
            }
        };
        this.jsonData = {
            analysis: []
        };
        this.offset = 0;
        this.dataMap = {
            '0': 'entityData' //全部实体数据
        };
        this.pageParam = {
            pageNo: 1,
            pageSize: 5,
            total: 0,
            baiduTotal: 0
        }
        // 显示智能检索搜索框
        this.showIntelligentSearch = true
        this.searchTagList= [];
        this.basicSearchKeywordChangeDebounce = _.debounce(this.basicSearchKeywordChange.bind(this), 500)

        this.init();
        this.batchIds = [];
        // this.debounceSearch = _.debounce(this.debounceSearch.bind(this), 5000);
    }
    init() {
        this.inject.get('$rootScope').urlData.chooseMenu = 'home';
        this.initSearchData();
        if (this.$state.params.searchType === 'senior') {
            this.isSeniorSearch = true;
            this.initSensiorData();
        } else {
            this.getRationTotal();
        }
        if(!!this.$location.$$search.importId){
            new tagModal(this.inject)
        }
        this.$scope.$on('$viewContentLoaded', function() {
            angular.element('video source').attr('src', 'assets/theme-sb/home/video/home-bg.mp4')
        });

        //监听出发站到达站的值改变下拉选项
        angular.element('body').on('input', '.start-train input, .end-train input', (e) => {
            let currentValue = e.target.value
            if (currentValue) {
                this.seniorSearchDics.trainNameSelect = this.seniorSearchDics.trainName.filter((item) => {
                    if (item.indexOf(currentValue) > -1) {
                        return item
                    }
                })
            }
        })

        this.$scope.$on('$destroy', () => {
            $(document).off("click")
        });
    }
    // 初始化搜索结果数据
    initSearchData() {
        this.inject.get('homeService').getAllSearchType().then((res) => {
            if (res.status === 200 && res.data.code === 0) {
                res.data.result.forEach((item) => {
                    this.resultData[item.code] = {
                        pageNo: 1,
                        data: {},
                        searchValue: ''
                    }
                });
            }
        }, error => {
            //
        });
    }
    // 初始化车站站点数据
    trainNameChange(tag) {
        this.seniorSearchDics.trainNameSelect = this.trainName.slice(0, 30)
    }
    // 简单检索和高级检索切换
    searchSwitch(tag) {
        const stateData =  { searchType: 'senior'};
        window.open(this.$state.href('main.senior', stateData), '_blank');
    }
    // 简单检索检索类型的切换
    basicSearchTypeChange() {
        this.homeData.choosetype = 6;
        this.goryType = 0;
        this.resultData[this.goryType].pageNo = 1;
        this.searchSubmitTitle();
        this.showIntelligentSearch = false
    }
    // 高级搜索相关方法
    initSensiorData() {

        //初始化高级搜索参数
        this.seniorSearchParams = _.cloneDeep(this.seniorSearchService.ststicData.params)
        //初始化并处理字典数据-人
        const dicDataResult = JSON.parse(localStorage.getItem('dicData'))
        if (dicDataResult) {
            const dicData = dicDataResult.result
            //民族
            this.seniorSearchDics.mzName = _.map(dicData.mz, 'name')
            //婚姻状态
            this.seniorSearchDics.marryName = _.map(dicData.married, 'name')
            //性别
            this.seniorSearchDics.sexName = _.map(dicData.xb, 'name')
            //教育程度
            this.seniorSearchDics.eduName = _.map(dicData.eduDegree, 'name')
            //案件状态字典
            this.seniorSearchDics.ctStatusName = _.map(dicData.categoryCase, 'name')
            //手机卡类型字典
            this.seniorSearchDics.phoneTypeName = _.map(dicData.phoneType, 'name')
            //市场主体类型字典
            this.seniorSearchDics.businessTypeName = _.map(dicData.bussinessType, 'name')
            //登记状态字典
            this.seniorSearchDics.businessRankTypeName = _.map(dicData.bussinessRankType, 'name')
            //机场
            this.seniorSearchDics.flightName = [...new Set(_.map(dicData.airPlance, 'name'))]
            //违章车辆类型
            this.seniorSearchDics.illegalCarTypeName = _.map(dicData.illegalCar, 'name')
            //违章车辆号牌类型
            this.seniorSearchDics.illegalCarName = _.map(dicData.illegalCarNumber, 'name')
            //火车站点
            this.trainName = [...new Set(_.map(dicData.trainStation, 'name'))]
            this.seniorSearchDics.trainName = this.trainName
            this.seniorSearchDics.trainNameSelect = this.trainName.slice(0, 30)
            //报案类型
            this.seniorSearchDics.reportCaseName = _.map(dicData.reportCaseType, 'name')
            //报案类别
            this.seniorSearchDics.reportCaseClassName = _.map(dicData.reportCase, 'name')
            //案件类别
            this.seniorSearchDics.caseClassName = _.map(dicData.caseClass, 'name')
        }

        //初始化三个大类下的各小类
        this.inject.get('util').innerLoadingStart('theme_star_blue', '#24263C');
        this.seniorSearchService.getType().then((res) => {
			if(res.status === 200 && res.data.code === 0) {
                //初始化实体下的类别
                let entityType = res.data.result[2];
                this.entityTypeData = entityType.gory;
                this.entityTypeData.currentId = entityType.gory[0].id;

                //初始化事件下的类别
                let eventType = res.data.result[3];
                this.eventTypeData = eventType.gory;
                this.eventTypeData.currentId = eventType.gory[0].id;

                // 判断当前页面是否为高级检索
                if (this.$state.params.searchType === 'senior') {
                    this.homeData.choosetype = 2
                    //高级检索切换一级分类设置goryType和searchTypeTerm
                    this.setGoryType(this.homeData.choosetype);
                }
			} else {
				this.toaster.pop({type:'error',title: res.data.message});
            }
            this.inject.get('util').innerLoadingEnd();
        })

        // 初始化搜索下拉项
        this.seniorSearchService.getClass().then((res) => {
			if(res.status === 200 && res.data.code === 0) {
                
                let result = res.data.result;
                for(let i in result) {
                    result[i].unshift({
                        name: "请选择",
                        id: 0
                    });
                }

                //初始化实体-人属性
                let peopleAttr = result[1] || [];
                this.entityAttrData.peopleAttrData.result = peopleAttr;
                this.entityAttrData.peopleAttrData.currentValue = peopleAttr[0].id;

                //初始化实体-手机属性
                let phoneAttr = result[3] || [];
                this.entityAttrData.phoneAttrData.result = phoneAttr;
                this.entityAttrData.phoneAttrData.currentValue = phoneAttr[0].id;

                //初始化实体-企业属性
                let companyAttr = result[2] || [];
                this.entityAttrData.businessAttrData.result = companyAttr;
                this.entityAttrData.businessAttrData.currentValue = companyAttr[0].id;

                //初始化实体-案件属性
                let caseAttr = result[9] || [];
                this.entityAttrData.caseAttrData.result = caseAttr;
                this.entityAttrData.caseAttrData.currentValue = caseAttr[0].id;

                //初始化实体-车辆属性
                let vehicleAttr = result[22] || [];
                this.entityAttrData.vehicleAttrData.result = vehicleAttr;
                this.entityAttrData.vehicleAttrData.currentValue = vehicleAttr[0].id;

                //初始化实体-网吧属性
                let internetAttr = result[21] || [];
                this.entityAttrData.internetAttrData.result = internetAttr;
                this.entityAttrData.internetAttrData.currentValue = internetAttr[0].id;

                //初始化事件-住宿属性
                let hotelAttr = result[8] || [];
                this.eventAttrData.hotelAttrData.result = hotelAttr;
                this.eventAttrData.hotelAttrData.currentValue = hotelAttr[0].id;

                //初始化事件-航班属性
                let flightAttr = result[7] || [];
                this.eventAttrData.flightAttrData.result = flightAttr;
                this.eventAttrData.flightAttrData.currentValue = flightAttr[0].id;

                //初始化事件-违法车辆属性
                let vehicleEventAttr = result[6] || [];
                this.eventAttrData.vehicleAttrData.result = vehicleEventAttr;
                this.eventAttrData.vehicleAttrData.currentValue = vehicleEventAttr[0].id;

                //初始化事件-网络购票属性
                let ticketAttr = result[5] || [];
                this.eventAttrData.ticketAttrData.result = ticketAttr;
                this.eventAttrData.ticketAttrData.currentValue = ticketAttr[0].id;

                //初始化事件-火车出行属性
                let trainAttr = result[4] || [];
                this.eventAttrData.trainAttrData.result = trainAttr;
                this.eventAttrData.trainAttrData.currentValue = trainAttr[0].id;
			} else {
                this.toaster.pop({type:'error',title: res.data.message});
			}
		})
    }

    clearCurrent(type, attr, addedType, attrId, currentType, currentAttr) {
        const _this = this
        _this.inject.get('$timeout')(() => {
            _this.seniorSearchParams.term[type][attr] = []
            _.remove(_this[currentType][currentAttr].resultDiff, function (n) {
                let flag = n.id.toString() == attrId
                if (flag) {
                    _this[currentType][currentAttr].result.push(n)
                }
                return flag
            })
            _this[currentType][currentAttr].result = _this[currentType][currentAttr].result.sort(_this.inject.get('util').sortBy("id"));
            _.remove(_this[addedType], function (n) {
                return n == attrId;
            })
        })
    }
    clearCurrentAll(type, addedType, currentType, currentAttr) {
        const that = this
        that[currentType][currentAttr].result = _.cloneDeep(that[currentType][currentAttr].resultCopy)
        that[currentType][currentAttr].result = _.cloneDeep(that[currentType][currentAttr].result.sort(that.inject.get('util').sortBy("id")));
        for (let key in that.seniorSearchParams.term[type]) {
            if (that.seniorSearchDates.includes(key)) { //时间类型的参数特殊处理,清空初始化为必须是长度为2的数组
                that.seniorSearchParams.term[type][key] = ['', '']
            } else {
                that.seniorSearchParams.term[type][key] = []
            }
        }
        this[addedType] = []
    }

    entityTypeSelect(id) {
        this.goryType = id
        this.seniorSearchParams.gory = this.goryType
        this.entityTypeData.currentId = id
        this.homeData.seniorSearchValue = this.resultData[id].searchValue
    }
    caseTypeSelect(id) {
        this.goryType = id
        this.seniorSearchParams.gory = this.goryType
        this.eventTypeData.currentId = id
        this.homeData.seniorSearchValue = this.resultData[id].searchValue
    }

    // 批量跳图析
    batchToPorpoise(id,isToGis) {
        // 保存图析时是否允许更新图析
        localStorage.setItem('canUpdateGraph','false')
        const total = this.resultData[this.goryType].data.total
        var count = count || 100
        if (!id && total > count) {
            this.toaster.pop({type:'warning',title:'结果数量超过100条，暂不支持批量进入图析'});
            return
        } else {
            localStorage.setItem("isToGis", isToGis)
            if(total){
            const copyseniorSearchParams = _.cloneDeep(this.seniorSearchParams);
            copyseniorSearchParams.pageSize = count
            copyseniorSearchParams.pageNo = 1
            this.seniorSearchService.getSeniorData((copyseniorSearchParams)).then((res) => {
                if (res.status == 200) {
                    if (id) {
                        localStorage.setItem("batchIds", id)
                    } else {
                        this.batchIds = _.map(res.data.data, 'keys')
                        localStorage.setItem("batchIds", this.batchIds)
                    }
                    const state = this.inject.get('$state');
                    const stateData =  { type: 'normal', id: 'batch'};
                    window.open(state.href('main.porpoise' , stateData), '_blank');
                } else {
                    this.toaster.pop({type:'warning',title:res.data.data.msg || '跳转失败,请稍后再试'});
                    return
                }
            })
            }
            else{
                this.toaster.pop({type:'warning',title: '暂无检索结果,请重新检索'});
                return
            }
            
        }


    }

    attrChange(type, attr, addedType) {
        let _this = this
        _this.emptyDic = []
        if (!this[addedType].includes(this[type][attr].currentValue)) {
            if (_this[type][attr].cloneFlag) {} else {
                _this[type][attr].resultCopy = _.cloneDeep(_this[type][attr].result);
                _this[type][attr].cloneFlag = true
            }
            if(this[addedType].length > 0) {
                angular.element(`.${addedType}${this[type][attr].currentValue}`).insertAfter(angular.element(`.${addedType}${this[addedType][this[addedType].length - 1]}`));
            }
            this[addedType].push(this[type][attr].currentValue)
            _this.inject.get('$timeout')(() => {
                _this[type][attr].currentValue = '0'
                _this[type][attr].result = _this[type][attr].result.filter((i) => {
                    return i.id.toString() == _this[type][attr].currentValue || !_this[addedType].includes(i.id.toString())
                })
                _this[type][attr].resultDiff = _.cloneDeep(_this.inject.get('util').difference(_this[type][attr].result, _this[type][attr].resultCopy, 'name'));
            })

        } else {
            this.toaster.pop({type:'warning',title: '列表中已存在该属性'});
            _this.inject.get('$timeout')(() => {
                _this[type][attr].currentValue = '0'
                _this[type][attr].result = _this[type][attr].result.filter((i) => {
                    return i.id.toString() == _this[type][attr].currentValue || !_this[addedType].includes(i.id.toString())
                })
            })
            return
        }
    }
    // 高级搜索相关方法结束
    getRationTotal() {
        this.inject.get('homeService').getRationTotal({
            searchContent: {},
        }).then((res) => {
            if (res.status === 200) {
                if (res.data.status === 0) {
                    this.rtData = res.data.data;
                }
            }
        }, error => {
            //
        });
    }

    changeSearchSelect(option) {
        this.homeData.search.option.filter(op => op.value !== option.value).forEach(op => {
            op.chosen = false;
        });

        this.homeData.search.selectLabel = option.chosen ? option.label : '默认';
        this.homeData.search.type = option.chosen ? option.value : 3;
    }

    // 简单检索筛选
    chooseEntityType(e, item) {
        if(!this.homeData.searchValue.trim()) {
            this.toaster.pop({type:'warning',title: '请先输入搜索关键词'});
            return
        }
        this.goryType = item.code;
        this.homeData.basicSearchValue = this.resultData[this.goryType].searchValue
        this.searchSubmitTitle();
    }

    setGoryType(type) {
        if (type == 2) {
            this.goryType = this.entityTypeData.currentId;
            this.homeData.seniorSearchValue = this.resultData[this.entityTypeData.currentId].searchValue
        } else if (type == 3) {
            this.goryType = this.eventTypeData.currentId;
            this.homeData.seniorSearchValue = this.resultData[this.eventTypeData.currentId].searchValue
        } else if (type == 4) {
            this.goryType = this.textTypeData.currentId;
        }
    }

    chooseType(e, type) {
        e.stopPropagation();
        const $this = this;
        if ($this.homeData.choosetype == type) {
            return
        }
        this.setGoryType(type); //高级检索切换一级分类设置goryType和searchTypeTerm
        $this.homeData.choosetype = type;
        $this.seniorChoosetype = type;
        //$this.showResult()
        if ($this.homeData.searchValue.length == 0) { //如果搜索关键词为空,则不发请求
            return
        }
    }

    openResult() {
        const $this = this;
        const defer = $this.inject.get('$q').defer();
        if (this.isSeniorSearch) {
            $this.homeData.showResult = true;
        }
        return defer.promise;
    }

    closeList() {
        const $this = this;
        $this.inject.get('$timeout')(() => {
            angular.element('.jq_result_li').each((index, item) => {
                $this.inject.get('$timeout')(() => {
                    angular.element(item).removeClass('result-animate');
                }, 100 * index);
            });
        }, 100);
    }

    backHome() {
        const $this = this;
        $this.homeData.init = false;
        if($this.basicSearchMethodType == 20){
            $this.homeData.basicSearch.intelligentValue = ''
        }else{
            $this.homeData.searchValue = '';
        }
        $this.searchTagList = [];
    }
    seniorBackHome(e) {
        e.stopPropagation();
        this.homeData.seniorSearchValue = '';
    }
    
    basicBackHome(e) {
        e.stopPropagation();
        this.homeData.basicSearchValue = '';
    }

    clickSeniorSearchInput() {
        this.seniorSearchInput = true;
        angular.element('.senior-search-input .search-btn').addClass('search-btn-active');
        angular.element('.senior-search-input .search-input').addClass('search-input-active');
    }
    clickBasicSearchInput() {
        angular.element('.basic-search-input .search-btn').addClass('search-btn-active');
        angular.element('.basic-search-input .search-input').addClass('search-input-active');
    }

    searchSubmitTitle(isBasicSecondSearch) {
        // 简单搜索的非空校验
        if (!this.isSeniorSearch) {
            if(!this.homeData.searchValue.trim()){
                this.toaster.pop({type:'warning',title: '请先输入搜索关键词'});
                return
            }
        }
        this.seniorSearchParams.gory = this.goryType
        // 简单搜索的处理
        if (!this.isSeniorSearch) {
            this.seniorSearchParams.content = this.homeData.searchValue.trim()
            let basicSearchValue = this.homeData.basicSearchValue.trim()
            this.seniorSearchParams.secondContent = basicSearchValue
            this.resultData[this.goryType].searchValue = basicSearchValue
            this.homeData.showBasicResult = true;
            this.seniorSearchParams.pageSize = 5;
        } else {
            let searchValue = this.homeData.seniorSearchValue
            if (searchValue && searchValue.trim()) {
                this.resultData[this.goryType].searchValue = searchValue
                this.seniorSearchParams.content = searchValue
            } else {
                this.seniorSearchParams.content = ''
            }
            this.seniorSearchParams.pageSize = 8;
        }
        this.seniorSearchParams.type = this.homeData.choosetype
        this.seniorSearchParams.pageNo = this.resultData[this.goryType].pageNo
        this.homeData.pressEnter = true
        this.inject.get('util').innerLoadingStart('jq-home-result', '#24263C'); //加载loading
        this.seniorSearchService.getSeniorData(this.seniorSearchParams).then((res) => {
            if (res.status == 200 && res.data.status === 0) {
                this.resultData[this.goryType].data = res.data
                this.showBatchBtn = true
                if (!this.isSeniorSearch && (!isBasicSecondSearch || (isBasicSecondSearch && !this.seniorSearchParams.secondContent)) && (this.goryType === 0)) {
                    this.basicFilterItem = res.data.gory;
                }
                this.homeData.init = true
                if (!this.homeData.showResult && this.isSeniorSearch) {
                    this.homeData.showResult = true;
                }
                angular.element('.home-main video').fadeOut(1000);
                this.inject.get('util').innerLoadingEnd();
            } else {
                this.showBatchBtn = false
                this.toaster.pop({type:'warning',title: _.get(res.msg) || '查询失败'});
                this.inject.get('util').innerLoadingEnd();
                return false
            }
        })
    }

    into_archives(key) {
        const $this = this;
        const state = $this.inject.get('$state');
        const stateData = {
            key: 'fromGraph',
            type: 'normal'
        };
        if (key) {
            localStorage.setItem('porpoiseNodeIds', JSON.stringify([key]))
            window.open(state.href('main.file', stateData), '_blank');
        } else {
            const total = this.resultData[this.goryType].data.total
            if (!key && total > 100) {
                this.toaster.pop({type:'warning',title:'结果数量超过100条，暂不支持批量进入档案'});
                return
            } else {
                if(total){
                    var count = count || 100
                    const copyseniorSearchParams = _.cloneDeep(this.seniorSearchParams);
                    copyseniorSearchParams.pageSize = count
                    copyseniorSearchParams.pageNo = 1
                    this.seniorSearchService.getSeniorData((copyseniorSearchParams)).then((res) => {
                        if (res.status == 200) {
                            this.batchIds = _.map(res.data.data, 'id')
                            localStorage.setItem("porpoiseNodeIds", JSON.stringify(this.batchIds))
                            window.open(state.href('main.file', stateData), '_blank');
                        } else {
                            this.toaster.pop({type:'warning',title:'跳转失败,请稍后再试'});
                            return
                        }
                    })
                } else {
                    this.toaster.pop({type:'warning',title:'暂无搜索结果,请重新检索'});
                    return
                }
            }
        }
    }
    // 添加搜索出来的分页实体到关注里
    addFocusEntities(){
        if(this.focusLoading){
            return false;
        }
        this.focusLoading = true;

        let  searchEntitiesList = this.resultData[this.goryType].data.data
        let list = searchEntitiesList.filter(item => {
            return this.judgeIsEntity(item.tag)
        }).map(item => {
            return {
                type:item.tag,
                focusid:item.id,
                title:this.getEntityTitle(item)
            }
        })
        if(searchEntitiesList.length ==0 ){
            this.toaster.warning('结果中无可关注项');
            return false;
        }
        if(list.length == 0){
            this.toaster.warning('结果中无实体类型');
            return false;
        }
        new focusManagerAddFocusModal(this.inject,list).$promise.then(res => {
            this.focusLoading = false;
            if(res){
                this.searchSubmitTitle();
            }
        }).catch(err => {
            this.focusLoading = false;
        })
    }
    //关注单个个体
    focus(e, item) {
        e.stopPropagation();
        if(this.focusLoading){
            return false;
        }
        this.focusLoading = true;
        let list = [
            {
                type:item.tag,
                focusid:item.id,
                title:this.getEntityTitle(item) 
            }
        ]
        new focusManagerAddFocusModal(this.inject,list).$promise.then(res => {
            this.focusLoading = false;
            if(res){
                item.isFocused = res.length != 0;
            }
        }).catch(err => {
            this.focusLoading = false;
        })
    }
    judgeIsEntity(tag){
        switch (tag){
            case '0101': // 人员
            case '1701': // 网吧
            case '0404': // 企业
            case '0601': // 车辆
            case '0301': // 手机
            case '1601': // 案件
                return true;
            default :
                return false;
        }
    }
    getEntityTitle(entity){
        switch(entity.tag){
            case '0101':
            case "1501":
                return entity['origin_xm'] || entity['xm'] || entity['key'];
            case '0301':
                return entity['origin_sjhm'] || entity['sjhm'] || entity['key'];
            case '0404':
                return entity['origin_wbmc'] || entity['wbmc'] || entity['key'];
            case '0601':
                return entity['origin_qymc'] || entity['qymc'] || entity['key'];
            case '0201':
            case '0902':
                return entity['origin_clbh'] || entity['clbh'] || entity['key'];
            case '1601':
                return entity['origin_ajmc'] || entity['ajmc'] || entity['key'];
            case '0403':
                return entity['origin_key'] || entity['key'] || entity['keys'];
            case '0402':
                return entity['origin_zwm']  || entity['zwm'] || entity['key'];
            case '0401':
                return entity['origin_rzxm'] || entity['rzxm'] || entity['key'];
                
        }
    }

    // 单个跳图析
    into_porpoise(id,isToGis) {
        localStorage.setItem("isToGis",isToGis)
        // 保存图析时是否允许更新图析
        localStorage.setItem('canUpdateGraph','false')
        const $this = this;
        const state = $this.inject.get('$state');
        const stateData =  { type: 'normal', id: encodeURIComponent(id)};
        window.open(state.href('main.porpoise' , stateData), '_blank');
    }
    // 监听 简单搜索部分search的文字变化
    basicSearchKeywordChange (event) {
        if(this.homeData.searchValue.trim() != ''){
            this.inject.get('homeService').getRecognition(this.homeData.searchValue).then(result => {
                if (result.data.code == 0) {
                    this.searchTagList = result.data.result;
                } else {
                    this.searchTagList.splice(0,this.searchTagList.length);
                }
            })
        } else {
            this.$timeout(() => {
                this.searchTagList.splice(0,this.searchTagList.length);
            },0,true)
        }
    }
    // 显示智能检索匹配
    showIntelligentSearchFunc(e) {
        e.stopPropagation();
        this.showIntelligentSearch = true
        $(document.body).unbind('click');
        $(document.body).bind('click', (e) => {
            if (!this.showIntelligentSearch) {
                $(document.body).unbind('click');
            } else {
                this.showIntelligentSearch = false
                if (!this.$scope.$$phase) {
                    this.$scope.$digest();
                }
            }
        });
    }
    // 批量检索回车
    myKeyup(e) {
        const keycode = window.event ? e.keyCode : e.which;
        if (keycode === 13) {
            if (this.homeData.searchValue && this.homeData.searchValue.trim()) {
                this.homeData.choosetype = 1;
                this.goryType = 0;
                this.resultData[this.goryType].pageNo = 1;
                this.searchSubmitTitle();
            } else {
                this.toaster.pop({type:'warning',title:'请输入搜索关键字'});

            }
        }
    }
    // 高级检索回车
    mySeniorKeyup(e) {
        e.stopPropagation()
        const keycode = window.event ? e.keyCode : e.which;
        if (keycode === 13) {
            this.resultData[this.goryType].pageNo = 1
            this.searchSubmitTitle();
        }
    }
    // 二次检索回车
    myBasicKeyup(e) {
        e.stopPropagation()
        const keycode = window.event ? e.keyCode : e.which;
        if (keycode === 13) {
            this.resultData[this.goryType].pageNo = 1
            this.searchSubmitTitle(true);
        }
    }

    // 点击批量检索放大镜
    pressSearchBtn() {
        if (this.homeData.searchValue && this.homeData.searchValue.trim()) {
            this.homeData.choosetype = 1;
            this.goryType = 0;
            this.resultData[this.goryType].pageNo = 1
            this.searchSubmitTitle();
        } else {
            this.toaster.pop({type:'warning',title:'请输入搜索关键字'});
        }
    }

    // 点击基本检索二次检索放大镜
    pressBasicSearchBtn() {
        this.resultData[this.goryType].pageNo = 1
        this.searchSubmitTitle(true);
    }

    // 点击高级检索放大镜
    pressSeniorSearchBtn(e) {
        e.stopPropagation()
        this.resultData[this.goryType].pageNo = 1
        this.searchSubmitTitle();
    }

    showResult() {
        const $this = this;
        $this.openResult();
    }
}
