import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EsriLoaderService } from 'angular2-esri-loader';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { AngularEsriModule } from 'angular-esri-components';

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent
  ],
  imports: [
    BrowserModule,
    AngularEsriModule
  ],
  providers: [EsriLoaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
