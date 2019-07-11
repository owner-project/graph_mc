## toaster使用方式
列举一下常用的方式
1.引入方式 两种
```javascript
export class HomeController {
    constructor($injector, $scope,toaster) {
        // 第一种 
        this.toaster = toaster
        // 第二种
        this.injector = $injector
        this.toaster = this.injector.get('toaster')
    }
}
```
## 使用方法
1.pop方法
```javascript
this.toaster.pop({
    type:'success'  // success,error  info/note  warning 
    title:''     //string title信息
    body:''   // string 下方message说明信息 
    bodyOutputType: '' // toast的文字展示类型  trustedHtml template template directive
    timeout:1000  // number toaster的消失时间
    showCloseButton:'' // boolean 是否显示关闭按钮
    clickHandler: func  // function  点击之后的回调函数
    onShowCallback:func, // 展示的回调
    onHideCallback:func, // 关闭的回调
})

```
2.直接使用类型

```javascript
this.toaster.success('title','body message')
this.toaster.warning('title','body message')
this.toaster.info('title','body message')
this.toaster.error('title','body message')


toaster.success({
  title:'title',
  body:'body message'
})
```
