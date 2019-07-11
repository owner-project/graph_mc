var GIS_CFG = {
    "USE_CUSTOM_MAP": false,  // 正常构建为false，只有在构建私有云版本时显式指定了相应参数才为true

    "MAP_COORDTYPE": "bd09ll",  // 底图的坐标系，百度地图为bd09ll
    // 地图的默认中心点
    "DEFAULT_CENTER": [116.404089,39.915309],

    "DEFAULT_ZOOM": 9,  // 地图的默认缩放尺度

    // "MIN_ZOOM": 1,  // 地图的最小缩放尺度
    // "MAX_ZOOM": 10,  // 地图的最大缩放尺度

    // "FORCE_DRAW_EVEYTHING": true, // 强制画出所有点，即使点不在可视区域内。pgis v0.3版需要开启这项设置，否则会出现可视边界区域被截断的问题

    /* 设置内置的CRS start */
    // "CUSTOM_CRS": "EPSG4326",  // 支持的投影：["EPSG3395", "EPSG3857", "EPSG4326", "Earth", "Simple"]
    /* 设置内置的CRS end */

    /* 自定义的CRS配置 start */
    // "CUSTOM_CRS": {  // 使用自定义的投影坐标系, 构建私有云版本时传入参数进行设置，不设置时使用EPSG3857
    //     "code": "EPSG:3857", // 投影的code，
    //     "proj4def": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs", // 投影的定义，find on http://epsg.io/ or http://spatialreference.org/
    //     "options": {
    //         // e.g: http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/
    //         "origin": [-2.0037508342787E7, 2.0037508342787E7],
    //         "resolutions": [
    //             156543.03392800014,
    //             78271.51696399994,
    //             39135.75848200009,
    //             19567.87924099992,
    //             9783.93962049996,
    //             4891.96981024998,
    //             2445.98490512499,
    //             1222.992452562495, 
    //             611.4962262813797,
    //             305.74811314055756,
    //             152.87405657041106,
    //             76.43702828507324,
    //             38.21851414253662,
    //             19.10925707126831,
    //             9.554628535634155,
    //             4.77731426794937,
    //             2.388657133974685,
    //             1.1943285668550503,
    //             0.5971642835598172,
    //             0.29858214164761665,
    //             0.14929107082380833,
    //             0.07464553541190416,
    //             0.03732276770595208,
    //             0.01866138385297604
    //         ],
    //         "bounds": [[0, 0], [10000, 10000]]  // 投影的边界[左上角, 右上角], PGIS v0.3版会用到这项配置
    //     }
    // }, 
    /* 自定义的CRS配置 end */


    /* 使用XYZ、TMS Scheme的url配置 (默认配置) start */
    // 主流Web地图都用XYZ这个模式，由google发明，其他类似地图有：高德地图、PGIS
    // "DARK_STYLE_TMS": "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",  // 默认主题切片服务url
    // "LIGHT_STYLE_TMS": "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", // 深色主题切片服务url
    //DARK_STYLE_TMS: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    DARK_STYLE_TMS: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    
    
    //DARK_STYLE_TMS: "https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=2&ltype=11",
    LIGHT_STYLE_TMS: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    DARK_STYLE_TMS_OPTIONS: {
        //subdomains: ["1", "2", "3", "4"]
    },
    LIGHT_STYLE_TMS_OPTIONS: {
        subdomains: ["1", "2", "3", "4"]
    },
    DARK_LAYERS: [
        {
            url: 'https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=2&ltype=11',
            name: '高德地图',
            options:{
                subdomains: ["1", "2", "3", "4"]
            }
        },
        {
            url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            name: '高德影像',
            options:{
                subdomains: ["1", "2", "3", "4"]
            }
        }
    ],
    LIGHT_LAYERS: [
        {
            url: 'https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=2&ltype=11',
            name: '高德地图',
            options:{
                subdomains: ["1", "2", "3", "4"]
            }
        },
        {
            url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            name: '高德影像',
            options:{
                subdomains: ["1", "2", "3", "4"]
            }
        }
    ]
};

export default GIS_CFG;