export function fileUpload() {

    let directive = {
        restrict: 'A',
        scope: {
            ngModel: '=',
            fileUpload: '&'
        },
        link: (scope, ele , attr) => {
            function safeDigest(scope) {
                scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
            }
            angular.element(ele).on('change', (event) => {
                if (ele[0].files && ele[0].files.length) {
                    scope.ngModel = ele[0].files[0];
                    scope.$apply();
                    if (attr.fileUpload) {
                        scope.fileUpload({$event: event});
                    }
                }
            })
        }
    }

    return directive;
}
