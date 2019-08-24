import { Component, OnInit } from '@angular/core';
import {DashboardFilterService} from "../../filters/dashboard-filter.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private filterService: DashboardFilterService, private router: Router) { }

  ngOnInit() {
  }

  showSearchBar(): boolean {
    return this.router.url === '/dashboard'
  }

  filterQuery(query: string){
    console.log("Filter query:", query);
    this.filterService.filterQuery(query)
  }
}
