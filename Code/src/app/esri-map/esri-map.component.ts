import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  public mapView: __esri.MapView;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor(
    private esriLoader: EsriLoaderService
  ) { }

  public ngOnInit() {
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
          center: [0, 0],
          zoom: 2,    
          map 
        };

        this.mapView = new MapView(mapViewProperties);
        this.locate(this.mapView);

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

    	view.popup.clear();
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

  locate(view) {
  	this.esriLoader.require(["esri/widgets/Locate"], function(Locate) {
  		var locateWidget = new Locate({
  			view: view,
  			goToLocationEnabled: false
		}, "locateDiv");

		locateWidget.locate().then(function(){
			var lon = locateWidget.graphic.geometry.longitude;
			var lat = locateWidget.graphic.geometry.latitude;
  			view.goTo({center: [lon, lat], zoom: 15})
		});
  	});
  }

}