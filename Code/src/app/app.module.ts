import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from "@angular/http"
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { EsriLoaderService } from 'angular2-esri-loader';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { AngularEsriModule } from 'angular-esri-components';

import { DonorsService } from './donors.service';

const ROUTES = [
  {
    path: '',
    component: AppComponent, 
    useAsDefault: true
  },
  {
    path: 'esri-map',
    component: EsriMapComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularEsriModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [EsriLoaderService, DonorsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
