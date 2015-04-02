/**
 * @module util
 */
define(["jquery"],
function($){

	//util wrapper object
	var util = {};

	/**
	 * Checks if element is in list.
	 * @method inList
	 * @param {*} Element - Element to be searched for.
	 * @param {Array} List - List of Elements.
	 * @return {boolean} True if element is in list, false otherwise.
	 * @memberOf module:util
	 */
	util.inList = function(e, list)
	{
		return (list.indexOf(e) != -1);
	}

	return util;
});