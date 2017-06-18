const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/donors', (req, res) => {
  return res.status(200).json([
        	{longitude:-43.187, latitude:-22.806, firstName: 'Agatha', bloodGroup: "A+"},
        	{longitude:-43.189, latitude:-22.799, firstName: 'Bernie', bloodGroup: "B-"},
        	{longitude:-43.173, latitude:-22.798, firstName: 'Carlos', bloodGroup: "O+"},
        	{longitude:-43.18, latitude:-22.814, firstName: 'Dandara', bloodGroup: "AB+"}
        ]);
});

module.exports = router;