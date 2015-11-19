'use strict';
define(['./SpeakersList',
        './util',
        'json!./constants.json'],
        function(SpeakersList,
                 util,
                 constants){

var MotionStates = constants.MotionStates;
var MotionTypes = constants.MotionTypes;

function Motion(topic, proposedBy, s, type, listDuration, speechDuration) {

  function generateId(topic, name, session){
    var str = topic + name + Date.now();
    var id = util.hashCode(str);   
    //check if the Id was already used
    //if it wasn't call generateId again
    //the new timestamp should result in a new hash
    var ids = session.motions.map(function(e){
      return e.id;
    });
    if (ids.indexOf(id.toString()) === -1)
    {
      return id;
    }
    else
    {
      return generateId(topic+' ', name, session);
    }
  }

  this.topic = topic;
  this.proposedBy = proposedBy;
  this.session = s;
  this.type = type;
  this.listDuration = undefined;
  this.speechDuration = undefined;
  this.state = MotionStates.OPENED;
  this.id = generateId(topic,
             this.session.getAttendeeById(proposedBy).name,
             this.session);
  this.extended = false;
  this.extensionTime = undefined;
  this.speakerslist = undefined;
  //TODO extension vote results

  //vote results
  this.votesFor = -1;
  this.overwhelmingMajority = false;
  this.simpleMajority = -1;

  switch(this.type)
  {
    case MotionTypes.UNMODERATED_CAUCUS:
      this.listDuration = listDuration;
      break;

    case MotionTypes.MODERATED_CAUCUS:
      this.listDuration = listDuration;
      this.speechDuration = speechDuration;
      break;

    case MotionTypes.OTHER: // jshint ignore:line
    //fallthrough
    default:
      break;
  }

}

Motion.prototype.getSpeakersList = function(){
  if((this.state === MotionStates.VOTED_PASSED ||
    this.state === MotionStates.VOTED_PASSED_EXTENDED ||
      this.state === MotionStates.DONE) &&
     this.type === MotionTypes.MODERATED_CAUCUS)
  {
    if(this.speakerslist === undefined)
    {
      var sl = new SpeakersList(this.topic,
                    this.speechDuration,
                    this.session,
                    this.listDuration * 60,
                    this);
      this.session.speakerslists[sl.id] = sl;
      this.session.updateSpeakerslistsHashCode();
      this.speakerslist = sl;
    }
    return this.speakerslist.id;
  }
};

Motion.prototype.isExtendable = function(){
  return (this.state === MotionStates.VOTED_PASSED ||
       this.state === MotionStates.DONE) &&
       this.extended === false;
};

Motion.prototype.extend = function(overwhelmingMajority, simpleMajority, inFavor, time){
  var result = false;
  if (this.isExtendable())
  {
    if(overwhelmingMajority)
    {
      this.extended = true;
      this.extensionTime = time;
      result = true;
    } else if(inFavor >= simpleMajority)
    {
      this.extended = true;
      this.extensionTime = time;
      result = true;
    } else
    {
      this.extended = false;
      this.extensionTime = undefined;
      result = false;
    }
  }
  return result;
};

Motion.prototype.complete = function(){
  if (this.state === MotionStates.VOTED_PASSED ||
    this.state === MotionStates.VOTED_PASSED_EXTENDED)
  {
    this.state = MotionStates.DONE;
  }
};

Motion.prototype.delete = function(){
  this.state = MotionStates.DELETED;
};

Motion.prototype.vote = function(overwhelmingMajority, simpleMajority, inFavor){
  var result = false;
  if(overwhelmingMajority)
  {
    this.state = MotionStates.VOTED_PASSED;
    this.overwhelmingMajority = true;
    result = true;
  } else if(inFavor >= simpleMajority)
  {
    this.state = MotionStates.VOTED_PASSED;
    this.votesFor = inFavor;
    this.simpleMajority = simpleMajority;
    result = true;
  } else
  {
    this.state = MotionStates.VOTED_FAILED;
    result = false;
  }
  return result;
};

Motion.prototype.toSimpleObject = function()
{
  var obj = {topic: this.topic,
         type: this.type,
         listDuration: this.listDuration,
         speechDuration: this.speechDuration,
         state: this.state,
         proposedBy: this.proposedBy,
         id: this.id,
         votesFor: this.votesFor,
         overwhelmingMajority: this.overwhelmingMajority,
         simpleMajority: this.simpleMajority,
         extended: this.extended,
         extensionTime: this.extensionTime};
  if (this.speakerslist !== undefined)
  {
    obj.speakerslist = this.speakerslist.id;
  }
  else
  {
    obj.speakerslist = undefined;
  }
  return obj;

};

Motion.prototype.toJSON = function()
{
  return JSON.stringify(this.toSimpleObject());
};	

return Motion;

});