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
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/Graphic",
  		'dojo/domReady!'
      ]).then(([
        Map,
        MapView, 
        Point,
        SimpleMarkerSymbol,
        Graphic
      ]: [ __esri.MapConstructor, __esri.MapViewConstructor, __esri.PointConstructor, __esri.SimpleMarkerSymbolConstructor, __esri.GraphicConstructor]) => {

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

        if(this.location) {
            var point = new Point({
        		longitude: this.location.longitude, 
        		latitude: this.location.latitude}
        	);
        	var marker = new SimpleMarkerSymbol({
			  	//color: "palegreen"
			});

        	var lineAtt = {
    			Name: "Keystone Pipeline",  // The name of the pipeline
    			Owner: "TransCanada",  // The owner of the pipeline
    			Length: "3,456 km"  // The length of the pipeline
  			};

  			var polylineGraphic = new Graphic({
    			geometry: point,   // Add the geometry created in step 4
    			symbol: marker,   // Add the symbol created in step 5
    			attributes: lineAtt,   // Add the attributes created in step 6
    			popupTemplate: {
		      	title: "{Name}",
		      	content: [{
		        	type: "fields",
		        	fieldInfos: [{
		          		fieldName: "Name"
		        	}, {
		          		fieldName: "Owner"
		        	}, {
		          		fieldName: "Length"
		        	}]
		      	}]
		    	}
  			});
  			this.mapView.graphics.add(polylineGraphic);
        }
        
      });
    });
  }

}