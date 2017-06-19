var mongoose = require('mongoose');
require('../model/donors.js')();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/donors', (req, res) => {
	var Donor = mongoose.model('Donor');
	Donor.find(function(err, donors) {
		res.status(200).json(donors);	
	})
});

module.exports = router;