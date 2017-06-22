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
    this.loadPosition();
  }

  loadPosition() {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this.loadMap.bind(this), this.loadMap.bind(this), { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
    } else {
      console.log('Geolocation is not supported by this browser.')
      this.loadMap(null);
    }
  }

  loadMap(position) {
    return this.esriLoader.load({
      url: 'https://js.arcgis.com/4.3/'
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/FeatureLayer',
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',        
        'esri/Graphic',
        'esri/widgets/Search',
        'esri/widgets/Locate',
        'esri/core/watchUtils',
        "dojo/dom",
  		'dojo/domReady!'
      ]).then(([
        Map,
        MapView, 
        FeatureLayer,
        Point,
        SimpleMarkerSymbol,
        Graphic,
        Search,
        Locate,
        watchUtils,
        dom
      ]) => {

        const service = this.donorsService;
        const map = new Map({basemap: 'streets'});

        const mapViewProperties = {
          container: this.mapViewEl.nativeElement, 
          map 
        };
        if(position && position.coords) {
          mapViewProperties['center']=[position.coords.longitude, position.coords.latitude]
          mapViewProperties['zoom']=15
        } else {
          mapViewProperties['center']=[0, 0]
          mapViewProperties['zoom']=2
        }

        var view = this.mapView = new MapView(mapViewProperties);

        addSearchWidget(this.mapView);

        markDonorsWhenTheMapViewChange(this.mapView)

        addLocateWidget(this.mapView);        

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
          var editArea = dom.byId("editArea");
        	view.on("click", function(event) {
          	var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
          	var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

            editArea.style.display = 'block';

          	view.popup.clear();
          	view.popup.dockOptions = {buttonEnabled: false, breakpoint: false};
          	view.popup.open({
              	title: "New Donor Information",
              	location: {longitude: lon, latitude: lat},
              	content: editArea
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

        function addLocateWidget(view) {
      		var locateWidget = new Locate({
      			view: view
    		  }, "locateDiv");

    		  view.ui.add(locateWidget, "top-left");
        }

        function addSearchWidget(view) {
          var searchWidget = new Search({
            view: view
          });
        
          view.ui.add(searchWidget, "top-right");
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