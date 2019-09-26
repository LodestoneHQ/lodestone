// tslint:disable

import {Component, Input, OnInit} from '@angular/core';
import * as mammoth from '../../../../node_modules/mammoth/mammoth.browser.js';
import {ApiService} from "../../services/api.service";
import {RTFJS} from 'rtf.js';
import * as $ from "jquery";

@Component({
  selector: 'app-doc-preview',
  templateUrl: './doc-preview.component.html',
  styleUrls: ['./doc-preview.component.scss']
})
export class DocPreviewComponent implements OnInit {

  @Input() extension: string;
  @Input() path: string;

  renderers = {
    'docx': this.renderDocx,
    'rtf': this.renderRtf
  }
  constructor(private api: ApiService) { }

  ngOnInit() {

    if(this.previewType(this.extension) == 'third-party'){
      this.api.fetchDocumentData(this.path)
        .subscribe(
          arrBuffResp => {
            console.log("SUCCESSFUL ARRYBUFFER")
            this.renderers[this.extension](arrBuffResp.body)
          },
          err => console.error(err),
          () => {
            console.log("COMPLETE")
          }
        )
    }

  }

  previewType(extension: string){
    if(extension == 'jpg' || extension == 'jpeg' || extension == 'png'){
      return 'native' //browser native preview
    }
    else if(extension == 'pdf'){
      return 'pdf' //uses viewer.js through ng2-pdfjs-viewer
    }
    else if(this.renderers[extension]){
      return 'third-party'
    } else {
      return 'unsupported'
    }
  }

  //Renderers
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
      $("#thirdPartyRender").append(htmlElements)
    }).catch(error => console.error(error))
  }

}
