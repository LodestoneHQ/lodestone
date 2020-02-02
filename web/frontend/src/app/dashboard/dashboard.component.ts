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
import {Router, ActivatedRoute, Params} from "@angular/router";
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {debounceTime} from "rxjs/operators";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  //customize slider plugin
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

  //limits that are tied to the current result set.
  resultLimits = {
    totalPages: 0,
    fileTypeBuckets: [], // { [key: string]:any; }[],
    tagBuckets: [] //{ [key:string]:any; }[] = [],

  }

  filterForm =  this.filterService.filterForm;

  searchResults: SearchResult[] = [];

  constructor(
    private es: ElasticsearchService,
    private filterService: DashboardFilterService,
    private location: Location,
    private route: Router,
    private activatedRoute: ActivatedRoute,

  ) {}



  ngOnInit() {


    this.filterForm.valueChanges.pipe(debounceTime(200)).subscribe(val => {
      console.log("FILTER FORM CHANGED:", val)

      var dashboardFilter = this.filterService.convertFormToDashboardFilter(val)
      console.log("generated dashboard filter", dashboardFilter)

      this.queryDocuments(dashboardFilter)

      // change the browser url whenever the filter is updated.
      this.updateBrowserUrl(dashboardFilter)
    })

    this.activatedRoute.params.subscribe((params: Params) => {
      //this should only change when angular detects a page change (not when we set the route manually for deeplinking in updateBrowserUrl)
      console.log("ROUTE PARAMS CHANGED IN SERVICE", params)
      var updatedFormFields = this.filterService.convertParamsToForm(params)
      console.log("UPDATED FORM FIELDS", updatedFormFields, this.filterForm.value)
      if(updatedFormFields.fileSizes && this.sliderOptions.floor === 0 && this.sliderOptions.ceil === 0){
        //setting the max/min values for filesize slider
        const newOptions: Options = Object.assign({}, this.sliderOptions);
        newOptions.floor = 0;
        newOptions.ceil = updatedFormFields.fileSizes[1];
        this.sliderOptions = newOptions;
      }
      this.filterForm.patchValue(updatedFormFields, {emitEvent: false});

      // if(parsedFilter.timeRange.length > 0){
      //   //setting the max/min dates
      //   this.minMaxDateValue = parsedFilter.timeRange;
      // }
    })

    this.getGlobalLimits()
  }

  updateBrowserUrl(dashboardFilter: DashboardFilter){
    console.log("TODO: update the browser url")

    //deep copy current filter (So we can encode
    var clonedFilter = JSON.parse(JSON.stringify(dashboardFilter));
    if(dashboardFilter.dateRange && dashboardFilter.dateRange.length){
      clonedFilter.dateRange = dashboardFilter.dateRange.map(item => item.toJSON());
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



  filterSortBy(filterSortBy: string){
    this.filterForm.patchValue({
      sortBy: filterSortBy
    })

    console.log("filterSortBy:", filterSortBy)
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

          var fileSizes = this.filterForm.get('fileSizes').value;
          console.log("CURRENT FILESIZES WHEN GLOBAL DATA LOADED", fileSizes)
          if(fileSizes.length == 0 || (fileSizes[0] === 0 && fileSizes[1] === 0)) {
            console.log("SETTING new filesizes.",  [wrapper.aggregations.by_filesize.min, wrapper.aggregations.by_filesize.max])
            //if there's no filter value set,
            this.filterForm.patchValue({
              fileSizes: [wrapper.aggregations.by_filesize.min, wrapper.aggregations.by_filesize.max]
            }, {emitEvent:false})
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

  private queryDocuments(filter: DashboardFilter) {
    //TODO: pass filter to function.
    // this.location.replaceState('/dashboard','', this.filter)

    this.es.searchDocuments(filter)
      .subscribe(wrapper => {
          console.log("documents", wrapper);
          this.searchResults = wrapper.hits.hits;
          this.resultLimits.totalPages = wrapper.hits.total.value;

          this.resultLimits.fileTypeBuckets = wrapper.aggregations.by_filetype.buckets;
          this.resultLimits.tagBuckets = wrapper.aggregations.by_tag.buckets;


          console.log(this.resultLimits.fileTypeBuckets)

          var fileTypeControls = this.filterForm.get('fileTypes') as FormGroup;
          this.resultLimits.fileTypeBuckets.forEach((option: any) => {
            if(option.key && !fileTypeControls.contains(option.key)){
              fileTypeControls.addControl(option.key, new FormControl(false));
            }
          });

          //
          //
          // //this should clear out the controls without generating an event (which would cause an inf loop)
          // fileTypeControls.controls.splice(0, fileTypeControls.controls.length)
          //
          // this.resultLimits.fileTypeBuckets.forEach((o, i) => {
          //   console.log("ADDING FILETTYPEBUCKET", o, i)
          //   const control = new FormControl(i === 0); // if first item set to true, else false
          //   // this should (re)add a control without causing a form event (which would cause an inf loop)
          //   fileTypeControls.controls.push(control)
          // });
          // // this.filterForm.controls.fileTypes.setValue(fileTypeControls)
        },
        error => {
          console.error("documents FAILED", error)
        },
        () => {
          console.log("documents finished")
        }
      );
  }

  bucketDocCount(buckets: { [key: string]:any; }[], key){

    return (buckets.find((bucket) => { return bucket.key === key }) || {}).doc_count
  }
}
