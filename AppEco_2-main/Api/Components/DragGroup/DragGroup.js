// 18.12.2022

import {Component} from '../Component.js';




class DragGroup extends Component {
  static url = import.meta.url;
  
  
  
  
  _drag_item__template = null;
  _drag_items = [];
  _dragged_item = null;
  _drop_zone__template = null;
  _drop_zones = [];
  _drop_zones__container = null;
  _dropped_item = null;
  _event_finally = null;
  _group_item_count = {}
  _start_zone = null;
  _title_zone_template = null;
  
  
  
  
  static #_solver(polygon) {
    let drag_items = Array.from(polygon.querySelectorAll('.drag_item'));
    let drop_zones = Array.from(polygon.querySelector('.drop_zones').children);
    
    for (let i = 0; i < drag_items.length - 1; i++) {
      let drop_zone = drop_zones.find((item) => item.id == drag_items[i].dataset.groupId);
      
      if (!drop_zone) continue;
      
      drop_zone.append(drag_items[i]);
    }
  }
  
  
  
  
  async _build() {
    await super._build();
    
    this._drag_item__template = this._template.querySelector('.drag_item');
    this._drop_zone__template = this._template.querySelector('.drop_zone');
    this._drop_zones__container = this._body.querySelector('.drop_zones');
    this._start_zone = this._body.querySelector('.start_zone');
    this._title_zone_template = this._template.querySelector('.title_zone');
    
    this._event_finally = new Event('finally', {
      bubbles: true,
      composed: true,
    });
    
    this.refrash();
  }
  
  
  _drag_item__on_dragStart(event) {
    event.target.classList.add('drag_item__active');
    
    this._dragged_item = event.target;
  }
  
  
  _drag_item__on_dragEnd(event) {
    event.target.classList.remove('drag_item__active');
 
    this._dragged_item = null;
  }
  
  
  _drag_item__on_dragEnter(item) {
    if (this._dragged_item == this._dropped_item) return;
        
    this._dropped_item = item;
  }
  
  
  _drag_item__on_dragLeave() {
    this._dropped_item = null;
  }
  
  
  _drop_zone__on_dragEnter(event) {
    if (event.target.classList.contains('drag_item') || event.target.parentElement.classList.contains('drag_item')) return;
    
    event.target.classList.add('drop_zone__active');
  }
  
  
  _drop_zone__on_dragLeave(event) {
    event.target.classList.remove('drop_zone__active');
  }
  
  
  _drop_zone__on_dragOver(event) {
    event.preventDefault();
  }
  
  
  _drop_zone__on_drop(event) {
    for (let drop_zone of this._drop_zones) {
      drop_zone.classList.remove('drop_zone__active');
    }
    
    if (event.target.id == this._dragged_item.dataset.groupId) {
      this._insert_item(event);
      this._success__insert_item(this._dragged_item);
    }
    else if (event.target.classList.contains('start_zone')) {
      this._insert_item(event);
      
      if (this._dragged_item.classList.contains('_error')) {
        this._dragged_item.classList.remove('_error')
      }
      if (this._dragged_item.classList.contains('_success')) {
        this._dragged_item.classList.remove('_success')
      }
    }
    else if (event.target.id && event.target.id != this._dragged_item.dataset.groupId) {
      this._insert_item(event);
      this._error__insert_item(this._dragged_item);
    }
  }
  
  
  _insert_groups() {
    for (let i = 0; i < this.children.length; i++) {
      let date = new Date();
      let drop_zone = this._drop_zone__template.cloneNode(true);
      let group = this.children[i];
      let id = String(i + date.getTime());
      let group_item = Array.from(group.children);
      
      this._group_item_count[id] = group_item.length;
      
      for (let child of group_item) {
        let drag_item = this._drag_item__template.cloneNode(true);
        
        drag_item.append(child);
        drag_item.dataset.groupId = id;
        this._drag_items.push(drag_item);
      }
      
      drop_zone.id = id;
      drop_zone.setAttribute('title', group.dataset.title || '');
      this._drop_zones.push(drop_zone);
    }
    
    this._drag_items = this._shuffle(this._drag_items);
    
    for (let drag_item of this._drag_items) {
      this._start_zone.append(drag_item);
    }
  }
  
  
  _insert__drop_zones() {
    window.a = this._drop_zones
    for (let drop_zone of this._drop_zones) {
      let title_zone = this._title_zone_template.cloneNode(true);
      
      title_zone.textContent = drop_zone.getAttribute('title');
      this._drop_zones__container.append(title_zone);
    }
    
    for (let drop_zone of this._drop_zones) {
      this._drop_zones__container.append(drop_zone);
    }
  }
  
  
  _insert_item(event) {
    if (this._dropped_item) {
      if (this._dropped_item.parentElement == this._dragged_item.parentElement) {
        let children = Array.from(this._dropped_item.parentElement.children);
        let dragged_index = children.indexOf(this._dragged_item);
        let dropped_index = children.indexOf(this._dropped_item);
        
        if (dragged_index > dropped_index) {
          this._dragged_item.parentElement.insertBefore(this._dragged_item, this._dropped_item);
        }
        else {
          this._dragged_item.parentElement.insertBefore(this._dragged_item, this._dropped_item.nextElementSibling);
        }
      }
      else {
        event.target.parentElement.insertBefore(this._dragged_item, this._dropped_item);
      }
    }
    else {
      event.target.append(this._dragged_item);
    }
    
    this._check_end();
  }
  
  
  _addEventsHandlers() {
    for (let drag_item of this._drag_items) {
      drag_item.addEventListener('dragend', this._drag_item__on_dragEnd.bind(this));
      drag_item.addEventListener('dragenter', () => this._drag_item__on_dragEnter(drag_item));
      drag_item.addEventListener('dragleave', this._drag_item__on_dragLeave.bind(this));
      drag_item.addEventListener('dragstart', this. _drag_item__on_dragStart.bind(this));
    }

    for (let drop_zone of this._drop_zones) {
      drop_zone.addEventListener('dragenter', this._drop_zone__on_dragEnter.bind(this));
      drop_zone.addEventListener('dragleave', this._drop_zone__on_dragLeave.bind(this));
      drop_zone.addEventListener('dragover', this._drop_zone__on_dragOver.bind(this));
      drop_zone.addEventListener('drop', this._drop_zone__on_drop.bind(this));
    }
  }
  
  
  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array;
  }
  
  
  _success__insert_item(element) {
    if (element.classList.contains('_error')) {
      element.classList.remove('_error')
    }
    
    element.classList.add('_success');
  }
  
  
  _error__insert_item(element) {
    if (element.classList.contains('_success')) {
      element.classList.remove('_success')
    }
    
    element.classList.add('_error');
  }
  
  
  _check_end() {
    for (let i = 0; i < this._drop_zones.length - 1; i++) {
      if (!(this._drop_zones[i].children.length == this._group_item_count[+this._drop_zones[i].id] && !this._drop_zones[i].querySelectorAll('[_error]').length)) return;
    }
    
    this.dispatchEvent(this._event_finally);
  }
  
  
  
  
  refrash() {
    this._insert_groups();
    
    this._body.style.setProperty('--_template_grid', `repeat(2, auto) / repeat(${this._drop_zones.length}, 1fr)`);
    
    this._insert__drop_zones();
    this._drop_zones.push(this._start_zone);
    
    this._addEventsHandlers();
    
    // this.constructor.#_solver(this._body);
  }
}




DragGroup.init();
