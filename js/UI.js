/**
 * @module UI
 */
define (["jquery", "util", "munToolLib"],
function ($,        util,   munToolLib){

	// extracted from wikipedia (https://en.wikipedia.org/wiki/Member_states_of_the_United_Nations) via:
	// countries = [];
	// $('table.wikitable > tbody > tr td:first-child a').each(function(){ console.log($(this).attr('title'))})
	// countries = countries.filter(function(e){ return (e != undefined && e != null);})
	// JSON.stirngify(countries)
	var members = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","The Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cape Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Republic of the Congo","Costa Rica","Ivory Coast","Croatia","Cuba","Cyprus","Czech Republic","North Korea","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","The Gambia","Georgia (country)","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Republic of Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Federated States of Micronesia","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Burma","Namibia","Nauru","Nepal","Kingdom of the Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","South Korea","Moldova","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Tajikistan","Thailand","Republic of Macedonia","East Timor","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","Tanzania","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
	//TODO countries can have flags, synonym ("north korea", china)

//patch jquery
//https://www.darklaunch.com/2013/08/06/jquery-next-prev-with-wrapping
(function( $ ) {
    $.fn.nextWrap = function( selector ) {
        var $next = $(this).next( selector );
 
        if ( ! $next.length ) {
            $next = $(this).parent().children( selector ).first();
        }
 
        return $next;
    };
 
    $.fn.prevWrap = function( selector ) {
        var $previous = $(this).prev( selector );
 
        if ( ! $previous.length ) {
            $previous = $(this).parent().children( selector ).last();
        }
 
        return $previous;
    };
})( jQuery ); //TODO call with $ handle

//TODO show possible motins points
//TODO "Overwhelming mayority button" in votes
//TODO distinction with present and (present and voting)
//FIXME adding an attendee with the Add button that is not on the list (and adding one that is actually on the list as a "country ")
//ToDO show possible ammendments at any point
/**
 * Create the UI.
 * @param  {munToolLib.Session} session The current session.
 * @class
 */
UI = (function(){
	/*** OOP Constructs ***/
	var UI = function(){ return constructor.apply(this,arguments); }
	var p = UI.prototype;
	var self;
	
	/**
	 * Local reference to the current session.
	 * @name session
	 * @memberOf module:UI~UI
	 * @instance
	 * @private
	 */
	var session;

	/*** OOP style constructor ***/
	function constructor(s){
		session = s;
		self = this;
	}

	/**
	 * Sets up the UI for the session.
	 * @method setupUI
	 * @memberOf module:UI~UI
	 * @instance
	 * @public
	 */
	p.setupUI = function(){
		//TODO members move somehwere

		//Setup autocomplete for attendance list 
		fuzzy_autocomplete('attendance-list-add-text',
			               members,    //list of all country members
			               undefined,  //members are simple Strings
			               function(e) //check if member was already added
			               		{return !util.inList(e, session.getAttendeeNames());},
			               session.newAttendee); //onFound: add as attendee if it was seleted
		
		render_speakers_list();

		//Wire the attendance list add button
		$('#attendance-list-add').click(function(){
			session.newAttendee($('#attendance-list-add-text').val());
			render_attendancelist();
		})

		//Wire the new-speakers-list button (opens speakerslist modal)
		$('#new-speakers-list').click(function(){
			//reset to defaults
			$('#new-speakers-list-name').val('');
			$('#new-speakers-list-duration').val('45');
			//show modal
			$('#NewSpeakersList').modal();
		})

		//Wire the new-speakers-list-add button (ends speakerslist modal)
		$('#new-speakers-list-add').click(function(){
			//TODO error checking
			var name = $('#new-speakers-list-name').val();
			var duration = parseInt($('#new-speakers-list-duration').val());
			session.newSpeakersList(name, duration);
			render_speakers_list();
			$('#NewSpeakersList').modal('hide');
		});
	}

	/**
	 * Atacks an array of elements and populates an HTML ul with it.
	 * @param  {string} id - HTML id of the tartget list. (without the #)
	 * @param  {Array} data - Array of elements, which are either primitives (string, integer...) or objects. 
	 * @param  {(string|undefined)} itemIdKey - If the data array was an object array, 
	 * this is used as the key to get an id for the element. If this is undefined the array element itself is used. //TODO
	 * @param  {(string|undefined)} itemIdDisplayNameKey - If the data array was an object array, 
	 * this is used as the key to get a display name for the element. If this is undefined the array element itself is used.
	 * @param  {Object.<string, string>} liAttributes Attributes that are added to the li tag as HTML attributes.
	 * Translation is obvious: key becomes key, value becomes value.
	 * @param  {boolean} itemsAreRemovable Are the list items deletable? True renders a x next to the item, which when clicked calls the onRemove function.
	 * False does not render the x.
	 * @param  {onRemove} onRemove - Callback if the delete action for the item 
	 * @memberOf module:UI~UI
	 * @inner
	 * @private
	 */
	function render_list(id,
						 data,
						 itemIdKey,
						 itemIdDisplayNameKey,
						 liAttributes,
						 itemsAreRemovable,
						 /**
						  * @callback onRemove
						  * @param  {*} element - The element object that is related to the list item for which delete is clicked.
						  */
						 onRemove)
	{
		$list = $('#'+id);
		var html = '';
		$.each(data, function(index, value){
			html += '<li data-list-index="' + index + '"';
			for (var key in liAttributes) {
			  if (liAttributes.hasOwnProperty(key)) {
			    html += ' ' + key + '="' + liAttributes[key] + '"';
			  }
			}
			if (itemIdKey != undefined)
				html += ' data-itemId="' + value[itemIdKey] + '"';
			html += '>';
			if (itemIdDisplayNameKey != undefined)
				html += value[itemIdDisplayNameKey];
			else
				html += value;
			if (itemsAreRemovable)
			{
				html += ' <span class="remove glyphicon glyphicon-remove" aria-hidden="true"></span>';
			}
			html += '</li>';
		});

		$list.html(html);
			
		if (itemsAreRemovable)
		{
			$list.find(".remove").click(function(e){
				var index = $(this).parent().data('list-index');
				onRemove(index);
			});
		}	
	}

	/**
	 * Renders the attedance list. Wrapper for {@link UI~UI~render_list}.
	 * @memberOf module:UI~UI
	 * @inner
	 * @private
	 */
	function render_attendancelist()
	{
		render_list('attendance-list',
					session.getAttendees(),
					'attendeeId', //itemIdKeykey - key for the item id
					'name', //itemIdDisplayName - key for the item display name
					{}, //no attidtional css atributes
					true, //items are deletable
					function(index){ //on delete
						session.removeAttendeeById(index);
						render_attendancelist();}
				   );
	}

	//TODO implement me
	function render_motions()
	{

	}

	/**
	 * Renders the Speakers list. This includes the current sepakers list,
	 * the speakers list menu, and the speakers list selection dropdown.
	 * @memberOf module:UI~UI
	 * @inner
	 * @private
	 */
	function render_speakers_list()
	{
		//create list of HTML links from data
		var l = session.speakerslists.map(function(e){
			return '<a role="menuitem" tabindex="-1"' +
			       'href="#" data-speakerslist-id="' +
			        e.name + '">' + e.name + '</a>';
		});

		render_list('speakers-lists-dropdown-menu',
					l,
					undefined, //we have simple string attributes, not keys
					undefined,
					{role:'presentation'}, //add role="presentation" to the <li>s
					false //no deletion
				   );

		//Wire up the selection of a speakers list in the dropdown
		$('#speakers-lists-dropdown-menu li a').click(function(e){
			session.setCurrentSpeakersList($(this).data('speakerslist-id'));
			render_speakers_list(session);
		});

		//Add the "New speakers list" option to the dropdown
		$('#speakers-lists-dropdown-menu')
			.append('<li role="presentation" class="divider"></li>')
			.append('<li role="presentation">' +
				     '<a role="menuitem" id="speakers-lists-dropdown-menu-new-list"' +
				     'tabindex="-1" href="#">Add new Speakers List</a></li>');

		//Wire up the "New speakers list" handle
		$('#speakers-lists-dropdown-menu-new-list').click(function(){
			//todo new speakerslist
			return false;
		});

		//add the dropdown symbol
		$('#speakers-lists-dropdown')
		.html(session.currentSpeakersList().name +
			  '<span class="caret"></span>');

		//Autocomplete for the textfield to add countries to the speakers list
		fuzzy_autocomplete('speakers-list-add-text',
							session.getAttendees, //TODO not a funciton..
							'name', //get the name attribute of the attendees
							undefined, //we don't need an id //TODO see whter this matters
							function(speaker) { 
								session.newSpeaker(speaker.attendeeId);
								//render speakerslist
								render_list('speakers-list',
											 session.currentSpeakersList().speakers,
											 undefined,
											 undefined,
											 {},
											 false);
							});
	}

	/**
	 * Add fuzzy search autocompletion to a given (text) input.
	 * @param  {string} id - HTML id of the tartget input. (without the #)
	 * @param  {Array} data - List that is the basis for the fuzzy autocomplete.
	 * The individual elements can either be primitive (String, Integer) or Objects.
	 * or function handle that returns [a] //TODO remove the funciton handle stuff
	 * @param  {(string|undefined)} dataSearchKey - Key that is used to search in a specifice attribute
	 * of the data list. If the list is composed of primitives, provide undefined instead.
	 * @param  {filterFun} filterFun - Used to Array.filter the data list.
	 * @param  {onFoundAndSelcted} onFound - Called when an item is found and the user selected it.
	 * @memberOf module:UI~UI
	 * @inner
	 * @private
	 */
	function fuzzy_autocomplete(id,
								data,
								dataSearchKey,
								/**
								 * Used to Array.filter the data list.
								 * @callback filterFun
								 * @param  {*} element - An elment from the data list.
								 * @return {boolean} True if element should tay in list, false otherwise.
								 */
								filterFun,
								/**
								 * meow
								 * @callback onFoundAndSelcted
								 * @param  {*}
								 * @return {*}
								 */
								onFoundAndSelcted){

		var timeout = 500; //timeout for keydown
		var timer;
		var panel;
		var target = $('#' + id);
		var displayed;

		//TODO keep cursor position when using up and down

		//TODO remove me
		if (typeof(data) == "function") data = data();

		/* Create Function handles for handling different tasks */

		//handle cleanup/exit
		 var cleanUp = function()
		 {
		    if (panel) panel.remove();
		    panel = undefined;
		    target.val('');
			if (timer) clearTimeout(timer);
		    timer = undefined;
		 }

		//handle the up key
		var handleUp = function()
		{
			if (panel) {
				active = panel.find('ul.list-group li.active');
	    		active.prevWrap().addClass('active');
	    		active.removeClass('active');
	    	}
		};

		//handle the down key
		var handleDown = function()
		{
			if (panel) {
				active = panel.find('ul.list-group li.active');
	    		active.nextWrap().addClass('active');
	    		active.removeClass('active');
	    	}
		};

		//handle the enter key
		var handleEnter = function()
		{
	     	var id = panel.find('ul.list-group li.active').data('fuzzy-serach-key');
	    	onFoundAndSelcted(displayed[id]);
			cleanUp();
	    	//render the list
	    	render_attendancelist();
		};

		//handle any other key
		var handleKey = function()
		{
			if (timer) clearTimeout(timer);

			//warpper so that we can treat primitive elments and objects the same
			var transformElement = (dataSearchKey != undefined) ?
								    function(e) {return e[dataSearchKey];} :
								    function(e) {return e;};

			timer = setTimeout(function(){
				var val = target.val();

				//filter for fuzzy search macthes
				displayed = data.filter(function(e)
						   				{
											e = transformElement(e);
						     				return (e.toLowerCase().indexOf(val.toLowerCase()) > -1)
						   				});

				//apply the give filterfunciton
				if (filterFun) displayed = displayed.filter(filterFun);

				//create panel
				if (panel)
				{
					panel.empty();
				}
				else
				{
					$('body').append('<div id="' + id +'-autocomplete"></div>');
					panel = $('#' + id + '-autocomplete');
				}
				panel.append('<ul class="list-group"></ul>')
				$ul = panel.find('ul.list-group')
				
				//TODO sort so that we really have the best
				//only display 5 best hits
				displayed = displayed.sort().slice(0, 5);
				
				//add countries to the panel
				//see that the matched part is highlighted
				var pattern = new RegExp(val, 'gi');
				displayed.forEach(function(e, index){
					var e = transformElement(e);
					var str = e.replace(pattern, function(a, b){
						return '<b>' + a + '</b>';
					});
					$ul.append('<li class="list-group-item"' +
						       'data-fuzzy-serach-key ="' +
						       index + '">'+ str +'</li>');
				});

				//mark first list entry as marked by default
				$ul.find('li:first-child').addClass('active');

				//move panel to the input element
				panel.css('width', target.outerWidth());
				panel.css('position', 'absolute');
				panel.css('top',
					      target.parent().offset().top +
					      target.outerHeight() );
				panel.css('left', target.offset().left);
			}, timeout);
		};

		/* Apply the formerly defined handles */
		target.focusout(cleanUp);
		target.keydown(function(event){
			switch(event.which) {

		        case 38: // up
		        	handleUp();
		        break;

		        case 40: // down
		        	handleDown();
		        break;

		        case 13: // enter
		        	handleEnter();
		        break;

		        default: // any other key
		        	handleKey();
			    } //end swich		
		});	//end target.keydown
	}	
	return UI;
})();

return UI;

});