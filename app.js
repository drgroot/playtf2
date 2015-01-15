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
	host: config.database.host,
	user: config.database.user,
	port: config.database.port,
	database: config.database.database,
	password: config.database.password
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
	define routes for db queries
*/
app.get('/get/:data/:query?', function(req,res){ tools.dataHandler(req, res, pool) })
app.get('/plot/:int?', function(req,res){ tools.makePlots(req,res,pool) })

app.listen(3000)