'use strict';

var ORDERS = "restaurantsOnlineOrders";


angular.module("restaurantsOnlineApp.services", ['ngResource'])

/*******************************
* Restaurant Factory
********************************/
.service("restaurantFactory", ['$resource', 'baseURL', "$ionicLoading",
                               function($resource, baseURL, $ionicLoading) {
   
   this.getRestaurants = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants", null);
   };
   
   
   this.getRestaurantById = function() {
     
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid", null);
      
   };
   
   
}])

/*******************************
* Cuisine Category Factory
********************************/
.service("cuisineCategoryFactory", ['$resource', 'baseURL', "$ionicLoading",
                                    function($resource, baseURL, $ionicLoading) {

   this.getCuisineCategories = function() {
      
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/cuisinecategories", null);
      
   };
   
}])

/*******************************
* local storage Factory
********************************/
.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = angular.toJson(value);
        },
        getObject: function (key, defaultValue) {
           
            //console.log("storage=", $window.localStorage[key]);
            if ($window.localStorage[key] == undefined)
               return defaultValue;
           
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

/*******************************
* User Factory
********************************/
.service("userFactory", 
         ['$resource', '$http', 'baseURL', '$localStorage', '$window', "$ionicModal", "$ionicLoading", "$rootScope",
         function($resource, $http, baseURL, $localStorage, $window, $ionicModal, $ionicLoading, $rootScope) {

            
   var TOKEN_KEY = 'restaurantsOnlineToken';
   var isAuthenticated = false;
   var userFirstname = '';
   var authToken = undefined;          
   var isRestaurantMgr = false;
       
   //===============================
   // Setup and open/close loginRegisterDialog
   var loginRegisterModal = null;
                   
   this.closeLoginRegisterDialog = function() {
      
      if (loginRegisterModal == null)
         console.log("loginRegisterModal should've been setup \
                     by the openLoginRegisterDialog function!");
      else
         loginRegisterModal.hide();
   };
            
            
   this.destroyLoginRegisterDialog = function() {
      
      if (loginRegisterModal == null)
         console.log("loginRegisterModal should've been setup \
                     by the openLoginRegisterDialog function!");
      else
         loginRegisterModal.remove();
         loginRegisterModal = null;
   };       
            
   
   // this setup a singleton loginRegisterModal
   this.openLoginRegisterDialog = function() {
      
      if (loginRegisterModal == null) {
         
         // Create the login modal that we will use later
         $ionicModal.fromTemplateUrl('templates/login.html', {
            //scope: $scope
            animation: 'slide-in-up'
         }).then(function (modal) {

            //console.log("modal ready");
            loginRegisterModal = modal;            
            modal.show();
         });
      }
      else {
         loginRegisterModal.show();
      }
   };
   //=========================
            
            
   this.login = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/users/login", null, {'save':{method:'POST'}});
   };
            
            
   this.addDevice = function() {
      return $resource(baseURL + "/api/users/addDevice", null, {'update': { method:'PUT' }}); 
   };  
            
   this.deleteDevice = function() {
      return $resource(baseURL + "/api/users/deleteDevice", null, {'update': { method:'PUT' }}); 
   };              

   var stateData = null;
   this.getStateData = function() {
      return stateData; 
   };
            
   this.clearStateData = function() {
      stateData = null; 
   };
            
   this.storeStateData = function(sData) {
      stateData = sData;
   }
            
            
   function dummyCloseLoginFunction() {
      console.log("closeLogin is NOT set to a real function yet");
   }
   
            /*
   this.unsetCloseLogin = function() {
      this.closeLogin = dummyCloseLoginFunction;
   }
            
   this.closeLogin = dummyCloseLoginFunction;
            */
   
            
   this.logout = function() {
      $resource(baseURL + "/api/users/logout").get(function(response) {});
      destroyUserCredentials();
      destroyAllOrders();
   };
   
   this.register = function(registerData) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/users/register");
   };
   
   this.isAuthenticated = function() {
      return isAuthenticated;
   };
            
   this.getUserFirstname = function() {
      return userFirstname;
   };
            
   this.isRestaurantMgr = function() {
      return isRestaurantMgr;
   };
   
   function useCredentials(credentials) {
      isAuthenticated = true;
      userFirstname = credentials.userFirstname;
      authToken = credentials.token;
      isRestaurantMgr = credentials.restaurantMgr;
 
      // Set the token as header for your requests!
      $http.defaults.headers.common['x-access-token'] = authToken;
   }
   
   function destroyAllOrders() {
      
      $localStorage.remove(ORDERS);
   }
            
   function loadUserCredentials() {
      
      console.log("loadUserCredentials");
      
      var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
      if (credentials.userFirstname != undefined) {
         useCredentials(credentials);
      }
   }
      
   function destroyUserCredentials() {
      authToken = undefined;
      userFirstname = '';
      isAuthenticated = false;
      $http.defaults.headers.common['x-access-token'] = authToken;
      $localStorage.remove(TOKEN_KEY);
      isRestaurantMgr = false;
   }
          
   this.storeUserCredentials = function(credentials) {
      $localStorage.storeObject(TOKEN_KEY, credentials);
      useCredentials(credentials);
   };       
            
            
   var storeDeviceRegistrationId = function(deviceRegId) {
      return $localStorage.store("restaurantsOnlineDeviceRegId", deviceRegId);
   };
      
   var loadDeviceRegistrationId = function() {
      return $localStorage.get("restaurantsOnlineDeviceRegId", "");  
   };          
            
        
   this.storeDeviceRegistrationId = storeDeviceRegistrationId;
   this.loadDeviceRegistrationId = loadDeviceRegistrationId;

   var push = null;          
   
   // Need a local function for use internally.
   var setPushNotificationOn = function() {
      
      console.log("setPushNotificationOn");
      
      if (push != null)
         push.on('notification', notificationCallback);
   };
            
   // turn notification on
   this.setPushNotificationOn = setPushNotificationOn;
   
   // turn notification off
   this.setPushNotificationOff = function() {
      
      console.log("setPushNotificationOff");
      
      if (push != null)
         push.off('notification', notificationCallback);
   };            
            
   var notificationCallback = function(data) {
      
      console.log("** message=" + data.message);
      console.log("** title=" + data.title);
      console.log("** count=" + data.count);
      console.log("** sound=" + data.sound);
      console.log("** image=" + data.image);
      console.log("** additionalData=" + JSON.stringify(data.additionalData));
      
      $rootScope.$broadcast("pushNotification:Received", data);
            
   };
            
   this.setupGCM = function() {
      
    // setup push notification  
    try {
           
       push = PushNotification.init({
         android: {
            senderID: "819350653217",
            icon: "icon"

         },
         ios: {
            alert: "true",
            badge: "true",
            sound: "true"
         },
         windows: {}
       });

       
       push.on('registration', function (data) {
         console.log("*** registrationId=" + data.registrationId + " ***");
          
         storeDeviceRegistrationId(data.registrationId); 
          
         console.log("*** User Authenticated? " + isAuthenticated);
         if (isAuthenticated) {
            setPushNotificationOn();
         }
          
         /* 
         var deviceObj = {device: data.registrationId}; 
          
         this.addDevice().update(deviceObj).$promise
         .then(function(res) {
            console.log("Device added");
         })
         .catch(function(res){
            console.log("addDevice wasn't successful");  
         })
         .finally(function() {
            //hideLoading($ionicLoading);
            this.storeDeviceRegistrationId(data.registrationId);
            //$scope.deviceRegistrationId = data.registrationId;
         });
         */
       });

       //push.on('notification', notificationCallback);

       push.on('error', function (e) {
         console.error("Error from push notification:" + e.message);
       });   
       
    }
    catch (err) {
       console.error("PushNotification not available in ionic serve emulation mode");
    }         
      
   };
      
            
   // automatically load all the user credentials from local storage.
   loadUserCredentials();
            
}])


/*******************************
* Timeslot Factory
********************************/
.service("timeslotFactory", 
         ['$resource', '$http', 'baseURL', "$ionicLoading",
         function($resource, $http, baseURL, $ionicLoading) {

   this.findByNumOfPeople = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid/timeslots", null);
   };

                
}])


/*******************************
* Reservation Factory
********************************/
.service("reservationFactory", 
         ['$resource', '$http', 'baseURL', "$ionicLoading",
         function($resource, $http, baseURL, $ionicLoading) {
 
   this.makeReservation = function(rid) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid/reservations", {rid: rid});
   };
   
   this.getAllReservations = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/reservations");
   };
   
   this.getAllReservationStatuses = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/reservationstatuses");
   };
            
   this.updateReservationStatus = function(rsId) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/reservations/:rsId", {rsId: rsId}, 
                       {'update': { method:'PUT' }});
   };
            
}])



/*******************************
* Foood Ordering Factory
********************************/
.service("orderingFactory", 
         ['$resource', '$http', 'baseURL', "$localStorage", "$ionicModal", "$ionicLoading",
         function($resource, $http, baseURL, $localStorage, $ionicModal, $ionicLoading) {
 
   //var ORDERS = "restaurantsOnlineOrders";
   // ORDERS_MAP is the data structure for REST call.
   var ORDERS_MAP = "map";
   // ORDERS_LIST is the data structure for screen display.
   var ORDERS_LIST = "list";            
            
   this.getFoodCategories = function(rid) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid/menu/categories", {rid: rid});
   };
            
   this.getMenu = function(rid) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid/menu", {rid: rid}); 
   };
            
   this.order = function(rid) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/restaurants/:rid/orders", {rid: rid});
   };
   
   this.getAllOrders = function() {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/orders");
   };
   
   this.getAllOrderStatuses = function() {
      showLoading($ionicLoading);
      return $resource(baseURL +  "/api/orderstatuses");
   };
            
   this.updateOrderStatus = function(oid) {
      showLoading($ionicLoading);
      return $resource(baseURL + "/api/orders/:oid", {oid: oid}, {'update': { method:'PUT' }});
   };
            
   
   // Storing order lists
   this.storeOrdersObjects = function(restaurant, basketForSubmission, orderListForDisplay) {
      
      var ordersInStorage = $localStorage.getObject(ORDERS, {});
      
      //console.log("here storeOrdersObjects");
      
      // to make each order unique per restaurant, 
      // we have to append the restaurant id to the key.
      ordersInStorage[ORDERS_MAP  + "_" + restaurant] = basketForSubmission;
      ordersInStorage[ORDERS_LIST + "_" + restaurant] = orderListForDisplay;
      
      $localStorage.storeObject(ORDERS, ordersInStorage);
   };
            
   // Getting orders object for submission
   this.getOrdersObjectForSubmission = function(restaurant) {
      
      var ordersInStorage = $localStorage.getObject(ORDERS, {});
      var obj = ordersInStorage[ORDERS_MAP + "_" + restaurant];
      
      if (obj == null)
         return {};
      
      return obj;
   };
            
   // Getting orders object for display
   this.getOrdersObjectForDisplay = function(restaurant) {
      
      var ordersInStorage = $localStorage.getObject(ORDERS, {});
      var obj = ordersInStorage[ORDERS_LIST + "_" + restaurant];
      
      if (obj == null)
         return [];
      
      return obj;
   };
            
   // Remove order after submission
   this.removeOrder = function(restaurant) {
      
      var ordersInStorage = $localStorage.getObject(ORDERS, {});
      
      delete ordersInStorage[ORDERS_MAP + "_" + restaurant];
      delete ordersInStorage[ORDERS_LIST + "_" + restaurant];
      
      $localStorage.storeObject(ORDERS, ordersInStorage);
   };
   
}])


;


function showLoading($ionicLoading) {
   
   $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
   });
}
