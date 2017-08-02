var app = angular.module('myApp', ['ngSanitize', 'naif.base64']);

app.filter("newlines", function(){
    return function(text) {
	return text.replace(/\n/g, "&#13;");
    }
});


app.controller("ChatController", function($sce, $http, $scope, $window, $rootScope, $anchorScroll, $location) {

    $scope.passphrase = "";
    $scope.uname = "";
    $scope.messages = {};
    $scope.newInterval = 5;
    $scope.lastTimestamp = 0;
    $scope.expiry = 0;
    $scope.cantSend = 0;
    $scope.tout;
    $scope.newFile = {};
    $scope.imageSelect = 0;
    $scope.newMessage = '';

    $scope.decryptMessage = function(message) {
	if(message == "Conversation Cleared") return message;
	if ($scope.passphrase == '') return '';
	try {
	    message = CryptoJS.AES.decrypt(message, $scope.passphrase).toString(CryptoJS.enc.Utf8);
	} catch (e) {
	    message = '';
	}
	if (message !== 'undefined' || message != '') return message.replace(/\n/g, "<br/>"); else return '';
    }

    $scope.scrollToBottom = function() {
	$(".chat").scrollTop(($(".chat")[0].scrollHeight) + 200);
	$location.hash('bottom');
	$anchorScroll();
    }
    
    $scope.sendData = function() {
	var newline = String.fromCharCode(13, 10);
	clearTimeout($scope.tout);
	$scope.cantSend = 1;
	$http.post('/message', {message: CryptoJS.AES.encrypt($scope.newMessage, $scope.passphrase).toString() , username: $scope.uname}).success(function(data) {
	    $scope.messages = data;
	    $scope.scrollToBottom();
	    $scope.newMessage = "";
	    $scope.tout = setTimeout((function() {
		$scope.cantSend = 0;
		clearTimeout($scope.tout);
	    }), 750);
	}).error(function() {
	    alert("Could not send message. Have you set your username and key?")
	    $scope.cantSend = 0;
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
	angular.element('#newmessagebox').trigger('focus');
    }

    //functions for image upload
    $scope.onImageLoad = function (e, reader, file, fileList, fileOjects, fileObj) {
	var b64 = '';
	b64 = b64.concat(fileObj.base64);
	while (b64.length % 4 > 0) {
	    b64 = b64.concat('=');
	}
	console.log(b64);
	$scope.newMessage = $scope.newMessage.concat(file.name+'<br/><img src="data:'+file.type+';base64, '+b64+'"/>');
	$scope.sendData();
	$scope.imageSelect = 0;
    };


    $scope.updateMessages();
    $scope.getExpiry();

});
