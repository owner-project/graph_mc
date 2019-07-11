export default class toast{
    constructor($inject, data){
        this.str = data.str;
        this.duration = data.duration;
        this.inject = $inject;
        this.initToast();
    }

    initToast() {
        angular.element('.jq_toast').find('.jq_toast_str').html(this.str);
        this.toastId = this.inject.get('util').idMaker('toast_');
        let toasrEle = '<div class="toast-main" id="' + this.toastId + '">' +
                  '<span>' + this.str + '</span>'
              '</div>';
        $('body').append(toasrEle);
    }

    success() {
        angular.element('#' + this.toastId).addClass('success');
        this.show();
    }

    error() {
        angular.element('#' + this.toastId).addClass('error');
        this.show();
    }

    info() {
        angular.element('#' + this.toastId).addClass('info');
        this.show();
    }

    warn() {
        angular.element('#' + this.toastId).addClass('warn');
        this.show();
    }

    show() {
        this.inject.get('$timeout')(() => {
            angular.element('#' + this.toastId).addClass('show-toast');
            this.close();
        }, 300);
    }

    close() {
        this.inject.get('$timeout')(() => {
            angular.element('#' + this.toastId).addClass('close-toast');
            this.inject.get('$timeout')(() => {
                $('body').find('#' + this.toastId).remove();
            },500);
        }, (this.duration) ? (this.duration) : (1500));
    }
}
