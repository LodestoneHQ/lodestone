import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import * as XLSX from 'xlsx';
import {ApiService} from "../../services/api.service";
type AOA = any[][];

@Component({
  selector: 'sheetjs',
  templateUrl: './sheetjs.component.html',
  styleUrls: ['./sheetjs.component.scss']
})
export class SheetjsComponent implements AfterViewInit {
  data: AOA = [ ];

  @Input() src: string;

  constructor(private api: ApiService) { }
  ngAfterViewInit() {
    this.api.fetchDocumentData(this.src, 'arraybuffer')
      .subscribe(
        arrBuffResp => {
          // this.execRenderer(thirdPartyRenderType, arrBuffResp.body)
          var data = new Uint8Array(arrBuffResp.body);
          const wb: XLSX.WorkBook = XLSX.read(data, {type: 'array'});

          /* grab first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];

          /* save data */
          this.data = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));
        },
        err => console.error(err),
        () => {
          console.log("COMPLETE")
        }
      )
  }
}
