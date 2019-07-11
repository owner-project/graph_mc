export function TimeAxisDirective($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr) => {
        scope.data = {
            nowIndex: scope.index,
            width: element.width(),
            hasAnimate: true
        };

        scope.$watch('data', function (newValue, oldValue) {
            scope.data.$inputValue = scope.value;
        });

        scope.$watch('index', function (newValue, oldValue) {
            if (newValue !== undefined) {
                if (newValue !== scope.data.nowIndex) {
                    scope.data.hasAnimate = false;
                    scope.data.nowIndex = newValue;

                    $timeout(() => {
                        scope.data.hasAnimate = true;
                    });
                }
            }
        });

        scope.change = function (step) {
            const nextIndex = scope.data.nowIndex + step;
            if (nextIndex >= 1 && nextIndex <= scope.list.length) {
                scope.data.nowIndex = nextIndex;
                attr.onChange && scope.onChange({index: nextIndex});
            }
        };
    };

    let directive = {
        restrict: 'A',
        replace: true,
        scope: {
            list: '=',
            index: '=',
            onChange: '&'
        },
        templateUrl: 'app/components/timeAxis/template.html',
        link: linkFuc
    };

    return directive;
}
