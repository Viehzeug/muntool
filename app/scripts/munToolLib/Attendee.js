'use strict';
define(['./util',
        './Constants'],
        function(util,
                 Constants){

var AttendeeStates = Constants.AttendeeStates;

/**
 * Attendee of the session that was recognized.
 * @class
 * @param {String} name - Name of the attendee.
 * @param {Session} session - Current session.
 */
function Attendee(name, s){
  /*** OOP Constructs ***/

  /**
   * Name of the Attendee.
   * @name name
   * @instance
   * @public
   * @memberOf module:munToolLib~Attendee
   */

  /**
   * Unique Id of the Attendee.
   * @name attendeeId
   * @instance
   * @public
   * @memberOf module:munToolLib~Attendee
   */
  
  /**
   * Genrates a unique Id for a given country name based on the name
   * and the current timestamp.
   * @method generateId
   * @param  {string} name - Name of the Attendee.
   * @param  {module:munToolLib~Session} session - Refence to the current session.
   * @return {string} id
   * @inner
   * @private
   * @memberOf module:munToolLib~Attendee
   */
  function generateId(name, session){
    var str = name + Date.now();
    var id = util.hashCode(str);   
    //check if the Id was already used
    //if it wasn't call generateId again
    //the new timestamp should result in a new hash
    var attendeeIds = session.getAttendeeIds();
    if (attendeeIds.indexOf(id.toString()) === -1)
    {
      return id;
    }
    else
    {
      return generateId(name, session);
    }
  }

  this.status = AttendeeStates.ACTIVE;
  this.name = name;
  this.attendeeId = generateId(name, s);
  this.session = s;
}

Attendee.prototype.isActive = function() {
  return this.status === AttendeeStates.ACTIVE;
};

Attendee.prototype.reenter = function(){
  this.status = AttendeeStates.ACTIVE;  
};

Attendee.prototype.leave = function() {
  this.status = AttendeeStates.LEFT;
  var self = this;
  this.session.getAllSpeakersLists().forEach(function(sl){
    var indizes = [];
    for (var i = 0; i < sl.speeches.length; i++) {
      var speech = sl.speeches[i];
      if (speech.speaker === self &&
        speech.isUpcoming())
      {
        delete sl.speeches[i];
        indizes.push(i);
      }

    }
    //TODO use a common delete funtion

    for (var k = 0; k < indizes.length; k++) {
      var index = indizes[k];
      sl.speeches.splice(index, 1);
      for (var j = k+1; j < indizes.length; j++) {
        indizes[j]--;
      }
    }

  });

  this.session.motions.forEach(function(m){
    if (m.proposedBy === self &&
      !m.closed())
    {
      m.delete(); //TODO stop delting ship
    }
  });

  this.session.updateAttendeeHash();
  this.session.updateSpeakerslistsHashCode();

};

Attendee.prototype.getNumberOfSpeeches = function()
{
  var self = this;
  var sum = 0;
  this.session.getAllSpeakersLists().forEach(function(e){
    sum += self.getNumberOfSpeechesOnList(e);
  });
  return sum;
};

Attendee.prototype.getNumberOfSpeechesOnList = function(list)
{
  var self = this;
  return list.speeches.filter(function(e){
    return self.attendeeId === e.speaker.attendeeId;
  }).length;
};

Attendee.prototype.getNumberOfSpeechesOnCurrentList = function()
{
  return this.getNumberOfSpeechesOnList(this.session.currentSpeakersList());
};


Attendee.prototype.toSimpleObject = function()
{
  return {name: this.name,
      attendeeId: this.attendeeId,
      status: this.status};
};

Attendee.prototype.toJSON = function()
{
  return JSON.stringify(this.toSimpleObject());
};

return Attendee;

});