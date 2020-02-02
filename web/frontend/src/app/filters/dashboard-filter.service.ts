import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DashboardFilter} from "../models/dashboard-filter";
import {ActivatedRoute, Params} from "@angular/router";
import {Form, FormBuilder, FormGroup} from "@angular/forms";
import {Options} from "ng5-slider";

@Injectable({
  providedIn: 'root'
})
export class DashboardFilterService {

  filterForm = this.formBuilder.group({
    page: [1],
    query: [''],
    dateRange: [[]],
    fileTypes: this.formBuilder.group({}),
    tags: this.formBuilder.array([]),
    fileSizes: [[0, 0]],
    sortBy:['relevance'],
    bookmarked: [false]
  })

  constructor(private formBuilder: FormBuilder) {}

  convertParamsToForm(paramsData:Params): any {
    var updateData: {
      page?: number,
      query?: string,
      dateRange?: Date[],
      fileTypes?: [],
      tags?: [],
      fileSizes?: [],
      sortBy?: string,
      bookmarked?: boolean
    } = {};

    if(paramsData.page){
      updateData.page = parseInt(paramsData.page)
    }
    if(paramsData.query){
      updateData.query = paramsData.query
    }
    if(paramsData.dateRange){
      updateData.dateRange = paramsData.dateRange.split(',').map((dateStr) => new Date(dateStr))
    }
    if(paramsData.fileTypes){
      console.log("TODO: UPDATE FORM FILETYPES", paramsData.fileTypes)
      // updateData.fileTypes = paramsData.fileTypes.split(',')
    }
    if(paramsData.fileSizes){
      updateData.fileSizes = paramsData.fileSizes.split(',').map((fileStr) => parseInt(fileStr))
    }
    if(paramsData.tags){
      updateData.tags = paramsData.tags.split(',')
    }
    if(paramsData.sortBy){
      updateData.sortBy = paramsData.sortBy
    }
    if(paramsData.bookmarked){
      updateData.bookmarked = (paramsData.bookmarked === 'true')
    }
    return updateData;
  }

  convertFormToDashboardFilter(form): DashboardFilter {

    var dashboardFilter = new DashboardFilter();

    if(form.page){
      dashboardFilter.page = form.page;
    }
    if(form.query){
      dashboardFilter.query = form.query;
    }
    if(form.dateRange && form.dateRange.length > 0){
      dashboardFilter.dateRange = form.dateRange;
    }
    if(form.fileTypes){
      dashboardFilter.fileTypes = [];
      Object.keys(form.fileTypes).forEach((key) => {
        if (form.fileTypes[key]) {
          dashboardFilter.fileTypes.push(key);
        }
      })
      // form.fileTypes.forEach()
    }
    if(form.tags && form.tags.length > 0){
      dashboardFilter.tags = form.tags;
    }
    if(form.fileSizes && form.fileSizes.length > 0){
      dashboardFilter.fileSizes = form.fileSizes;
    }
    if(form.sortBy){
      dashboardFilter.sortBy = form.sortBy;
    }
    if(form.bookmarked){
      dashboardFilter.bookmarked = form.bookmarked;
    }

    return dashboardFilter
  }

}
