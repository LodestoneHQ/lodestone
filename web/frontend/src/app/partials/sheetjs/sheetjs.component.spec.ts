import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetjsComponent } from './sheetjs.component';

describe('SheetjsComponent', () => {
  let component: SheetjsComponent;
  let fixture: ComponentFixture<SheetjsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetjsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
