module.exports = {
	queryPlayers: "SELECT player_id, name, 30*rank + 1500 as elo, \
			IFNULL(SUM(kills),0) as kills,IFNULL(SUM(deaths),0) as deaths \
			FROM players LEFT JOIN player_stats USING(steamID) \
			GROUP BY steamID ORDER BY rank DESC LIMIT ?"
	, getPlayerVitals: "SELECT name, steamID, lastConnect, mew as mu, sigma, 30*rank + 1500 as elo \
			FROM players WHERE player_id = ?"
	, queryBans: "SELECT *, TIMESTAMPDIFF(minute,`timestamp`,now()) as diff from my_bans"
	, getKillStat: "SELECT roles,kills,deaths FROM player_stats WHERE steamID = ?"
	, getBest: "SELECT mew as mu,sigma FROM players ORDER BY rank DESC LIMIT 1"
	, search: "SELECT player_id, name, 30*rank + 1500 as elo, SUM(kills) as kills, SUM(deaths) as deaths \
			FROM players LEFT JOIN player_stats USING(steamID) WHERE name LIKE '%?%' \
			GROUP BY steamID ORDER BY rank LIMIT 10"
	, population: "SELECT MAX(30*rank+1500) as max, MIN(30*rank+1500) as min, AVG(30*rank+1500) as mean, STD(30*rank+1500) as sigma FROM players"

	/* 
		master function to deal with the 
		handling of get requests from db
	*/
	, dataHandler: function(req, res, pool){
		switch(req.params.data){
			case "bans":
				this.getBans(res,pool)
				break
			case "player":
				this.getPlayerData(req.params.query,res,pool)
				break
			case "page":
				this.listPlayers(req.params.query,res,pool)
				break
			case "search":
				this.searchPlayers(req.params.query,res,pool)
				break
			default:
				res.send('Down with Zionism')
		}
	}

	, getPlayerData: function(playerID,res,pool){
		var me = this; var player = {}
		if(playerID == undefined){
			res.send(JSON.stringify(player)); return
		}

		pool.getConnection(function(err,connection){
			if(err != undefined){
				res.send(JSON.stringify(player));connection.destroy()
				return
			}

			connection.query( me.getPlayerVitals, playerID , function(err,rows){
				if(err != undefined || rows[0] == undefined){
					res.send(JSON.stringify(player));connection.destroy()
					return
				}
				player = rows[0]

				/* top mu and sigma */
				connection.query( me.getBest, function(err,rows){
					player.bestMu = rows[0].mu; player.bestSigma = rows[0].sigma;

					/* get player statistics */
					connection.query( me.getKillStat, player.steamID, function(err,rows){
						me.formkillObject(rows, player)

						connection.destroy()
						res.send(JSON.stringify(player))
					})
				})
			})
		})
	}

	, formkillObject: function(mysql_data,player){
		/* define class constants */
		var classes = ['spec','scout','sniper','soldier','demoman','medic','heavy','pyro','spy','engineer'];
		player.kill = []; player.death = []; 
		player.kills = 0; player.deaths = 0;

		/* loop through mysql data */
		for (i in mysql_data){
			var role_data = mysql_data[i];

			/* grab role data from row */
			var role = classes[role_data.roles]
			var kills = parseInt(role_data.kills); 
			var deaths = parseInt(role_data.deaths);

			/* update class data object */
			player.kill.push([role,kills]);
			player.death.push([role,deaths]);
			
			/* update global kills and deaths */
			player.kills += kills;
			player.deaths += deaths;
		}
	}

	, listPlayers: function(page,res,pool){
		var me  = this

		pool.getConnection( function(err,connection){
			connection.query( me.queryPlayers , 15*page, function(err,rows){
				
				if(rows.length > 15) rows.splice(0,rows.length-15)
				connection.destroy();

				res.send(JSON.stringify(rows))
			})
		})
	}

	, searchPlayers: function(name,res,pool){
		var me = this;
		pool.getConnection(function(err,connection){
			connection.query( me.search, name , function(err,rows,fields){
				if(err != undefined){
					res.send(JSON.stringify([]))
				}
				res.send(JSON.stringify(rows))
			})
		})
	}

	, getBans: function(res, pool){
		var me = this
		pool.getConnection(function(err,connection){
			if(err != undefined){
				res.send(JSON.stringify([]))
				connection.destroy()
			}
			else{
				connection.query(me.queryBans, function(err,rows,fields){
					if(err != undefined){
						res.send(JSON.stringify([]))
						connection.destroy()
					}
					else{
						res.send(JSON.stringify(rows))
						connection.destroy()
					}			
				})
			}
		})
	}


	, makePlots: function(req,res,pool){
		var me = this; var values = []
		var intervals = 40; var table = [];

		if(req.params.int != undefined){
			intervals = req.params.int
		}

		pool.getConnection(function(err,connection){
			connection.query(me.population, function(err,rows,fields){
				stats = rows[0];
				var increment = (Math.abs(0) + Math.abs(3000))/intervals

				/* loop through intervals, define categories */
				for(var i=0; i< intervals; i++){
					var low = (increment * i)
					var upp = (increment *(i+1))

					if(values[i] == undefined){
						values[i] = [ upp,0]
						table[i] = [ 
							"{0} > x < {1}".format( low.toFixed(2),upp.toFixed(2) )
							,0  ]
					}
				}
				var count  = 0; var val_list = []

				connection.query("SELECT  30*rank + 1500 as rank FROM players", function(err,rows, fields){
					for(var index in rows){
						var rank = rows[index].rank
						val_list[count++] = rank

						/* sub categorize in intervals */
						for(var i = 0; i < intervals;i++){
							var low = (increment * i)
							var upp = (increment *(i+1))

							if(rank >= low && rank < upp){
								values[i][1]++
								table[i][1]++
								break
							}
						}
					}

					stats.median = val_list[Math.ceil(count/2)]

					res.render('plot',{
						values: values
						, stats: stats
						, table:table
					})
				})
			})
		})
	}
}