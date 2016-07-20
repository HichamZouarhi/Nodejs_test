//routes/index.js
var express = require('express');
var router = express.Router();

// psql package import
var pg = require("pg");

var conString = "postgres://postgres:P0stgres@127.0.0.1/TEST";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET map page. */
router.get('/map', function(req, res) {
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

router.get('/microzones', function(req, res) {
    var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
    client.connect();
    var query = client.query("SELECT row_to_json(fc) "
        + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
        + "FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geometry)::json As geometry "
        + ", row_to_json((id, microzone, arrondissement, prefecture, population, superficie)) As properties "
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

router.get('/bootstrap', function(req, res) {
    var client = new pg.Client("postgres://postgres:P0stgres@127.0.0.1/Afriquia_Gaz");
    client.connect();
    var query = client.query("SELECT row_to_json(fc) "
        + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
        + "FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geometry)::json As geometry "
        + ", row_to_json((id, microzone, arrondissement, prefecture, population, superficie)) As properties "
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

router.get('/layers', function (req, res) {
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

router.get('/pg/:name', function (req, res) {
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
        res.status(404)        // HTTP status 404: NotFound
        .send('Not found');
    }
});

module.exports=router;