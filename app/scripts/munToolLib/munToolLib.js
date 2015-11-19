'use strict';
define(['./Session',
        'json!./constants.json',
        './muntoolJSONLoader'],
        function (Session,
        		  constants,
        		  muntoolJSONLoader) {

  return {'Session': Session,
          'constants': constants,
          'muntoolJSONLoader': muntoolJSONLoader};
});