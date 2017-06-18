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
        	mapViewProperties['zoom']=15
        } else {
        	mapViewProperties['center']=[0, 0]
        	mapViewProperties['zoom']=2
        }

        this.mapView = new MapView(mapViewProperties);

        this.setOpenDonorFormOnClick(this.mapView);
        
        var donors = [
        	{longitude:-43.187, latitude:-22.806, firstName: 'Agatha', bloodGroup: "A+"},
        	{longitude:-43.189, latitude:-22.799, firstName: 'Bernie', bloodGroup: "B-"},
        	{longitude:-43.173, latitude:-22.798, firstName: 'Carlos', bloodGroup: "O+"},
        	{longitude:-43.18, latitude:-22.814, firstName: 'Dandara', bloodGroup: "AB+"}
        ];
        this.createMarkerForDonors(this.mapView, donors);


      });
    });
  }

  setOpenDonorFormOnClick(view) {
  	var component = this;
  	view.on("click", function(event) {
    	var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
    	var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

    	view.popup.dockOptions = {buttonEnabled: false, breakpoint: false};
    	view.popup.open({
        	title: "New Donor Information",
        	location: {longitude: lon, latitude: lat},
        	content: "Aqui entra o formulario"/*[{
		        	type: "fields",
		        	fieldInfos: [{
		          		fieldName: "firstName",
		          		label: "First Name"
		        	}, {
		          		fieldName: "lastName",
		          		label: "Last Name"
		        	}, {
		          		fieldName: "contactNumber",
		          		label: "Contact Number"
		        	}, {
		          		fieldName: "address",
		          		label: "Address"
		        	}, {
		          		fieldName: "bloodGroup",
		          		label: "BloodGroup"
		        	}]
		      	}]*/
    	});
	});
  }

  createMarkerForDonors(view, donors) {
  	var component = this;
  	donors.forEach(function(donor, index, arr) {
  		console.log(donor)
  		component.createAMarkerAt(view, donor);
  	});
  }

  createAMarkerAt(view, donor) {
  	this.esriLoader.require([
        'esri/Map',
        'esri/views/MapView',
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/Graphic",
  		'dojo/domReady!'
      ], function(
      	Map,
        MapView, 
        Point,
        SimpleMarkerSymbol,
        Graphic
  		) {
		    var point = new Point(donor);
			var marker = new SimpleMarkerSymbol({
			  	color: "red"
			});

			var lineAtt = {
				firstName: "Cindy",
				lastName: "Moore",
				contactNumber: "+55 21 999999999",
				address: "Some St, 555",
				bloodGroup: "A+"
			};

			var polylineGraphic = new Graphic({
				geometry: point,
				symbol: marker,
				attributes: donor,
				popupTemplate: {
      				title: "{firstName} {lastName} ({bloodGroup})",
					content: "<a link=\"#\">click to show</a>"
		      	}
			});
			view.graphics.add(polylineGraphic);
  	});
  }

}