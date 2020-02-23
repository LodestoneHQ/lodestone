import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DashboardFilter} from "../models/dashboard-filter";
import {ActivatedRoute, Params} from "@angular/router";
import {Form, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Options} from "ng5-slider";
import {formatDate} from "@angular/common";

@Injectable({
  providedIn: 'root'
})


//this service stores the state for the Dashboard page
export class DashboardFilterService {

  filterForm = this.formBuilder.group({
    page: [1],
    query: [''],
    dateRange: [[]],
    fileTypes: this.formBuilder.group({}),
    tags: this.formBuilder.group({}),
    fileSizes: this.formBuilder.control([0, 100_000_000]),
    sortBy:['relevance'],
    bookmarked: [false]
  })

  constructor(private formBuilder: FormBuilder) {}



  parseQueryParams(queryParams: {[name:string]:string}){

    var updateData: {
      page?: number,
      query?: string,
      dateRange?: Date[],
      fileTypes?: {},
      tags?: {},
      fileSizes?: number[],
      sortBy?: string,
      bookmarked?: boolean
    } = {};

    if(queryParams.page){
      updateData.page = parseInt(queryParams.page)
    }
    if(queryParams.query){
      updateData.query = queryParams.query
    }
    if(queryParams.dateRangeStart && queryParams.dateRangeEnd){
      updateData.dateRange = [new Date(queryParams.dateRangeStart), new Date(queryParams.dateRangeEnd) ]
    }
    if(queryParams.fileTypes){
      updateData.fileTypes = updateData.fileTypes ? updateData.fileTypes : {};
      for(let fileType of queryParams.fileTypes.split(',')){
        updateData.fileTypes[fileType] = true;
      }
    }
    if(queryParams.fileSizesStart && queryParams.fileSizesEnd){
      updateData.fileSizes = [parseInt(queryParams.fileSizesStart), parseInt(queryParams.fileSizesEnd)]
    }
    if(queryParams.tags){
      updateData.tags = updateData.tags ? updateData.tags : {};
      for(let tag of queryParams.tags.split(',')){
        updateData.tags[tag] = true;
      }
    }
    if(queryParams.sortBy){
      updateData.sortBy = queryParams.sortBy
    }
    if(queryParams.bookmarked){
      updateData.bookmarked = (queryParams.bookmarked === 'true')
    }

    //ensure that checkbox list values exist before trying to "patch" them in.
    if(updateData.fileTypes){
      var currentFileTypes = this.filterForm.get('fileTypes').value;
      Object.keys(updateData.fileTypes).forEach((bucketKey) => {
        if(!currentFileTypes.hasOwnProperty(bucketKey)){
          (this.filterForm.get('fileTypes') as FormGroup).addControl(bucketKey, new FormControl(false))
        }
      })
    }
    if(updateData.tags){
      Object.keys(updateData.tags).forEach((bucketKey) => {
        if(!this.filterForm.get('tags').get(bucketKey)){
          (this.filterForm.get('tags') as FormGroup).addControl(bucketKey, new FormControl(false))
        }
      })
    }

    return updateData;
  }

  toQueryParams() : {[name:string]:string} {
    var form = this.filterForm.value;

    var queryParams = {};

    if(form.page){
      queryParams['page'] = form.page.toString()
    }
    if(form.query){
      queryParams['query'] = form.query
    }
    if(form.dateRange && form.dateRange.length){
      queryParams['dateRangeStart'] = formatDate(form.dateRange[0], 'yyyy-MM-ddT00:00:00.000Z', 'en-US')
      queryParams['dateRangeEnd'] = formatDate(form.dateRange[1], 'yyyy-MM-ddT00:00:00.000Z', 'en-US')
    }
    if(form.fileTypes && Object.keys(form.fileTypes).length){
      var fileTypes = [];
      Object.keys(form.fileTypes).forEach((key) => {
        if (form.fileTypes[key]) {
          fileTypes.push(key);
        }
      })

      queryParams['fileTypes'] = fileTypes.join(',');
    }

    if(form.tags && Object.keys(form.tags).length){
      var tags = [];
      Object.keys(form.tags).forEach((key) => {
        if (form.tags[key]) {
          tags.push(key);
        }
      })
      queryParams['tags'] = tags.join(',');

    }
    if(form.fileSizes && form.fileSizes.length){
      queryParams['fileSizesStart'] = form.fileSizes[0].toString();
      queryParams['fileSizesEnd'] = form.fileSizes[1].toString();
    }
    if(form.sortBy){
      queryParams['sortBy'] = form.sortBy;
    }
    if(form.bookmarked){
      queryParams['bookmarked'] = form.bookmarked.toString();
    }
    return queryParams;
  }

  toDashboardFilter(form): DashboardFilter {

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
    }
    if(form.tags){
      dashboardFilter.tags = [];
      Object.keys(form.tags).forEach((key) => {
        if (form.tags[key]) {
          dashboardFilter.tags.push(key);
        }
      })
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
