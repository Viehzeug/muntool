'use strict';
define(['./util',
		    'json!./constants.json',
        './Speech'],
        function(util,
                 constants,
                 Speech){

/**
 * SpeakersList
 * @class
 * @param  {string} name - Name of the Speakers List.
 * @param  {number} duration - Duration of a Speech on the Speakrslist.
 * @param  {Session} session - Current session.
 */
function SpeakersList(name, duration, s, listDuration, motion){
  /*** OOP Constructs ***/

  function generateId(name, session){
    var str = name + Date.now();
    var id = util.hashCode(str);   
    //check if the Id was already used
    //if it wasn't call generateId again
    //the new timestamp should result in a new hash
    var ids = Object.keys(session.speakerslists);
    if (ids.indexOf(id.toString()) === -1)
    {
      return id;
    }
    else
    {
      return generateId(name + ' ', session);
    }
  }

  /**
   * Name of the Speakerslist.
   * @name name
   * @instance
   * @public
   * @memberOf module:munToolLib~SpeakersList
   */

  /**
   * Duration of a Speech on the Speakrslist.
   * @name duration
   * @instance
   * @public
   * @memberOf module:munToolLib~SpeakersList
   */


  //todo comment me
  
  //todo comment me

  //TODO comment me

  /*** OOP style constructor ***/
  this.session = s;
  this.name = name;
  this.id = generateId(name, s);
  this.duration = duration;
  this.speeches = [];
  this.currentSpeechId = -1;
  this.startedForModeratedCaucus = motion;
  this.state = constants.SpeakersListStates.OPEN;
  //listDuration === 0 <==> infinity
  if(listDuration !== undefined)
  {
    if (listDuration < 0)
    {
      this.listDuration = 0;
    } else
    {
      this.listDuration = listDuration;
    }
  } else
  {
    this.listDuration = 0;
  }

}

SpeakersList.prototype.close = function(){
  this.state = constants.SpeakersListStates.CLOSED;
};

SpeakersList.prototype.extend = function(overwhelmingMajority, inFavor, time){
  if(this.isExtendable())
  {
    this.startedForModeratedCaucus.extend(overwhelmingMajority,
                        this.session.getSimpleMajority(),
                        inFavor,
                        time);
    this.listDuration += 60 * this.startedForModeratedCaucus.extensionTime;
    this.session.updateSpeakerslistsHashCode();
  }
};

SpeakersList.prototype.isCloseable = function(){
  return this.session.generalSpeakersListId !== this.id;
};

SpeakersList.prototype.isExtendable = function(){
  return (this.isMotion() &&
      this.startedForModeratedCaucus.isExtendable());
};

SpeakersList.prototype.isMotion = function(){
  return (this.startedForModeratedCaucus !== undefined);
};

SpeakersList.prototype.hasTimelimit = function(){
  return (this.listDuration !== 0);
};

SpeakersList.prototype.speechesDone = function(){
  return this.speeches.filter(function(e){
    return e.isDone();
  }).length;
};

SpeakersList.prototype.speechesUpcoming = function(){
  return this.speeches.filter(function(e){
    return e.isUpcoming();
  }).length;
};

SpeakersList.prototype.speechesRemaining = function(){
  if (this.listDuration === 0)
  {
    return 0;
  } else
  {
    var timeRemaining = this.listDuration - (this.speeches.length * this.duration);
    return Math.floor(timeRemaining/this.duration);
  }
};

SpeakersList.prototype.getHashCode = function(){
  var str = this.name + this.duration +
        this.currentSpeechId +
        this.state;
  str += this.speeches.map(function(s){
    return s.getHashCode();
  }).join();
  return util.hashCode(str);
};

SpeakersList.prototype.toSimpleObject = function()
{
  var obj = {name: this.name,
         duration: this.duration,
         speeches: this.speeches.map(function(e){ return e.toSimpleObject();}),
         currentSpeechId: this.currentSpeechId,
         listDuration: this.listDuration,
         id: this.id,
         state: this.state};

  if (this.startedForModeratedCaucus !== undefined)
  {
    obj.startedForModeratedCaucus = this.startedForModeratedCaucus.id;
  } else 
  {
    obj.startedForModeratedCaucus = undefined;    
  }

  return obj;
};

SpeakersList.prototype.toJSON = function()
{
  return JSON.stringify(this.toSimpleObject());
};

/**
 * Adds a speaker to the speakerslist.
 * @method add 
 * @param {string} Id of a speaker. See {@link module:munToolLib~Attendee#attendeeId}.
 * @instance
 * @public
 * @memberOf module:munToolLib~SpeakersList
 */
//TODO fix comment
SpeakersList.prototype.add = function(speaker){
  this.speeches.push(new Speech(speaker, this.duration, this.session, this));
  this.session.updateSpeakerslistsHashCode();
};

//todo comment me
SpeakersList.prototype.getSpeakers = function(){
  return this.speeches.map(function(e){
    return e.speaker;
  });
};

SpeakersList.prototype.getSpeeches = function(){
  return this.speeches;
};

SpeakersList.prototype.hasCurrentSpeech = function(){
  return (this.currentSpeechId > -1);
};

SpeakersList.prototype.hasNextSpeech = function(){
  return (this.currentSpeechId+1 < this.speeches.length);
};

//TODO comment me
SpeakersList.prototype.getNextSpeech = function(){
  if (this.hasNextSpeech())
  {
    return this.speeches[this.currentSpeechId+1];
  }
};

//TODO comment me
SpeakersList.prototype.getCurrentSpeech = function(){
  if (this.hasCurrentSpeech())
  {
    return this.speeches[this.currentSpeechId];
  }
};

SpeakersList.prototype.advanceToNextSpeech = function(){
  if (this.hasNextSpeech())
  {
    if (this.hasCurrentSpeech())
    {
      this.getCurrentSpeech().end();      
    }
    this.currentSpeechId++;
    console.log('Going to speech ' + this.currentSpeechId);
    this.getCurrentSpeech().setCurrent();
    return this.getCurrentSpeech();
  }
};

	return SpeakersList;
});