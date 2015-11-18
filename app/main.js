requirejs.config({
  shim: {
    'angucomplete-alt': {
      deps: [
        'angular'
      ]
    },
    'angular-animate': {
      deps: [
        'angular'
      ]
    },
    'angular-aria': {
      deps: [
        'angular'
      ]
    },
    'angular-bootstrap': {
      deps: [
        'angular'
      ]
    },
    'angular-local-storage': {
      deps: [
        'angular'
      ]
    },
    'angular-messages': {
      deps: [
        'angular'
      ]
    },
    'angular-mocks': {
      deps: [
        'angular'
      ]
    },
    'angular-route': {
      deps: [
        'angular'
      ]
    },
    'angular-sanitize': {
      deps: [
        'angular'
      ]
    },
    'angular-touch': {
      deps: [
        'angular'
      ]
    },
    angular: {
      exports: 'angular'
    }
  },
  paths: {
    'angucomplete-alt': '../bower_components/angucomplete-alt/angucomplete-alt',
    angular: '../bower_components/angular/angular',
    'angular-animate': '../bower_components/angular-animate/angular-animate',
    'angular-aria': '../bower_components/angular-aria/angular-aria',
    'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'angular-local-storage': '../bower_components/angular-local-storage/dist/angular-local-storage',
    'angular-messages': '../bower_components/angular-messages/angular-messages',
    'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
    'angular-route': '../bower_components/angular-route/angular-route',
    'angular-sanitize': '../bower_components/angular-sanitize/angular-sanitize',
    'angular-touch': '../bower_components/angular-touch/angular-touch',
    requirejs: '../bower_components/requirejs/require'
  },
  baseUrl: '/scripts',
  packages: [

  ]
});

require(['app'], function (app) {
  app.init();
});