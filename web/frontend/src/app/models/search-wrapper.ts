import {SearchResult} from "./search-result";

export class SearchWrapper {

  aggregations: {
    by_filetype: {
      buckets: { [key:string]:any; }[]
    }
    by_timerange: { [key:string]:any; }
    by_filesize: { [key:string]:any; }
  }
  hits: {
    total: {
      value: number;
    }
    max_score: number;
    hits: SearchResult[];

  }
}
