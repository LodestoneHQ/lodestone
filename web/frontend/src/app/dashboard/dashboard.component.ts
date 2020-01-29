import { Component, OnInit } from '@angular/core';
import {ElasticsearchService} from "../services/elasticsearch.service";
import {DashboardFilter} from "../models/dashboard-filter";
import {DashboardFilterService} from "../filters/dashboard-filter.service";
import {SearchResult} from "../models/search-result";
import {AppSettings} from "../app-settings";
import {environment} from "../../environments/environment";
import { Options } from 'ng5-slider';
import * as filesize from 'filesize'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  minFileSizeValue: number = 0;
  maxFileSizeValue: number = 0;
  sliderOptions: Options = {
    floor: 0,
    ceil: 0,
    // showTicks: true,
    translate: (value: number): string => {
      const size = filesize.partial({ round: 0});
      return size(value);
    }
  };


  //aggregation/filter data & limits
  globalLimits = {
    maxDate: new Date(),
    minDate: new Date(),

    sortBy: AppSettings.SORT_BY_OPTIONS
  }

  constructor(private es: ElasticsearchService, private filterService: DashboardFilterService) {}

  filter: DashboardFilter = new DashboardFilter();



  searchResults: SearchResult[] = [];
  fileTypeBuckets = {};
  tagBuckets = {};
  totalPages: number;
  currentPage: number = 1;


  ngOnInit() {
    // this.api.ping().then(
    //   () => {
    //     console.log("PING SUCCESSFUL")
    //   },
    //   error => {
    //     console.error("PING FAILED", error)
    //   }
    // )

    this.getGlobalLimits()

    this.filterService.currentFilter.subscribe(filter => {
      this.currentPage = filter.page
      this.filter = filter;
      this.queryDocuments()
    })

    //set the filter to nothing, so that we can trigger a document query (works even when pressing back button)
    this.filterService.filterClear()
  }

  bookmarkDocument(doc:SearchResult, currentState:boolean){
    this.es.bookmarkDocument(doc._id, !currentState)
      .subscribe(wrapper => {
          console.log("Successful update")

          if (doc._source.lodestone){
            doc._source.lodestone.bookmark = !currentState
          } else {
            doc._source.lodestone = {
              title: "",
              bookmark: !currentState,
              tags: []
            }
          }
        },
        error => {
          console.error("Failed update", error)
        },
        () => {
          console.log("update finished")
        }
      );
  }

  filterPage(page: number){
    console.log("Page changed:", page);
    this.filterService.filterPage(page)
  }

  filterQuery(query: string){
    console.log("Filter query:", query);
    this.filterService.filterQuery(query)
  }

  filterSortBy(sortBy: string){
    console.log("filterSortBy:", sortBy)
    this.filterService.filterSortBy(sortBy);
  }

  filterFileType(fileType: string, isChecked: boolean){

    if(isChecked){
      this.filterService.filterFileTypeAdd(fileType)
    } else {
      this.filterService.filterFileTypeRemove(fileType)
    }
  }

  filterTag(tag: string, isChecked: boolean){

    if(isChecked){
      this.filterService.filterTagAdd(tag)
    } else {
      this.filterService.filterTagRemove(tag)
    }
  }

  filterTimeRange(timeRange: Date[]){
    console.log("Filter timeRange:", timeRange);

    this.filterService.filterTimeRange(timeRange);
  }

  filterFileSize(data: any){
    console.log("FILTER FILESIZE", data)
    this.filterService.filterFileSize([this.minFileSizeValue, this.maxFileSizeValue])
  }

  filterBookmark(bookmark: boolean){
    console.log("FILTER Bookmark", bookmark)
    this.filterService.filterBookmark(bookmark)
  }

  clearFilter(){
    this.filterService.filterClear();
  }

  thumbEndpoint(bucket: string, path: string){
    return (environment.apiBase ? environment.apiBase: '') + '/storage/' + bucket +'/' + path;
  }

  private getGlobalLimits() {
    this.es.getAggregations()
      .subscribe(wrapper => {
          console.log("aggregations", wrapper);
          this.globalLimits.maxDate = new Date(wrapper.aggregations.by_timerange.max_as_string);
          this.globalLimits.minDate = new Date(wrapper.aggregations.by_timerange.min_as_string);

          // Due to change detection rules in Angular, we need to re-create the options object to apply the change
          const newOptions: Options = Object.assign({}, this.sliderOptions);
          newOptions.floor = wrapper.aggregations.by_filesize.min;
          newOptions.ceil = wrapper.aggregations.by_filesize.max;
          this.sliderOptions = newOptions;

          this.minFileSizeValue = wrapper.aggregations.by_filesize.min;
          this.maxFileSizeValue = wrapper.aggregations.by_filesize.max;
        },
        error => {
          console.error("documents FAILED", error)
        },
        () => {
          console.log("documents finished")

        }
      );

  }

  private queryDocuments() {
    //TODO: pass filter to function.
    this.es.searchDocuments(this.filter)
      .subscribe(wrapper => {
          console.log("documents", wrapper);
          this.searchResults = wrapper.hits.hits;
          this.totalPages = wrapper.hits.total.value;

          this.fileTypeBuckets = wrapper.aggregations.by_filetype.buckets;
          this.tagBuckets = wrapper.aggregations.by_tag.buckets;
          // for(let bucket of wrapper.aggregations.by_filetype.buckets){
          //   this.fileTypeBuckets[bucket.key] = bucket.doc_count
          // }

        },
        error => {
          console.error("documents FAILED", error)
        },
        () => {
          console.log("documents finished")

        }
      );

  }

}
