import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'tag-checkbox',
  templateUrl: './tag-checkbox.component.html',
  styleUrls: ['./tag-checkbox.component.scss']
})
export class TagCheckboxComponent implements OnInit {

  @Input() tagName: string;
  @Input() isSelected: boolean = true;
  @Output() valueChange = new EventEmitter();

  @Input() sep: string = ".";

  minimizedText: string = "";

  displayText: string = "";




  @HostListener('mouseenter', ['$event'])
  onMouseEnter(e: Event) {
    this.displayText = this.tagName
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(e: Event) {
    this.displayText = this.minimizedText
  }

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

  tagClicked() {
    this.valueChange.emit(this.tagName)
  }

}
