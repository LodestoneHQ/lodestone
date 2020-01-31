import { Component, OnInit } from '@angular/core';
import {DashboardFilterService} from "../../filters/dashboard-filter.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  queryValue: string = "";
  constructor(private filterService: DashboardFilterService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.queryValue = params.query
    })
  }

  showSearchBar(): boolean {
    const urlTree = this.router.parseUrl(this.router.url);
    const urlWithoutParams = urlTree.root.children['primary'].segments.map(it => it.path).join('/');
    console.log(this.router.url, urlWithoutParams)
    return urlWithoutParams === 'dashboard'
  }

  filterQuery(query: string){
    console.log("Filter query:", query);
    this.filterService.filterQuery(query)
  }
}
