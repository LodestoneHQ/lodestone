import {Component, OnInit, TemplateRef} from '@angular/core';

import {ApiService} from "../services/api.service";
import {StatusResult} from "../models/status-result";
import {BsModalRef, BsModalService} from "ngx-bootstrap";
import {SyncResult} from "../models/sync-result";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  statusResult: StatusResult = new StatusResult();
  statusDate: Date = new Date()
  modalRef: BsModalRef;

  syncedDocuments: SyncResult[] = [];
  processingErrors: [];

  loading = {
    scan: false,
    errors: false,
    status: false
  }

  constructor(private apiService: ApiService, private modalService: BsModalService) {}

  ngOnInit() {
    this.getStatus()
  }

  getStatus(event=null){
    if(this.loading.status){
      return
    }
    this.loading.status = true;
    this.apiService.fetchStatus().subscribe(result => {
        console.log("Successful status ");
        console.log(result);

        this.statusDate = new Date()
        this.statusResult = result
      },
      error => {
        console.error("Failed status", error)
      },
      () => {
        this.loading.status = false
      }
    );
  }

  scanMissingConfirm(scanMissingTemplate: TemplateRef<any>){
    this.modalRef = this.modalService.show(scanMissingTemplate, {
      class: 'modal-dialog-centered modal-lg'
    });
  }


  scanMissing(scanTemplate: TemplateRef<any>){

    if(this.loading.scan){
      return
    }

    //scan for missing documents
    this.loading.scan = true;
    this.apiService.syncStorage().subscribe(result => {
        console.log("Successful scan");
        console.log(result);

        this.syncedDocuments = result;

        this.modalRef = this.modalService.show(scanTemplate, {
            class: 'modal-dialog-centered modal-dialog-scrollable modal-lg',
            ignoreBackdropClick: true
        });
      },
      error => {
        console.error("Failed scan", error)
      },
      () =>{
      this.loading.scan = false
      }
    );
  }

  viewErrors(template: TemplateRef<any>){
    if(this.loading.errors){
      return
    }

    //list document errors
    this.loading.errors = true;
    this.apiService.fetchStatusErrors().subscribe(result => {
        console.log("Retrieved Errors");
        console.log(result);

        this.processingErrors = result;

        this.modalRef = this.modalService.show(template, {
          class: 'modal-dialog-centered modal-dialog-scrollable modal-lg',
          ignoreBackdropClick: true
        });
      },
      error => {
        console.error("Could not get errors", error)
      },
      () =>{
        this.loading.errors = false
      }
    );


    // this.modalRef = this.modalService.show(template, {
    //   class: 'modal-dialog-centered modal-lg',
    //   ignoreBackdropClick: true
    // });

  }



}
