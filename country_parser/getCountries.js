var http = require('http');
var cheerio = require('cheerio');

var options = {
  host: 'www.un.org',
  path: '/en/members/'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    // console.log(str);
    $ = cheerio.load(str);
    var foo = $('ul > li > ul').find('li.countryname').each(function(i, obj){
      var name = $(obj).text();
      // var shortname = $($(obj).find('a').last()).attr('title');
      // name = name
      name = name.trim()
             .replace(/(?:\r\n|\r|\n)/g, ' ')
             .replace('*', '').trim();
      console.log(name);
    });
  });
}

http.request(options, callback).end();
