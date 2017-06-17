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
          center: [-12.287, -37.114],
          zoom: 12,
          map 
        };

        this.mapView = new MapView(mapViewProperties);
      });
    });
  }

}