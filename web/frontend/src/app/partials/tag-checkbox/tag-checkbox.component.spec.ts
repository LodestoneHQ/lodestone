import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagCheckboxComponent } from './tag-checkbox.component';

describe('TagCheckboxComponent', () => {
  let component: TagCheckboxComponent;
  let fixture: ComponentFixture<TagCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
