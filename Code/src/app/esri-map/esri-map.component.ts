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
        'esri/Graphic',
        'esri/widgets/Search',
        'esri/widgets/Locate',
        'esri/core/watchUtils',
  		'dojo/domReady!'
      ]).then(([
        Map,
        MapView, 
        Point,
        SimpleMarkerSymbol,
        Graphic,
        Search,
        Locate,
        watchUtils
      ]) => {

        const service = this.donorsService;
        const map = new Map({basemap: 'streets'});

        const mapViewProperties = {
          container: this.mapViewEl.nativeElement, 
          center: [0, 0],
          zoom: 2,    
          map 
        };

        this.mapView = new MapView(mapViewProperties);

        addSearchWidget(this.mapView);

        markDonorsWhenTheMapViewChange(this.mapView)

        locate(this.mapView);        

        setOpenDonorFormOnClick(this.mapView);  

        service.createDonor({firstName: 'Cindy', 'loc.coordinates': [0,0]});

        function markDonorsWhenTheMapViewChange(view) {
          watchUtils.whenTrue(view, "stationary", function() {
              if (view.center) {
                markNearestDonors(view);
              }
            });
        }

        function setOpenDonorFormOnClick(view) {
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

        function createMarkerForDonors(view, donors) {
        	donors.forEach(function(donor, index, arr) {
        		createAMarkerAt(view, donor);
        	});
        }

        function createAMarkerAt(view, donor) {      		  
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
        }

        function locate(view) {
      		var locateWidget = new Locate({
      			view: view,
      			goToLocationEnabled: false
    		  }, "locateDiv");

    		  locateWidget.locate().then(function(err){
    			  var lon = locateWidget.graphic.geometry.longitude;
    			  var lat = locateWidget.graphic.geometry.latitude;
      			view.goTo({center: [lon, lat], zoom: 15});
    		  });
        }

        function addSearchWidget(view) {
          var searchWidget = new Search({
            view: view
          });
        
          view.ui.add(searchWidget, {
            position: "top-right",
            index: 2
          });
        }

        function markNearestDonors(view) {
          if(view.extent && view.extent.width) {
            service.getDonors([view.center.longitude, view.center.latitude], Math.ceil(view.extent.width/2)).subscribe(donors => {
              console.log('> ' + donors.length + ' donors to draw');
              createMarkerForDonors(view, donors);
            }, console.error);
          }
        }
        });
    });
  }



}