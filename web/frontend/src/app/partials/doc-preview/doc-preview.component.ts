// tslint:disable

import {Component, Input, AfterViewInit, ViewChild} from '@angular/core';
import * as mammoth from '../../../../node_modules/mammoth/mammoth.browser.js';
import {ApiService} from "../../services/api.service";
import {RTFJS} from 'rtf.js';
import * as $ from "jquery";
import {environment} from "../../../environments/environment";
import {PdfJsViewerComponent} from "ng2-pdfjs-viewer";

@Component({
  selector: 'app-doc-preview',
  templateUrl: './doc-preview.component.html',
  styleUrls: ['./doc-preview.component.scss']
})
export class DocPreviewComponent implements AfterViewInit {

  @Input() extension: string;
  @Input() path: string;


  thirdPartyRenderers = ['pdf', 'rtf', 'docx'];

  @ViewChild(PdfJsViewerComponent, {static: false}) public pdfViewerAutoLoad: PdfJsViewerComponent;

  constructor(private api: ApiService) { }

  ngAfterViewInit() {
    if(this.previewType(this.extension) == 'third-party'){
      this.api.fetchDocumentData(this.path, 'arraybuffer')
        .subscribe(
          arrBuffResp => {
            this.chooseRenderer(this.extension, arrBuffResp.body)
          },
          err => console.error(err),
          () => {
            console.log("COMPLETE")
          }
        )
    } else if(this.previewType(this.extension) == 'pdf') {
      this.api.fetchDocumentData(this.path, 'blob')
        .subscribe(
          arrBuffResp => {
            this.chooseRenderer(this.extension, arrBuffResp.body)
          },
          err => console.error(err),
          () => {
            console.log("COMPLETE")
          }
        )
    }

  }

  previewType(extension: string){
    if(extension == 'jpg' || extension == 'jpeg' || extension == 'png' || extension ==  'gif'){
      return 'native' //browser native preview
    }
    else if(extension == 'pdf'){
      return 'pdf' //uses viewer.js through ng2-pdfjs-viewer
    }
    else if(extension == 'html'){
      return 'iframe' //uses iframe to render html.
    }
    else if(this.thirdPartyRenderers.indexOf(extension) != -1){
      return 'third-party'
    } else {
      return 'unsupported'
    }
  }

  //Renderers
  chooseRenderer = function(extension, data){
    if(extension == 'docx'){
      this.renderDocx(data)
    }
    else if(extension == 'rtf'){
      this.renderRtf(data)
    }
    else if(extension == 'pdf'){
      this.renderPdf(data)
    }
  }

  renderPdf(data: Blob){
    this.pdfViewerAutoLoad.pdfSrc = data;
    this.pdfViewerAutoLoad.refresh();
  }

  private renderDocx(data: ArrayBuffer) {
    console.log("REQUESTING MAMMOTH DOCUMENT.");
    mammoth.convertToHtml({arrayBuffer: data})
      .then((result) => {
        document.getElementById("thirdPartyRender").innerHTML = result.value;
        console.log(result.messages)
        // var messageHtml = result.messages.map(function(message) {
        //   return '<li class="' + message.type + '">' + message.message + "</li>";
        // }).join("");
        //
        // document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
      })
      .done();
  }

  private renderRtf(data: ArrayBuffer){
    const doc = new RTFJS.Document(data,{});

    const meta = doc.metadata();
    doc.render().then(function(htmlElements) {
      console.log(meta);
      //TODO: document.getElementById("thirdPartyRender").append(htmlElements)
    }).catch(error => console.error(error))
  }
}
