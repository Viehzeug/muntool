'use strict';
define(['./Session',
        './Attendee',
        './SpeakersList',
        './Speech',
        './Motion'],
        function (Session,
                  Attendee,
                  SpeakersList,
                  Speech,
                  Motion) {
var muntoolJSONLoader = {};
muntoolJSONLoader.load = function(json)
{
  var obj = JSON.parse(json);
  var session = new Session();

  session.currentSpeakersListId = obj.currentSpeakersListId;
  session.generalSpeakersListId = obj.generalSpeakersListId;
  session.attendees = {};
  obj.attendees.forEach(function(e){
    session.attendees[e.attendeeId] = new Attendee(e.name, session);
    session.attendees[e.attendeeId].attendeeId = e.attendeeId;
    session.attendees[e.attendeeId].status = e.status;
  });
  session.speakerslists = {};
  obj.speakerslists.forEach(function(e){
    var list = new SpeakersList(e.name, e.duration, session, e.listDuration);
    list.currentSpeechId = e.currentSpeechId;
    list.id = e.id;
    list.state = e.state;
    list.speeches = [];
    e.speeches.forEach(function(s){
      var speech = new Speech(session.getAttendeeById(s.speaker), s.duration, session);
      speech.state = s.state;
      e.startTime = new Date(); //TODO use date
      speech.speakerslist = list;
      list.speeches.push(speech);
    });
    session.speakerslists[list.id] = list;
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
    if (e.speakerslist !== undefined)
    {
      //TODO rename to speakersListKey
      motion.speakerslist = session.speakerslists[e.speakerslist];
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
  return muntoolJSONLoader;
});