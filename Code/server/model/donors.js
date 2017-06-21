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
	    email: String,
	    bloodGroup: String,
	    ip: String,
	    loc: { type: { type: String, default:'Point' }, coordinates: [Number] }
	});
	donorSchema.index({ loc: '2dsphere' });
	
	var Donor = mongoose.model('Donor', donorSchema);

	// Creating some dummy data.
	
	Donor.deleteMany({}).exec();

	var someData = [new Donor({
		firstName: 'Agatha', lastName: 'Christi', bloodGroup: "A+", 
		contactNumber: "+55 21 999999999",
		email: 'agatha@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-43.187, -22.806]}
	}), new Donor({
		firstName: 'Bernie', lastName: 'Watson', bloodGroup: "B-", 
		contactNumber: "+55 21 666666666",
		email: 'b@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-43.189, -22.799]}
	}), new Donor({
		firstName: 'Carlos', lastName: 'Watson', bloodGroup: "O+", 
		contactNumber: "+55 21 777777777",
		email: 'c@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-43.173, -22.798]}
	}), new Donor({
		firstName: 'Dandara', bloodGroup: "AB+", 
		contactNumber: "+55 21 9999999999",
		email: 'ddr@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-43.18, -22.814]}
	}), new Donor({
		firstName: 'Ethan', bloodGroup: "AB+", 
		contactNumber: "+55 21 15452146541",		
		email: 'ethan@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-48.18, -10.814]}
	}), new Donor({
		firstName: 'Fany', bloodGroup: "AB+", 
		contactNumber: "+55 21 6549843213",
		email: 'fany@email.com',
		ip: '255.255.0.0',
		loc: {type: "Point", coordinates: [-43.450, -22.76]}
	})];

	someData.forEach(function(donor, index, arr) {
		donor.save(function(err, newDonor){
			if(err) console.error(err);
		});
	})
	console.log("Some dummy data created.");


}