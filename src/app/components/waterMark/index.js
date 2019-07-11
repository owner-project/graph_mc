export function waterMark($timeout, cache) {
    'ngInject';
    let linkFuc = (scope, element, attr) => {
        let user = {};
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
             value: function (callback, type, quality) {
           
               var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
                   len = binStr.length,
                   arr = new Uint8Array(len);
           
               for (var i=0; i<len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
               }
           
               callback( new Blob( [arr], {type: type || 'image/png'} ) );
             }
            });
           }
        let t = new Date()
        if(cache.getLoginDataCache()) {
            user = cache.getLoginDataCache();
        }
        else {
            const year = t.getFullYear().toString();
            user.name = "游客";
            user.policeId = year;
        }
        const des = "本操作将被记录,泄露相关信息将被依法追究法律责任"//文字描述
        let currentTime = t.getFullYear().toString() + (t.getMonth() + 1) + t.getDate() + t.getHours() + t.getMinutes() + t.getSeconds()
        let time = user.loginTime || currentTime
        const fontSize = 12;//字体大小
        const textList = [`${user.name}  ${user.username}`,time,des]//所有水印要显示的文字内容都放在这个数组里
        const lengthList = []//每个要显示的字段的文字长度
        const angle = -20 * Math.PI / 210//整个canvas旋转角度
        const eachHeight = fontSize * 1.618//每个文字+间距的高度(跟文字成黄金比例)
        Array.prototype.max = function () {//返回数组最大值
            return Math.max.apply({}, this)
        }
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        for(let [index,val] of textList.entries()){
            lengthList.push(val.length)
        }
        let max = lengthList.max()
        if(max <= 3){
            max = 5
        }
        const offsetY = fontSize * max//canvas旋转之后 y轴偏移量 为了防止文字显示不全
        canvas.width = fontSize * max / Math.cos(angle) +  offsetY;
        canvas.height = lengthList.length * eachHeight + offsetY;
        context.rotate(angle);
        context.translate(0, offsetY);
        context.fillStyle = 'rgba(100, 100, 100, 0.20)';
        context.font = `normal ${fontSize}px Microsoft Yahei`;
        context.textAlign="center"; 

        for(let [index,val] of textList.entries()){
            context.fillText(val, 100, index * eachHeight);
        }

        function _setBackgroundImage(image) {
            if (element.css('background-image') !== 'none') {
                element.css('background-repeat', `repeat, ${element.css('background-repeat')}`);
                element.css('background-size', `${canvas.width}px ${canvas.height}px, ${element.css('background-size')}`);
                element.css('background-image', `url(${image}), ${element.css('background-image')}`);
            } else {
                element.css('background-image', `url(${image})`);
            }
        }

        if (window.URL) {
            canvas.toBlob(blob => {
                _setBackgroundImage(URL.createObjectURL(blob));
            });
        } else {
            _setBackgroundImage(canvas.toDataURL('image/png'));
        }
    };

    let directive = {
        restrict: 'A',
        link: linkFuc
    };

    return directive;
}
