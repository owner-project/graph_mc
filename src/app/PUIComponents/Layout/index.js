export default function ($timeout) {
    'ngInject';

    let linkFuc = (scope, element, attr) => {
        scope.$watch('type + align + justify + wrap + direction', function () {
            const classnames = {
                'inline': scope.type === 'inline',
                'justify-start': scope.justify === 'start',
                'justify-end': scope.justify === 'end',
                'justify-center': scope.justify === 'center',
                'justify-space-between': scope.justify === 'space-between',
                'justify-space-around': scope.justify === 'space-around',
                'align-start': scope.align === 'start',
                'align-end': scope.align === 'end',
                'align-center': scope.align === 'center',
                'align-baseline': scope.align === 'baseline',
                'align-stretch': scope.align === 'stretch',
                'flex-wrap': scope.wrap === 'wrap',
                'flex-nowrap': scope.wrap === 'nowrap',
                'flex-wrap-reverse': scope.wrap === 'wrap-reverse',
                'direction-row': scope.direction === 'row',
                'direction-row-reverse': scope.direction === 'row-reverse',
                'direction-column': scope.direction === 'column',
                'direction-column-reverse': scope.direction === 'column-reverse'};

            scope.classname = '';

            for (let key in classnames) {
                if (classnames.hasOwnProperty(key)) {
                    if (classnames[key]) {
                        scope.classname += `${key} `;
                    }
                }
            }
        });
    };

    let directive = {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            type: '@',
            align: '@',
            justify: '@',
            wrap: '@',
            direction: '@'
        },
        templateUrl: 'app/PUIComponents/Layout/template.html',
        link: linkFuc
    };

    return directive;
}
