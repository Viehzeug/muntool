/**
 * @module munToolLib
 */
define (["jquery", "util"],
function ($,        util) {

/**
 * Attendee of the session that was recognized.
 * @class
 * @param {String} name - Name of the attendee.
 * @param {Session} session - Current session.
 */
Attendee = (function(){
	/*** OOP Constructs ***/
	var Attendee = function(){ return constructor.apply(this,arguments); }
	var p = Attendee.prototype;
	var self;

	/**
	 * Name of the Attendee.
	 * @name name
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Attendee
	 */
	p.name;
	/**
	 * Unique Id of the Attendee.
	 * @name attendeeId
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Attendee
	 */
	p.attendeeId;
	
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
		//Java's String.hashCode()
		//source: http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
		var id = (function(str){
				    var hash = 0;
				    if (str.length == 0) return hash;
				    for (i = 0; i < str.length; i++) {
				        char = str.charCodeAt(i);
				        hash = ((hash<<5)-hash)+char;
				        hash = hash & hash; // Convert to 32bit integer
				    }
				    return hash;
				})(str);
		
		//check if the Id was already used
		//if it wasn't call generateId again
		//the new timestamp should result in a new hash
		var atendeeIds = session.getAttendeeIds();
		if (atendeeIds.indexOf(id) == -1)
			return id;
		else
			return generateId(name, session);;
	}

	/*** OOP style constructor ***/
	function constructor(name, session){
		this.name = name;
		this.attendeeId = generateId(name, session);
		self = this;
	}
	
	return Attendee;
})();


/**
 * SpeakersList
 * @class
 * @param  {string} name - Name of the Speakers List.
 * @param  {number} duration - Duration of a Speech on the Speakrslist.
 */
SpeakersList = (function(){
	/*** OOP Constructs ***/
	var SpeakersList = function(){ return constructor.apply(this,arguments); }
	var p = SpeakersList.prototype;
	var self;
	
	/**
	 * Name of the Speakerslist.
	 * @name name
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~SpeakersList
	 */
	p.name;
	/**
	 * Duration of a Speech on the Speakrslist.
	 * @name duration
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~SpeakersList
	 */
	p.duration;
	/**
	 * List of the IDs of the speakers in the Speakrslist.
	 * @name speakers
	 * @instance
	 * @private
	 * @memberOf module:munToolLib~SpeakersList
	 */
	var speakers;
	
	/*** OOP style constructor ***/
	function constructor(name, duration){
		this.name = name;
		this.duration = duration;
		speakers = [];
		self = this;
	}

	/**
	 * Adds a speaker to the speakerslist.
	 * @method add 
	 * @param {string} Id of a speaker. See {@link module:munToolLib~Attendee#attendeeId}.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~SpeakersList
	 */
	p.add = function(id){
		self.speakers.push(id);
	};
	
	return SpeakersList;
})();

/**
 * Session
 * @class
 */
Session = (function(){
	/*** OOP Constructs ***/
	var Session = function(){ return constructor.apply(this,arguments); }
	var p = Session.prototype;
	var self;

	//TODO make private what can be private
	/**
	 * The attendees of the session saved in an object. Key is {@link module:munToolLib~Attendee#attendeeId} and value is {@link module:munToolLib~Attendee}.
	 * @name attendees
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.attendees;
	/**
	 * List of motions.
	 * @name motions
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.motions;
	/**
	 * List of the speakslists. List of {@link module:munToolLib~SpeakersList}.
	 * @name speakerslists
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.speakerslists;
	/**
	 * Id of the current speakerslist. Array index in {@link module:munToolLib~Session#speakerslists}.
	 * @name currentSpeakersListId
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.currentSpeakersListId;

	/*** OOP style constructor ***/
	function constructor(){
		self = this;
		this.attendees = {};
		this.motions = [];
		this.speakerslists = [];

		//add General Speakers List as speakers list
		this.newSpeakersList('General Speakers List', 45);
		this.currentSpeakersListId = 0;
	}
	
	/**
	 * Adds a string to the session log.
	 * @method  log
	 * @param  {string} str - the Text.
	 * @inner
	 * @private
	 * @memberOf module:munToolLib~Session
	 */
	function log(str)
	{
		console.log('[' + (new Date()).toString() + '] ' + str);
	}

	/**
	 * Adds a speaker to the speakerslist.
	 * @method currentSpeakersList
	 * @return {module:munToolLib~SpeakersList} The currently active SpeakersList.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.currentSpeakersList = function(){
		return self.speakerslists[self.currentSpeakersListId];
	};

	/**
	 * Sets the currently active SpeakersList by name.
	 * @method setCurrentSpeakersList
	 * @param {string} name - The name of the SpeakersList that is to be set to active.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.setCurrentSpeakersList = function(name){
		var l = self.speakerslists.map(function(e, index){
			return {index: index, val:e};
		}).filter(function(e){
			return e.val.name == name;
		});
		if (l.length > 0)
		{
			self.currentSpeakersListId = l[0].index;
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
	p.newSpeakersList = function(name, duration){
		self.speakerslists.push(new SpeakersList(name, duration));
	};

	/**
	 * Adds a speaker to the current SpeakersList.
	 * @method newSpeaker
	 * @param {string} atendeeId - The [Id]{@link module:munToolLib~Attendee#attendeeId} of the speaker to be added.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.newSpeaker = function(atendeeId) {
		self.currentSpeakersList().add(atendeeId);
		log('added ' + attendeeId + 'to the speakerslist')
	};

	/**
	 * Adds a new Attendee to the session by a given name.
	 * @method newAttendee
	 * @param {string} name - The name of the new Attendee.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.newAttendee = function(name)
	{
		var a = new Attendee(name, self);
		self.attendees[a.attendeeId] = a;
		log(name + '(' + a.attendeeId + ') entered the debate');
	};

	/**
	 * Returns a list of the Attendees.
	 * @method getAttendees
	 * @return {module:munToolLib~Attendee[]} The list of attendees.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.getAttendees = function()
	{
		var attendees = [];
		Object.keys(self.attendees).forEach(function (key) {
			attendees.push(self.attendees[key]);
		});
		return attendees;
	}

	/**
	 * Returns a list of the AttendeeIds.
	 * @method getAttendeeIds
	 * @return {string[]} The list of [Attendee]{@link module:munToolLib~Attendee} Ids.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.getAttendeeIds = function()
	{
		return Object.keys(self.attendees);
	}

	/**
	 * Returns a list of the Attendee name.
	 * @method getAttendeeNames
	 * @return {string[]} The list of [Attendee]{@link module:munToolLib~Attendee} names.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.getAttendeeNames = function()
	{
		return self.getAttendees().map(function(e){return e['name'];});
	}

	/**
	 * Remove an Attendee by the [Id]{@link module:munToolLib~Attendee#attendeeId}.
	 * @method removeAttendeeById
	 * @param {string} id - The unique [Id]{@link module:munToolLib~Attendee#attendeeId} of the Attendee.
	 * @instance
	 * @public
	 * @memberOf module:munToolLib~Session
	 */
	p.removeAttendeeById = function(id)
	{
		var a = self.attendees[id];
		//TODO handle error case if there is no such id
		delete attendees[id];
		log(a.name + '(' + a.attendeeId + ') left the debate');
	}

	return Session;
})();



var munToolLib = {};
munToolLib.Session = Session;
return munToolLib; //Export munToolLib.Session

}); //require