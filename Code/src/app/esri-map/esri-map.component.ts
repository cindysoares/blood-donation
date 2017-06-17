import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
	
	location = {};
  	setPosition(position){
    	this.location = position.coords;
    	console.log(this.location);
    }

  public mapView: __esri.MapView;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor(
    private esriLoader: EsriLoaderService
  ) { }

  public ngOnInit() {
    if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));
    } else {
    	console.log('no position');
    }

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
        const mapProperties: __esri.MapProperties = {
          basemap: 'streets'
        };

        const map = new Map(mapProperties);

        const mapViewProperties: __esri.MapViewProperties = {
          container: this.mapViewEl.nativeElement,
          center: [this.location['longitude'], this.location['latitude']],
          zoom: 12,
          map 
        };

        this.mapView = new MapView(mapViewProperties);
      });
    });
  }

}