import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/debounceTime';

import { DonorsService } from '../donors.service';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  public mapView: __esri.MapView;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  donorToUpdate: Object

  constructor(
    private esriLoader: EsriLoaderService,
    private donorsService: DonorsService,
    private activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit() {
    this.activatedRoute.queryParams.debounceTime(200).subscribe((params) => {
      var donorId = params['id'];
      if(donorId) {
        console.log(donorId);
        this.donorsService.getDonor(donorId).subscribe(donor => {
          console.log(donor);
          this.donorToUpdate = donor;
          this.loadMap({coords: {
            longitude: donor.loc.coordinates[0], 
            latitude: donor.loc.coordinates[1]
          }});
        }, err => {
          console.error(err);
          this.loadPosition();  
        });        
      } else {
        this.loadPosition();
      }
    });    
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
        "dojo/on",
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
        on,
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

        var donorToUpdate = this.donorToUpdate;
        view.then(function() {
          if(donorToUpdate) {        
            openEditArea(dom.byId("editArea"), view.center.clone(), donorToUpdate);
          }
        });

        function markDonorsWhenTheMapViewChange(view) {
          watchUtils.whenTrue(view, "stationary", function() {
              if (view.center) {
                markNearestDonors(view);
              }
            });
        }

        function setOpenDonorFormOnClick(view) {
          var editArea = dom.byId("editArea");

          var input_firstName = dom.byId("input_firstName");
          var input_lastName = dom.byId("input_lastName");
          var input_bloodGroup = dom.byId("input_bloodGroup");
          var input_contactNumber = dom.byId("input_contactNumber");
          var input_emailAddress = dom.byId("input_emailAddress");
          var input_id = dom.byId("input_id");

          on(dom.byId("btnSave"), "click", function(evt) {
            var donorId = input_id.value;
            var newDonor = {
              firstName: input_firstName.value, 
              lastName: input_lastName.value,
              bloodGroup: input_bloodGroup.value,
              contactNumber: input_contactNumber.value,
              email: input_emailAddress.value,
              loc: {coordinates: [view.popup.location.longitude, view.popup.location.latitude]}
              };
            if(donorId) {
              newDonor['_id'] = donorId;
              service.updateDonor(newDonor).subscribe(donor => {
              }, console.error);
              openSaveMessage(newDonor, donorId)

            } else {
              service.createDonor(newDonor).subscribe(id => {
                createAMarkerAt(view, newDonor);
                console.log("new donor => " + id);

                input_firstName.value=null;
                input_lastName.value=null;
                input_bloodGroup.value=null;
                input_contactNumber.value=null;
                input_emailAddress.value=null;
                input_id.value=null;

                openSaveMessage(newDonor, id)
              }, console.error);
            }
          });

        	view.on("click", function(event) {
          	var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
          	var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
            
            input_firstName.value=null;
            input_lastName.value=null;
            input_bloodGroup.value=null;
            input_contactNumber.value=null;
            input_emailAddress.value=null;
            input_id.value=null;

            openEditArea(editArea, {longitude: lon, latitude: lat})
          	
      	   });
        }

        function openSaveMessage(newDonor, donorId) {
          var urlToUpdate = 'http://localhost:3000?id=' + donorId;
          view.popup.open({
              title: "Information saved",
              attributes: newDonor,
              location: {longitude: newDonor.loc.coordinates[0], latitude: newDonor.loc.coordinates[1]},
              content: 'Hi, ' + newDonor.firstName + '. To update your informations use the URL below.<br/><a href=\"'+ urlToUpdate + '\">'+ urlToUpdate + '</a>'
          });
        }

        function openEditArea(editArea, point, donor=null) {
          if(donor) {
            dom.byId("input_id").value = donor._id;
            dom.byId("input_firstName").value = donor.firstName;
            dom.byId("input_lastName").value = donor.lastName;
            dom.byId("input_bloodGroup").value = donor.bloodGroup;
            dom.byId("input_contactNumber").value = donor.contactNumber;
            dom.byId("input_emailAddress").value = donor.email;
          }

          editArea.style.display = 'block';
          view.popup.clear();
          view.popup.dockOptions = {buttonEnabled: false, breakpoint: false};
          view.popup.open({
              title: "Donor Information",
              location: point,
              content: editArea
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