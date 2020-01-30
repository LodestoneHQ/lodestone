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


  thirdPartyRenderers = {
    'pdf': {
      fetchType: 'blob',
      renderElem: 'pdf',
      extensions: ['pdf']
    },
    'rtf': {
      fetchType: 'arraybuffer',
      renderElem: 'anchor',
      extensions: ['rtf']
    },
    'docx': {
      fetchType: 'arraybuffer',
      renderElem: 'anchor',
      extensions: ['docx', 'doc']
    }
  };

  @ViewChild(PdfJsViewerComponent, {static: false}) public pdfViewerAutoLoad: PdfJsViewerComponent;

  constructor(private api: ApiService) { }

  ngAfterViewInit() {
    let thirdPartyRenderType = this.renderType(this.extension)
    let fetchData = this.thirdPartyRenderers[thirdPartyRenderType]
    if(fetchData){
      this.api.fetchDocumentData(this.path, fetchData.fetchType)
        .subscribe(
          arrBuffResp => {
            this.execRenderer(thirdPartyRenderType, arrBuffResp.body)
          },
          err => console.error(err),
          () => {
            console.log("COMPLETE")
          }
        )
    }

  }
  //given an extension (docx, doc, pdf, jpeg, gif, etc) determine the renderType (docx,native, iframe, etc)
  renderType(extension: string){
    if(extension == 'jpg' || extension == 'jpeg' || extension == 'png' || extension ==  'gif'){
      return 'native' //browser native preview
    }
    else if(extension == 'pdf'){
      return 'pdf' //uses viewer.js through ng2-pdfjs-viewer
    }
    else if(extension == 'html'){
      return 'iframe' //uses iframe to render html.
    }

    //check if one of the third party renderers support this extension
    for(let renderType of Object.keys(this.thirdPartyRenderers)){
      if(this.thirdPartyRenderers[renderType].extensions.indexOf(extension) != -1){
        return renderType
      }
    }

    return 'unsupported';
  }

  //Renderers
  execRenderer = function(renderType, data){
    if(renderType == 'docx'){
      this.renderDocx(data)
    }
    else if(renderType == 'rtf'){
      this.renderRtf(data)
    }
    else if(renderType == 'pdf'){
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
        document.getElementById("thirdPartyAnchor").innerHTML = result.value;
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
      //TODO: document.getElementById("thirdPartyAnchor").append(htmlElements)
    }).catch(error => console.error(error))
  }
}
