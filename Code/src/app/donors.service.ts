import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
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
		return this.http.post('/api/donors', donor).map(res => res.json());
	}

	updateDonor(donor) {
		console.log("> Updating donor");
		return this.http.put('/api/donors', donor).map(res => res.json());
	}	

	getDonor(id) {
		console.log("> Getting donor with id " + id + ": " + '/api/donor/'+id)
		return this.http.get('/api/donors/'+id).map(res => {
			console.log(res);
			return res.json();
		});
	}
}
