import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DonorsService {

	constructor(private http: Http) { }

	getDonors() {
		return this.http.get('/api/donors')
		  .map(res => res.json());
	}
}
