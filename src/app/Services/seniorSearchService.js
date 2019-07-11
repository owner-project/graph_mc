export function seniorSearchService($injector) {
    'ngInject';
    let service = {
        getSeniorData: (params) => { //获取某一个大类下的类型,如获取实体下的(人,车,案件)
            let http = $injector.get('$http');
            return http.post('/admin_api/search/senior' , params);
        },
        getType: () => { //获取某一个大类下的类型,如获取实体下的(人,车,案件)
            let http = $injector.get('$http');
            return http.get('/admin_api/search/type');
        },
        //获取搜索下拉项
        getClass: () => {
            let http = $injector.get('$http');
            return http.get('/admin_api/search/class');
        },
        getBusinessRankTypeDic: () => { //登记状态字典
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/businessRankType');
        },
        getBusinessTypeDic: () => { //市场主题类型字典
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/businessType');
        },

        getCamDic: () => { //查询案件受理方式字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/cam');
        },

        getCaseClassDic: () => { //案件事件类别字典
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/caseClass');
        },
        getccDic: (data) => { //查询案件类别字典接口
            let http = $injector.get('$http');
            return http.get(' /admin_api/dic/get/cc', data);
        },

        getciDic: (data) => { //查询案件危害程度字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/ci', data);
        },
        getctStatusDic: (data) => { //查询案件状态字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/ct/status', data);
        },

        getEdudegreeDic: (data) => { //查询教育程度字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/edu_degree', data);
        },
        getFlightDic: (data) => { //查询航站楼字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/flight', data);
        },

        getIllegalCarDic: (data) => { //查询违章字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/illegalCar', data);
        },
        getIllegalCarTypeDic: (data) => { //查询违章字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/illegalCarType', data);
        },
        getMarriedDic: (data) => { //查询婚姻状态字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/married', data);
        },
        getmzDic: (data) => { //查询民族字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/mz', data);
        },
        getPhoneTypesDic: (data) => { //查询获取手机类型接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/phone_types', data);
        },
        getReportCaseClassDic: (data) => { //报案类别字典
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/reportCaseClass', data);
        },
        getReportCaseTypeDic: (data) => { //报案类型字典
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/reportCaseType', data);
        },
        getTrainDic: (data) => { //查询火车车站字典接口
            let http = $injector.get('$http');
            return http.get('/admin_api/dic/get/train', data);
        },
        'ststicData': {
            params: {
                "pageNo": 1,
                "pageSize": 5,
                "type": 1,
                "gory": 0,
                "content":'',
                "secondContent": '',
                "term": {
                    "business": {
                        "identityCode": [],
                        "firmName": [],
                        "regMark": [],
                        "type": [],
                        "registrationAuthority": [],
                        "registrationStatus": [],
                        "dwellingPlace": [],
                        "phone": []
                    },
                    "calaboose": {
                        "enterTimeAround": [],
                        "levelTimeAround": []
                    },
                    "flightDeparture": {
                        "idNum": [],
                        "flightNUm": [],
                        "boardAirport": [],
                        "arrivalAirport": [],
                        "airLine": [],
                        "flightDate": [],
                        "startTime": ['', ''],
                        "endTime": ['', ''],
                        "phone": []
                    },
                    "hotel": {
                        "hotelNum": [],
                        "hotelName": [],
                        "idCard": [],
                        "occupancyNumber": [],
                        "checkIn": [],
                        "roomNumber": [],
                        "startTime": ['', ''],
                        "endTime": ['', '']
                    },
                    "illegalVehicle": {
                        "driverNum": [],
                        "carType": [],
                        "carFlapperType": [],
                        "flapperNum": [],
                        "time": ['', '']
                    },
                    "vehicle": {
                        "clbh": [],
                        "clsbdh": [],
                        "syr": [],
                        "zjhm": [],
                        "fdjh": [],
                        "fdjxh": [],
                        "clpp": [],
                        "cllxdm": [],
                        "clxh": [],
                        "clcpzldm": []
                    },
                    "internetBar": {
                        "license": [],
                        "leader": [],
                        "name": []
                    },
                    "internetBarEvent": {
                        "idCard": [],
                        "onlineTime": ['', ''],
                        "offlineTime": ['', '']
                    },
                    "internetBarEntity" : {
                        "wbbh": [],
                        "wbmc": [],
                        "jyxkzbh": [],
                        "wbfzr": [],
                        "gxdwmc": [],
                        "wbdz": []
                    },
                    "legalCase": {
                        "date": ['', ''],
                        "name": [],
                        "reportTime": ['', ''],
                        "type": [],
                        "number": [],
                        "address": [],
                        "des": [],
                    },
                    "onlionTicket": {
                        "idCard": [],
                        "contactWay": [],
                        "ticketNum": [],
                        "time": ['', '']
                    },
                    "person": {
                        "idCards": [],
                        "name": [],
                        "nations": [],
                        "isMarrieds": [],
                        "nativePlace": [],
                        "phone": [],
                        "residenceAddress": [],
                        "eduDegree": [],
                        "xbmc": []
                    },
                    "phone": {
                        "phoneNum": [],
                        "ownerName": [],
                        "ownerIdCard": [],
                        "type": [],
                        "cardNum": []
                    },
                    "quarter": {
                        "occupancyTimeAround": [],
                        "levelTimeAround": []
                    },
                    "relationshipRecord": {
                        "phoneNum": [],
                        "time": ['', '']
                    },
                    "reportCase": {
                        "portTime": ['', ''],
                        "reporter": [],
                        "type": [],
                        "classes": [],
                        "detailType": [],
                        "feedbackOrganization": [],
                        "feedbackOrganizationNumber": [],
                        "happeningPlace": [],
                        "informerPhone": [],
                        "precinctOrganization": [],
                        "precinctOrganizationCode": [],
                        "content": []
                    },
                    "trainTrip": {
                        "idNum": [],
                        "classes": [],
                        "departStation": [],
                        "arrivalStation": [],
                        "trafficDate": ['', ''],
                        "departDate": ['', ''],
                        "arrivalDate": ['', '']
                    },
                    "watchHouse": {
                        "enterTime": ['', ''],
                        "levelTime": [
                            '', ''
                        ],
                        "isDrugs": []
                    }
                }
            }
        }
    };

    return service;

}
