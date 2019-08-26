import {Component, Input, OnInit} from '@angular/core';
import * as mammoth from '../../../../node_modules/mammoth/mammoth.browser.js';
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-doc-preview',
  templateUrl: './doc-preview.component.html',
  styleUrls: ['./doc-preview.component.scss']
})
export class DocPreviewComponent implements OnInit {

  @Input() extension: string;
  @Input() path: string;

  constructor(private api: ApiService) { }

  ngOnInit() {

    if(this.previewType(this.extension) == 'third-party'){
      this.api.fetchDocumentData(this.path)
        .subscribe(
          arrBuffResp => {
            console.log("SUCCESSFUL ARRYBUFFER")
            if(this.extension == 'docx'){
              this.renderDocx(arrBuffResp.body)
            }


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
    else if(extension == 'docx'){
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

}
