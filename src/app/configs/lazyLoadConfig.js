export function lazyLoadConfig($ocLazyLoadProvider) {
    'ngInject';
    $ocLazyLoadProvider.config({
      'debug': true,
      'events': true,
      'modules': [{
        name : 'HomeController',
        files: ['app/main/home/HomeController.js']
      }]
    });
}