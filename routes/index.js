//routes/index.js
var express = require('express');
//var app = express.Router();
var app=express();

// psql package import
var pg = require("pg");

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var conString = "postgres://postgres:P0stgres@127.0.0.1/TEST";

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET map page. */
app.get('/map', function(req, res) {
	var client = new pg.Client(conString);
	client.connect();
	var query = client.query("SELECT lname FROM geo_layers");
	query.on("row", function (row, result) {
		result.addRow(row);
	});
 
	query.on("end", function (result) {
		res.render('map', {
			"layers": (result.rows),
			title: 'An OL3 map served by node.js and postgis',
			lat: 40.7795213,
			lng: -73.9641241
		});
	});
});

app.get('/microzones', function(req, res) {
	var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
	client.connect();
	var query = client.query("SELECT row_to_json(fc) "
		+ "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
		+ "FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geometry)::json As geometry "
		+ ", json_build_object("
						+"'id', id," 
						+"'microzone', microzone,"
						+"'arrondissement', arrondissement,"
						+"'prefecture', prefecture,"
						+"'population', population,"
						+"'superficie', superficie) As properties "
		+ "FROM microzones As lg   ) As f )  As fc;");
	query.on("row", function (row, result) {
		result.addRow(row);
	});
 
	query.on("end", function (result) {
		res.render('map2', {
			features: JSON.stringify(result.rows[0].row_to_json),
			title: 'Afriquia Gaz map served by node.js and postgis ',
			lat: 33.5593,
			lng: -7.6158
		});
		/*res.send(result.rows[0].row_to_json);
		res.end();*/
	});
});

app.get('/bootstrap', function(req, res) {
	var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
	client.connect();
	var query = client.query("SELECT row_to_json(fc) "
		+ "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
		+ "FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geometry)::json As geometry "
		+ ", json_build_object("
						+"'id', id," 
						+"'microzone', microzone,"
						+"'arrondissement', arrondissement,"
						+"'prefecture', prefecture,"
						+"'population', population,"
						+"'superficie', superficie) As properties "
		+ "FROM microzones As lg   ) As f )  As fc;");
	query.on("row", function (row, result) {
		result.addRow(row);
	});
 
	query.on("end", function (result) {
		res.render('map3', {
			features: JSON.stringify(result.rows[0].row_to_json),
			title: 'Afriquia Gaz map served by node.js and postgis using bootstrap',
			lat: 33.5593,
			lng: -7.6158
		});
		/*res.send(result.rows[0].row_to_json);
		res.end();*/
	});
});

app.post('/save', function(req, res) {
	var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
	client.connect();
	//console.log(req.body.microzone);
	client.query("UPDATE microzones "
		+"set microzone='"+req.body.microzone+"'"
		+", arrondissement='"+req.body.arrondissement+"'"
		+", prefecture='"+req.body.prefecture+"'"
		+", population='"+req.body.population+"'"
		+" WHERE id='"+req.body.id+"'");
 	
	//client.end();
	res.send("row updated in DB");
	res.end();
		/*res.send(result.rows[0].row_to_json);
		res.end();*/
	
});

app.post('/add', function(req, res) {
	var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
	client.connect();
	//console.log(req.body.microzone);
	client.query("INSERT into microzones (superficie, geometry) "
		+"VALUES ('"+req.body.superficie+"'"
		+", ST_SetSRID(ST_GeomFromText('"+req.body.geometry+"'), 4326)"
		+")");
 	
	//client.end();
	res.send("row inserted in DB");
	res.end();
		/*res.send(result.rows[0].row_to_json);
		res.end();*/
	
});

app.post('/modify', function(req, res) {
	var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
	client.connect();
	//console.log(req.body.microzone);
	client.query("UPDATE microzones "
		+"set geometry=ST_SetSRID(ST_GeomFromText('"+req.body.geometry+"'), 4326)"
		+", superficie='"+req.body.superficie+"'"
		+" WHERE id='"+req.body.id+"'");
 	
	//client.end();
	res.send("row updated in DB");
	res.end();
		/*res.send(result.rows[0].row_to_json);
		res.end();*/
	
});

app.get('/layers', function (req, res) {
	var client = new pg.Client(conString);
	client.connect();
	var query = client.query("SELECT lname FROM geo_layers");
	query.on("row", function (row, result) {
		result.addRow(row);
	});
 
	query.on("end", function (result) {
		res.send(result.rows);
		res.end();
	});
});

app.get('/pg/:name', function (req, res) {
	if (req.params.name) {
		var client = new pg.Client(conString);
		client.connect();
 
		var query = client.query("SELECT row_to_json(fc) "
			+ "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
			+ "FROM (SELECT 'Feature' As type "
				+ ", ST_AsGeoJSON(lg.the_geom)::json As geometry "
				+ ", row_to_json(lp) As properties "
				+ "FROM geo_layers As lg "
					+ "INNER JOIN (SELECT gid, lname FROM geo_layers where lname = $1) As lp "
					+ "ON lg.gid = lp.gid  ) As f )  As fc", [req.params.name]);
		query.on("row", function (row, result) {
			result.addRow(row);
		});
		query.on("end", function (result) {
			res.send(result.rows[0].row_to_json);
			res.end();
		});
	} else {
		res.status(404)		// HTTP status 404: NotFound
		.send('Not found');
	}
});

module.exports=app;