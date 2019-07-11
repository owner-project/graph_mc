
// angular-strap modal弹出框的默认配置,为了解决 modalbody过长展示的问题,在beforeshow中增加modal-body的max-height,来展示滚动条
export function strapModalConfig($modalProvider) {
    'ngInject';
    angular.extend($modalProvider.defaults,{
        onBeforeShow:function (modal) {
            let  $element = modal.$element;
            if($element.find('.modal-body').length>0){
                let modalFooter = $element.find('.modal-footer');
                let modalFooterOuterHeight =modalFooter.length>0?modalFooter.outerHeight() || 41 :0;
                let modalBody = $element.find('.modal-body');
                let modalHeader = $element.find('.modal-header');
                let modalHeaderOuterHeight = modalHeader.length > 0?modalHeader.outerHeight() || 53 :0;
                let modalBodyMaxHeight = Math.floor($('body').height() * 0.9 - modalFooterOuterHeight - modalHeaderOuterHeight - 60);
                modalBody.css("max-height",`${modalBodyMaxHeight}px`);
            }
          }
    })
  }