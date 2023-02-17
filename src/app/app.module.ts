import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ScrapperComponent } from './scrapper/scrapper.component';

import { SettingsComponent } from './settings/settings.component';
import { SideNavComponent } from './side-nav/side-nav.component';

import { TopNavComponent } from './top-nav/top-nav.component';
import { HomeComponent } from './home/home.component';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';

import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ScrapperComponent,
    SettingsComponent,
    SideNavComponent,
    TopNavComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    /* configure App with AmplifyAuthenticatorModule */
    AmplifyAuthenticatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
