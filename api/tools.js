module.exports = {
	/*
		Pre defined constants for MySQL Queries
	*/
	query_page_listPlayers: "SELECT player_id, name, 30*rank + 1500 as elo, \
			IFNULL(SUM(kills),0) as kills,IFNULL(SUM(deaths),0) as deaths \
			FROM players LEFT JOIN player_stats USING(steamID) \
			GROUP BY steamID ORDER BY rank DESC LIMIT ?"

	, query_list_bans: "SELECT *, TIMESTAMPDIFF(minute,`timestamp`,now()) as diff from my_bans"

	, query_player_kill_stats: "SELECT roles,kills,deaths FROM player_stats LEFT JOIN players ON players.steamID =  player_stats.steamID WHERE player_id = ?"

	, query_player_vitals: "SELECT name, steamID, lastConnect, mew as mu, sigma, 30*rank + 1500 as elo FROM players WHERE player_id = ?"

	, query_player_trueskill: "SELECT mew as mu, sigma FROM players where player_id = ?; SELECT mew as bestMu, sigma as bestSigma FROM players ORDER BY rank DESC LIMIT 1"

	, classes: ['spec','scout','sniper','soldier','demoman','medic','heavy','pyro','spy','engineer']

	/*
		Respond to data requests, and return request data
	*/
	, list_players_page: function( page, res, pool ){
		var me = this
		pool.query( me.query_page_listPlayers, 15*page, function(err,rows){
			if( rows.length > 15 )
				rows.splice(0,rows.length-15)

			res.send( JSON.stringify(rows) )
		})
	}

	, list_bans: function( res, pool ){
		var me = this
		pool.query( me.query_list_bans, function(err,rows){
			res.send( JSON.stringify(rows) )
		})
	}

	, player_kill_stats: function( player_id, res, pool ){
		var me = this
		var player = {}
		player.kill = []; player.death = [];
		player.kills = 0; player.deaths = 0;

		pool.query( me.query_player_kill_stats, player_id ).on('result', function(row){
			var clas = me.classes[row.roles]
			var kills = row.kills
			var deaths = row.deaths
			
			/* update class data object */
			player.kill.push( [clas,kills] )
			player.death.push( [clas,deaths] )

			/* update global kills and deaths */
			player.kills += kills
			player.deaths += deaths
		})
		.on('end', function(){
			res.send( JSON.stringify(player) )
		})
	}

	, player_vitals: function( player_id, res, pool ){
		var me = this
		pool.query( me.query_player_vitals, player_id, function(err,row){
			res.send( JSON.stringify(row) )
		})
	}

	, player_trueskill: function( player_id, res, pool ){
		var me = this
		pool.query( me.query_player_trueskill, player_id, function(err,rows){
			var result = {}
			result.mu = rows[0][0].mu
			result.sigma = rows[0][0].sigma
			result.bestMu = rows[1][0].bestMu
			result.bestSigma = rows[1][0].bestSigma

			res.send( JSON.stringify(rows) )
		})
	}
	
}