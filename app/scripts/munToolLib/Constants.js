'use strict';
//TODO make JSON
define(function(){

var Constants = {};

Constants.SessionModes = {};
Constants.SessionModes.SPEAKERSLIST = 0;
Constants.SessionModes.SPEAKERSLIST_MOD = 1;
Constants.SessionModes.UNMOD = 2;

Constants.SpeechStates = {};
Constants.SpeechStates.UPCOMING = 0;
Constants.SpeechStates.CURRENT_UNSTARTED = 1;
Constants.SpeechStates.CURRENT_RUNNING = 2;
Constants.SpeechStates.CURRENT_DONE = 3;
Constants.SpeechStates.DONE = 4;

Constants.AttendeeStates = {};
Constants.AttendeeStates.ACTIVE = 0;
Constants.AttendeeStates.LEFT = 1;

Constants.SpeakersListStates = {};
Constants.SpeakersListStates.OPEN = 0;
Constants.SpeakersListStates.CLOSED = 1;

Constants.MotionTypes = {};
Constants.MotionTypes.UNMODERATED_CAUCUS = 0;
Constants.MotionTypes.MODERATED_CAUCUS = 1;
Constants.MotionTypes.OTHER = 2;

Constants.MotionStates = {};
Constants.MotionStates.OPENED = 0;
Constants.MotionStates.VOTED_PASSED = 1;
Constants.MotionStates.VOTED_FAILED = 2;
Constants.MotionStates.DONE = 3;
Constants.MotionStates.DELETED = 4;
Constants.MotionStates.VOTED_PASSED_EXTENDED = 5;

return Constants;

});