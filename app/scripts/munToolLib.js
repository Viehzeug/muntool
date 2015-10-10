/**
 * @module munToolLib
 */

var SessionModes = {};
SessionModes.SPEAKERSLIST = 0;
SessionModes.SPEAKERSLIST_MOD = 1;
SessionModes.UNMOD = 2;

var MotionTypes = {};
MotionTypes.UNMODERATED_CAUCUS = 0;
MotionTypes.MODERATED_CAUCUS = 1;
MotionTypes.OTHER = 2;

var MotionStates = {};
MotionStates.OPENED = 0;
MotionStates.VOTED_PASSED = 1;
MotionStates.VOTED_FAILED = 2;
MotionStates.DONE = 3;
MotionStates.DELETED = 4;
MotionStates.VOTED_PASSED_EXTENDED = 5;


//TODO statistik panel

function Motion(topic, proposedBy, s, type, listDuration, speechDuration) {

	function generateId(topic, name, session){
		var str = topic + name + Date.now();
		var id = hashCode(str);		
		//check if the Id was already used
		//if it wasn't call generateId again
		//the new timestamp should result in a new hash
		var ids = session.motions.map(function(e){
			return e.id;
		});
		if (ids.indexOf(id) == -1)
			return id;
		else
			return generateId(topic+' ', name, session);
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

		case MotionTypes.OTHER:
		default:
			break;
	}

}

Motion.prototype.getSpeakersList = function(){
	if((this.state == MotionStates.VOTED_PASSED ||
		this.state == MotionStates.VOTED_PASSED_EXTENDED ||
	    this.state == MotionStates.DONE)
	   && this.type == MotionTypes.MODERATED_CAUCUS)
	{
		if(this.speakerslist == undefined)
		{
			var sl = new SpeakersList(this.topic,
									  this.speechDuration,
									  this.session,
									  this.listDuration * 60,
									  this);
			this.session.speakerslists.push(sl);
			this.session.updateSpeakerslistsHashCode();
			this.speakerslist = sl;
		}
		return this.speakerslist.name;
	}
}

Motion.prototype.isExtendable = function(){
	return (this.state == MotionStates.VOTED_PASSED ||
		   this.state == MotionStates.DONE)
		   && this.extended == false;
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
	if (this.state == MotionStates.VOTED_PASSED ||
		this.state == MotionStates.VOTED_PASSED_EXTENDED)
		this.state = MotionStates.DONE;	
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
	if (this.speakerslist != undefined)
	{
		obj.speakerslist = this.speakerslist.name;
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



//Java's String.hashCode()
//source: http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
function hashCode(str){
    var hash = 0;
    if (str.length === 0) {return hash;}
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i); //TODO use other name than char
        hash = ((hash<<5)-hash)+char; // jshint ignore:line
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

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
		var id = hashCode(str);		
		//check if the Id was already used
		//if it wasn't call generateId again
		//the new timestamp should result in a new hash
		var attendeeIds = session.getAttendeeIds();
		if (attendeeIds.indexOf(id) == -1)
			return id;
		else
			return generateId(name, session);
	}

	this.name = name;
	this.attendeeId = generateId(name, s);
	this.session = s;
}

Attendee.prototype.getNumberOfSpeeches = function()
{
	var self = this;
	var sum = 0;
	this.session.speakerslists.forEach(function(e){
		sum += self.getNumberOfSpeechesOnList(e);
	});
	return sum;
};

Attendee.prototype.getNumberOfSpeechesOnList = function(list)
{
	var self = this;
	return list.speeches.filter(function(e){
		return self.attendeeId == e.speaker.attendeeId;
	}).length;
};

Attendee.prototype.getNumberOfSpeechesOnCurrentList = function()
{
	return this.getNumberOfSpeechesOnList(this.session.currentSpeakersList());
};


Attendee.prototype.toSimpleObject = function()
{
	return {name: this.name,
			attendeeId: this.attendeeId};
};

Attendee.prototype.toJSON = function()
{
	return JSON.stringify(this.toSimpleObject());
};

var SpeechStates = {};
SpeechStates.UPCOMING = 0;
SpeechStates.CURRENT_UNSTARTED = 1;
SpeechStates.CURRENT_RUNNING = 2;
SpeechStates.CURRENT_DONE = 3;
SpeechStates.DONE = 4;

function Speech(speaker, duration, s) {
	/*** OOP Constructs ***/
	this.speaker = speaker;
	this.duration = duration;
	this.state = SpeechStates.UPCOMING;
	this.startTime = undefined;
	this.session = s;
	this.timeout = undefined;

}

Speech.prototype.getHashCode = function(){
	var str = this.speaker.attendeeId + this.duration +
			  this.state + this.startTime;
	return hashCode(str);
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
	if (this.state == SpeechStates.CURRENT_UNSTARTED)
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
		this.state = SpeechStates.CURRENT_UNSTARTED;
}

Speech.prototype.isRunning = function(){
	return this.state == SpeechStates.CURRENT_RUNNING;
}

Speech.prototype.isUpcoming = function(){
	return this.state == SpeechStates.UPCOMING ||
		   this.state == SpeechStates.CURRENT_UNSTARTED;
};

Speech.prototype.isDone = function(){
	return this.state == SpeechStates.CURRENT_DONE ||
		   this.state == SpeechStates.DONE;
}

Speech.prototype.reset = function(){
	if (this.state >= SpeechStates.CURRENT_UNSTARTED)
	{
		if (this.timeout != undefined)
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
	if (this.state == SpeechStates.CURRENT_RUNNING)
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


/**
 * SpeakersList
 * @class
 * @param  {string} name - Name of the Speakers List.
 * @param  {number} duration - Duration of a Speech on the Speakrslist.
 * @param  {Session} session - Current session.
 */
function SpeakersList(name, duration, s, listDuration, motion){
	/*** OOP Constructs ***/	
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
	this.duration = duration;
	this.speeches = [];
	this.currentSpeechId = -1;
	this.startedForModeratedCaucus = motion;
	//listDuration == 0 <==> infinity
	if(listDuration != undefined)
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

SpeakersList.prototype.extend = function(overwhelmingMajority, inFavor, time){
	if(this.isMotion())
	{
		this.startedForModeratedCaucus.extend(overwhelmingMajority,
											  this.session.getSimpleMajority(),
											  inFavor,
											  time);
		this.listDuration += 60 * this.startedForModeratedCaucus.extensionTime;
		this.session.updateSpeakerslistsHashCode();
	}
};

SpeakersList.prototype.isExtendable = function(){
	return (this.isMotion() &&
			this.startedForModeratedCaucus.isExtendable());
};

SpeakersList.prototype.isMotion = function(){
	return (this.startedForModeratedCaucus != undefined);
};

SpeakersList.prototype.hasTimelimit = function(){
	return (this.listDuration != 0);
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
	if (this.listDuration == 0)
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
			  this.currentSpeechId;
	str += this.speeches.map(function(s){
		return s.getHashCode();
	}).join();
	return hashCode(str);
};

SpeakersList.prototype.toSimpleObject = function()
{
	var obj = {name: this.name,
			   duration: this.duration,
			   speeches: this.speeches.map(function(e){ return e.toSimpleObject();}),
			   currentSpeechId: this.currentSpeechId,
			   listDuration: this.listDuration};

	if (this.startedForModeratedCaucus != undefined)
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
	this.speeches.push(new Speech(speaker, this.duration, this.session));
	session.updateSpeakerslistsHashCode();
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
		return this.speeches[this.currentSpeechId+1];
};

//TODO comment me
SpeakersList.prototype.getCurrentSpeech = function(){
	if (this.hasCurrentSpeech())
		return this.speeches[this.currentSpeechId];
};

SpeakersList.prototype.advanceToNextSpeech = function(){
	if (this.hasNextSpeech())
	{
		if (this.hasCurrentSpeech())
			this.getCurrentSpeech().end();			
		this.currentSpeechId++;
		console.log('Going to speech ' + this.currentSpeechId);
		this.getCurrentSpeech().setCurrent();
		return this.getCurrentSpeech();
	}
};


/**
 * Session
 * @class
 */
function Session(){
	/*** OOP Constructs ***/

	this.attendees = {};
	this.attendeesHashCode = '';
	this.updateAttendeeHash();
	
	this.motions = [];
	this.speakerslists = [];
	//add General Speakers List as speakers list
	this.newSpeakersList('General Speakers List', 45, 0);
	this.currentSpeakersListId = 0;
	this.speakerslistsHashCode = '';
	this.updateSpeakerslistsHashCode();

	this.constants = {};
	this.constants.MotionTypes = MotionTypes;
	this.constants.SessionModes = SessionModes;
	this.constants.SpeechStates = SpeechStates;
	this.constants.MotionStates = MotionStates;

}

Session.prototype.toSimpleObject = function()
{
	return {attendees: this.getAttendees().map(function(e){ return e.toSimpleObject();}),
			motions: this.motions.map(function(e){ return e.toSimpleObject();}),
			speakerslists: this.speakerslists.map(function(e){ return e.toSimpleObject();}),
			currentSpeakersListId: this.currentSpeakersListId};
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
// countries = countries.filter(function(e){ return (e != undefined && e != null);})
// JSON.stirngify(countries)
Session.prototype.autocompleteMembers = function(){

	var attendees = this.getAttendees().map(function(e){
		return e.name;
	});

	return members.filter(function(e){
		return (attendees.indexOf(e) == -1);
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
Session.prototype.setCurrentSpeakersList = function(name){
	var l = this.speakerslists.map(function(e, index){
		return {index: index, val:e};
	}).filter(function(e){
		return e.val.name == name;
	});
	if (l.length > 0)
	{
		this.currentSpeakersListId = l[0].index;
	} else
	{
		//TODO raise error
	}
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
	this.speakerslists.push(new SpeakersList(name, duration, this, listDuration, undefined));
	this.log('opening speakerslist ' + name + 'with a speech duration of ' + duration);
	//todo maybe reutrn id
	this.updateSpeakerslistsHashCode();
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
	this.currentSpeakersList().add(this.attendees[attendeeId]);
	this.log('added ' + attendeeId + 'to the speakerslist');
	this.updateSpeakerslistsHashCode();
};

Session.prototype.newMotion = function(type, proposedBy, topic, listDuration, speechDuration) {
	this.motions.push(new Motion(topic, proposedBy, this, type, listDuration, speechDuration));
};

Session.prototype.updateAttendeeHash = function(){
	var str = Object.keys(this.attendees).join();
	this.attendeesHashCode = hashCode(str);
};

Session.prototype.updateSpeakerslistsHashCode = function(){
	var str = this.speakerslists.map(function(e){ return e.getHashCode();}).join();
	this.speakerslistsHashCode = hashCode(str);
};

Session.prototype.getNumberOfAttendees = function() {
	return Object.keys(this.attendees).length;
};

Session.prototype.getSimpleMajority = function() {
	return Math.ceil((this.getNumberOfAttendees()+1) / 2);
};

Session.prototype.getMotionById = function(id) {
	var filtered = this.motions.filter(function(e){
		return (e.id == id);
	});
	if (filtered.length > 0)
		return filtered[0];
};

Session.prototype.getOpenMotions = function() {
	var self = this;
	return this.motions.filter(function(e){
		return (e.state == MotionStates.OPENED);
	}).map(function(e){
		var obj = e.toSimpleObject();
		obj.proposedByText = self.getAttendeeById(e.proposedBy).name;
		switch(obj.type)
		{

			case MotionTypes.UNMODERATED_CAUCUS:
				obj.typeText = "Unmoderated Caucus";
				break;

			case MotionTypes.MODERATED_CAUCUS:
				obj.typeText = "Moderated Caucus";
				break;

			case MotionTypes.OTHER:
			default:
				obj.typeText = "Motion";
		}
		return obj;
	});
}

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
	var a = new Attendee(name, this);
	this.attendees[a.attendeeId] = a;
	this.log(name + ' (' + a.attendeeId + ') entered the debate');
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
	Object.keys(this.attendees).forEach(function (key) {
		attendees.push(self.attendees[key]);
	});
	attendees.sort(function(a,b){
		return a.name.localeCompare(b.name);
	});
	return attendees;
}

//TODO comment me
Session.prototype.getAttendeeById = function(id)
{
	return this.attendees[id];
}

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
	return Object.keys(this.attendees);
}

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
	delete this.attendees[id];
	log(a.name + ' (' + a.attendeeId + ') left the debate');
	this.updateAttendeeHash();
};




Session.prototype.deleteMotion = function(id) {
	var motion = this.getMotionById(id);
	motion.delete();
};


Session.prototype.voteMotion = function(id, overwhelmingMajority, inFavor) {
	var motion = this.getMotionById(id);
	return motion.vote(overwhelmingMajority, this.getSimpleMajority(), inFavor);
};

var muntoolJSONLoader = {};
muntoolJSONLoader.load = function(json)
{
	var obj = JSON.parse(json);
	var session = new Session();

	session.currentSpeakersListId = obj.currentSpeakersListId;
	session.attendees = {};
	obj.attendees.forEach(function(e){		session.attendees[e.attendeeId] = new Attendee(e.name, session);
		session.attendees[e.attendeeId].attendeeId = e.attendeeId;
	});
	session.speakerslists = [];
	obj.speakerslists.forEach(function(e){
		var list = new SpeakersList(e.name, e.duration, session, e.listDuration);
		list.currentSpeechId = e.currentSpeechId;
		list.speeches = [];
		e.speeches.forEach(function(s){
			var speech = new Speech(session.getAttendeeById(s.speaker), s.duration, session);
			speech.state = s.state;
			e.startTime = new Date(); //TODO use date
			list.speeches.push(speech);
		});
		session.speakerslists.push(list);
	});

	session.motions = [];
	obj.motions.forEach(function(e){
		var motion = new Motion(e.topic, e.proposedBy, session,
								e.type, e.listDuration,
								e.speechDuration);
		motion.id = e.id;
		motion.votesFor = e.votesFor;
		motion.overwhelmingMajority = e.overwhelmingMajority;
		motion.simpleMajority = e.simpleMajority;
		motion.state = e.state;
		motion.extended = e.extended;
		motion.extensionTime = e.extensionTime;
		if (e.speakerslist != undefined)
		{
			var l = session.speakerslists.map(function(sl, index){
				return {index: index, val:sl};
			}).filter(function(sl){
				return sl.val.name == e.speakerslist;
			});
			if (l.length > 0)
			{
				motion.speakerslist = l[0].val;
				l[0].val.startedForModeratedCaucus = motion;
			}
			
		} else
		{
			motion.speakerslist = undefined;
		}


		session.motions.push(motion);
	});

	session.updateSpeakerslistsHashCode();
	session.updateAttendeeHash();
	return session;
};