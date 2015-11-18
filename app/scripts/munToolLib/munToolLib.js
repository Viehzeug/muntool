'use strict';
define(['./Session',
        './Constants',
        './muntoolJSONLoader'],
        function (Session,
        		  Constants,
        		  muntoolJSONLoader) {

  return {'Session': Session,
          'Constants': Constants,
          'muntoolJSONLoader': muntoolJSONLoader};
});