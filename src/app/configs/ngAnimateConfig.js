export function ngAnimateConfig ($animateProvider) {
  'ngInject';
	$animateProvider.classNameFilter(/^((?!(ng-animate-disable)).)*$/);
}