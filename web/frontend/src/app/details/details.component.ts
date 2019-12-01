import { Component, OnInit } from '@angular/core';
import {ElasticsearchService} from "../services/elasticsearch.service";
import {ActivatedRoute} from "@angular/router";
import {SearchResult} from "../models/search-result";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  documentId: string;
  documentData: SearchResult = new SearchResult();
  newTag: string = "";
  constructor(private es: ElasticsearchService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.documentId = this.activatedRoute.snapshot.params.id;

    this.es.getById(this.documentId)
      .subscribe(
        data => {
          this.documentData = data;
        },
        error => console.error(error),
        () => console.log("FINISHED")
      );
  }

  bookmarkDocument(currentState){


    this.es.bookmarkDocument(this.documentData._id, !currentState)
      .subscribe(wrapper => {
          console.log("Successful update")

          if (this.documentData._source.lodestone){
            this.documentData._source.lodestone.bookmark = !currentState
          } else {
            this.documentData._source.lodestone = {
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

  addDocumentTag(){
    this.es.addDocumentTag(this.documentData._id, this.newTag)
      .subscribe(wrapper => {
          console.log("Successful update")

          if (this.documentData._source.lodestone && this.documentData._source.lodestone.tags){
            this.documentData._source.lodestone.tags.push(this.newTag)
          } else {
            this.documentData._source.lodestone = {
              bookmark: false,
              tags: [this.newTag]
            }
          }
        },
        error => {
          console.error("Failed update", error)
        },
        () => {
          this.newTag = ""
          console.log("update finished")
        }
      );
  }

  removeDocumentTag(existingTag){
    this.es.removeDocumentTag(this.documentData._id, existingTag)
      .subscribe(wrapper => {
          console.log("Successful update")

          if (this.documentData._source.lodestone && this.documentData._source.lodestone.tags){
            this.documentData._source.lodestone.tags.splice(this.documentData._source.lodestone.tags.indexOf(this.newTag), 1)
          }
        },
        error => {
          console.error("Failed update", error)
        },
        () => {
          this.newTag = ""
          console.log("update finished")
        }
      );
  }

}
