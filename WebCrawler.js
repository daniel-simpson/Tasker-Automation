tk.setLocal('webcrawlerreturn', 0);
tk.flash('start');

if(weburl.length < 1) {
	tk.flash('Web Crawler error: URL parameter cannot be null.');
	tk.exit();
}

if(selector.length < 1) {
	tk.flash('Web Crawler error: selector parameter cannot be null.');
	tk.exit();
}

if(search.length > 0) {
	regex = new RegExp(search);
}

$.ajax(
	{
		url: '' + weburl,
		context: document.body,
		
		success: function(data) {
			var page = $.parseHTML(data);
    var selectedValue = $(page).find(selector).text().trim();

			if(search.length == 0) {
				tk.setLocal('webcrawlerreturn', selectedValue);
			} else {
				var match = selectedValue.match(regex);
				tk.setLocal('webcrawlerreturn', match);
			}			
			tk.exit();
		},
		
		error: function() {
			tk.flash('Web Crawler error: Unable to fetch ' + URL)
			tk.exit();
		}
	}
);