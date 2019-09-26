import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {DetailsComponent} from "./details/details.component";
import {StatusComponent} from "./status/status.component";

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'details/:id', component: DetailsComponent },
  { path: 'status', component: StatusComponent },

  { path: '**', redirectTo: 'dashboard' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
