import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';

import { DonorsService } from '../donors.service';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  public mapView: __esri.MapView;
  donors: any = [];

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor(
    private esriLoader: EsriLoaderService,
    private donorsService: DonorsService
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

        this.addSearchWidget(this.mapView);

        this.markDonorsWhenTheMapViewChange(this.mapView)

        this.locate(this.mapView);        

        this.setOpenDonorFormOnClick(this.mapView);  

      });
    });
  }

  markDonorsWhenTheMapViewChange(view) {
    var component = this;
    this.esriLoader.require(["esri/core/watchUtils"], function(watchUtils) {
      watchUtils.whenTrue(view, "stationary", function() {
          if (view.center) {
            component.markNearestDonors(view);
          }
        });
    })
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
		  
      var point = new Point({
        longitude: donor.loc.coordinates[0], latitude: donor.loc.coordinates[1]
      });
			var marker = new SimpleMarkerSymbol({
			  	color: "red"
			});

			var polylineGraphic = new Graphic({
				geometry: point,
				symbol: marker,
				attributes: donor,
				popupTemplate: {
      				title: "{bloodGroup}",
					    content: "<p>{firstName} {lastName}</p><details><summary>click to show</summary>{contactNumber}<br/>{email}<br/></details>"
		    }
			});
			view.graphics.add(polylineGraphic);
  	});
  }

  locate(view) {
    var component = this;
  	this.esriLoader.require(["esri/widgets/Locate"], function(Locate) {
  		var locateWidget = new Locate({
  			view: view,
  			goToLocationEnabled: false
		  }, "locateDiv");

		  locateWidget.locate().then(function(err){
			  var lon = locateWidget.graphic.geometry.longitude;
			  var lat = locateWidget.graphic.geometry.latitude;
  			view.goTo({center: [lon, lat], zoom: 15});
		  });
  	});
  }

  addSearchWidget(view) {
    var component = this;
    this.esriLoader.require(["esri/widgets/Search"], function(Search) {
      var searchWidget = new Search({
        view: view
      });
    
      view.ui.add(searchWidget, {
        position: "top-right",
        index: 2
      });
    });
  }

  markNearestDonors(view) {
    if(view.extent && view.extent.width) {
      this.donorsService.getDonors([view.center.longitude, view.center.latitude], Math.ceil(view.extent.width/2)).subscribe(donors => {
        this.donors = donors;
        console.log('> ' + this.donors.length + ' donors to draw');
        this.createMarkerForDonors(view, this.donors);
      }, console.error);
    }
  }

}