export const fzlxMap = {
    '-1': {
        id: '-1',
        name: '普通'
    },
    '1': {
        id: '1',
        image: 'assets/images/theme_star_blue/personalModeling/shekong_icon.png',
        name: '涉恐'
    },
    '2': {
        id: '2',
        image: 'assets/images/theme_star_blue/personalModeling/shedu_icon.png',
        name: '涉毒'
    },
    '3': {
        id: '3',
        image: 'assets/images/theme_star_blue/personalModeling/shekong_icon.png',
        name: '抢劫'
    },
    '4': {
        id: '4',
        image: 'assets/images/theme_star_blue/personalModeling/zaitao_icon.png',
        name: '在逃'
    },
    '5': {
        id: '5',
        image: 'assets/images/theme_star_blue/personalModeling/fanying_icon.png',
        name: '贩婴'
    },
    '6': {
        id: '6',
        image: 'assets/images/theme_star_blue/personalModeling/qianke_icon.png',
        name: '前科'
    },
    '7': {
        id: '7',
        image: 'assets/images/theme_star_blue/personalModeling/jingshenbing.png',
        name: '精神病'
    },
    '8': {
        id: '8',
        image: 'assets/images/theme_star_blue/personalModeling/shangfang_icon.png',
        name: '上访'
    },
    '9': {
        id: '9',
        image: 'assets/images/theme_star_blue/personalModeling/wangfan_icon.png',
        name: '涉稳'
    },
    '10': {
        id: '10',
        image: 'assets/images/theme_star_blue/personalModeling/shekong_icon.png',
        name: '盗窃'
    }
};
export function propsFilter($injector) {
    'ngInject';
    let filter = function(items, props) {
      let out = [];
      if (angular.isArray(items)) {
        var keys = Object.keys(props);
  
        items.forEach(function(item) {
          var itemMatches = false;
  
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }
  
          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        out = items;
      }
  
      return out;
    };
    return filter
  };
export function ajFilter($injector) {
    'ngInject';

    let filter = (val) => {
        switch(Number(val)) {
            case 0:
                return '一般案件';
                break;
            case 1:
                return '重大案件';
                break;
            case -1:
                return '普通案件';
                break;
            default:
                return '';
                break;
        }
    };

    return filter;
}

export function fzlxFilter($injector) {
    'ngInject';

    let filter = (val) => {
        if (fzlxMap[val]) {
            return fzlxMap[val];
        } else {
            return {};
        }
    };

    return filter;
}

export function edgeEvent() {
    'ngInject';

    let filter = (val) => {
        if (val.type) {
            switch (val.type) {
                case '01':
                    return '酒店住宿';
                case '02':
                    return '网吧上网';
                case '03':
                    return '火车出行';
                case '04':
                    return '飞机出行';
                default:
                    return val.typeLabel;
            }
        } else {
            return '未知事件'
        }
    };

    return filter;
}

export function entityTableNameFilter() {
    'ngInject';

    let filter = (val) => {
        if (val) {
            switch (val.toLowerCase()) {
                case 'ren.ckxx_hzc':
                    return '常口信息表';
                case 'ren.zkxx_hzc':
                    return '暂口信息表';
                case 'ren.qgzdryxx_jwzh':
                    return '全国重点人员表';
                case 'ren.qgztry_shcj':
                    return '全国在逃人员表';
                case 'ren.qsrkjbxx_stgx':
                    return '全省人口信息表';
                case 'ren.ftptlfp':
                    return '铁路购票表';
                case 'hjknbsj.tbl_dzxxb_dispatch':
                    return '航班进出港表';
                case 'wazd.swry_wazd_20161202_120':
                    return '上网人员表';
                case 'ren.gnlkzsxx_zaj':
                    return '国内旅客住宿信息表';
                case 'jzzd.gaj_ztfzrxx':
                    return '企业法人基本信息表';
                case 'cs.wbxx_wazd':
                    return '网吧信息表';
                case 'zhian0901.t_lvguan':
                    return '治安旅馆';
                case 'bdl_qt_wzwfxx_jgj':
                    return '违章违法信息表';
                case 'bdl_aj_ajjbxx_jwzh':
                    return '案件基本信息表';
                case 'bdl_qt_sjkxx_jezh':
                    return '手机卡信息表';
                case 'bdl_ren_xyrxx_jwzh':
                    return '嫌疑人信息表';
                default:
                    return val;
            }
        } else {
            return ''
        }
    };

    return filter;
}

export function managerDisplay($injector) {
    'ngInject';

    let filter = (str, item) => {
        switch(item.key) {
            case 'sex':
                return (str === '0') ? ('男') : ('女');
            default:
                return str;

        }
    }

    return filter;
}

export function rmb_wy($injector, $filter) {
    'ngInject';

    const filter = (str, item) => {
        return (str) ? ($filter('number')(parseInt(str) / 10000, 2)) + '万' : (0) ;
    }

    return filter;
}

export function num_total($injector, $filter) {
    'ngInject';

    const filter = (str, item) => {
        var res = str;
        if (parseInt(str) > 10000) {
            res = $filter('number')(parseInt(str) / 10000, 2) + '万';
        }
        if (parseInt(str) > 100000000) {
            res = $filter('number')(parseInt(str) / 100000000, 2) + '亿';
        }
        return res;
    }

    return filter;
}