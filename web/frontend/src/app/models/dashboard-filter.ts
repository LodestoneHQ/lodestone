import {formatDate} from "@angular/common";

export class DashboardFilter {
  page: number = 1; //1 based indexing

  query: string;
  dateRange: Date[] = [];
  fileTypes: string[] = [];
  fileSizes:  number[] = [];
  tags: string[] = [];
  sortBy: string = "relevance"; //relevance, ascending A-Z, desc Z-A, ascend time, desc time
  bookmarked: boolean = false;

  fields: string[] = []; //specify the fields to return. if null or empty list, return all.

}
