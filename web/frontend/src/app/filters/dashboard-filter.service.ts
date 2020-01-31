import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DashboardFilter} from "../models/dashboard-filter";
import {Params} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class DashboardFilterService {

  private filterSource = new BehaviorSubject(new DashboardFilter());
  currentFilter = this.filterSource.asObservable();

  constructor() { }


  filterPage(nextPage: number) {
    var filter = this.filterSource.getValue()
    filter.page = nextPage
    this.filterSource.next(filter);  }

  filterQuery(nextQuery: string) {
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.query = nextQuery
    this.filterSource.next(filter);
  }

  filterTimeRange(nextTimeRange: Date[]) {
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.timeRange = nextTimeRange;
    this.filterSource.next(filter);
  }

  filterFileTypeAdd(newFileType: string){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.fileTypes.push(newFileType);
    this.filterSource.next(filter);
  }

  filterFileTypeRemove(removeFileType: string){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    const index: number = filter.fileTypes.indexOf(removeFileType);
    if (index !== -1) {
      filter.fileTypes.splice(index, 1);
    }
    this.filterSource.next(filter);
  }

  filterFileTypes(nextFileTypes: string[]) {
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.fileTypes = nextFileTypes;
    this.filterSource.next(filter);
  }

  filterTagAdd(newTag: string){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.tags.push(newTag);
    this.filterSource.next(filter);
  }

  filterTagRemove(removeTag: string){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    const index: number = filter.tags.indexOf(removeTag);
    if (index !== -1) {
      filter.tags.splice(index, 1);
    }
    this.filterSource.next(filter);
  }

  filterTags(nextTags: string[]) {
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.tags = nextTags;
    this.filterSource.next(filter);
  }

  filterFileSize(nextFileSizes: number[]){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.fileSizes = nextFileSizes;
    this.filterSource.next(filter);
  }

  filterSortBy(nextSortBy: string) {
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.sortBy = nextSortBy;
    this.filterSource.next(filter);
  }

  filterBookmark(nextBookmark: boolean){
    var filter = this.filterSource.getValue()
    filter.page = 1;
    filter.bookmark = nextBookmark;
    this.filterSource.next(filter);
  }

  filterSet(nextFilter: DashboardFilter){
    this.filterSource.next(nextFilter)
  }

  filterSetFromParams(nextFilterData: Params){
    var nextFilter = new DashboardFilter()
    if(nextFilterData.page){
      nextFilter.page = parseInt(nextFilterData.page)
    }
    if(nextFilterData.query){
      nextFilter.query = nextFilterData.query
    }
    if(nextFilterData.timeRange){
      nextFilter.timeRange = nextFilterData.timeRange.split(',').map((dateStr) => new Date(dateStr))
    }
    if(nextFilterData.fileTypes){
      nextFilter.fileTypes = nextFilterData.fileTypes.split(',')
    }
    if(nextFilterData.fileSizes){
      nextFilter.fileSizes = nextFilterData.fileSizes.split(',').map((fileStr) => parseInt(fileStr))
    }
    if(nextFilterData.tags){
      nextFilter.tags = nextFilterData.tags.split(',')
    }
    if(nextFilterData.sortBy){
      nextFilter.sortBy = nextFilterData.sortBy
    }
    if(nextFilterData.bookmark){
      nextFilter.bookmark = (nextFilterData.bookmark === 'true')
    }
    this.filterSource.next(nextFilter);
    return nextFilter;
  }

  filterClear(){
    this.filterSource.next(new DashboardFilter())
  }
}
