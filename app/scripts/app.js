'use strict';

/**
 * @ngdoc overview
 * @name muntoolApp
 * @description
 * # muntoolApp
 *
 * Main module of the application.
 */

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] !== 'undefined' ?
         args[number] : match
      ;
    });
  };
}

var session;

function formatTime(seconds)
{
  var min = Math.floor(seconds/60) + ':';
  var sec = Math.floor(seconds%60) + '';
  if (sec.length < 2)
  {
    sec = '0' + sec;
  }
  return min + sec;
}

var app = angular
  .module('muntoolApp', [
    'ngAnimate',
    'ngAria',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angucomplete-alt',
    'ui.bootstrap',
    'LocalStorageModule'
  ]);

app.config(['localStorageServiceProvider', function(localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('muntool');
}]);

app.factory('munSession', function(localStorageService) {
  if (session === undefined)
  {
    var sessionJSON = localStorageService.get('session');
    //TODO load from library
    if (sessionJSON !== undefined) {
      session = muntoolJSONLoader.load(sessionJSON); // jshint ignore:line
    } else {
      session = new Session(); // jshint ignore:line
    }

    //TODO
    //singelton this..
    //currently there will probably always be more creaed
    setInterval(function(){
      localStorageService.set('session', session.toJSON());
    }, 1000); //TODO decrease intervall or put after changes
    //session.currentSpeakersList().toJSON();
  }
  return session;
});

function showUnmoderatedCaucusModal($modal, munSession, motion)
{
  //var motionsVoteModal =
  $modal.open({
    animation: true,
    templateUrl: 'unmoderatedCaucusModal.html',
    controller: 'unmoderatedCaucusModalController',
    resolve: {'motion': function(){return motion;}}
  });  
}

function showVoteCaucusDialog($modal, munSession)
{
  var motionsVoteModal = $modal.open({
    animation: true,
    templateUrl: 'motionsVoteModal.html',
    controller: 'motionsVoteModalController'
  });

  motionsVoteModal.result.then(function(motionId){
    //motionId passed and is now to be executed
    var motion = munSession.getMotionById(motionId);
    if (motion.type === munSession.constants.MotionTypes.UNMODERATED_CAUCUS)
    {
      showUnmoderatedCaucusModal($modal, munSession, motion);
    } else if (motion.type === munSession.constants.MotionTypes.MODERATED_CAUCUS)
    {
      var sl = motion.getSpeakersList();
      munSession.setCurrentSpeakersList(sl);
    }
  }, function(){
  });

}

function showExtendSpeaerslistModal($modal)
{
    //var newSpeakersListModal =
    $modal.open({
      animation: true,
      templateUrl: 'extendSpeaerslistModal.html',
      controller: 'extendSpeaerslistModalController'
    });
}

function showNewSpeakersListDialog($modal, munSession)
{
    var newSpeakersListModal = $modal.open({
      animation: true,
      templateUrl: 'newSpeakersListModal.html',
      controller: 'newSpeakersListModalController'
    });

    newSpeakersListModal.result.then(function(newList){
      munSession.newSpeakersList(newList.name, newList.duration, 0); //TODO enable different durations
      munSession.setCurrentSpeakersList(newList.name);
    });
}

function showNewCaucusDialog($modal, munSession, defaultSelection)
{
  var newCaucusModal = $modal.open({
    animation: true,
    templateUrl: 'newCaucusModal.html',
    controller: 'newCaucusModalController',
    resolve: {'defaultSelection': function(){return defaultSelection;}}
  });

  newCaucusModal.result.then(function(caucus){
    munSession.newMotion(caucus.type, caucus.proposedBy, caucus.topic,
                         caucus.duration, caucus.speechDuration);
    if (caucus.more)
    {
      showNewCaucusDialog($modal, munSession, undefined);
    }
  }, function(dismissReason){
    if (dismissReason === 'vote')
    {
      showVoteCaucusDialog($modal, munSession);
    }
  });
}


app.controller('attendanceListController', function($scope, munSession)
{
  $scope.attendeesAutocomplete = munSession.autocompleteMembers();
  function update()
  {
    $scope.attendees = munSession.getAttendees();
    $scope.numAtendees = munSession.getNumberOfAttendees();
    $scope.simplemajority = munSession.getSimpleMajority();
    $scope.attendeesAutocomplete = munSession.autocompleteMembers();
  }
  update();

  $scope.$watch(function(){ return munSession.attendeesHashCode; },
                function(){ update(); });

  $scope.newAttendee = function(selected)
  {
    var newAttendeeName;
    if (selected.originalObject.name)
    {
      newAttendeeName = selected.originalObject.name;
    }
    else
    {
      newAttendeeName = selected.originalObject;
    }

    if (newAttendeeName !== "" && newAttendeeName !== undefined)
    {
      munSession.newAttendee(newAttendeeName);
    }
  };

  $scope.removeattendee = function(id)
  {
    munSession.removeAttendeeById(id);
  };

});

app.controller('speakersListController', function($scope, $modal, munSession)
{
  function update()
  {
    $scope.speakersLists = munSession.getOpenSpeakersLists();
    $scope.currentSpeakersList = munSession.currentSpeakersList();
    $scope.attendees = munSession.getAttendees();
  }
  update();

  $scope.$watch(function(){ return munSession.attendeesHashCode; },
                function(){ $scope.attendees = munSession.getAttendees(); },
                true);
  $scope.$watch(function(){ return munSession.speakerslistsHashCode; },
                function(){ $scope.speakersLists = munSession.getOpenSpeakersLists(); },
                true);
  $scope.$watch(function(){ return munSession.currentSpeakersListId; },
                function(){ $scope.currentSpeakersList = munSession.currentSpeakersList(); },
                true);

  $scope.getProposer = function()
  {
    if ($scope.currentSpeakersList.isMotion())
    {
      return munSession.getAttendeeById($scope.currentSpeakersList.startedForModeratedCaucus.proposedBy).name;
    }
    else
    {
      return '';
    }
  };

  $scope.close = function(){
     //todo move to appropiate location
     munSession.closeCurrenSpeakersList();
  };

  $scope.openExtend = function(){
    showExtendSpeaerslistModal($modal, munSession);
  };

  $scope.getSpeakerClass = function(s)
  {
    switch(s.state)
    {
      case 0:
      //fallthrough
      case 1:
        return 'speech-upcoming';
      
      case 2:
        return 'speech-active';
      
      case 3: //fallthrough
      case 4: // jshint ignore:line
      //fallthrough
      default:
        return 'speech-done';
    }
  };

  $scope.changeSpeakersList = function(event, speakerslist)
  {
    munSession.setCurrentSpeakersList(speakerslist.id);
    update();
  };

  $scope.newSpeakersList = function()
  {
    showNewSpeakersListDialog($modal, munSession);
  };

  $scope.newSpeaker = function(selected)
  {
    munSession.currentSpeakersList().add(selected.originalObject);
    update();
  };

});

app.controller('speechController', function($scope, $modal, $interval, munSession) {
  
  function update()
  {
    var speakerslist  = munSession.currentSpeakersList();
    var speech;
    if (speakerslist.hasNextSpeech())
    {
      $scope.nextSpeaker = speakerslist.getNextSpeech().speaker;
    } else
    {
      $scope.nextSpeaker = undefined;
    }
    if (speakerslist.hasCurrentSpeech())
    {
      $scope.currentSpeaker = speakerslist.getCurrentSpeech().speaker;
      speech = speakerslist.getCurrentSpeech();
      $scope.timeLeft = formatTime(speech.secondsLeft());
    } else
    {
      $scope.currentSpeaker = undefined;
      $scope.timeLeft = formatTime(0);
    }

    $scope.resetDisabled = !( speech && (speech.isRunning() || speech.isDone()) );
    $scope.startNextDisabled = !speakerslist.hasNextSpeech();
    $scope.backDisabled = false;
    $scope.forwardDisabled = false;
  }
  update();

  $scope.updateTimer = undefined;
  function stopTimer()
  {
    if (angular.isDefined($scope.updateTimer))
    {
      $interval.cancel($scope.updateTimer);
      $scope.updateTimer = undefined;
    }
  }

  $scope.$watch(function(){ return munSession.speakerslistsHashCode; },
                function(){ update(); },
                true);
  $scope.$watch(function(){ return munSession.currentSpeakersListId; },
                function(){ update(); },
                true);

  function startSpeech(speech)
  {
    stopTimer();
    speech.start();
    update();
    $scope.updateTimer = $interval(function(){
      $scope.timeLeft = formatTime(speech.secondsLeft());
      if (speech.isDone())
      {
        stopTimer();
        update();
      }
    }, 200);
  }

  $scope.startNext = function()
  {
    var speakerslist  = munSession.currentSpeakersList();
    var speech = speakerslist.advanceToNextSpeech();
    startSpeech(speech);
  };

  $scope.resetSpeech = function()
  {
    var speakerslist  = munSession.currentSpeakersList();
    var speech = speakerslist.getCurrentSpeech();
    speech.reset();
    startSpeech(speech);
  };

});


app.controller('newSpeakersListModalController', function($scope, $modalInstance)
{

  $scope.add = function () {
    $modalInstance.close({'name': $scope.name,
                          'duration':$scope.duration});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

app.controller('newCaucusModalController', function($scope, $modalInstance, munSession, defaultSelection)
{
  $scope.attendees = munSession.getAttendees();
  $scope.MotionTypes = munSession.constants.MotionTypes;
  if (defaultSelection !== undefined)
  {
    $scope.caucusType = defaultSelection;
  }
  else
  {
    $scope.caucusType = $scope.MotionTypes.UNMODERATED_CAUCUS;
  }

  $scope.add = function() {
    $modalInstance.close({'type': $scope.caucusType,
                          'topic': $scope.topic,
                          'proposedBy': $scope.proposedBy.originalObject.attendeeId,
                          'duration':$scope.duration,
                          'speechDuration':$scope.speechDuration,
                          'more': true});
  };

  $scope.cancel = function (reason) {
    $modalInstance.dismiss(reason);
  };
});

app.controller('unmoderatedCaucusModalController', function($scope, $modalInstance, $interval, munSession, motion){
  $scope.timeStarted = new Date();
  $scope.extensionOpen = false;
  $scope.notExtended = true;
  var running = true;
  var unmodDuration = motion.listDuration;

  function updateTimer()
  {
    var timeElapsed = (new Date()) - $scope.timeStarted;
    var secondsLeft = unmodDuration * 60 - timeElapsed/1000;
    if (secondsLeft <= 0)
    {
      $scope.timeLeft = formatTime(0);
      $interval.cancel($scope.interval);
      motion.complete();   
      running = false;  
    } else
    {
      $scope.timeLeft = formatTime(secondsLeft);
    }
  }
  $scope.interval = $interval(updateTimer, 200);

  $scope.cancel = function () {
    if ($scope.interval)
    {
      $interval.cancel($scope.interval);
    }
    $modalInstance.dismiss('cancel');
  };

  $scope.vote = function(){
    var passed = motion.extend($scope.overwhelmingMajority,
                               $scope.inFavor, $scope.duration);
    if (passed)
    {
      if (running)
      {
        unmodDuration += $scope.duration;
      } else
      {
        unmodDuration = $scope.duration;
        running = true;
        $scope.timeStarted = new Date();
        $scope.interval = $interval(updateTimer, 200);
      }
      $scope.extensionOpen = false;
      $scope.notExtended = false;
    } else
    {
      $scope.extensionOpen = false;
      $scope.notExtended = false;
    }
  };

  $scope.openExtend = function() {
    $scope.extensionOpen = true;
  };

});


app.controller('extendSpeaerslistModalController', function($scope, $modalInstance, munSession)
{
  $scope.currentSpeakersList = munSession.currentSpeakersList();

  $scope.getProposer = function()
  {
    return munSession.getAttendeeById($scope.currentSpeakersList.startedForModeratedCaucus.proposedBy).name;
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  $scope.vote = function () {
    $scope.currentSpeakersList.extend($scope.overwhelmingMajority,
                                      $scope.inFavor, $scope.duration);
    $modalInstance.close();
  };

});

app.controller('motionsVoteModalController', function($scope, $modalInstance, munSession)
{
  $scope.MotionTypes = munSession.constants.MotionTypes;
  function update(){
    $scope.simpleMajority = munSession.getSimpleMajority();
    $scope.openMotions = munSession.getOpenMotions();    
    $scope.currentMotion = undefined;
    $scope.overwhelmingMajority = false;
    if ($scope.openMotions.length > 0)
    {
      $scope.currentMotion = $scope.openMotions[0];
    }
  }
  update();

  $scope.changeMotion = function(id){
    var filtered = $scope.openMotions.filter(function(e){
      return (e.id === id);
    });
    if (filtered.length > 0)
    {
      $scope.currentMotion = $scope.openMotions[0];
    }
    else
    {
      $scope.currentMotion = undefined;
    }
    $scope.overwhelmingMajority = false;
  };

  $scope.vote = function() {
    var passed = munSession.voteMotion($scope.currentMotion.id, $scope.overwhelmingMajority, $scope.inFavor);
    if (passed)
    {
      $modalInstance.close($scope.currentMotion.id);
    } else
    {
      update();
    }
  };

  $scope.delete = function() {
    munSession.deleteMotion($scope.currentMotion.id);
    update();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };
});


app.controller('navigationController', function($scope, $modal, munSession) {
  $scope.newSpeakersList = function()
  {
    showNewSpeakersListDialog($modal, munSession);
  };

  $scope.modCaucus = function()
  {
    showNewCaucusDialog($modal, munSession,
                        munSession.constants.MotionTypes.MODERATED_CAUCUS);
  };

  $scope.unmodCaucus = function()
  {
    showNewCaucusDialog($modal, munSession,
                        munSession.constants.MotionTypes.UNMODERATED_CAUCUS);
  };

  $scope.reset = function()
  {
    session = new Session(); // jshint ignore:line
    setTimeout(function(){
      window.location.reload();
    }, 1005);
  };

});

app.controller('motionController', function($scope, $modal, munSession) {
  $scope.modCaucus = function()
  {
    showNewCaucusDialog($modal, munSession,
                        munSession.constants.MotionTypes.MODERATED_CAUCUS);
  };

  $scope.unmodCaucus = function()
  {
    showNewCaucusDialog($modal, munSession,
                        munSession.constants.MotionTypes.UNMODERATED_CAUCUS);
  };

});

app.controller('clockController', function($scope, $timeout) {
    $scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000; //ms

    var tick = function () {
        $scope.clock = Date.now(); // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    };

    // Start the timer
    $timeout(tick, $scope.tickInterval);
});