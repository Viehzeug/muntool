'use strict';
define(['./Constants',
        './util'],
        function(Constants,
                 util){

var SpeechStates = Constants.SpeechStates;

function Speech(speaker, duration, s, sl) {
  /*** OOP Constructs ***/
  this.speaker = speaker;
  this.duration = duration;
  this.state = SpeechStates.UPCOMING;
  this.startTime = undefined;
  this.session = s;
  this.timeout = undefined;
  this.speakerslist = sl;
}

Speech.prototype.delete = function(){
  if(this.isUpcoming())
  { //TODO add speakerslist ppinter to speech and use this instead
    for (var i = 0; i < this.speakerslist.speeches.length; i++) {
      if (this.speakerslist.speeches[i] === this)
      {
        this.speakerslist.speeches.splice(i, 1);
      }
    }
    this.session.updateSpeakerslistsHashCode();
    //TODO make better
    delete this; // jshint ignore:line
  }
};

Speech.prototype.getHashCode = function(){
  var str = this.speaker.attendeeId + this.duration +
        this.state + this.startTime;
  return util.hashCode(str);
};

Speech.prototype.toSimpleObject = function()
{
  return {speaker: this.speaker.attendeeId,
      duration: this.duration,
      state: this.state,
      startTime: this.startTime};
};

Speech.prototype.toJSON = function()
{
  return JSON.stringify(this.toSimpleObject());
};

Speech.prototype.start = function(){
  if (this.state === SpeechStates.CURRENT_UNSTARTED)
  {
    console.log('Speech by ' + this.speaker.name + ' now running');
    this.state = SpeechStates.CURRENT_RUNNING;
    this.startTime = new Date();
    var self = this;
    this.timeout = setTimeout(function(){
      self.state = SpeechStates.CURRENT_DONE;
      self.timeout = undefined;
      console.log('Speech by ' + self.speaker.name + ' now done');
    },
    //add half a second to counteract UI delays etc.
    this.duration * 1000 + 500);
  }
};

Speech.prototype.setCurrent = function(){
  console.log('Speech by ' + this.speaker.name + ' is now the current speech');
  if (this.state < SpeechStates.CURRENT_UNSTARTED)
  {
    this.state = SpeechStates.CURRENT_UNSTARTED;
  }
};

Speech.prototype.isRunning = function(){
  return this.state === SpeechStates.CURRENT_RUNNING;
};

Speech.prototype.isUpcoming = function(){
  return this.state === SpeechStates.UPCOMING ||
       this.state === SpeechStates.CURRENT_UNSTARTED;
};

Speech.prototype.isDone = function(){
  return this.state === SpeechStates.CURRENT_DONE ||
       this.state === SpeechStates.DONE;
};

Speech.prototype.reset = function(){
  if (this.state >= SpeechStates.CURRENT_UNSTARTED)
  {
    if (this.timeout !== undefined)
    {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.startTime = undefined;
    this.state = SpeechStates.CURRENT_UNSTARTED;
    console.log('Speech by ' + this.speaker.name + ' has been reset');
  }
};


Speech.prototype.end = function(){
  if (this.state === SpeechStates.CURRENT_RUNNING)
  {
    clearTimeout(this.timeout);
  }
  this.state = SpeechStates.DONE;
  console.log('Speech by ' + this.speaker.name + ' has ended and now done');
};

Speech.prototype.secondsLeft = function(){
  var timeElapsed = (new Date()) - this.startTime;
  return Math.max(0, Math.round(this.duration - timeElapsed/1000));
};

	return Speech;
});