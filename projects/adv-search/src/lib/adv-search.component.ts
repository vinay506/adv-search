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
  lastArithmeticOperator;
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


  /** will be called on key down in the query box*/

  onKeyDown(obj) {
    let { event, item } = obj;
    let array = [35, 36, 37, 39, 8, 46];
    let matchedKey = array.find(key => key === event.which);
    if (!matchedKey) { event.preventDefault(); }
    this.handleEventBasedOnAction(event, item);
  }

  /** provides a action based on event*/
  handleEventBasedOnAction(event, item) {
    switch (event.code) {
      case 'Space':
        this.prepareQueryForAdvSearch(event, item);
        break;
      case 'Backspace':
        this.handleBackSpace(event, item);
        break;
      case 'Delete':
        this.handleBackSpace(event, item);
        break;
      case 'Enter':
        this.handleEnterEvent()
    }
  }


  /** prepares search criteria */
  handleEnterEvent() {
    if (this.statusOfSearchCriteria) {
      this.advSearchCriteria = '';
      this.searchCriteriaOnRibbon = '';
      this.updateSearchCriteria(this.advSearchValList);
      this.removeOuterParantheses();
      this.preparePayloadOfAdvSearch();
    } else {
      console.log('Please enter search criteria')
    }
  }

  /** it will pass the payload to parent control */
  preparePayloadOfAdvSearch() {
    let criteria = this.advSearchCriteria.trim();
    let criteriaOnRibbon = this.searchCriteriaOnRibbon.trim();
    let payload = {
      query: criteria
    }
    // this.submitAdvsearch()(payload, this.advSearchValList, criteriaOnRibbon);
  }


  /** Removing outer parantheses , API team Needed With out outer parentheses */
  removeOuterParantheses() {
    let str = this.advSearchCriteria.trim();
    let strLength = str.length;

    if (str && str[0] === '(' && str[strLength - 1] === ')') {
      this.checkStatusOfCriteriaOnRemoveParanthese(str);
    }
  }

  /** check and removes outer paranhteses */
  checkStatusOfCriteriaOnRemoveParanthese(str) {
    let arr = JSON.parse(JSON.stringify(this.advSearchValList));
    let length = arr.length;
    if (length === 2 && arr[0].key === '(') {
      str = str.substr(1);
      str = str.slice(0, -1);
      this.advSearchCriteria = str;
    }
  }


  /** will be called on search event and prepares search criteria */
  updateSearchCriteria(arr) {
    arr.forEach((item, index) => {
      if (item.hasGroup) {
        this.advSearchCriteria = this.advSearchCriteria + ' ' + item['key'];
        this.searchCriteriaOnRibbon = this.searchCriteriaOnRibbon + ' ' + item['key'];
        this.updateSearchCriteria(item.group);
      } else {
        let hasLatLang = this.checkWithLatLangOnNext(item, index);
        this.concatinateSearchCriteria(item, hasLatLang);
      }
    });
  }

  /** update the search criteria with valid text */
  concatinateSearchCriteria(item, flag) {
    let array = ['column', 'arithmeticOperator', 'value', 'logicalOperator'];
    if (item.type === 'paranthesis') {
      let logicalOperatorKey = (item['logicalOperator']) ? item['logicalOperator'].key : '';
      let logicalOperatorDisplayName = (item['logicalOperator']) ? item['logicalOperator'].displayName : '';
      this.advSearchCriteria = this.advSearchCriteria + item['key'] + ' ' + logicalOperatorKey;
      this.searchCriteriaOnRibbon = this.searchCriteriaOnRibbon + item['key'] + ' ' + logicalOperatorDisplayName;
    } else {
      array.forEach(type => {
        let val = item[type];
        let valForRibbonCriteria = item[type];
        if (val && type === 'column') {
          val = val.key;
          valForRibbonCriteria = valForRibbonCriteria.displayName;
        }
        if (val && type === 'arithmeticOperator') {
          val = val.key;
          valForRibbonCriteria = valForRibbonCriteria.displayName;
        }

        if (val && type === 'logicalOperator') {
          val = val.key;
          valForRibbonCriteria = valForRibbonCriteria.displayName;
        }

        if (val && type === 'value') {
          val = this.checkwithLikeOperator(val, item);
          val = this.getFormatedValue(val, item);
        }

        if (type === 'logicalOperator' && flag && val === '&&') {
          val = '||';
        }

        if (val) {
          this.advSearchCriteria = (this.advSearchCriteria) ? this.advSearchCriteria.trim() : "";
          if (this.advSearchCriteria === '(') {
            this.advSearchCriteria = this.advSearchCriteria + val;
          } else {
            this.advSearchCriteria = this.advSearchCriteria + ' ' + val;
          }
          this.searchCriteriaOnRibbon = this.searchCriteriaOnRibbon + ' ' + valForRibbonCriteria;
        }
      });
    }
  }

  /** formates the value of current obj */
  getFormatedValue(val, item) {
    let value = '';
    let flag = /[()]/.test(val);
    if (flag) {
      value = this.getQuotedText(val);
      value = this.checkWithBetweenOperator(value, item);
    } else {
      value = "'" + val + "'";
    }
    return value;
  }

  checkWithBetweenOperator(val, item) {
    if (item.arithmeticOperator && !(item.arithmeticOperator.key == 'between' || item.arithmeticOperator.key == 'NT_bw')) {
      val = "(" + val + ")";
    }
    return val;
  }

  /** returns the quoted text */
  getQuotedText(val) {
    let value = val.replace(/[()]/g, '');
    value = value.trim();
    let arr = value.split(',');
    arr = arr.map(val => {
      return "'" + val + "'";
    });
    value = arr.join(',');
    return value;
  }

  /** updates val for like operator */
  checkwithLikeOperator(val, item) {
    if (item.arithmeticOperator && (item.arithmeticOperator.key === 'like' || item.arithmeticOperator.key === 'N_Lk')) {
      val = '%' + val + '%';
    }
    return val;
  }

  checkWithLatLangOnNext(item, index) {
    let isLatLangFlag = this.isLatLang(item);
    let flag = false;
    if (isLatLangFlag) {
      let nextObj = this.getNextObj(item, index);
      let current = item['column'];
      let next = nextObj['column'];
      let nextKey = (next) ? next.key : '';
      if (current.key !== nextKey) {
        flag = this.isLatLang(nextObj);
      }
    }
    return flag;
  }

  getNextObj(item, index) {
    let nextIndex = index + 1;
    let nextObj = {};
    if (item.parentId == '') {
      nextObj = this.advSearchValList[nextIndex];
    } else {
      let parentObj = this.getParentObj(this.advSearchValList, item.parentId)
      let group = parentObj.group;
      nextObj = group[nextIndex];
    }
    return nextObj || {};
  }

  getParentObj(arr, id) {
    let parentObj;
    arr.forEach(item => {
      if (!parentObj) {
        if (item.hasGroup) {
          if (item.id === id) {
            parentObj = item;
          } else {
            parentObj = this.getParentObj(item.group, id)
          }
        }
      }
    });
    return parentObj
  }


  isLatLang(item) {
    let col = item['column'];
    let key = (col) ? col.key : '';
    let arr = ['locationLAT', 'locationLONG'];
    let index = arr.findIndex(listItem => {
      return listItem.toLowerCase() === key.toLowerCase();
    });
    let flag = (index != -1) ? true : false;
    return flag;
  }


  /** handles the backspce event  */
  handleBackSpace(event, item) {
    let obj = this.getIdAndAttrFromEvent(event);
    if (obj['id'] && obj['attr']) {
      this.isLogicalOperator = (obj['attr'] === 'logicalOperator') ? true : false;
      this.handleBackSpaceBasedOnOperator(obj, item);
    }
  }

  /** handles the backspce event depends on operator */
  handleBackSpaceBasedOnOperator(obj, item) {
    switch (obj.attr) {
      case 'paranthesis':
        this.handleParenthesisOnBackSpace(obj, item);
        break;
      default:
        this.handleBackSpaceOnDefaultCase(obj, item);
    }
    this.updateCriteriaStatusFlag();
  }

  /** handles the backspce event on default case */
  handleBackSpaceOnDefaultCase(obj, item) {
    if (obj.attr === 'arithmeticOperator') {
      this.lastArithmeticOperator = item.arithmeticOperator;
    }
    item[obj.attr] = '';
    if (obj.attr !== 'column') {
      this.setColumnName(item.column);
    }
    this.currentObj = JSON.parse(JSON.stringify(item));
    this.lastObj = JSON.parse(JSON.stringify(item));
    this.checkWithEmpty(obj, item);
    this.setFocusToPreviousText(obj);
  }

  setFocusToPreviousText(obj) {
    let arr = ['column', 'arithmeticOperator', 'value', 'logicalOperator'];
    let index = arr.findIndex(item => {
      return (item === obj.attr);
    });
    if (index > 0) {
      let targetId = obj.id + '-type-' + arr[index - 1];
      let element = document.getElementById(targetId);
      setTimeout(() => {
        this.placeCaretAtEnd(element);
      }, 1)
    }
  }

  /** sets the cursor to the last position  */
  placeCaretAtEnd(el) {
    if (el) {
      el.focus();
    }
    if (window.getSelection
      && document.createRange) {
      var range = document.createRange();
      if (range) {
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }


  /** will check and removes the current obj */
  checkWithEmpty(obj, item) {
    let arr = ['column', 'arithmeticOperator', 'value'];
    let matchedList = arr.filter(str => {
      return (item[str] === '');
    });
    if (matchedList.length === arr.length) {
      this.currentGroupId = item.parentId;
      this.removeObjFromList(obj);
    }
  }

  /**  removes the current obj from the list*/
  removeObjFromList(obj) {
    if (this.currentGroupId === '') {
      this.advSearchValList = this.removeObjFromGroup(this.advSearchValList, obj)
    } else {
      this.updateCurrentGroup(this.advSearchValList, this.currentGroupId, 'removeItem', obj);
    }
  }



  /**  will be called on backspace event on parantheses*/
  handleParenthesisOnBackSpace(obj, item) {
    let type = obj.typeOfParenthesis;
    if (type === 'start') {
      if (item.parentId == '') {
        let arr = this.getRejectedList(this.advSearchValList, obj.id);
        this.advSearchValList = arr;
      } else {
        this.updateCurrentGroup(this.advSearchValList, item.parentId, 'empty', obj);
      }
      this.currentGroupId = item.parentId;
    } else if (type === 'end') {
      if (item.parentId == '') {
        this.advSearchValList = this.removeCloseParanthesis(this.advSearchValList, obj)
      } else {
        this.updateCurrentGroup(this.advSearchValList, item.parentId, 'empty', obj);
      }
    }
  }



  /** handles the space event depends on place it triggered */
  prepareQueryForAdvSearch(event, item) {
    let obj = this.getIdAndAttrFromEvent(event);
    if (item && item.type !== 'paranthesis') {
      this.currentObj = JSON.parse(JSON.stringify(item));
      this.currentGroupId = item.parentId;
      this.lastObj = JSON.parse(JSON.stringify(item));
      this.isLogicalOperator = (this.getTypeBasedOnLastValues()) ? false : true;
    } else {
      if (obj['typeOfParenthesis'] == 'start') {
        this.isLogicalOperator = false;
        this.emptyCurrentObj();
        this.currentGroupId = item.id;
      } else if (obj['typeOfParenthesis'] == 'end') {
        this.isLogicalOperator = true;
        this.lastObj = item;
      }
    }
    if (obj['attr'] === 'logicalOperator') {
      this.isLogicalOperator = false;
      this.emptyCurrentObj()
    }


    this.displaySuggestionBox(event);
  }

  /** projects list of items in suggetion box */
  displaySuggestionBox(event) {
    this.udpateCurentObject();
    this.showSuggetionBox = true;
    this.setPositionOfSuggestionBox(event);
    const type = this.getTypeOfList();
    if (this.currentObj['type'] !== 'paranthesis') {
      this.typeOfValue = this.getTypeOfValue();
    }
    if (type === 'value') {
      this.typeOfSuggetion = 'value';
      this.assignLookUpValues();
    } else if (type) {
      this.suggestionList = this.getSuggestionList(type);
      this.typeOfSuggetion = 'list';
    } else {
      this.suggestionList = this.suggestions['logicalOperator'];
      this.typeOfSuggetion = 'list';
    }
    this.addFocusToTheListElements()
  }
  addFocusToTheListElements() {
    setTimeout(() => {
      this.lastIndex = 0;
      this.addHighLightClass(this.lastIndex, '#suggestion-list-element', 'down');
    }, 1);
  }

  /** returns type of suggestion list */
  getSuggestionList(type) {
    let list = [];
    if (type == 'arithmeticOperator') {
      list = this.filterArithmeticOperator(type);
    } else {
      list = this.suggestions[type];
    }
    return list;
  }

  /** dicides which arithmetic operators to be listed based on data type of selected column */
  filterArithmeticOperator(type) {
    let arr = JSON.parse(JSON.stringify(this.suggestions[type]));
    arr = arr.filter(item => {
      let allowedTypes = item.allowedTo;
      const obj = allowedTypes.find(type => {
        return (type === this.typeOfValue);
      });
      let flag = (obj) ? true : false;
      return flag;
    });
    return arr;
  }


  /** assigns to lookupvalues list array with current lookup values */
  assignLookUpValues() {
    if (this.typeOfValue === 'dropdown') {
      this.listOfLookUpValues = this[this.columnName];
      this.convertToListOfObj()
    }
  }

  /** converts the list of strings to list of objects */
  convertToListOfObj() {
    this.listOfLookUpValues = this.listOfLookUpValues.map(value => {
      let obj = {}
      obj['value'] = value;
      obj['selected'] = false;
      return obj;
    })
  }


  /** returns the column type in current obj */
  getTypeOfValue() {
    let col = this.currentObj.column;
    let type = this.getColDataType(col);
    return type;
  }


  /** returns the column type in current obj */
  getColDataType(col) {
    let type = col.columnDataType;
    if (type === 'location') {
      type = 'between';
    }
    return type;
  }

  /** returns the type of list to be projected */
  getTypeOfList() {
    let type;
    if (!this.isLogicalOperator) {
      type = this.getTypeBasedOnLastValues();
    } else if (this.advSearchValList.length == 0) {
      type = 'column';
    } else {
      type = 'logicalOperator'
    }
    return type;
  }


  /** sets the possition of suggestion box with event offeset */
  setPositionOfSuggestionBox(event) {
    setTimeout(() => {

      let el = document.getElementById('suggestionBoxContainer');
      if (el) {
        if (event.currentTarget.id == "display-criteria") {
          el.style.left = event.currentTarget.offsetLeft + 'px';
        } else {
          this.setPositionBasedOnDocumentObj(event, document, el);
        }
      }
    }, 0);
  }

  /** sets the possition of suggestion box with event offeset */
  setPositionBasedOnDocumentObj(event, docObj, el) {
    let offsetLeft = event.currentTarget.offsetLeft;
    let docClientWidth = docObj.scrollingElement.clientWidth;
    if (offsetLeft < docClientWidth) {
      el.style.left = offsetLeft + 'px';
    } else {
      el.style.left = 500 + 'px';
    }
  }



  /** returns the type of list based on last values in current object*/
  getTypeBasedOnLastValues() {
    let type = '';
    let array = ['column', 'arithmeticOperator', 'value'];
    type = array.find(key => {
      return (this.currentObj[key] === '')
    });
    if (!type && this.currentObj.logicalOperator != '') {
      type = 'column';
      this.emptyCurrentObj();
    }
    return type;
  }



  /**  reads events attributes and returns*/
  getIdAndAttrFromEvent(event) {
    const targetEle = event.currentTarget;
    let idWithattr = (targetEle) ? targetEle.id : '';
    let array = idWithattr.split('-type-');
    const obj = {}
    obj['id'] = array[0];
    obj['attr'] = array[1];
    if (array[2]) {
      obj['typeOfParenthesis'] = array[2];
    }
    return obj;
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
      this.updateCurrentGroup(this.advSearchValList, this.lastSelectedItem.parentId, 'addItem'); (this.advSearchValList, this.lastSelectedItem.parentId, 'addItem');
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