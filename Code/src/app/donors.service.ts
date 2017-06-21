import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DonorsService {

	constructor(private http: Http) { }

	getDonors(coordinates, maxDistance) {
		console.log("> Getting donors near "+ coordinates + " at a distance of " + maxDistance + " meters.")
		return this.http.get('/api/donors', {params: {
				longitude: coordinates[0],
				latitude: coordinates[1],
				maxDistance: maxDistance
			}})
		  .map(res => res.json());
	}

	createDonor(donor) {
		console.log("> Creating new donor");
		return this.http.post('/api/donors', donor).map(res => res.json()).subscribe(
    function (x) {
        console.log('Next: ' + x);
    },
    function (err) {
        console.log('Error: ' + err);
    },
    function () {
        console.log('Completed');
    });
	}
}
