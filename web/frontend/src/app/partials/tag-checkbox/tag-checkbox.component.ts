import {Component, EventEmitter, forwardRef, HostListener, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";


// https://medium.com/angular-in-depth/angular-nested-reactive-forms-using-cvas-b394ba2e5d0d
// https://indepth.dev/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms/
@Component({
  selector: 'tag-checkbox',
  templateUrl: './tag-checkbox.component.html',
  styleUrls: ['./tag-checkbox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagCheckboxComponent),
    multi: true
  }]
})

export class TagCheckboxComponent implements OnInit, ControlValueAccessor {
  @Input() tagName: string;
  @Input() sep: string = ".";

  minimizedText: string = "";
  displayText: string = "";

  ctrl = new FormControl(false);

  constructor() { }
  ngOnInit() {
    const parts = this.tagName.split(this.sep)
    if(parts.length > 1){
      this.minimizedText = parts.pop();
    }
    else {
      this.minimizedText = this.tagName
    }
    this.displayText = this.minimizedText
  }

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    val && this.ctrl.setValue(val, { emitEvent: false });
  }
  registerOnChange(fn: any): void {
    console.log("on change");
    this.ctrl.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.ctrl.disable() : this.ctrl.enable();
  }


  @HostListener('mouseenter', ['$event'])
  onMouseEnter(e: Event) {
    this.displayText = this.tagName
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(e: Event) {
    this.displayText = this.minimizedText
  }

}
