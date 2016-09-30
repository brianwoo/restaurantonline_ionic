// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('restaurantsOnlineApp', ['ionic', 'ionic-datepicker', 'ionic-modal-select', 'ngCordova',
                                        'angular.filter',
                                        'restaurantsOnlineApp.controllers', 'restaurantsOnlineApp.services'])

.constant("baseURL", "https://restaurantson-line1.rhcloud.com/")

.run(function($ionicPlatform, $rootScope, userFactory) {
  $ionicPlatform.ready(function() {
       
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    try { 
       if (window.cordova && window.cordova.plugins.Keyboard) {
         cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
         cordova.plugins.Keyboard.disableScroll(true);

       }
       if (window.StatusBar) {
         // org.apache.cordova.statusbar required
         StatusBar.styleDefault();
       }
    }
    catch (err) {
       console.error("error occurred while setting up keyboard and statusbar. " + err);
    }
    
    // setup push notification  
    userFactory.setupGCM();
          
  });
})


.config(function($compileProvider ){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(geo|tel|mailto):/);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    //controller: 'AppCtrl'
  })

  .state('app.restaurantDetails', {
    url: 'restaurantDetails/:rid',
    views: {
      'menuContent': {
        templateUrl: 'templates/restaurantDetails.html',
        // controller: 'RestaurantDetailsController'
      }
    }
  })
  
  .state('app.aboutus', {
    url: '/aboutus',
    views: {
      'menuContent': {
        templateUrl: 'templates/aboutus.html',
        // controller: 'RestaurantDetailsController'
      }
    }
  })  
  
  .state('app.contactus', {
    url: '/contactus',
    views: {
      'menuContent': {
        templateUrl: 'templates/contactus.html',
        // controller: 'RestaurantDetailsController'
      }
    }
  }) 
  
  .state('app.help', {
    url: '/help',
    views: {
      'menuContent': {
        templateUrl: 'templates/help.html',
        // controller: 'RestaurantDetailsController'
      }
    }
  })   

  .state('app.reservations', {
      url: '/reservations:rid?name',
      views: {
        'menuContent': {
          templateUrl: 'templates/reservations.html'
        }
      },
      data: {
         needLogin: true
      }      
    })
  
  .state('app.ordering', {
      url: '/ordering/:rid?name',
      views: {
        'menuContent': {
          templateUrl: 'templates/ordering.html'
        }
      },
      data: {
         needLogin: true
      }      
    })  

    .state('app.myorders', {
      url: '/myorders',
      cache: false,  // we want the page to reload everytime when we load it.
      views: {
        'menuContent': {
          templateUrl: 'templates/myorders.html',
        }
      },
      data: {
         needLogin: true
      }     
    })
  
  
   .state('app.myreservations', {
      url: '/myreservations',
      cache: false,  // we want the page to reload everytime when we load it.
      views: {
        'menuContent': {
          templateUrl: 'templates/myreservations.html',
          //controller: 'PlaylistsCtrl'
        }
      },
      data: {
         needLogin: true
      }      
    })
  
  
    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          //controller: 'PlaylistsCtrl'
        }
      }
    })

  /*
  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  })
  */
  
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
