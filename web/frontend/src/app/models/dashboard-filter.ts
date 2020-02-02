export class DashboardFilter {
  page: number = 1; //1 based indexing

  query: string;
  dateRange: Date[] = [];
  fileTypes: string[] = [];
  fileSizes:  number[] = [];
  tags: string[] = [];
  sortBy: string = "relevance"; //relevance, ascending A-Z, desc Z-A, ascend time, desc time
  bookmarked: boolean = false;
}
