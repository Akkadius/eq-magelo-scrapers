// const request = require('request');

var request = require('requestretry');

var mysql = require('mysql');

var config = require('./config.json');

var con = mysql.createConnection({
	host: "localhost",
	user: config.mysql_user,
	password: config.mysql_password,
	database: config.mysql_database
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	
	/*
	con.query(
		'DELETE FROM `magelo_npc_loot_parse`',
		function (err, results) {
			console.log(err);
		}
	);
	*/
	
});

function get_unix_time() {
	return Math.round((new Date()).getTime() / 1000);
}

var zone_id = 181;
zone_npc_data = [];

/* Load Zones List from zones.js */
var fs = require('fs');
var data = fs.readFileSync('./zones.js', 'utf8');
eval(data);
// console.log(zones);
/* Zones now accessible from zones[] */

var last_poll_action_time = get_unix_time();

var zone_array_length = zones.length;
for (var i = 0; i < zone_array_length; i++) {
	
	var zone_id = zones[i][0];
	var zone_sn = zones[i][1];
	var zone_ln = zones[i][2];
	
   	(function(zone_id, zone_sn){
		request('https://eq.magelo.com/zone/' + zone_id, function (error, response, body) {
			
			if(error)
				console.log('error:', error); // Print the error if one occurred 
			
			// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 

			zone_npc_data[zone_id] = [];
			index = 0;
			
			if(typeof body === "undefined")
				return false;
			
			if(body == "")
				return false;
			
			if(error)
				return false;
			
			var cheerio = require('cheerio'),
			$ = cheerio.load(body);
			
			$( "script" ).each(function() {
				script = $( this ).html();
				
				if(!/var data/.test(script)){
					return true;
				}

				var data1 = script.split("var data=(function(){return");
				var data2 = data1[1].split(";})();");

				/* Eval the loot array block */
				eval("npc_data = " + data2[0]);
				
				/* Data Iterate */
				var array_length = npc_data.length;
				for (var i = 0; i < array_length; i++) {
					
					zone_npc_data[zone_id][index] = [];
					
					/* Pull out Vars */
					npc_id = npc_data[i][0];
					npc_name = npc_data[i][1];
					min_lvl = npc_data[i][3][0];
					max_lvl = npc_data[i][3][1];
					
					/* Debug Print */
					
					/*
					console.log("npc_id: %s", npc_id);
					console.log("npc_name: %s", npc_name);
					console.log("min_lvl: %s", min_lvl);
					console.log("max_lvl: %s", max_lvl);
					console.log("\n");
					*/
					
					
					/* Store npc_data array for zone */
					zone_npc_data[zone_id][index] = [npc_id, npc_name, min_lvl, max_lvl];
					
					index++;
				}
				console.log('Zone: %s NPCs: %s', zone_sn, array_length);
			});

			last_poll_action_time = get_unix_time();
		});
	})(zone_id, zone_sn);
}

var zone_index = 0;
setInterval(function() {
	current_time = get_unix_time();
	if(current_time > (last_poll_action_time + 1)){
		console.log("Ready to poll");
		
		var zone_id = zones[zone_index][0];
		var zone_sn = zones[zone_index][1];
		var zone_ln = zones[zone_index][2];
		
		parse_zone_npcs(zone_id, zone_sn);
		
		zone_index++;
	}
	else { 
		console.log("Still polling zones");
	}

}, 500);

function parse_zone_npcs(l_zone_id, l_zone_sn){
	var index = 0;
	
	while(zone_npc_data[l_zone_id][index]){
		/* Pull out Vars */
		npc_id = zone_npc_data[l_zone_id][index][0];
		npc_name = zone_npc_data[l_zone_id][index][1];
		min_lvl = zone_npc_data[l_zone_id][index][2];
		max_lvl = zone_npc_data[l_zone_id][index][3];
		
		/* Debug Print */
		/*
		console.log("npc_id: %s", npc_id);
		console.log("npc_name: %s", npc_name);
		console.log("min_lvl: %s", min_lvl);
		console.log("max_lvl: %s", max_lvl);
		console.log("\n");
		*/	
		
		(function(npc_id, npc_name, min_lvl, max_lvl){
			
			var insert_data = [];
			var query_params = "";
			
			request(
			
			{
				url: 'https://eq.magelo.com/npc/' + npc_id,
				maxAttempts: 100,
				retryDelay: 5000,
				retrySrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
			}
			, function (error, response, body) {
				if(error)
					console.log('error:', error); // Print the error if one occurred 
				
				// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
				
				// console.log("npc_id: " + npc_id);
				
				/*
				if(typeof body === "undefined")
					return false;
				
				if(body == "")
					return false;
				*/
				
				var cheerio = require('cheerio'),
				$ = cheerio.load(body);
				
				$( "script" ).each(function() {
					script = $( this ).html();
					
					if(!/var data/.test(script)){
						return true;
					}

					/*
					*	Parse loot data block
					*/
					var data1 = script.split("var data=(function(){return");
					
					if(typeof data1[1] === "undefined")
						return false;
					
					var data2 = data1[1].split(";})();");

					/* Eval the loot array block */
					eval("loot_data = " + data2[0]);
					
					/* Data Iterate */
					var array_length = loot_data.length;
					for (var i = 0; i < array_length; i++) {
						
						/* Pull out Vars */
						item_id = loot_data[i][0];
						item_name = loot_data[i][2][0];
						item_icon_url = loot_data[i][1];
						
						observed_drops = loot_data[i][7][2];
						total_observed_drops = loot_data[i][7][3];
						drop_percent = (observed_drops / total_observed_drops) * 100;
						
						
						insert_data.push(l_zone_id);
						insert_data.push(npc_name);
						insert_data.push(item_id);
						insert_data.push(item_name);
						insert_data.push(l_zone_sn);
						insert_data.push(observed_drops);
						insert_data.push(total_observed_drops);
						insert_data.push(drop_percent);
						insert_data.push(min_lvl);
						insert_data.push(max_lvl);
						
						query_params = query_params + "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ";
						
						/* Debug Print */
						// console.log("item_id: %s", item_id);
						// console.log("observed_drops: %s", observed_drops);
						// console.log("observed drops: %s", total_observed_drops);
						// console.log("drop_percent: %s", drop_percent.toFixed(6));
						// console.log("\n");
					}
					
					con.query(
						'REPLACE INTO `magelo_npc_loot_parse` (zone_id, npc_name, item_id, item_name, zone_sn, observed_drops, total_observed_drops, drop_rate, npc_lvl_min, npc_lvl_max) ' +
						'VALUES ' + query_params.slice(0, -2), 
						insert_data, 
						function (err, results) {
							if(err)
								console.log(err);
						}
					);
					
					console.log("npc_id: %s npc_name: %s total drops %s", npc_id, npc_name, array_length);
					
					last_poll_action_time = get_unix_time();
					
				});
			});
		})(npc_id, npc_name, min_lvl, max_lvl);
		
		index++;
	}
}


return;

