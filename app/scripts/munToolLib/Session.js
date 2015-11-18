'use strict';
define(['./util',
        './SpeakersList',
        './members',
        './Constants',
        './Motion',
        './Attendee'],
        function (util,
                  SpeakersList,
                  members,
                  Constants,
                  Motion,
                  Attendee) {
function Session(){

/**
 * Session
 * @class
 */

  /*** OOP Constructs ***/

  this.attendees = {};
  this.attendeesHashCode = '';
  this.updateAttendeeHash();
  
  this.motions = [];
  this.speakerslists = {};
  //add General Speakers List as speakers list
  this.generalSpeakersListId =
    this.newSpeakersList('General Speakers List', 45, 0);
  this.currentSpeakersListId = this.generalSpeakersListId;
  this.speakerslistsHashCode = '';
  this.updateSpeakerslistsHashCode();

}

Session.prototype.toSimpleObject = function()
{
  var self = this;
  return {
      attendees: Object.keys(this.attendees).map(function(e){ return self.attendees[e].toSimpleObject();}),
      speakerslists: Object.keys(this.speakerslists).map(function(e){ return self.speakerslists[e].toSimpleObject();}),
      motions: this.motions.map(function(e){ return e.toSimpleObject();}),
      currentSpeakersListId: this.currentSpeakersListId,
      generalSpeakersListId: this.generalSpeakersListId
    };
};

Session.prototype.toJSON = function()
{
  return JSON.stringify(this.toSimpleObject());
};


  //TODO make private what can be private
  /**
   * The attendees of the session saved in an object. Key is {@link module:munToolLib~Attendee#attendeeId} and value is {@link module:munToolLib~Attendee}.
   * @name attendees
   * @instance
   * @public
   * @memberOf module:munToolLib~Session
   */

  /**
   * List of motions.
   * @name motions
   * @instance
   * @public
   * @memberOf module:munToolLib~Session
   */


  /**
   * List of the speakslists. List of {@link module:munToolLib~SpeakersList}.
   * @name speakerslists
   * @instance
   * @public
   * @memberOf module:munToolLib~Session
   */

  /**
   * Id of the current speakerslist. Array index in {@link module:munToolLib~Session#speakerslists}.
   * @name currentSpeakersListId
   * @instance
   * @public
   * @memberOf module:munToolLib~Session
   */


  /**
 * Adds a string to the session log.
 * @method  log
 * @param  {string} str - the Text.
 * @inner
 * @private
 * @memberOf module:munToolLib~Session
 */
Session.prototype.log = function (str)
{
  console.log('[' + (new Date()).toString() + '] ' + str);
};

//todo
// extracted from wikipedia (https://en.wikipedia.org/wiki/Member_states_of_the_United_Nations) via:
// countries = [];
// $('table.wikitable > tbody > tr td:first-child a').each(function(){ console.log($(this).attr('title'))})
// countries = countries.filter(function(e){ return (e !== undefined && e !== null);})
// JSON.stirngify(countries)
Session.prototype.autocompleteMembers = function(){

  var attendees = this.getAttendees().map(function(e){
    return e.name;
  });
  //members is global
  return members.filter(function(e){ // jshint ignore:line
    return (attendees.indexOf(e.toString()) === -1);
  }).map(function(v){
    return {'name': v};
  }); 
};
//TODO countries can have flags, synonym ("north korea", china)

/**
 * Adds a speaker to the speakerslist.
 * @method currentSpeakersList
 * @return {module:munToolLib~SpeakersList} The currently active SpeakersList.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.currentSpeakersList = function(){
  return this.speakerslists[this.currentSpeakersListId];
};

/**
 * Sets the currently active SpeakersList by name.
 * @method setCurrentSpeakersList
 * @param {string} name - The name of the SpeakersList that is to be set to active.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.setCurrentSpeakersList = function(id){
  var speakerslistId = Object.keys(this.speakerslists);
  if (speakerslistId.indexOf(id.toString()) !== -1)
  {
    this.currentSpeakersListId = id;
  }
  //TODO else give some error
};

/**
 * Create a new SpeakersList.
 * @method newSpeakersList
 * @param {string} name - The name of the new SpeakersList.
 * @param {number} duration - The duration of a speech on the new SpeakersList.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.newSpeakersList = function(name, duration, listDuration){
  var sl = new SpeakersList(name, duration, this, listDuration, undefined);
  this.log('opening speakerslist ' + name + 'with a speech duration of ' + duration);
  this.speakerslists[sl.id] = sl;
  this.updateSpeakerslistsHashCode();
  return sl.id;
};

/**
 * Adds a speaker to the current SpeakersList.
 * @method newSpeaker
 * @param {string} atendeeId - The [Id]{@link module:munToolLib~Attendee#attendeeId} of the speaker to be added.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.newSpeaker = function(attendeeId) {
  var attendee = this.attendees[attendeeId];
  if (attendee.isActive()) {
    this.currentSpeakersList().add(this.attendees[attendeeId]);
    this.log('added ' + attendeeId + 'to the speakerslist');
    this.updateSpeakerslistsHashCode();   
  }
};

Session.prototype.newMotion = function(type, proposedBy, topic, listDuration, speechDuration) {
  this.motions.push(new Motion(topic, proposedBy, this, type, listDuration, speechDuration));
};

Session.prototype.updateAttendeeHash = function(){
  var self = this;
  var str = Object.keys(this.attendees).map(function(e){
    return self.attendees[e].toJSON();
  }).join();
  this.attendeesHashCode = util.hashCode(str);
};

Session.prototype.updateSpeakerslistsHashCode = function(){
  var self = this;
  var str = Object.keys(this.speakerslists).map(function(e){ return self.speakerslists[e].getHashCode();}).join();
  this.speakerslistsHashCode = util.hashCode(str);
};

Session.prototype.getNumberOfAttendees = function() {
  return this.getAttendees().length;
};

Session.prototype.getSimpleMajority = function() {
  return Math.ceil((this.getNumberOfAttendees()+1) / 2);
};

Session.prototype.getMotionById = function(id) {
  var filtered = this.motions.filter(function(e){
    return (e.id === id);
  });
  if (filtered.length > 0)
  {
    return filtered[0];
  }
};

Session.prototype.getOpenMotions = function() {
  var self = this;
  return this.motions.filter(function(e){  
    return (e.state === Constants.MotionStates.OPENED);
  }).map(function(e){
    var obj = e.toSimpleObject();
    obj.proposedByText = self.getAttendeeById(e.proposedBy).name;
    switch(obj.type)
    {

      case Constants.MotionTypes.UNMODERATED_CAUCUS:
        obj.typeText = "Unmoderated Caucus";
        break;

      case Constants.MotionTypes.MODERATED_CAUCUS:
        obj.typeText = "Moderated Caucus";
        break;

      case Constants.MotionTypes.OTHER: // jshint ignore:line
      //fallthrough
      default:
        obj.typeText = "Motion";
    }
    return obj;
  });
};

/**
 * Adds a new Attendee to the session by a given name.
 * @method newAttendee
 * @param {string} name - The name of the new Attendee.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.newAttendee = function(name)
{
  //find out wheter the attendee was already here, but left
  var self = this;
  var left = Object.keys(this.attendees).filter(function(e){
    var attendee = self.attendees[e];
    return !attendee.isActive() && attendee.name === name;
  });
  if (left.length > 0)
  {
    this.attendees[left[0]].reenter();
  } else {
    var a = new Attendee(name, this);
    this.attendees[a.attendeeId] = a;
    this.log(name + ' (' + a.attendeeId + ') entered the debate');
  }
  this.updateAttendeeHash();
};

/**
 * Returns a list of the Attendees.
 * @method getAttendees
 * @return {module:munToolLib~Attendee[]} The list of attendees.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.getAttendees = function()
{
  var attendees = [];
  var self = this;
  this.getAttendeeIds().forEach(function (key) {
    attendees.push(self.attendees[key]);
  });
  attendees.sort(function(a,b){
    return a.name.localeCompare(b.name);
  });
  return attendees;
};

//TODO comment me
Session.prototype.getAttendeeById = function(id)
{
  return this.attendees[id];
};

/**
 * Returns a list of the AttendeeIds.
 * @method getAttendeeIds
 * @return {string[]} The list of [Attendee]{@link module:munToolLib~Attendee} Ids.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.getAttendeeIds = function()
{
  var self = this;
  return Object.keys(this.attendees).filter(function(e){
    return self.attendees[e].isActive();
  });
};

/**
 * Remove an Attendee by the [Id]{@link module:munToolLib~Attendee#attendeeId}.
 * @method removeAttendeeById
 * @param {string} id - The unique [Id]{@link module:munToolLib~Attendee#attendeeId} of the Attendee.
 * @instance
 * @public
 * @memberOf module:munToolLib~Session
 */
Session.prototype.removeAttendeeById = function(id)
{
  var a = this.attendees[id];
  //TODO handle error case if there is no such id
  // delete this.attendees[id];
  this.attendees[id].leave();
  this.log(a.name + ' (' + a.attendeeId + ') left the debate');
};

Session.prototype.getAllSpeakersLists = function(){
  var self = this;
  return Object.keys(this.speakerslists).map(function(e){
    return self.speakerslists[e];
  });
};

Session.prototype.getOpenSpeakersLists = function(){
  return this.getAllSpeakersLists().filter(function(e){
    return e.state === Constants.SpeakersListStates.OPEN;
  });
};

Session.prototype.deleteMotion = function(id) {
  var motion = this.getMotionById(id);
  motion.delete();
};


Session.prototype.voteMotion = function(id, overwhelmingMajority, inFavor) {
  var motion = this.getMotionById(id);
  return motion.vote(overwhelmingMajority, this.getSimpleMajority(), inFavor);
};

Session.prototype.closeCurrenSpeakersList = function(){
  var sl = this.currentSpeakersList();
  if (sl.isCloseable())
  {
    this.currentSpeakersList().close();
    this.currentSpeakersListId = this.generalSpeakersListId;
    this.updateSpeakerslistsHashCode();   
  }
  //TODO error in else-case
};
	return Session;
});