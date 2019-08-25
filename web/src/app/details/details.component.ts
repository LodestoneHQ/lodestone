import { Component, OnInit } from '@angular/core';
import {ElasticsearchService} from "../services/elasticsearch.service";
import {ActivatedRoute} from "@angular/router";
import {SearchResult} from "../models/search-result";
import * as mammoth from '../../../node_modules/mammoth/mammoth.browser.js';
import {Observable} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  documentId: string;
  documentData: SearchResult = new SearchResult();
  constructor(private es: ElasticsearchService, private activatedRoute: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.documentId = this.activatedRoute.snapshot.params.id;

    this.es.getById(this.documentId)
      .subscribe(
        data => {
          this.documentData = data;

          if(this.documentData._source.file.extension == 'docx' || this.documentData._source.file.extension == 'doc'){
            this.displayDocxFile()
          }
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

  displayDocxFile(){
    this.getStaticFile('/static' + this.documentData._source.path.virtual)

  }


  getStaticFile (filePath) {
    return this.http.get(filePath, {
      responseType: 'arraybuffer',
      observe: 'response'
    })

      .subscribe(
        arrBuffResp => {
          console.log("SUCCESSFUL ARRYBUFFER")
          this.renderDocx(arrBuffResp.body)
        },
        err => console.error(err),
        () => {
          console.log("COMPLETE")
        }
      )
  }

  renderDocx(data:ArrayBuffer) {
    console.log("REQUESTING MAMMOTH DOCUMENT.");
    mammoth.convertToHtml({arrayBuffer: data})
      .then((result) => {
        document.getElementById("output").innerHTML = result.value;
        console.log(result.messages)
        // var messageHtml = result.messages.map(function(message) {
        //   return '<li class="' + message.type + '">' + message.message + "</li>";
        // }).join("");
        //
        // document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
      })
      .done();
  }

}
