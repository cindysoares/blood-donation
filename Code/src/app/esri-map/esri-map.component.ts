import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
	
  location = null;
  
  setPosition(position){
  	if(position) {
   		this.location = position.coords;
   	}
  }

  loadPosition() {
   	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(this.setPosition.bind(this), function() {
			console.log("Geolocation was blocked.");
		}, { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
	} else {
		console.log('Geolocation is not supported by this browser.')
	}
  }    

  public mapView: __esri.MapView;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor(
    private esriLoader: EsriLoaderService
  ) { }

  public ngOnInit() {
  	this.loadPosition();

    return this.esriLoader.load({
      url: 'https://js.arcgis.com/4.3/'
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        'esri/views/MapView',
  		'dojo/domReady!'
      ]).then(([
        Map,
        MapView
      ]: [ __esri.MapConstructor, __esri.MapViewConstructor]) => {

        const map = new Map({basemap: 'streets'});

        const mapViewProperties = {
          container: this.mapViewEl.nativeElement,          
          map 
        };

        if(this.location) {
        	mapViewProperties['center']=[this.location.longitude, this.location.latitude]
        	mapViewProperties['zoom']=12
        } else {
        	mapViewProperties['center']=[0, 0]
        	mapViewProperties['zoom']=2
        }

        this.mapView = new MapView(mapViewProperties);
      });
    });
  }

}