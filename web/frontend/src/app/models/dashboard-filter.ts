export class DashboardFilter {
  page: number = 1; //1 based indexing

  query: string;
  timeRange: Date[];
  fileTypes: string[] = [];
  fileSizes:  number[] = [];
  tags: string[] = [];
  sortBy: string = "relevance"; //relevance, ascending A-Z, desc Z-A, ascend time, desc time
  bookmark: boolean = false;
}
