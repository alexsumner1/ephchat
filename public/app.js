var app = angular.module('myApp', []);

app.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);


app.controller("ChatController", function($http, $scope, $anchorScroll, $location) {

    $scope.passphrase = "";
    $scope.uname = "";
    $scope.messages = {};
    $scope.newInterval = 5;
    $scope.lastTimestamp = 0;
    $scope.expiry = 0;

    $scope.decryptMessage = function(message) {
	if(message == "Conversation Cleared") return message;
	if ($scope.passphrase == '') return '';
	try {
	    message = CryptoJS.AES.decrypt(message, $scope.passphrase).toString(CryptoJS.enc.Utf8);
	} catch (e) {
	    message = '';
	}
	if (message !== 'undefined' || message != '') return message; else return '';
    }

    $scope.scrollToBottom = function() {
	$(".chat").scrollTop(($(".chat")[0].scrollHeight) + 200);
	$location.hash('bottom');
	$anchorScroll();
    }
    
    $scope.sendData = function() {
	$http.post('/message', {message: CryptoJS.AES.encrypt($scope.newMessage, $scope.passphrase).toString() , username: $scope.uname}).success(function(data) {
	    $scope.messages = data;
	    $scope.scrollToBottom();
	    $scope.newMessage = "";
	}).error(function() {
	    alert("Could not send message. Have you set your username and key?")
	});
    };

    $scope.updateMessages = function() {
	$http.get('/message').success(function(data) {
	    $scope.messages = data;
	    $scope.lastTimestamp = $scope.messages[$scope.messages.length -1].timestamp;
	    $scope.scrollToBottom();
	});
    };

    $scope.checkForUpdates = function() {
	$http.get('/update?timestamp='+$scope.lastTimestamp).then(function(response) {
	    if(response.status != 304) {
		$scope.messages = response.data;
		$scope.lastTimestamp = $scope.messages[$scope.messages.length -1].timestamp;
		$scope.scrollToBottom();
	    }
	});
    }

    $scope.getExpiry = function() {
	$http.get('/expiry').success(function(data) {
	    console.log(data);
	    $scope.expiry = data;
	});
    };

    $scope.setExpiry = function(expiryTime) {
	$http.post('/expiry?s='+expiryTime).success(function(data) {
	    $scope.expiry = data;
	});
    };
						   

    $scope.generatecolour = function (name) {
	return CryptoJS.MD5(name).toString().substring(0,6);
    }

    $scope.promptForUsername = function() {
	var u = prompt("Set Username:", $scope.uname);
	if ( null !== u )
	    $scope.uname = u;
    };

    $scope.promptForKey = function() {
	var k = prompt("Set Key:", $scope.passphrase);
	if ( null !== k) 
	    $scope.passphrase = k;
    };

    $scope.promptForInterval = function() {
	clearInterval($scope.interval);
	var p = prompt("Set Auto Refresh Time", $scope.newInterval);
	if (null !== p) 
	    $scope.newInterval = p
	$scope.interval = setInterval((function() {
	    $scope.checkForUpdates();
	}), $scope.newInterval * 1000);

	if( 0 == p )
	    clearInterval($scope.interval);
	
    }

    $scope.promptForExpiry = function() {
	var e = prompt("Set how many messages to keep", $scope.expiry);
	if (null !== e) {
	    $scope.setExpiry(e)
	}
    }

    $scope.wipeChat = function() {
	if(confirm("Are you sure? This will wipe both party's conversation history!")) {
	    $http.get('/wipe').success(function(data) {
		$scope.messages = data;
		$scope.scrollToBottom();
	    });
	}
    };

    $scope.interval = setInterval((function() {
	$scope.checkForUpdates();
    }), $scope.newInterval * 1000);

    $scope.keepFocused = function() {
	console.log("focusing");
	angular.element('#newmessagebox').trigger('focus');
    }


    $scope.updateMessages();
    $scope.getExpiry();

});
