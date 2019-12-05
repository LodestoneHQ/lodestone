import { Component, OnInit } from '@angular/core';

import {ApiService} from "../services/api.service";
import {StatusResult} from "../models/status-result";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  statusResult: StatusResult = new StatusResult();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.fetchStatus().subscribe(result => {
        console.log("Successful status ");
        console.log(result);

      this.statusResult = result
      },
      error => {
        console.error("Failed status", error)
      },
    );
  }

}
