import { Component,OnInit } from '@angular/core';
import suggestions, {default as jsonData} from './suggestions'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'smp-app';
  suggestions = jsonData;
  ngOnInit(){
    this.loadColumns()
  }

  loadColumns(){
    setTimeout(()=>{
      suggestions.column = [{
        key:'test',
        columnDataType:'text',
        displayName:'Test',
        type:'column'
      },{
        key:'test1',
        columnDataType:'text',
        displayName:'Test1',
        type:'column'
      },{
        key:'test2',
        columnDataType:'text',
        displayName:'Test2',
        type:'column'
      },{
        key:'test3',
        columnDataType:'text',
        displayName:'Test3',
        type:'column'
      },{
        key:'test4',
        columnDataType:'text',
        displayName:'Test4',
        type:'column'
      }]
    },100)
  }
}
