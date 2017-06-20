var mongoose = require('mongoose');
require('../model/donors.js')();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/donors', (req, res) => {
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
   console.log(nearQuery)
	Donor.find({loc: nearQuery}, function(err, donors) {
		if(err) {
			console.error(err);
			res.status(500).json([]);
		}
		res.status(200).json(donors);
	})
});

module.exports = router;