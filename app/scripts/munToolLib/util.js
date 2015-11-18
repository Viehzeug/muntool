'use strict';
define(function(){

	//Java's String.util.hashCode()
	//source: http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
	function hashCode(str){
	    var hash = 0;
	    if (str.length === 0) {return hash;}
	    for (var i = 0; i < str.length; i++) {
	        var c = str.charCodeAt(i);
	        hash = ((hash<<5)-hash)+c; // jshint ignore:line
	        // Convert to 32bit integer 
	        hash = hash & hash; // jshint ignore:line
	    }
	    return hash;
	}

	return {'hashCode': hashCode};

});

