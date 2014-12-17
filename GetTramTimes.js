//Tasker mock setup

/*if(tk == undefined) {
	tk = {};
	tk.setLocal = function(name, value) {
		console.log("Setting variable " + name + " to: " + value);
		if(!!value) {
			eval(name + "=" + value);
		}
		return eval(name);
	};
	tk.local = function(name) {
		console.log("Retrieving Variable " + name + " as: " + eval(name));
		return eval(name);
	};
	tk.setGlobal = tk.setLocal;
	tk.global = tk.local;

	tk.flash = function(value) {
		console.log("Flashing value: " + value);
	}
	tk.exit = function() {
		alert('Complete!');
	}
	//Setup for tasker use cases.
	//to home
	tk.setLocal('stopstocheckjson', '[{"stopId":"3110","routeId":"8"},{"stopId":"3110","routeId":"1"},{"stopId":"3903","routeId":"19"}]';
	//to work
	//tk.setLocal('stopstocheckjson', '[{"stopId":"1216","routeId":"8"},{"stopId":"1216","routeId":"1"},{"stopId":"1419","routeId":"19"}]';
}*/

if(!(tk.local('stopstocheckjson'))) {
	tk.flash('stopstocheckjson variable not set.  Exiting.');
	tk.exit();
	return;
}

var URL_FORMAT = 'http://www.tramtracker.com/Controllers/GetNextPredictionsForStop.ashx?stopNo={0}&routeNo={1}&isLowFloor=false'
var results = [];
var threadsComplete = 0;
var stopsToCheck = $.parseJSON(tk.local('stopstocheckjson'));
tk.setLocal('predictionreturn', '0');

//Script setup starts here:
String.prototype.format = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var getTimeUntilTram = function(tram) {

	var arrivalTime = new Date(tram.PredictedArrivalDateTime.match(/\d+/)[0] * 1);
	var currentTime = new Date(tk.global('TIMES')*1000);
	var doubleDecaMinutes = 10 * ((arrivalTime - currentTime) / 60000);

	var ret = '' + parseInt(doubleDecaMinutes) / 10 + ' ';
	return ret;
};

var checkForExitConditions = function() {
	threadsComplete++;
	if(threadsComplete == stopsToCheck.length) {
		
		//order results
		results = results.sort(function(a,b) { return a.departsIn - b.departsIn; });
		var ret = JSON.stringify(results);
    /*var ret = "";
    for(var i=0; i<results.length; i++) {
      ret +=""+ results[i].routeId + ':' + results[i].departsIn + '   ':
    }*/

		tk.setLocal('gettramtimesreturn', ret);
		tk.exit();
	}
};

for(var i=0; i<stopsToCheck.length; i++) {
	$.getJSON(URL_FORMAT.format(stopsToCheck[i].stopId, stopsToCheck[i].routeId))
		.success(function(data) {
			for(var i=0; i<data.responseObject.length; i++)  {
				var tram = data.responseObject[i];
				results.push({
					routeId: tram.RouteNo,
					departsIn: getTimeUntilTram(tram)
				});
			}
			checkForExitConditions();
		})
		.error(function(data) {
			tk.flash("Error retrieving: " + data);
			checkForExitConditions();
		});
}
