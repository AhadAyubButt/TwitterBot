import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TopNavComponent } from './top-nav/top-nav.component';
import { SideNavComponent } from './side-nav/side-nav.component';

import { HomeComponent } from './home/home.component';
import { ScrapperComponent } from './scrapper/scrapper.component';

import { DashboardComponent } from './dashboard/dashboard.component'
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/currency',
    pathMatch: 'full',
  },
  {
    path: "home",
    component: HomeComponent,
    children: [
      {
        path: "currency",
        component: ScrapperComponent,
      },
      {
        path: "news",
        component: DashboardComponent,
      },
      {
        path: "settings",
        component: SettingsComponent,
      }
    ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
