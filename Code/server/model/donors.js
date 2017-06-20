var dbURL = 'mongodb://localhost/bloodDonation'
var mongoose = require('mongoose');

module.exports = function() { 
	mongoose.connect(dbURL);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function(error) {
	  	console.log("Connected to MongoDB: " + dbURL);
	});

	var donorSchema = mongoose.Schema({
	    firstName: String,
	    lastName: String,
	    contactNumber: String,
	    address: String,
	    bloodGroup: String,
	    loc: []
	});
	donorSchema.index({ loc: '2d' }, {name:'loc_index'});

	var Donor = mongoose.model('Donor', donorSchema);

	// Creating some dummy data.
	
	Donor.deleteMany({}).exec();

	var someData = [new Donor({
		firstName: 'Agatha', bloodGroup: "A+",
		loc: [-43.187, -22.806]
	}), new Donor({
		firstName: 'Bernie', bloodGroup: "B-",
		loc: [-43.189, -22.799]
	}), new Donor({
		firstName: 'Carlos', bloodGroup: "O+",
		loc: [-43.173, -22.798]
	}), new Donor({
		firstName: 'Dandara', bloodGroup: "AB+",
		loc: [-43.18, -22.814]
	}), new Donor({
		firstName: 'Ethan', bloodGroup: "AB+",
		loc: [-48.18, -10.814]
	}), new Donor({
		firstName: 'Fany', bloodGroup: "AB+",
		loc: [-43.450, -22.76]
	})];

	someData.forEach(function(donor, index, arr) {
		donor.save();
	})
	console.log("Some dummy data created.");


}