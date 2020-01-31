import { Component, OnInit } from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ElasticsearchService} from "../services/elasticsearch.service";
import {DashboardFilter} from "../models/dashboard-filter";
import {DashboardFilterService} from "../filters/dashboard-filter.service";
import {SearchResult} from "../models/search-result";
import {AppSettings} from "../app-settings";
import {environment} from "../../environments/environment";
import { Options } from 'ng5-slider';
import * as filesize from 'filesize'
import {Router, ActivatedRoute} from "@angular/router";


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

  minMaxDateValue: Date[] = [];

  //aggregation/filter data & limits
  globalLimits = {
    maxDate: new Date(),
    minDate: new Date(),

    sortBy: AppSettings.SORT_BY_OPTIONS
  }

  constructor(
    private es: ElasticsearchService,
    private filterService: DashboardFilterService,
    private location: Location,
    private route: Router,
    private activatedRoute: ActivatedRoute,

  ) {}

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
    this.activatedRoute.params.subscribe(params => {
      var parsedFilter = this.filterService.filterSetFromParams(params);
      if(parsedFilter.fileSizes.length > 0){
        //setting the max/min values for filesize slider
        const newOptions: Options = Object.assign({}, this.sliderOptions);
        newOptions.floor = 0;
        newOptions.ceil = parsedFilter.fileSizes[1]+100;
        this.sliderOptions = newOptions;
        this.minFileSizeValue = parsedFilter.fileSizes[0];
        this.maxFileSizeValue = parsedFilter.fileSizes[1];
      }
      if(parsedFilter.timeRange.length > 0){
        //setting the max/min dates
        this.minMaxDateValue = parsedFilter.timeRange;
      }
    })

    this.getGlobalLimits()

    this.filterService.currentFilter.subscribe(filter => {

      this.currentPage = filter.page
      this.filter = filter;
      this.queryDocuments()

      // change the browser url whenever the filter is updated.
      this.updateBrowserUrl()
    })

    //set the filter to nothing, so that we can trigger a document query (works even when pressing back button)
    // this.filterService.filterClear()
  }

  updateBrowserUrl(){
    //deep copy current filter (So we can encode
    var clonedFilter = JSON.parse(JSON.stringify(this.filter));
    if(this.filter.timeRange && this.filter.timeRange.length){
      clonedFilter.timeRange = this.filter.timeRange.map(item => item.toJSON());
    }
    const url = this.route
      .createUrlTree([clonedFilter], {relativeTo: this.activatedRoute})
      .toString();
    this.location.replaceState(url);
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
    this.filterService.filterTimeRange(timeRange);
  }

  filterFileSize(data: any){
    this.filterService.filterFileSize([this.minFileSizeValue, this.maxFileSizeValue])
  }

  filterBookmark(bookmark: boolean){
    this.filterService.filterBookmark(bookmark)
  }

  clearFilter(){
    this.filterService.filterClear();
  }

  thumbEndpoint(bucket: string, path: string){
    path = path.split('/').map(part => encodeURIComponent(part)).join('/');
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

          if(this.minFileSizeValue == 0 && this.maxFileSizeValue == 0) {
            //if there's no filter value set,
            this.minFileSizeValue = wrapper.aggregations.by_filesize.min;
            this.maxFileSizeValue = wrapper.aggregations.by_filesize.max;
          }
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
    // this.location.replaceState('/dashboard','', this.filter)

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
