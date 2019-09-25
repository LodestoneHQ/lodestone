import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPreviewComponent } from './doc-preview.component';

describe('DocPreviewComponent', () => {
  let component: DocPreviewComponent;
  let fixture: ComponentFixture<DocPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
