export default function ($modal, $q) {
    'ngInject';

    return {
        confirm(config = {}) {
            const defer = $q.defer();
            const modal = $modal({
                templateUrl: 'app/PUIComponents/Modal/confirm.tpl.html',
                placement: 'center',
                title: config.title || '提示',
                content: config.content || '',
                backdrop: 'static',
                onHide: () => {
                    modal.destroy();
                }
            });

            modal.$scope.hasCancel = angular.isDefined(config.hasCancel) ? config.hasCancel : true;

            modal.$scope.ok = function () {
                defer.resolve();
                modal.hide();
            };

            modal.$scope.dismiss = function () {
                defer.reject();
                modal.hide();
            };

            return defer.promise;
        }
    }
}
