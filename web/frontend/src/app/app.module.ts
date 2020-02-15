import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './partials/header/header.component';
import { FooterComponent } from './partials/footer/footer.component';
import { DocPreviewComponent } from './partials/doc-preview/doc-preview.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailsComponent } from './details/details.component';
import { StatusComponent } from './status/status.component';
import { TagCheckboxComponent } from './partials/tag-checkbox/tag-checkbox.component';

import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'; // <-- Import PdfJsViewerModule module
import { MomentModule } from 'ngx-moment';
import { FileSizeModule } from "ngx-filesize";
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { Ng5SliderModule } from 'ng5-slider';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { SheetjsComponent } from './partials/sheetjs/sheetjs.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    DetailsComponent,
    StatusComponent,
    DocPreviewComponent,
    TagCheckboxComponent,
    SheetjsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    FileSizeModule,
    PdfJsViewerModule,
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    AccordionModule.forRoot(),
    BrowserAnimationsModule,
    TabsModule.forRoot(),
    TypeaheadModule.forRoot(),
    Ng5SliderModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    MarkdownModule.forRoot({ loader: HttpClient }),
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
