//Set up require.js
requirejs.config({
	shim : {
        "bootstrap" : { "deps" :['jquery'] }
    },
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-1.11.2.min',
        bootstrap: 'vendor/bootstrap.min'
    }
});

//Start script
requirejs(['jquery', 'UI', 'munToolLib', 'bootstrap'],
function   ($,        UI,   munToolLib) {
	var session = new munToolLib.Session();
	var UI = new UI(session);
	UI.setupUI();
});


