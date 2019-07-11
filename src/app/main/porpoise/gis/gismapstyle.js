//百度地图样式配置
const mapStyle = [{
    "featureType": "background",
    "elementType": "geometry",
    "stylers": {
        "color": "#152746ff"
    }
}, {
    "featureType": "land",
    "elementType": "geometry",
    "stylers": {
        "color": "#18376bff"
    }
}, {
    "featureType": "subwaystation",
    "elementType": "geometry",
    "stylers": {
        "color": "#4a90e2ff"
    }
}, {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "subway",
    "elementType": "geometry",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "railway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#023a97ff"
    }
}, {
    "featureType": "railway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#347ffdff"
    }
}, {
    "featureType": "country",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#0f69ffff"
    }
}, {
    "featureType": "country",
    "elementType": "labels",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "city",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#ffffff00",
        "weight": 40
    }
}, {
    "featureType": "city",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#3567c5ff",
        "weight": 1,
        "visibility": "off"
    }
}, {
    "featureType": "district",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#3567c5ff",
        "weight": 40
    }
}, {
    "featureType": "town",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#3567c5ff",
        "weight": 40
    }
}, {
    "featureType": "village",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#3567c5ff",
        "weight": 40
    }
}, {
    "featureType": "village",
    "elementType": "labels.text",
    "stylers": {}
}, {
    "featureType": "district",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "town",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0,
        "visibility": "off"
    }
}, {
    "featureType": "village",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0,
        "visibility": "off"
    }
}, {
    "featureType": "boundary",
    "elementType": "geometry",
    "stylers": {
        "color": "#2959adff",
        "weight": 1
    }
}, {
    "featureType": "districtlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "weight": 10
    }
}, {
    "featureType": "districtlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0
    }
}, {
    "featureType": "districtlabel",
    "elementType": "labels",
    "stylers": {
        "visibility": "on"
    }
}, {
    "featureType": "city",
    "elementType": "labels.text",
    "stylers": {
        "fontsize": 24
    }
}, {
    "featureType": "scenicspotslabel",
    "elementType": "labels",
    "stylers": {
        "visibility": "on"
    }
}, {
    "featureType": "entertainmentlabel",
    "elementType": "labels",
    "stylers": {
        "visibility": "on"
    }
}, {
    "featureType": "estatelabel",
    "elementType": "labels",
    "stylers": {
        "visibility": "on"
    }
}, {
    "featureType": "airportlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffff"
    }
}, {
    "featureType": "airportlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "scenicspotslabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffc2"
    }
}, {
    "featureType": "scenicspotslabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff00"
    }
}, {
    "featureType": "educationlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "educationlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "medicallabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "medicallabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "entertainmentlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbd"
    }
}, {
    "featureType": "entertainmentlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "estatelabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffba"
    }
}, {
    "featureType": "estatelabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "businesstowerlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffba"
    }
}, {
    "featureType": "businesstowerlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "companylabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbd"
    }
}, {
    "featureType": "companylabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "governmentlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbd"
    }
}, {
    "featureType": "governmentlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "restaurantlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffb5"
    }
}, {
    "featureType": "restaurantlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "hotellabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#3567c5a3"
    }
}, {
    "featureType": "hotellabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "shoppinglabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffa6"
    }
}, {
    "featureType": "shoppinglabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "lifeservicelabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffb0"
    }
}, {
    "featureType": "lifeservicelabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "carservicelabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffc2"
    }
}, {
    "featureType": "carservicelabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "transportationlabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffad"
    }
}, {
    "featureType": "transportationlabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "financelabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffba"
    }
}, {
    "featureType": "financelabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "city",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "highway",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0,
        "visibility": "off"
    }
}, {
    "featureType": "highway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff",
        "visibility": "off"
    }
}, {
    "featureType": "highway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0",
        "visibility": "off"
    }
}, {
    "featureType": "highway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffff"
    }
}, {
    "featureType": "nationalway",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "nationalway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "nationalway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "nationalway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ff99"
    }
}, {
    "featureType": "provincialway",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "provincialway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "provincialway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "provincialway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "cityhighway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "cityhighway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "cityhighway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffd9"
    }
}, {
    "featureType": "arterial",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "arterial",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "arterial",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "arterial",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "tertiaryway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffcc"
    }
}, {
    "featureType": "tertiaryway",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "tertiaryway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "tertiaryway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "fourlevelway",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "fourlevelway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "fourlevelway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "fourlevelway",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffba"
    }
}, {
    "featureType": "local",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "local",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "local",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "local",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffcc"
    }
}, {
    "featureType": "scenicspotsway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "scenicspotsway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "universityway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "universityway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "vacationway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "vacationway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "subway",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff00"
    }
}, {
    "featureType": "subway",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "highwaysign",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "highwaysign",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "highwaysign",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "nationalwaysign",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "nationalwaysign",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "nationalwaysign",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "provincialwaysign",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "provincialwaysign",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "tertiarywaysign",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "tertiarywaysign",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "subwaylabel",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "subwaylabel",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": {
        "color": "#152746ff"
    }
}, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "continent",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbf"
    }
}, {
    "featureType": "continent",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff00",
        "weight": 0
    }
}, {
    "featureType": "green",
    "elementType": "geometry",
    "stylers": {
        "color": "#5895ff1a"
    }
}, {
    "featureType": "building",
    "elementType": "geometry.stroke",
    "stylers": {
        "color": "#ffffff0"
    }
}, {
    "featureType": "building",
    "elementType": "geometry.fill",
    "stylers": {
        "color": "#5895ff26"
    }
}, {
    "featureType": "manmade",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9f54"
    }
}, {
    "featureType": "manmade",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ff00"
    }
}, {
    "featureType": "manmade",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "education",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff00"
    }
}, {
    "featureType": "education",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffff"
    }
}, {
    "featureType": "education",
    "elementType": "geometry",
    "stylers": {
        "color": "#5895ff30"
    }
}, {
    "featureType": "transportation",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff00"
    }
}, {
    "featureType": "transportation",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffbd"
    }
}, {
    "featureType": "transportation",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "shopping",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "estate",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "entertainment",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "scenicspots",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "scenicspots",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "scenicspots",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffcc"
    }
}, {
    "featureType": "medical",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffcc"
    }
}, {
    "featureType": "medical",
    "elementType": "labels.text.stroke",
    "stylers": {
        "color": "#ffffff0",
        "weight": 0
    }
}, {
    "featureType": "medical",
    "elementType": "geometry",
    "stylers": {
        "color": "#1e4d9fff"
    }
}, {
    "featureType": "carservicelabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "roadarrow",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": {
        "weight": 0,
        "color": "#ffffff0"
    }
}, {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": {
        "color": "#5895ffff"
    }
}, {
    "featureType": "arterial",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "scenicspotslabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "educationlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "medicallabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "entertainmentlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "estatelabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "businesstowerlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "companylabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "governmentlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "restaurantlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "hotellabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "shoppinglabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "lifeservicelabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "transportationlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "financelabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "airportlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "on"
    }
}, {
    "featureType": "tertiaryway",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "fourlevelway",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "highway",
    "elementType": "labels",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "local",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}, {
    "featureType": "districtlabel",
    "elementType": "labels.icon",
    "stylers": {
        "visibility": "off"
    }
}];
const cssText = `.BMap_cpyCtrl.anchorBL, .gis .anchorBL{display: none;}
.gis-canvas { height: 100%;}
.gis.dark {
    position: relative;
    background-color: #152746;
}
.gis.dark all fill {
    --featureType: nationalway;
    --elementType: labels;
    --stylers: { "visibility": "on"};
    --g: function () {};
}
.gis.dark land geometry-fill {
    --featureType: land;
    --elementType: geometry;
    --stylers: {"visibility": "on"}
}
/*new dark style*/
.gis.dark background geometry{
    --featureType: background,
    --elementType: geometry,
    --stylers: {"color": "#152746ff"}
}
.gis.dark land geometry{
    --featureType: land,
    --elementType: geometry,
    --stylers: {"color": "#18376bff"}
}
.gis.dark subwaystation geometry{
    --featureType: subwaystation,
    --elementType: geometry,
    --stylers: {"color": "#4a90e2ff"}
}
.gis.dark road geometry{
    --featureType: subwaystation,
    --elementType: geometry,
    --stylers: {"color": "#4a90e2ff"}
}

.gis.dark shape ripple {
    --fps: 24;
    --rippleStyle: fill_stroke;
    --rippleStyle: stroke;
    --fillStyle: #2b79ff;
    --strokeStyle: #2b79ff;
    /*--globalCompositeOperation: screen;*/
    --shuffle: false;
    --stepIn: true;
    --minScale: 0.25;
    --maxScale: 1;
    --size: 11;
    font: 12px Arial;
    --text-color: #fff;
}

/*light*/
.gis.light {
    background-color: #f8f8f8;
    position: relative;
}
.gis.light all text-fill {
    --featureType: all;
    --elementType: labels.text.fill;
    --stylers: {
        "color": "#999999"
    }
}
.gis.light all text-stroke {
    --featureType: all;
    --elementType: labels.text.stroke;
    --stylers: {
        "color": "#ffffff"
    }
}
.gis.light all fill {
    --featureType: all;
    --elementType: geometry.fill;
    --stylers: {
        "hue": "#d3e3f2",
        "lightness": 50,
        "saturation": -84
    }
}
.gis.light road geometry-stroke {
    --featureType: road;
    --elementType: geometry.stroke;
    --stylers: {
        "lightness": 50,
        "saturation": -84
    }
}
.gis.light label {
    --featureType: label;
    --elementType: labels.icon;
    --stylers: {
        "visibility": "off"
    }
}
.gis.light highway {
    --featureType: highway;
    --elementType: labels.icon;
    --stylers: {
        "visibility": "off"
    }
}
.gis.light shape ripple {
    --fps: 24;
    --rippleStyle: fill_stroke;
    --rippleStyle: fill;
    --fillStyle: rgb(238, 75, 75);
    --strokeStyle: rgb(238, 75, 75);
    --globalCompositeOperation: screen; /* 颜色叠加方式 */
    --shuffle: true;
    --stepIn: true;
    --minScale: 0.5;
    --maxScale: 3;
    --size: 10;
}
/* gis.tooltip */
.gis.dark .gis-tooltip {
    width: 353px;
    max-height: 348px;
    padding: 2px;
    position: absolute;
    left: -9999px;
    top: -9999px;
    z-index: 9999;
    background: #1B2D59;
    color: #ffffff85;
    transition: left .1s linear, top .1s linear;
}
.gis-tooltip ul{
    padding: 1px 0;
    max-height:348px;
    margin-bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
}
.gis-tooltip ul li{
    padding: 6px 6px;
    background: #234683;
    margin: 4px;
    min-height: 30px;
    display: flex;
    align-items: center;
}
.gis-tooltip-list-icon{
    width: 32px;
    height: 32px;
    display: block;
    margin-right: 6px;
}
.gis-tooltip ul li span{
    height: 100%;
    display: block;
    width: 285px;
}`;

export default {cssText, mapStyle};