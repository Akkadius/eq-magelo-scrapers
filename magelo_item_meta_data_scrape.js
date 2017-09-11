var request = require('requestretry');

console.log("\n");
console.log("Note: Script relies on items table data to get item_id's");
console.log("\n");

var mysql = require('mysql');
var config = require('./config.json');
var con = mysql.createConnection({
	host: "localhost",
	user: config.mysql_user,
	password: config.mysql_password,
	database: config.mysql_database
});

var items = [];
con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	
	con.query("select id FROM items GROUP BY id", function (err, result, fields) {
		if (err) throw err;
		
		for (var i = 0; i < result.length; i++) {
			items.push(result[i].id);
		}
		// process.exit(1);
	});
});

last_poll_action_time = get_unix_time();

setTimeout(function(){ 
	var index = 0;
	setInterval(function() {
		current_time = get_unix_time();
		if(current_time > (last_poll_action_time + 10)){
			// console.log("Ready to poll");
			poll_item(items[index]);
			
			if(!items[index]){
				process.exit(1);
			}
			
			index++;
		}
		else { 
			// console.log("Still polling");
		}

	}, 10);
}, 2000);

function get_unix_time() {
	return Math.round((new Date()).getTime());
}

function poll_item (item_id) {
	(function(item_id){
		request(
		{
			url: 'https://eq.magelo.com/item/' + item_id,
			maxAttempts: 100,
			retryDelay: 5000,
			retrySrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
		}
		, 
		function (error, response, body) {
			if(error)
				console.log('error:', error); // Print the error if one occurred 
			
			if(typeof body === "undefined")
				return false;
			
			if(body == "")
				return false;
			
			if(error)
				return false;
			
			console.log("Polling item: %s", item_id);
			
			var cheerio = require('cheerio'),
			$ = cheerio.load(body);
			
			initial_entry = 0;
			initial_entry_human = "";
			last_updated = 0;
			last_updated_human = "";
			
			$( "table td" ).each(function() {
				html = $( this ).html();
			
				if(/PM|AM/.test(html)){
					
					date = new Date(html).toLocaleDateString();
					time = new Date(html).toLocaleTimeString();
					unix_time = Math.round((new Date(html)).getTime() / 1000);
					
					if(initial_entry == 0){
						initial_entry = unix_time;
						initial_entry_human = date + ' ' + time;
					}
					else if(last_updated == 0){
						last_updated = unix_time;
						last_updated_human = date + ' ' + time;
					}
					
					// console.log("entry: %s date: %s time: %s unix_time: %s", html, date, time, unix_time);
					
					insert_data = [item_id, initial_entry, initial_entry_human, last_updated, last_updated_human];
					
				}
			});
			
			// console.log("initial: %s last: %s", initial_entry_human, last_updated_human);
			
			if(initial_entry == 0 && last_updated == 0)
				return false;
			
			console.log(insert_data);
			
			con.query(
				'REPLACE INTO `magelo_item_meta_data` (item_id, initial_entry_date_unix, initial_entry_date_human, last_updated_date_unix, last_updated_date_human) ' +
				'VALUES (?, ?, ?, ?, ?)', 
				insert_data, 
				function (err, results) {
					if(err)
						console.log(err);
				}
			);
			
			last_poll_action_time = get_unix_time();
			
		});
	})(item_id);
}