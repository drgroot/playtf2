/*
	Format String
*/
if (!String.prototype.format) {
	String.prototype.format = function() {var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
	return typeof args[number] != 'undefined'? args[number]: match;
	});};}

/*
	Module Dependencies
 */
var express = require('express')
	, favicon = require('serve-favicon')
	, fs = require('fs')
	, ini = require('ini')
	, tools = require('./api/tools.js')
	, mysql = require('mysql')
	, bodyParser = require('body-parser')

var config = ini.parse(fs.readFileSync('./config.ini','utf-8'))
var app = express();

/*
	set directives
 */
app.set('views',__dirname + '/views');
app.set('view engine','jade');
app.use(express.static(__dirname + "/public"))
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use( bodyParser.json() )
app.use(bodyParser.urlencoded({
	extended: true
}))

/*
	intiate connection to mysql database 
*/
var pool = mysql.createPool({
	connectionLimit: 10,
	host: config.database.host,
	user: config.database.user,
	port: config.database.port,
	database: config.database.database,
	password: config.database.password,
	multipleStatements: true
})

/*
	define routing conditions
*/
app.get('/',function(req,res){
   res.render('index',{title: 'Home'})
});
app.get('/faq/',function(req,res){
	res.render('rank',{title:'FAQ'})
})
app.get('/donate/',function(req,res){
	res.render('donate',{title:'Donate'})
})
app.get('/bans/', function(req,res){
	res.render('bans',{title:'Bans'})
})
app.get('/player/:player_id/:name',function(req,res){
	res.render('player',{title:req.params.name, pID:req.params.player_id})
})
app.get('/stats/', function(req,res){
	res.render('stats',{title: 'Stats'})
})

/* 
	routing conditions for getting data
*/
app.post('/get/page', function(req,res){	// list players on stats page
	tools.list_players_page( req.body.page, res, pool )
})
app.get('/get/bans', function(req,res){ 	// list banned players
	tools.list_bans( res, pool )
})
app.post('/get/player/kill_stats', function(req,res){		// returns class and kill stats
	tools.player_kill_stats( req.body.player_id, res, pool )
})
app.post('/get/player/vitals', function(req,res){			// returns name and stuff
	tools.player_vitals( req.body.player_id, res, pool )
})
app.post('/get/player/trueskill', function(req,res){		// get trueskill params
	tools.player_trueskill( req.body.player_id, res, pool )
})

app.listen(3000)