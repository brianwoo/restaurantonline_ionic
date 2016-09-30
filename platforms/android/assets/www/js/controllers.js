angular.module('restaurantsOnlineApp.controllers', [])

/*
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
*/

/*************************************
* Home Controller
*************************************/
.controller(
   "HomeController", 
   ['$scope', "restaurantFactory", "cuisineCategoryFactory", "baseURL", "$ionicLoading", "$ionicPopup",
   function($scope, restaurantFactory, cuisineCategoryFactory, baseURL, $ionicLoading, $ionicPopup) {
   
   $scope.baseURL = baseURL;      
      
      
   // Get all restaurants
   $scope.restaurants = restaurantFactory.getRestaurants().query()
   .$promise.then(function(response) {
   
      //console.log("restaurants=", response);                       
      $scope.restaurants = response;
   })
   .catch(function(res){
      showAlert($ionicPopup, "Sorry!", "Unable to retrieve restaurant listing!");
   })
   .finally(function(){
      hideLoading($ionicLoading);
   });
                                  
   
   //Get all Cuisine Categories
   $scope.cuisineCategories = cuisineCategoryFactory.getCuisineCategories().query()
   .$promise.then(function(response) {
   
      //console.log("cuisineCategories=", response);
      $scope.cuisineCategories = response;
   })
   .catch(function(res){
      showAlert($ionicPopup, "Sorry!", "Unable to retrieve cuisine categories!");
   })
   .finally(function(){
      hideLoading($ionicLoading);
   });   
            
      
      
   $scope.isActive = function(categoryId) {
      
      return (categoryId === $scope.selectedCategoryId);
   };
   
   /*
   $scope.categorySelected = {};
   $scope.selectCategory = function(category) {
      
      $scope.categorySelected = {cuisineCategory: category};
      console.log("category=" + JSON.stringify($scope.categorySelected));
   }
   */
      
   $scope.getCostIndicator = getCostIndicator;  
   
   $scope.selectedCategory = "All";
   $scope.selectedCategoryId = "";
   $scope.cuisineCategoryFilter = {};
      
   $scope.selectCategory = function (item) {
 
      $scope.selectedCategory = item.desc;
      $scope.selectedCategoryId = item.id;
      $scope.cuisineCategoryFilter = {cuisineCategory: item.id};
      //alert("selectedCategory=" + $scope.selectedCategory + ", id=" + $scope.selectedCategoryId + ", filter=" + JSON.stringify($scope.cuisineCategoryFilter));
   };
   
   
            
}])


/*************************************
* Restaurant Details Controller
*************************************/
.controller(
   "RestaurantDetailsController", 
   ['$scope', '$stateParams', "restaurantFactory", '$state', 'userFactory', 'baseURL', '$ionicSlideBoxDelegate', "$window", "$ionicModal", "$ionicLoading",
   function($scope, $stateParams, restaurantFactory, $state, userFactory, baseURL, $ionicSlideBoxDelegate, $window, $ionicModal, $ionicLoading) {

   $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBItpeQklbV6onKwnAZKlf8uXQux17sxR8";   
      
   $scope.baseURL = baseURL;   
   
   // Create the login modal that we will use later
   //$ionicModal.fromTemplateUrl('templates/login.html', {
   //   scope: $scope
   //}).then(function (modal) {
   //   $scope.modal = modal;
   //});

   //openLoginRegisterModal($ionicModal, $scope, userFactory);  // $scope.login() and $scope.closeLogin() are now ready
        
      
   $scope.latAndLon = "";   
   
   $scope.restaurantDetails =  restaurantFactory.getRestaurantById().get({rid: $stateParams.rid})
   .$promise.then(function(response) {
   
      console.log("restaurant=", response); 
      $scope.restaurantDetails = response;
      $scope.latAndLon = response.lat + "," + response.lon;
      
      $scope.sanitizedRestaurantName = $scope.restaurantDetails.name.replace(/&/g, "and"); 
      
      $ionicSlideBoxDelegate.update();
      
      //restaurantFactory.setRestaurantInfo(response._id, response.name);
      //console.log($scope.latAndLon);
   })
   .catch(function(res){
      showAlert($ionicPopup, "Sorry!", "Unable to retrieve restaurant details!");
   })
   .finally(function(){
      hideLoading($ionicLoading);
   });
      
   $scope.goToUrl = function(url) {
      $window.open(url, '_system', 'location=yes');
      return false;
   }
        
      
   $scope.getCostIndicator = getCostIndicator;   
      
   // Reservations
   $scope.goToReservations = function() {
      
      var stateToTransition = {state: "app.reservations", 
                               param: {rid: $scope.restaurantDetails._id,
                                       name: $scope.restaurantDetails.name}
                              };
      
      if (checkIsLoggedIn(userFactory, $scope)) {
         console.log("true:" + JSON.stringify(stateToTransition));
         stateGo($state, stateToTransition);
      }
      else {
         console.log("false");
         openLoginRegisterDialog(userFactory, $scope, stateToTransition, $ionicModal);
         
      }
         
   };
      
      
   // Online Ordering
   $scope.goToOrdering = function() {
     
      var stateToTransition = {state: "app.ordering", 
                               param: {rid: $scope.restaurantDetails._id,
                               name: $scope.restaurantDetails.name}
                              };
      
      if (checkIsLoggedIn(userFactory, $scope)) {
         console.log("true:" + JSON.stringify(stateToTransition));
         stateGo($state, stateToTransition);
      }
      else {
         console.log("false");
         openLoginRegisterDialog(userFactory, $scope, stateToTransition, $ionicModal);
      }
      
   }; 
            
}])



/*************************************
* Reservations Controller
*************************************/
.controller(
   "ReservationsController", 
   ['$scope', '$stateParams', "userFactory", "timeslotFactory", "reservationFactory", 
    "$state", "ionicDatePicker", "$ionicPopup", "$ionicHistory", "$ionicLoading",
   function($scope, $stateParams, userFactory, timeslotFactory, reservationFactory, $state, 
             ionicDatePicker, $ionicPopup, $ionicHistory, $ionicLoading) {
      
   console.log("minDate=", getCurrentDate());
   $scope.minDate = getCurrentDate();
      
   $scope.userFirstname = "Guest";
   $scope.isLoggedIn = false;
            
   // Protect the reservations page for authenticated users only
   var isValidated = validateUserOrReturn(userFactory, $scope, $state);
   if (!isValidated) return;

   console.log("stateParams=", $stateParams);
      
   $scope.restaurant = $stateParams.rid;
   $scope.restaurantName = $stateParams.name;
      
   $scope.login = function() {
      $scope.emit('login', '');
   };
      
   

      
      
   //----- 
   // For submit reservation request
   $scope.reservation = {date: getCurrentDate(), 
                         nPeople: "", 
                         specialReq: "", 
                         status: "Reserved", 
                         timeslot: "",
                         timeslotObj: undefined};
      
   //=====
   // Make A Reservation   
   $scope.hasMsg = false;
   $scope.infoMsg = "";
   $scope.reservationMsgType = "reservationSuccess";
   $scope.submitReservation = function() {
      
      $scope.reservation.timeslot = $scope.reservation.timeslotObj._id;
      
      console.log("reservation=" + JSON.stringify($scope.reservation));
      var resoPromise = reservationFactory.makeReservation($stateParams.rid)
                           .save($scope.reservation).$promise;
      
      resoPromise.then(function(res) {
         console.log("Reservation Successful!");
         //$scope.reservationMsgType = "reservationSuccess";
         //$scope.hasMsg = true;
         disableAllControls();
         $ionicHistory.goBack();
         showAlert($ionicPopup, "Reservation Successful!", "Reservation is confirmed for " + 
                   $scope.restaurantName + ": Party of " + $scope.reservation.nPeople + " at " + 
                   $scope.reservation.timeslotObj.from + ".");
                  
      }).catch(function(res){
         console.log("Unable to reserve for this timeslot");
         //$scope.reservationMsgType = "reservationFailed";
         //$scope.hasMsg = true;
         showAlert($ionicPopup, "Sorry!", "Unable to reserve for this timeslot");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
   };
   //-----
      
   $scope.nPeopleInDropdown = [1,2,3,4,5,6,7,8];
   
   /*   
   $scope.getTimeslotOpt = function(option) {
    return option._id;
   };
   */
      
   //=====
   // For fetching available timeslots
   $scope.availableTimeslots = [];   
   $scope.fetchAvailableTimeslots = function() {
      
      if (($scope.reservation.date == "") || 
          ($scope.reservation.nPeople == "")) {
         return;
      }
      
      //console.log("date="+$scope.reservation.date, 
        //          "nPeople="+$scope.reservation.nPeople, 
          //        "restaurant="+$scope.restaurant);
      
      var timeslotPromise = 
          timeslotFactory.findByNumOfPeople().query({rid: $stateParams.rid, 
                                                 nPeople: $scope.reservation.nPeople, 
                                                 date: $scope.reservation.date}).$promise;
      
      timeslotPromise.then(function(res) {
         
         //console.log("then="+ JSON.stringify(res));
         
         var currentTimeslot = 
             findTimeSlotFromCurrentDateTime($scope.reservation.date);
                  
         console.log("currentTimeslot=", currentTimeslot, ", ",$scope.reservation.date);
         
         // filter out any timeslots that are already in the past.
         res = res.filter(function(timeslotObj) {
            return (timeslotObj.timeSlot >= currentTimeslot);
         });
         
         $scope.availableTimeslots = res;
         $scope.isTimeslotDropdownDisabled = false;
         console.log("timeslot=", res);
      })
      .catch(function(res) {
         
         $scope.availableTimeslots = [];
         $scope.isTimeslotDropdownDisabled = true;
         showAlert($ionicPopup, "Sorry!", "Unable to find timeslots");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
      
   };
   //=====
   
   $scope.isTimeslotDropdownDisabled = true;
   
   $scope.isSubmitButtonDisabled = function() {
      
      return ($scope.isAllControlsDisabled || 
         !($scope.reservation.timeslotObj != undefined && 
          $scope.reservation.date != "" && 
          $scope.reservation.nPeople != ""));
   }; 
      
      
   $scope.isAllControlsDisabled = false;
   function disableAllControls() {
      $scope.isAllControlsDisabled = true;
      $scope.isTimeslotDropdownDisabled = true;
   }
      
      
   var datepickerConfigObj = {
      callback: function (val) {  //Mandatory
        $scope.reservation.date = formatDate(new Date(val));
        datepickerConfigObj.inputDate = new Date(val);
        $scope.fetchAvailableTimeslots();
      },
      
      disabledDates: [],
      from: new Date(), //Optional
      to: addMonths(new Date(), 3), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: false,          //Optional
      closeOnSelect: true,       //Optional
      templateType: 'modal'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(datepickerConfigObj);
    };
      
}])


/*************************************
* Ordering Controller
*************************************/
.controller(
   "OrderingController", 
   ['$scope', '$stateParams', "userFactory", "orderingFactory", "$state", "$location", "$anchorScroll", "$ionicModal", "$ionicPopup", "$ionicHistory", "$rootScope", "$ionicLoading", "$cordovaVibration", "$cordovaToast",
   function($scope, $stateParams, userFactory, orderingFactory, $state, $location, $anchorScroll, $ionicModal, $ionicPopup, 
             $ionicHistory, $rootScope, $ionicLoading, $cordovaVibration, $cordovaToast) {

   var isValidated = validateUserOrReturn(userFactory, $scope, $state);
   if (!isValidated) return;
      
   $scope.restaurant = $stateParams.rid;
   $scope.restaurantName = $stateParams.name;
            
   $scope.currentCategory = "";
   
   // Get food categories
   /*
   $scope.foodCategories = 
      orderingFactory.getFoodCategories($scope.restaurant).query().$promise.then(
      function(res) {
         
         console.log(res);
         $scope.foodCategories = res;
         $scope.currentCategory = res[0].categoryName;
         
      }).catch(function(res) {
         
         console.error(res);
         $scope.foodCategories = [];
      });
      
   $scope.isCategorySelected = function(category) {
      
      return category == $scope.currentCategory;
   };
   */
      
   
   $ionicModal.fromTemplateUrl('templates/orderingCart.html', {
      scope: $scope,
      animation: 'slide-in-up'
   }).then(function (modal) {
      $scope.modal = modal;
   });
      
   $scope.openCartModal = function () {
      $scope.modal.show();
   };
   $scope.closeModal = function () {
      $scope.modal.hide();
   };
   // Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function () {
      $scope.modal.remove();
   });
   // Execute action on hide modal
   $scope.$on('modal.hidden', function () {
      // Execute action
   });
   // Execute action on remove modal
   $scope.$on('modal.removed', function () {
      // Execute action
   });
      
      
   // Get menu
   $scope.menu = 
      orderingFactory.getMenu($scope.restaurant).query().$promise.then(
      function(res) {
         
         console.log(res);
         $scope.menu = res;
         
      }).catch(function(res) {
      
         console.error(res);
         $scope.menu = [];
         showAlert($ionicPopup, "Sorry!", "Unable to find menu!");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
      
   // Check to see if it's the same category
   var currCategory;
   $scope.checkSetIfDiffCategory = function(category) {

      var isDiff = currCategory != category;
      console.log("curr=", currCategory, "new=", category, "diff=", isDiff);
         
      currCategory = category;
      return isDiff;
   };
      
   // method to get around the jump to page section issue
   $scope.scrollTo = function(id) {
         $location.hash(id);
         $anchorScroll();
   };      

      
   // external basket for looping
   $scope.itemsAdded = [];
   $scope.itemsAddedSubTotal = 0;
   var TAX_PERCENT = 0.05;
   $scope.itemsAddedSubTotalTax = 0;
   $scope.itemsAddedGrandTotal = 0;
      
   // Update Tax and Grand Total after SubTotal is calculated.
   function updateTaxAndGrandTotal() {
      $scope.itemsAddedSubTotalTax = $scope.itemsAddedSubTotal * TAX_PERCENT;
      $scope.itemsAddedGrandTotal = $scope.itemsAddedSubTotal + $scope.itemsAddedSubTotalTax;      
   }
         
      
   // add remove counter to know whether basket is empty.
   var numItemsInBasket = 0;
   $scope.isBasketEmpty = function() {
      
      return (numItemsInBasket == 0);
   };      
      
   // calculate pickup time
   var INIT_PICKUP_TIME = 15;
   $scope.pickupTime = 0;   
   function calcPickupTime() {
      
      if (numItemsInBasket <= 5)
            $scope.pickupTime = INIT_PICKUP_TIME + (numItemsInBasket * 5);
      else if (numItemsInBasket <= 10)
            $scope.pickupTime = INIT_PICKUP_TIME + (numItemsInBasket * 7);
      else 
         $scope.pickupTime = INIT_PICKUP_TIME + (numItemsInBasket * 9);
   }         
      
   // Add item to basket (internal)
   var basket = {};
   $scope.addToBasket = function(menuItem, dishName, dishPrice) {
      
      if ($scope.isOrderDone) return;
      
      if (basket[menuItem] == undefined)
         basket[menuItem] = 1;
      else
         basket[menuItem] += 1;
      

      
      $scope.itemsAdded.push(
         {menuItem: menuItem, 
          dishName: dishName, 
          dishPrice: dishPrice, 
          added: true, 
          index: $scope.itemsAdded.length});
      
      //console.log("addToBasket=", $scope.itemsAdded);
      
      // temporily persist the orders to localStorage to avoid data loss 
      // from page refresh.
      //console.log("addToBasket=" + angular.toJson($scope.itemsAdded));
      orderingFactory.storeOrdersObjects($scope.restaurant, basket, $scope.itemsAdded);
      
      showToast($cordovaToast, "Item added to basket");
      vibrateShort($cordovaVibration);
      
      numItemsInBasket++;
      calcPickupTime();
      
      $scope.itemsAddedSubTotal = $scope.itemsAddedSubTotal + parseFloat(dishPrice); 
      updateTaxAndGrandTotal();
      
      //console.log("basket=" + menuItem, dishName, basket[menuItem], dishPrice);
      //console.log("itemsAdded=" + JSON.stringify($scope.itemsAdded), 
      //            "total=", $scope.itemsAddedTotal.toFixed(2));
   };      
      
   // Remove item from basket
   $scope.removeFromBasket = function(menuItem, index) {
      
      if ($scope.isOrderDone) return;
      
      if (basket[menuItem] != undefined)
      {
         basket[menuItem] -= 1;
         
         // delete the parameter if it's empty
         if (basket[menuItem] == 0)
            delete basket[menuItem];
      }
      
      showToast($cordovaToast, "Item removed from basket");
      vibrateShort($cordovaVibration);
      
      numItemsInBasket--;
      calcPickupTime();
      
      $scope.itemsAdded[index].added = false;
      
      //console.log("removeFromBasket=", $scope.itemsAdded);
      
      // temporily persist the orders to localStorage to avoid data loss 
      // from page refresh.
      //console.log("removeFromBasket=" + angular.toJson($scope.itemsAdded));
      orderingFactory.storeOrdersObjects($scope.restaurant, basket, $scope.itemsAdded);
      
      $scope.itemsAddedSubTotal = 
         $scope.itemsAddedSubTotal - parseFloat($scope.itemsAdded[index].dishPrice);
      updateTaxAndGrandTotal();
      
      //console.log("itemsAdded=" + JSON.stringify($scope.itemsAdded), "total=", $scope.itemsAddedTotal.toFixed(2));
   };
         
   
   //=====
   // Quick method to handle load orders from storage
   // this method is used to handle reload the page.
   function loadOrdersFromStorage(orderingFactory) {
      
      basket = orderingFactory.getOrdersObjectForSubmission($scope.restaurant);
      $scope.itemsAdded = orderingFactory.getOrdersObjectForDisplay($scope.restaurant);
      
      
      
      for (var i=0; i < $scope.itemsAdded.length; i++) {
         if ($scope.itemsAdded[i].added) {
            $scope.itemsAddedSubTotal += parseFloat($scope.itemsAdded[i].dishPrice);
            numItemsInBasket++;
         }
               
         //console.log("itemsAddedSubTotal=", $scope.itemsAddedSubTotal);
      }
      
      calcPickupTime();
      updateTaxAndGrandTotal();
   }
   //=====
      
   
   //=====
   // Send the order
   $scope.order = {};
   $scope.isOrderDone = false;
   $scope.isOrderSuccessful = false;
   $scope.orderNow = function() {
      
      //var order = {};
      
      var menuItems = [];
      for (var key in basket) {
         menuItems.push({menuItem: key, numOfOrders: basket[key]});
      }
      
      $scope.order.menuItems = menuItems;
      $scope.order.restaurant = $scope.restaurant;
      
      //console.log("orderNow", $scope.order);
      
      var orderPromise = orderingFactory.order($scope.restaurant).save($scope.order).$promise;
      orderPromise.then(function(res) {
         $scope.isOrderSuccessful = true;
         $scope.isOrderDone = true;
         console.log("order successful");
         orderingFactory.removeOrder($scope.restaurant);
         $ionicHistory.goBack();
         $scope.modal.remove();
         showAlert($ionicPopup, "Success!", "Thanks for ordering at " + $scope.restaurantName + "!");
         //$rootScope.$broadcast("order:Successful", {}); // need to notify the myOrders page to trigger a refresh.  
                                                        // In Ionic, the Controller does not
                                                        // seem to reload when the page is reloaded
      })
      .catch(function(res){
         $scope.isOrderSuccessful = false;
         $scope.isOrderDone = true;
         console.log("order failed");
         showAlert($ionicPopup, "Sorry!", "we were unable to submit your order");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
   };
   //=====
      
   // load up orders from Storage at startup.
   loadOrdersFromStorage(orderingFactory);
   
}])


/*************************************
* My Orders Controller
*************************************/
.controller(
   "MyOrdersController", 
   ['$scope', '$stateParams', "userFactory", "orderingFactory", "$state", "$location", "$anchorScroll", 
    "$rootScope", "$ionicModal", "$cordovaToast", "$ionicPopup", "$ionicLoading",
   function($scope, $stateParams, userFactory, orderingFactory, $state, $location, $anchorScroll, 
             $rootScope, $ionicModal, $cordovaToast, $ionicPopup, $ionicLoading) {

   var isValidated = validateUserOrReturn(userFactory, $scope, $state);
   if (!isValidated) return; 
      

   /*
   var orderStatusesModal = null;
            
   $scope.closeOrderStatusesModal = function() {
            
      if (orderStatusesModal == null)
         console.log("orderStatusesModal should've been setup \
                     by the openOrderStatusesModal function!");
      else
         orderStatusesModal.hide();
   };
            
   $scope.orderIdSelected = "";
      
   $scope.openOrderStatusesModal = function(orderId) {
      
      $scope.orderIdSelected = orderId;
      
      if (orderStatusesModal == null) {
         
         // Create the login modal that we will use later
         $ionicModal.fromTemplateUrl('templates/orderingStatuses.html', {
            scope: $scope,
            animation: 'slide-in-up'
         }).then(function (modal) {

            console.log("modal ready");
            orderStatusesModal = modal;            
            modal.show();
         });
      }
      else {
         orderStatusesModal.show();
      }
   };
   */
      
   // Method to reload myOrders after a successful order.
   //$rootScope.$on('order:Successful', function(event, data) {   
      // Get My Orders
      //getAllOrders();
   //});
      
      
   $scope.doRefresh = function() {
     
      try {
         getAllOrders();
      }
      catch (err) {}
      
      finally {
         // Stop the ion-refresher from spinning
         $scope.$broadcast('scroll.refreshComplete');   
      }
   };
      
      
   // Get My Orders
   $scope.myOrders = getAllOrders();
   
   function getAllOrders() {
      orderingFactory.getAllOrders().query().$promise
      .then(function(res) {
         //console.log("myOrders=", res);
         $scope.myOrders = res;
      })
      .catch(function(res){
         console.log("No order found!");
         $scope.myOrders = [];
         showAlert($ionicPopup, "Sorry!", "Unable to find orders!");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
   }
      
   $scope.getSanitizedRestaurantName = getSanitizedRestaurantName;
      
   $scope.convertDateTime = convertDateTime;

   $scope.isRestaurantMgr = userFactory.isRestaurantMgr();
      

   // Get Order Statuses
   $scope.orderStatuses = orderingFactory.getAllOrderStatuses().query().$promise
   .then(function(res) {
      $scope.orderStatuses = res;
   })
   .catch(function(res){
      console.log("No order statuses found!");
      $scope.orderStatuses = [];
      showAlert($ionicPopup, "Sorry!", "Unable to get order statuses!");
   })
   .finally(function() {
         hideLoading($ionicLoading);
   });      
      
   
   // Need to update the status in scope manually
   // coz we are not forcing a refresh and 
   // updating the status remotely won't update the scope
   // automatically.
   function updateStatusInScope(id, status) {
      
      for (var i=0; i < $scope.myOrders.length; i++) {
         
         if ($scope.myOrders[i]._id == id) {
            $scope.myOrders[i].status = status.orderStatus;
         }
      }
   }
    
      
   $scope.setOrderStatus = function(orderId, orderStatus) {
      
      console.log("orderId=", orderId, " orderStatus=",orderStatus);
      
      var newStatus = {orderStatus: orderStatus};
      
      // Get Order Statuses
      orderingFactory.updateOrderStatus(orderId).update(newStatus).$promise
      .then(function(res) {
         console.log("status updated successfully");
         showToast($cordovaToast, "status updated");
      })
      .catch(function(res){
         console.log("status NOT updated successfully");  
         showAlert($ionicPopup, "Sorry", "Unable to update status", null);
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });

   };
      
   //console.log("Created another MyOrdersController");
   /*   
   $scope.openOrderStatusesModal = function() {
      orderingFactory.openOrderStatusesModal($scope);
   }
      
   $scope.closeOrderStatusesModal = orderingFactory.closeOrderStatusesModal;
   */
   
}])



/*************************************
* My Reservations Controller
*************************************/
.controller(
   "MyReservationsController", 
   ['$scope', '$stateParams', "userFactory", "reservationFactory", "$state", "$location", 
    "$anchorScroll", "$ionicPopup", "$cordovaToast", "$ionicLoading",
   function($scope, $stateParams, userFactory, reservationFactory, $state, $location, 
             $anchorScroll, $ionicPopup, $cordovaToast, $ionicLoading) {

   var isValidated = validateUserOrReturn(userFactory, $scope, $state);
   if (!isValidated) return;
   
      
   $scope.doRefresh = function() {
     
      try {
         getAllReservations();
      }
      catch (err) {}
      
      finally {
         // Stop the ion-refresher from spinning
         $scope.$broadcast('scroll.refreshComplete');   
      }
   };      
      
      
   $scope.myReservations = getAllReservations();
      
      
   // Get My Reservations
   function getAllReservations() {
      
      reservationFactory.getAllReservations().query().$promise
      .then(function(res) {
         $scope.myReservations = res;
         //console.log("My Reservations=", res);
      })
      .catch(function(res){
         console.log("No reservations found!");
         $scope.myReservations = [];
         showAlert($ionicPopup, "Sorry!", "No reservations found!");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });
   }
      

      
   $scope.convertDateTime = convertDateTime;

   $scope.isRestaurantMgr = userFactory.isRestaurantMgr();
      

   // Get Order Statuses
   $scope.reservationStatuses = reservationFactory.getAllReservationStatuses().query().$promise
   .then(function(res) {
      $scope.reservationStatuses = res;
   })
   .catch(function(res){
      console.log("No reservation statuses found!");
      $scope.reservationStatuses = [];
      showAlert($ionicPopup, "Sorry!", "Unable to get reservation statuses!");
   })
   .finally(function() {
      hideLoading($ionicLoading);
   });      
      
      
   $scope.setReservationStatus = function(rsId, reservationStatus) {
      
      //console.log("rsId=", rsId, " reservationStatus=",reservationStatus);
      
      var newStatus = {reservationStatus: reservationStatus};
      
      // Get Order Statuses
      reservationFactory.updateReservationStatus(rsId).update(newStatus).$promise
      .then(function(res) {
         console.log("status updated successfully");
         showToast($cordovaToast, "status updated");
      })
      .catch(function(res){
         console.log("status NOT updated successfully");     
         showAlert($ionicPopup, "Sorry", "Unable to update status", null);
      })
      .finally(function() {
         hideLoading($ionicLoading);
      });

   };
      
      
    
   
}])


/*************************************
* Users Controller
*************************************/
.controller(
   "UsersController", 
   ['$rootScope', '$scope', "userFactory", "$state", "$ionicPopup", "$ionicModal", 
    "$cordovaToast", "$ionicSideMenuDelegate", "$ionicHistory", "$ionicLoading", "$cordovaLocalNotification",
   function($rootScope, $scope, userFactory, $state, $ionicPopup, $ionicModal, 
             $cordovaToast, $ionicSideMenuDelegate, $ionicHistory, $ionicLoading, $cordovaLocalNotification) {

   //$scope.isLoggedIn = false;
   $scope.userFirstname = "Guest";
   $scope.isLoggedIn = false;
            
   checkIsLoggedIn(userFactory, $scope);
    
   
   $scope.openLogin = function() {
        openLoginRegisterDialog(userFactory, $scope, null, $ionicModal);
   };
   
   
   /*
   $scope.openRegister = function() {
        openRegisterDialog(ngDialog);
   };
   */
      
   //=====
   // Handle Login / Register tab change
   // default is the login tab
   var currentTab = "login";
   $scope.setTab = function(tab) {
      //console.log("set tab=" + tab);
      currentTab = tab;
   };
      
   $scope.isTabSet = function(tab) {
      //console.log("is tab set=" + tab);
      return (currentTab == tab);
   };
   //=====
      
   // login model binding   
   $scope.loginData = {username: "", password: ""};
   $scope.rememberMe = "";
   $scope.invalidLogin = false;
   
      
   // register model binding
   $scope.registration = {username: "", password: "", firstname: "", lastname: ""};
   $scope.invalidRegistration = false;
      
   // Register.  If successful, it will trigger an auto login.
   $scope.register = function() {
      
      var regPromise = userFactory.register().save($scope.registration).$promise;
      
      regPromise.then(function(res){
      
         // if registration is successful, then we automatically login
         // the user.
         console.log("registration successful: " + $scope.registration.username, $scope.$parent.ngDialogData);
         $scope.loginData.username = $scope.registration.username;
         $scope.loginData.password = $scope.registration.password;
         $scope.login();
         
      })
      .catch(function(res){
         console.log("registration failed: " + $scope.registration.username);
         $scope.invalidRegistration = true;
         showAlert($ionicPopup, "Registration Failed!", "Please check your credentials and try again.");
      })
      .finally(function() {
         hideLoading($ionicLoading);
      }); 
   };
      
   $scope.closeLogin = function() {
     userFactory.closeLoginRegisterDialog(); 
   };
      
   //$scope.deviceRegistrationId = "";   
      
   // Login
   $scope.login = function() {
     var loginPromise = userFactory.login().save($scope.loginData).$promise;
      
     loginPromise.then(function(res) {
        console.log("success=", res);
        $scope.invalidLogin = false;
        userFactory.storeUserCredentials({username: $scope.loginData,
                                         token: res.token,
                                         userFirstname: res.firstname,
                                         restaurantMgr: res.restaurantMgr});
        
        $rootScope.$broadcast("login:Successful", {userFirstname: res.firstname});
        //ngDialog.close();
        userFactory.closeLoginRegisterDialog();
        showToast($cordovaToast, "You have logged in");
        //setupGCM($scope, userFactory); //setup $scope.deviceRegistrationId
        userFactory.setPushNotificationOn();
        addDevice(userFactory);
        
        userFactory.destroyLoginRegisterDialog();
        
        // if login successful, we will follow the state transition if available.
        var stateData = userFactory.getStateData();
        if (stateData) {
           stateGo($state, stateData);
           userFactory.clearStateData();
        }
     })
     .catch(function(res) {
        console.log("failed");
        $scope.invalidLogin = true;
        showAlert($ionicPopup, "Login Failed!", "Please check your credentials and try again.");
     })
     .finally(function() {
         hideLoading($ionicLoading);
     });
   };
      
   
   $scope.manualCloseSideBar = function() {
      $ionicSideMenuDelegate.toggleLeft();
   }
      
      
   // Logout
   $scope.logout = function() {
      
      var deviceRegistrationId = userFactory.loadDeviceRegistrationId();
      console.log("**** deviceRegistrationId=" + deviceRegistrationId);
   
      if (deviceRegistrationId != "") {
         
         userFactory.setPushNotificationOff();

         // TODO: add this into deleteDevice
         var deviceObj = {device: deviceRegistrationId};            
               
         userFactory.deleteDevice().update(deviceObj).$promise
         .then(function(res) {
            console.log("Device deleted");
         })
         .catch(function(res){
            console.log("deleteDevice wasn't successful=" + JSON.stringify(res));  
         })
         .finally(function() {
            //hideLoading($ionicLoading);
            //userFactory.storeDeviceRegistrationId("");
         });                
      }
      
      userFactory.logout();
         
      
      $scope.userFirstname = "Guest";
      $scope.isLoggedIn = false;
      
      showToast($cordovaToast, "You have logged out");
      $scope.manualCloseSideBar();
      
      // If the page needs login privilage, logging out will
      // redirect the page to the main page.
      if ($state.current.data && $state.current.data.needLogin) {
         validateUserOrReturn(userFactory, $scope, $state, $ionicHistory);
      }
   };
      
   // Subscriber on successful login.
   $rootScope.$on('login:Successful', function(event, data) {
      console.log("received emit" + JSON.stringify(data));    
      $scope.userFirstname = data.userFirstname;
      $scope.isLoggedIn = true;
      
   });
      
      
      
   // Subscriber on successful login.
   $rootScope.$on('pushNotification:Received', function(event, data) {
      console.log("pushNotification:Received" + JSON.stringify(data));      
      
      if ($scope.isLoggedIn) {
         try {         
            $cordovaLocalNotification.schedule({
               id: 1,
               title: data.additionalData.title1,
               text: data.additionalData.message1,
               icon: "res://ic_stat_restaurants_online.png"
            }).then(function () {
               console.log("The notification has been set");
            });
         }
         catch(err){
            console.error("$cordovaLocalNotification won't work coz it's not a real device");
         }            
      }
      else
         console.log("User not logged in, no local notification will be sent");
   });   
      
}])


;


// Protect the my orders page for authenticated users only
function validateUserOrReturn(userFactory, $scope, $state, $ionicHistory) {
   
   console.log("state=", $state);
   
   var isLoggedIn = checkIsLoggedIn(userFactory, $scope);

   if (!isLoggedIn) {
      // clear history and go back home
      $ionicHistory.nextViewOptions({historyRoot: true});
      stateGo($state, {state: "app.home"})
   }
   
   return isLoggedIn;
}


function stateGo($state, stateParam) {
      
   if (stateParam == null) {
      console.log("stateGo, no param");
      $state.go(stateParam.state);
   }
   else {
      console.log("stateGo, with param = ", stateParam.param);
      $state.go(stateParam.state, stateParam.param);
   }
}


function formatDate(dateObj) {
   
   var dd = dateObj.getDate();
   var mm = dateObj.getMonth() + 1;
   var yyyy = dateObj.getFullYear();
   
   /*
   if (dd < 10) {
      dd='0'+dd;
   } 

   if(mm < 10) {
      mm='0'+mm;
   }
   */
   
   return mm+ '/' + dd + '/' + yyyy;
}



function getCurrentDate() {
   var today = new Date();

   return formatDate(today);
}


function addMonths(dateObj, num) {

    var currentMonth = dateObj.getMonth();
    dateObj.setMonth(dateObj.getMonth() + num)

    if (dateObj.getMonth() != ((currentMonth + num) % 12)){
        dateObj.setDate(0);
    }
    return dateObj;
}


/********************
* Convert DateTime
*********************/
function convertDateTime(dateStr) {
      
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      var dateObj = new Date(dateStr);
      
      var hours = dateObj.getHours();
      //it is pm if hours from 12 onwards
      var suffix = (hours >= 12)? 'pm' : 'am';

      //only -12 from hours if it is greater than 12 (if not back at mid night)
      hours = (hours > 12)? hours -12 : hours;

      //if 00 then it is 12 am
      hours = (hours == '00')? 12 : hours;
      
      var min = dateObj.getMinutes();
      if (min < 10) 
         min = "0" + min;
   
      var year = dateObj.getFullYear();
      var month = months[dateObj.getMonth()];
      var date = dateObj.getDate();
      
      return month + " " + date + ", " + year + " " + hours + ":" + min + suffix;
}



function openLoginRegisterDialog(userFactory, $scope, stateData, $ionicModal) {
   userFactory.storeStateData(stateData);
   //$scope.login();
   userFactory.openLoginRegisterDialog();
}


function checkIsLoggedIn(userFactory, $scope) {
   
   if (userFactory.isAuthenticated()) {
      console.log("user authenticated");
      $scope.isLoggedIn = true;
      $scope.userFirstname = userFactory.getUserFirstname();
      //$rootScope.$broadcast("login:Successful", {userFirstname: $scope.userFirstname});
      return true;
   }      
   else {
      console.log("user NOT authenticated");
      return false;
   }
}

/*
function openLoginRegisterModal($ionicModal, $scope, userFactory) {
   
   // Create the login modal that we will use later
   $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
   }).then(function (modal) {
          
      // Triggered in the login modal to close it
      $scope.closeLogin = function () {
         modal.hide();
         userFactory.unsetCloseLogin();
         modal.remove();
      };

      // need to hook up closeLogin to the UserFactory
      // this is because the Modal is tied to the 
      // UserController which uses the UserFactory
      userFactory.closeLogin = $scope.closeLogin;
   
      modal.show();
      
   });
}
*/


function getCostIndicator(low, high) {
      
   if (low <=15 && high <= 50)
      return "$";
   
   if (high <= 50)
      return "$$";
   
   if (high > 50)
      return "$$$";
   
}


//=====
// Find Timeslot which the current Datetime is in.
function findTimeSlotFromCurrentDateTime(targetDate) {
   
   var currentDateTime = new Date();
   var dateStr = 
       currentDateTime.getMonth() + 1 + "/" + 
       currentDateTime.getDate() + "/" + 
       currentDateTime.getFullYear();
   
   //console.log("DateTime=", currentHours, currentMins);
   
   // if the timeslot being acquired isn't today,
   // we return the first timeslot of the day, which is 1
   if (targetDate !== dateStr)
      return 1;
   
   // else, we have to calculate
   var currentHours = currentDateTime.getHours();
   var currentMins = currentDateTime.getMinutes();
   
   var timeslot = (currentHours * 2) + 1;
   if (currentMins >= 30)
      timeslot += 1;
      
   return timeslot;
}


function showToast($cordovaToast, msg) {     
   
   try {
      $cordovaToast
         .show(msg, 'short', 'center')
         .then(function(success) {}, function (error) {});
   }
   catch (err) {
      console.log("showToast: Not running in the real device, no Cordova here.", err);
   }
}


function vibrateShort($cordovaVibration) {     
   
   try {
      $cordovaVibration.vibrate(100);
   }
   catch (err) {
      console.log("vibrateShort: Not running in the real device, no Cordova here.", err);
   }
}



// An alert dialog
function showAlert($ionicPopup, title, msg, callbackifSuccess) {
   var alertPopup = $ionicPopup.alert({
     title: title,
     template: msg
   });

   alertPopup.then(function(res) {
      if (callbackifSuccess != null)
         callbackIfSuccess();
   });
}


function getSanitizedRestaurantName(restaurantName) {
    
    return restaurantName.replace(/&/g, "and");
}


function hideLoading($ionicLoading) {
   
   $ionicLoading.hide();
}


function addDevice(userFactory) {
   
   var deviceRegId = userFactory.loadDeviceRegistrationId();
   var deviceObj = {device: deviceRegId}; 
   
   userFactory.addDevice().update(deviceObj).$promise
      .then(function (res) {
         console.log("Device added");
      })
      .catch(function (res) {
         console.log("addDevice wasn't successful");
      })
      .finally(function () {
         //hideLoading($ionicLoading);
         //userFactory.storeDeviceRegistrationId(data.registrationId);
         //$scope.deviceRegistrationId = data.registrationId;
      });
};


