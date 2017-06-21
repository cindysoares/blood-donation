var mongoose = require('mongoose');
require('../model/donors.js')();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/donors', (req, res) => {
	console.log('> GET /donors ' + req.query.longitude + ", " + req.query.latitude + " " + req.query.maxDistance);
	var coordinates = [req.query.longitude, req.query.latitude]
	var maxDistance =  parseInt(req.query.maxDistance)
	var Donor = mongoose.model('Donor');
	nearQuery = {
	 $near: {
	   $geometry: {
	      type: "Point" ,
	      coordinates: [req.query.longitude, req.query.latitude]
	   },
	   $maxDistance: maxDistance
	 }
	}
	Donor.find({loc: nearQuery}, function(err, donors) {
		if(err) {
			console.error(err);
			res.status(500).json([]);
		}
		res.status(200).json(donors);
	})
});

router.post('/donors', (req, res) => {
	console.log('> POST /donors')
	console.log(req.body)
	res.status(200).json("id");
});

module.exports = router;