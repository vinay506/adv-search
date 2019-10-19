import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-adv-search',
  templateUrl: './adv-search.component.html',
  styleUrls: ['./adv-search.component.css']
})


export class AdvSearchComponent implements OnInit {
  advSearchCriteria = '';
  searchCriteriaOnRibbon = '';
  advSearchValList = [];
  showSuggetionBox = false;
  suggestionList = [];
  lastSelectedItem;
  typeOfSuggetion = 'list';
  currentObj = getObjectTemplate();
  lastObj;
  columnName;
  columnKey;
  typeOfValue = 'text';
  searchObj;
  isLogicalOperator = false;
  currentGroupId = '';
  statusOfSearchCriteria = false;
  listOfLookUpValues = [];
  lastArithmeticOperator ;
  lastIndex = 0;

  @Input() suggestions;

  constructor() { }

  ngOnInit() {
    this.addEventOnDocument();
    this.addKedownEventOnDocument();
  }

  /** adds the keydown event on  docuement */
  addKedownEventOnDocument() {
    document.onkeydown = (event) => {
      if (event.which == 38 || event.which == 40) {
        this.handleArrowKeysOnList(event);
      }
    };
  }



  handleArrowKeysOnList(event) {
    switch (event.which) {
      case 38:
        this.handleUpArrow(event);
        break;
      case 40:
        this.handleDownArrow(event);
        break;
    }

  }


  handleDownArrow(event) {
    event.preventDefault();
    this.lastIndex = this.lastIndex + 1;
    this.addHighLightClass(this.lastIndex, '#suggestion-list-element', 'down');

  }



  handleUpArrow(event) {
    event.preventDefault();
    this.lastIndex = this.lastIndex - 1;
    this.addHighLightClass(this.lastIndex, '#suggestion-list-element', 'up');
  }


  addHighLightClass(index, selector, direction) {
    let elements = this.getListElements(selector);
    if (elements && index >= 0 && elements[index]) {
      if (index > 0 && direction === 'down' && elements[index - 1]) {
        elements[index - 1].classList.remove('highlight');
      } else if (index >= 0 && direction === 'up' && elements[index + 1]) {
        elements[index + 1].classList.remove('highlight');
      }
      elements[index].classList.add("highlight");
      elements[index].tabIndex = 1;
      elements[index].focus();
    }
  }

  udpateCurentObject() {
    if (this.advSearchValList.length === 0) {
      this.emptyCurrentObj();
    }
  }

  /** nullyfient the currenty object  */
  emptyCurrentObj() {
    this.lastSelectedItem = {};
    this.currentObj = getObjectTemplate();
  }

  getListElements(str) {
    let elements = document.querySelectorAll(str);
    return elements;
  }

  /** adds the click event on  docuement */
  addEventOnDocument() {
    document.onclick = (event) => { this.suggetionListClickOff(event) }
  }

  /** display no suggestion box on clickoff  */
  suggetionListClickOff(event) {
    const classList = this.getClassList(event)
    const array = classList.filter(item => {
      return (item === 'suggestion-list');
    });
    if (array.length === 0) {
      // updateScopeVar('showSuggetionBox', false);
      this.showSuggetionBox = false;
    }
  }

  /** get classlist based on click event  */
  getClassList(event) {
    const target = (event) ? event.target : '';
    const parent = (target) ? target.offsetParent : '';
    const grandParent = (parent) ? parent.offsetParent : '';
    const parentClassList = parent ? converToArray(parent.classList) : [];
    const grandParentClassList = grandParent ? converToArray(grandParent.classList) : [];
    let classList = converToArray(target.classList);
    classList = classList.concat(parentClassList);
    classList = classList.concat(grandParentClassList);
    return classList;
  }



  onKeyDown(event) {
    console.log('event ::', event);
  }

  clickedOnSearchCriteria() {
    console.log('clicked on search criteria');
  }

  /**  Will be called on select an item in suggestion list*/
  selectListElement(selectedItem, event) {
    event.stopPropagation();
    this.showSuggetionBox = false;
    this.lastSelectedItem = JSON.parse(JSON.stringify(selectedItem));
    this.actionBasedOnSelectedItem();
    this.setFocusOnSelect()
  }

  /**  handels different actions on selecting item in suggestion list*/
  actionBasedOnSelectedItem() {
    if (!this.lastSelectedItem) return false;
    switch (this.lastSelectedItem.type) {
      case 'paranthesis':
        this.actionOnSelectParentheses();
        break;
      case 'logicalOperator':
        this.updateWithLogicalOperator();
        break;
      case 'column':
        this.actionOnSelectColumn();
        break;
      case 'arithmeticOperator':
        this.updateWithArithmeticOperator();
    }
    this.updateCriteriaStatusFlag()
  }

  /**  this will describes the status of the query*/
  updateCriteriaStatusFlag() {
    this.statusOfSearchCriteria = true;
    this.statusOfSearchCriteria = this.checkWithEmptyValues(this.advSearchValList, true);
    if (this.statusOfSearchCriteria) {
      this.statusOfSearchCriteria = this.getStatusBasedOnParentheses(this.advSearchValList);
    }
    if (this.statusOfSearchCriteria) {
      this.checkStatusBasedOnCriteria(this.advSearchValList);
    }
    if (this.statusOfSearchCriteria) {
      this.checkStatusBasedOnLogicalOperator(this.advSearchValList)
    }
  }

  /**  will check the all logical operator for the status of generated query*/
  checkStatusBasedOnLogicalOperator(arr) {
    arr.forEach((item, index) => {
      if (this.statusOfSearchCriteria) {
        if (item.hasGroup) {
          this.checkStatusBasedOnLogicalOperator(item.group);
        } else {
          let flag = this.statusWithLogicalOperator(item, index, arr);
          if (!flag) {
            this.statusOfSearchCriteria = flag;
          }
        }
      }
    });
  }

  /**  will check the logical operator for the status of generated query*/
  statusWithLogicalOperator(item, index, arr) {
    let flag = true;
    let nextObj = arr[index + 1];
    if ((nextObj && item['logicalOperator'] === '') || (!nextObj && item['logicalOperator'])) {
      flag = false;
    }
    return flag;
  }


  /**  sets the status of Search Criteria ( valid or invalid) */
  checkStatusBasedOnCriteria(arr) {
    arr.forEach((item) => {
      if (this.statusOfSearchCriteria) {
        if (item.hasGroup) {
          this.checkStatusBasedOnCriteria(item.group);
        } else if (item.type !== 'paranthesis') {
          let flag = this.checkStatusOfCurrentObj(item)
          if (!flag) {
            this.statusOfSearchCriteria = flag;
          }
        }
      }
    });
  }

  /** checks for status on each object*/
  checkStatusOfCurrentObj(obj) {
    let array = ['column', 'arithmeticOperator', 'value'];
    let type = array.find(key => {
      return (obj[key] === '')
    });
    let flag = (type) ? false : true;
    return flag;
  }

  /**  returns list of group items(open parantheses)*/
  getListOfGroups(arr) {
    let groups = arr.filter(item => {
      return (item.type === 'paranthesis' && item.typeOfParanthesis === 'start')
    });
    return groups;
  }

  /**  will check the parantheses for the status of generated query*/
  getStatusBasedOnParentheses(arr) {
    let groups = this.getListOfGroups(arr);
    if (groups.length === 0) {
      return true;
    } else {
      let notClosedGrops = this.getNotClosedGroups(groups);
      let flag = (notClosedGrops.length > 0) ? false : true;
      if (flag) {
        flag = this.checkWithSubGroups(groups);
        return flag;
      } else {
        return flag;
      }
    }
  }

  /**  will check the all parantheses for the status of generated query*/
  checkWithSubGroups(groups) {
    let flag = true;
    groups.forEach(item => {
      flag = this.getStatusBasedOnParentheses(item.group);
    })
    return flag;
  }


  /**  returns list of group items(open parantheses) which are not closed*/
  getNotClosedGroups(groups) {
    let notClosedGrops = groups.filter(item => {
      return !item.isClosed;
    });
    return notClosedGrops;
  }

  /** checks the group with empty values */
  checkWithEmptyValues(arr, flag) {
    let status = flag;
    arr.forEach(obj => {
      if (status) {
        if (obj.hasGroup) {
          status = (obj.group.length == 0) ? false : true;
        }
      }
    })
    return status;
  }

  /** update with the arithmetic operator in the current object */
  updateWithArithmeticOperator() {
    this.isLogicalOperator = false;
    this.currentObj[this.lastSelectedItem.type] = this.lastSelectedItem;
    this.lastObj = this.currentObj;
    if (this.currentGroupId === '') {
      this.advSearchValList.forEach(searchVal => {
        if (searchVal.id === this.currentObj.id) {
          searchVal.arithmeticOperator = this.lastSelectedItem;
          searchVal = this.checkWithArithmeticOperator(searchVal);
        }
      });
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.currentObj.id, 'update', 'arithmeticOperator');
    }
  }

  /** check with arithmetic operator in the current object */
  checkWithArithmeticOperator(item) {
    if (this.lastArithmeticOperator && (this.lastArithmeticOperator.key !== this.lastSelectedItem.key)) {
      if ((this.lastArithmeticOperator.key === 'between' || this.lastSelectedItem.key === 'between') || (this.lastArithmeticOperator.key === 'NT_bw' || this.lastSelectedItem.key === 'NT_bw')) {
        item.value = '';
        this.lastArithmeticOperator = '';
        this.currentObj = JSON.parse(JSON.stringify(item));
      }
    }

    return item;
  }


  /** updates with logical operator to an object in list  */
  updateWithLogicalOperator() {
    if (this.currentGroupId === '') {
      let indexVal;
      this.advSearchValList.forEach((searchVal, index) => {
        if (searchVal.id === this.lastObj.id) {
          searchVal.logicalOperator = this.lastSelectedItem;
          if (searchVal.type === 'paranthesis') {
            this.currentGroupId = searchVal.parentId;
          }
          indexVal = index + 1;
        }
      });
      this.advSearchValList = this.getInsertedOpenParantheses(this.advSearchValList, indexVal);
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.lastObj.id, 'update', 'logicalOperator');
    }
    this.isLogicalOperator = false;
    this.emptyCurrentObj();
  }

  /** checks the data type of current selected column */
  actionOnSelectColumn() {
    if (this.currentObj.id) {
      let column = this.currentObj.column;
      if (column['columnDataType'] === this.lastSelectedItem.columnDataType) {
        this.actionOnSameDataType();
      } else {
        this.actionOnSelectColumnOnDifferentDatatype();
      }
      this.setColumnName(this.lastSelectedItem);
    } else {
      this.prepareCurrentObj()
    }
  }

  /** add the pair or object in list */
  prepareCurrentObj() {
    this.updateCurrentObjectWithColumn();
    if (this.currentGroupId != '') {
      this.updateCurrentGroup(this.advSearchValList, this.currentGroupId, 'addItem');
    } else {
      const obj = JSON.parse(JSON.stringify(this.currentObj))
      this.advSearchValList.push(obj);
    }
  }

  /** updates the current object  */
  updateCurrentObjectWithColumn() {
    this.isLogicalOperator = false;
    this.currentObj.id = generateUUID();
    this.currentObj.parentId = this.currentGroupId;
    this.currentObj[this.lastSelectedItem.type] = this.lastSelectedItem;
    this.setColumnName(this.lastSelectedItem);
  }

  /** will perform an action on selecting column on diffent data type on update*/
  actionOnSelectColumnOnDifferentDatatype() {
    this.currentObj[this.lastSelectedItem.type] = this.lastSelectedItem;
    this.lastObj = this.currentObj;
    if (this.currentGroupId === '') {
      this.advSearchValList.forEach(searchVal => {
        if (searchVal.id === this.currentObj.id) {
          searchVal[this.lastSelectedItem.type] = this.currentObj[this.lastSelectedItem.type];
          searchVal['arithmeticOperator'] = '';
          searchVal['value'] = '';
          this.currentObj = JSON.parse(JSON.stringify(searchVal));
        }
      });
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.currentObj.id, 'updateColWithDifferentDataType', this.lastSelectedItem.type);
    }
  }

  /** sets the columname  */
  setColumnName(selectedItem) {
    if (selectedItem.type === 'column') {
      this.columnName = selectedItem.key;
      this.setModelKey();
    }
  }

  /** sets the prepares the key for the model  */
  setModelKey() {
    let key = '';
    key = this.currentObj.id + '-' + this.columnName;
    this.columnKey = key;
  }

  /** will perform an action on selecting column on same data type on update*/
  actionOnSameDataType() {
    this.currentObj[this.lastSelectedItem.type] = this.lastSelectedItem;
    this.lastObj = this.currentObj;
    if (this.currentGroupId === '') {
      this.advSearchValList.forEach(searchVal => {
        if (searchVal.id === this.currentObj.id) {
          searchVal[this.lastSelectedItem.type] = this.currentObj[this.lastSelectedItem.type];
        }
      });
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.currentObj.id, 'update', this.lastSelectedItem.type);
    }

  }



  /** navigate the action based on type of parantheses  */
  actionOnSelectParentheses() {
    if (this.lastSelectedItem.typeOfParanthesis === 'start') {
      this.setOpenParentheses()
    } else {
      this.isLogicalOperator = true;
      this.setCloseParentheses();
    }
  }

  /** will adds the open parantheses in the list */
  setOpenParentheses() {
    let obj = Object.assign(this.lastSelectedItem, getGroupObjectTemplate());
    obj['parentId'] = this.currentGroupId;
    obj['id'] = generateUUID();
    this.currentGroupId = obj.id;
    obj.group = [];
    this.lastSelectedItem = JSON.parse(JSON.stringify(obj));
    if (this.lastSelectedItem.parentId === '') {
      this.advSearchValList.push(this.lastSelectedItem);
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.lastSelectedItem.parentId, 'addItem');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (this.advSearchValList, this.lastSelectedItem.parentId, 'addItem');
    }
  }



  /** updates current group id and  close parantheses */
  setCloseParentheses() {
    this.updateCurrentGroup(this.advSearchValList, this.currentGroupId, 'checkAndUpdateCurrentGroupId');
    this.updateCurrentGroup(this.advSearchValList, this.currentGroupId, 'closeParentheses');
  }

  /** iterates through group of groups */
  updateCurrentGroup(array, id, action, operator?: any) {
    array.forEach(item => {
      if (item.hasGroup) {
        if (item.id === id) {
          item = this.updateGroupItem(item, action, operator);
        } else {
          this.updateCurrentGroup(item.group, id, action, operator);
        }
      } else if (item.id === id && action == 'update' && operator === 'logicalOperator') {
        item = this.updateGroupItem(item, action, operator);
      } else if (item.id === id && item.type != 'paranthesis') {
        item = this.updateGroupItem(item, action, operator);
      }
    });
  }

  /** provides options to  group item  to perform action*/
  updateGroupItem(item, action, attr) {
    switch (action) {
      case 'addItem':
        item = this.addObjToGroup(item);
        break;
      case 'removeItem':
        item.group = this.removeObjFromGroup(item.group, attr);
        break;
      case 'closeParentheses':
        item = this.updateCloseParantheses(item);
        break;
      case 'checkAndUpdateCurrentGroupId':
        item = this.checkAndUpdateCurrentGroupId(item)
        break;
      case 'update':
        item = this.updateWithAttribute(item, attr);
        break;
      case 'empty':
        item = this.upadateWithEmptyVal(item, attr);
        break;
      case 'updateColWithDifferentDataType':
        item = this.updateWithDifferentDataType(item, attr);
        break;
      case 'updateORandNotOperator':
        item = this.updateORandNotOperator(item, attr);
    }
    return item;
  }

  /** update with parantheses for the or and not operator  */
  updateORandNotOperator(parentItem, item) {
    let indexVal;
    parentItem.group.forEach((searchVal, index) => {
      if (searchVal.id === item.id) {
        searchVal.logicalOperator = this.lastSelectedItem;
        indexVal = index + 1;
      }
    });
    parentItem.group = this.getInsertedOpenParantheses(parentItem.group, indexVal);

    return parentItem;
  }

  /** handling with adding parantheses (group) for or and not operator */
  getInsertedOpenParantheses(array, indexVal) {
    if (this.lastSelectedItem['key'] === 'or' || this.lastSelectedItem['key'] === 'not') {
      let restOfElements = array.slice(indexVal, array.length);
      array.splice(indexVal, array.length);
      let obj = getParanthesisObjTemplate();
      obj = Object.assign(obj, getGroupObjectTemplate());
      obj['parentId'] = this.currentGroupId;
      obj['id'] = generateUUID();
      obj['group'] = this.updateEachWithParentId(restOfElements, obj);
      this.lastSelectedItem = JSON.parse(JSON.stringify(obj));
      array.push(obj);

      obj.isClosed = true;
      let closeParentheses = {
        key: ')',
        typeOfParanthesis: 'end',
        displayName: ')',
        type: 'paranthesis',
        id: obj['id'],
        parentId: this.currentGroupId
      }
      array.push(closeParentheses);
    }
    return array
  }

  /** sets parent id for the next of elements */
  updateEachWithParentId(restOfElements, obj) {
    restOfElements.forEach(item => {
      item.parentId = obj.id;
    });
    return restOfElements;
  }



  /** nullify the arithmetic and value attribute on selectng to column with differnt data type*/
  updateWithDifferentDataType(item, attr) {
    item[attr] = this.currentObj[attr];
    item['arithmeticOperator'] = '';
    item['value'] = '';
    this.currentObj = JSON.parse(JSON.stringify(item));
  }


  /** updates with empty values */
  upadateWithEmptyVal(item, obj) {
    if (!obj.attr) return false;
    if (obj.attr === 'paranthesis') {
      if (obj.typeOfParenthesis === 'start') {
        item = this.removeOpenParenthesis(item, obj);
      } else if (obj.typeOfParenthesis === 'end') {
        item.group = this.removeCloseParanthesis(item.group, obj);
      }
    } else {
      item[obj.attr] = '';
      this.currentObj = item;
    }
  }


  /** removes open parantheses */
  removeOpenParenthesis(item, obj) {
    let arr = this.getRejectedList(item.group, obj.id);
    item.group = arr;
    return item;
  }

  /** removes close parantheses */
  removeCloseParanthesis(arr, obj) {
    let index = arr.findIndex(groupItem => {
      return groupItem.id == obj.id && groupItem.typeOfParanthesis == 'end';
    });
    arr.splice(index, 1);
    let openParanthesesIndex = arr.findIndex(groupItem => {
      return groupItem.id == obj.id && groupItem.typeOfParanthesis == 'start';
    });
    arr[openParanthesesIndex].isClosed = false;
    this.currentGroupId = arr[openParanthesesIndex].id;
    return arr;
  }



  /** returns  rejected list (not matched with id) */
  getRejectedList(arr, id) {
    let arrCopy = JSON.parse(JSON.stringify(arr));
    let rejectedList = arrCopy.filter(groupItem => {
      return groupItem.id != id;
    });
    return rejectedList;
  }

  /** update the list object with currnet object */
  updateWithAttribute(item, attr) {
    if (attr == 'value') {
      item[attr] = this.currentObj.value;
    } else if (attr == 'column') {
      item[attr] = this.currentObj[attr];
    } else if (attr == 'arithmeticOperator') {
      item[attr] = this.currentObj[attr];
      item = this.checkWithArithmeticOperator(item);
    } else if (attr == 'logicalOperator') {
      item[attr] = this.lastSelectedItem;
      if (item.type === 'paranthesis') {
        this.currentGroupId = item.parentId;
      }
      if (item.logicalOperator.displayName === 'OR') {
        this.updateCurrentGroup(this.advSearchValList, item.parentId, 'updateORandNotOperator', item);
      }

    } else {
      item = this.updateWithOperator(item, attr);
    }
    return item;
  }

  /** update with different type of operator*/
  updateWithOperator(item, operator) {
    if (operator) {
      item[operator] = this.lastSelectedItem.key;
    }

    return item;
  }


  /** updates current group id */
  checkAndUpdateCurrentGroupId(item) {
    if (item.isClosed === false) {
      this.currentGroupId = item.id;
    } else {
      if (item.parentId) {
        this.updateCurrentGroup(this.advSearchValList, this.currentGroupId, 'checkAndUpdateCurrentGroupId');
      }
    }

  }

  /** update the closing status of paranthese  */
  updateCloseParantheses(item) {
    item.isClosed = true;
    this.lastSelectedItem.id = item.id;
    this.lastSelectedItem.parentId = item.parentId;
    this.currentGroupId = item.parentId;
    this.lastObj = JSON.parse(JSON.stringify(item))
    if (item.parentId === '') {
      this.advSearchValList.push(this.lastSelectedItem);
    } else {
      this.updateCurrentGroup(this.advSearchValList, item.parentId, 'addItem');
    }
    return item;
  }

  /** remove the object the list*/
  removeObjFromGroup(arr, obj) {
    if (!obj.id) return arr;
    let index, prvEleIndex;
    index = arr.findIndex(groupItem => {
      return groupItem.id == obj.id;
    });
    if (index !== -1) {
      arr.splice(index, 1);
      // delete scope.searchObj[scope.columnKey];
      prvEleIndex = index - 1;
      if (prvEleIndex < 0) {
        this.emptyCurrentObj();
      } else {
        this.currentObj = arr[prvEleIndex];
      }
    }
    return arr;
  }

  /** addes the object to group  */
  addObjToGroup(item) {
    if (this.lastSelectedItem && this.lastSelectedItem.type === 'paranthesis') {
      this.lastSelectedItem.parentId = item.id;
      item.group.push(this.lastSelectedItem);
    } else {
      const obj = JSON.parse(JSON.stringify(this.currentObj));
      item.group.push(obj);
    }
    return item;
  }


  setFocusOnSelect() {

  }

}

/** generates the UUID for each object */
function generateUUID() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}

/** returns the templte of current object (object of cursor position) */
function getObjectTemplate() {
  const obj = {
    column: '',
    arithmeticOperator: '',
    value: '',
    hasParent: false,
    id: '',
    parentId: '',
    hasGroup: false,
    logicalOperator: ''
  }
  return obj;
}

/** returns the templte of start parantheses in suggestion list */
function getParanthesisObjTemplate() {
  let obj = {
    key: '(',
    typeOfParanthesis: 'start',
    displayName: '(',
    isClosed: false,
    type: 'paranthesis'
  }
  return obj;
}

/** returns the templte of group object (which will has group of pairs) */
function getGroupObjectTemplate() {
  const obj = {
    hasParent: false,
    id: '',
    hasGroup: true,
    parentId: '',
    logicalOperator: ''
  }
  return obj;
}

/** flatify the array  */
function converToArray(list) {
  list = [...list];
  return list;
}