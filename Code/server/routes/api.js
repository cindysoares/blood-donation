var mongoose = require('mongoose');
require('../model/donors.js')();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/donors', (req, res) => {
	console.log('> GET /donors?longitude=' + req.query.longitude + "&latitude=" + req.query.latitude + "&maxDistance=" + req.query.maxDistance);
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
		} else {
			res.status(200).json(donors);
		}
	})
});

router.get("/donors/:id", (req, res) => {
	console.log('> GET /donors/' + req.params.id)
	var Donor = mongoose.model('Donor');
	var ObjectID = require('mongodb').ObjectID;
	Donor.findOne({_id: new ObjectID(req.params.id)}, function(err, donor) {
		if(err) {
			console.error(err);
			res.status(500).json([]);
		} else {
			console.log(donor)
			res.status(200).json(donor);
		}
	})
});

router.post('/donors', (req, res) => {
	console.log('> POST /donors')
	console.log(req.body)
	var Donor = mongoose.model('Donor');
	var donor = new Donor(req.body);
	donor.save(function(err) {
		if(err) {
			console.error(err);
			res.status(500).json([])
		} else {
			res.status(200).json(donor._id);
		}
	});	
});

module.exports = router;