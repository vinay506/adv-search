import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'display-search-criteria',
  templateUrl: './display-search.component.html',
  styleUrls: ['./display-search.component.css']
})
export class DisplaySearchComponent implements OnInit {
  @Input()list;
  @Input()searchCriteria;
  @Output()handleKeydown = new EventEmitter();
  @Output() focusOnlastElement = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onKeyDown(event,item){
    this.handleKeydown.emit({event,item});
  }

  lastElementFocus(event,item){
    this.focusOnlastElement.emit({event,item});
  }

}
