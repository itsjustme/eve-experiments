/// <reference path="./microReact.ts" />
module ui {
  //---------------------------------------------------------
  // Types
  //---------------------------------------------------------
  type Element = microReact.Element;
  type Content = (() => Element)|string;
  type Handler = microReact.Handler<Event>;

  export interface ElemOpts {
    c?:string
    semantic?:string
    key?:string
    debug?:string
  }

  type Control = Element;

  export interface Pane {
    title:Content
    id:string
    content:Content
  }

  export interface UiState {
    tabbedBox: {[id:string]: string}
  }

  //---------------------------------------------------------
  // Utilities
  //---------------------------------------------------------
  function inject(elem:Element, content:Content):Element {
    if(typeof content === "string") {
      elem.text = content;
    } else if(typeof content === "function") {
      elem.children = [content()];
    }
    return elem;
  }

  //---------------------------------------------------------
  // Dispatcher
  //---------------------------------------------------------
  export var onChange = () => undefined;
  export var uiState:UiState = {
    tabbedBox: {}
  };

  export function init(localState:any, changeHandler:() => void) {
    onChange = changeHandler;
    if(!localState.uiState) {
      localState.uiState = uiState;
    } else {
      uiState = localState.uiState;
    }
  }

  var dispatches:{[evt:string]: (info:{}) => boolean} = {
    switchTab: ({tab, tabbedBox}:{tab:string, tabbedBox:string}) => {
      uiState.tabbedBox[tabbedBox] = tab;
      return true;
    }
  };
  export function dispatch(evt:string, info:any) {
    if(!dispatches[evt]) {
      console.error("Unknown dispatch:", event, info);
      return;
    } else {
      let changed = dispatches[evt](info);
      if(changed) {
        onChange();
      }
    }
  }

  //---------------------------------------------------------
  // Containers
  //---------------------------------------------------------
  export interface TabbedBoxElement extends Element {
    panes: Pane[]
    controls?:Control[]
    defaultTab?:string
  }
  export function tabbedBox(elem:TabbedBoxElement):Element {
    let {id, defaultTab, panes = [], controls = []} = elem;
    if(panes.length < 1) { return; }
    let tabs = [];
    let currentPane;
    let selected = uiState.tabbedBox[id];
    if(selected === undefined) {
      selected = uiState.tabbedBox[id] = (defaultTab !== undefined) ? defaultTab : panes[0].id;
    }

    for(let pane of panes) {
      let isSelected = (pane.id === selected);
      tabs.push(inject({c: isSelected ? "tab selected" : "tab", tab: pane.id, tabbedBox: id, semantic: "item::tab::" + pane.id, click: switchTab}, pane.title));
      if(isSelected) {
        currentPane = pane;
      }
    }
    elem.c = "tabbed-box" + (elem.c ? " " + elem.c : "");
    elem.children = [
      {c: "tabs", children: tabs.concat(ui.spacer()).concat(controls)},
      inject({c: "pane"}, currentPane.content)
    ];
    return elem;
  }

  function switchTab(evt, elem) {
    dispatch("switchTab", {tabbedBox: elem.tabbedBox, tab: elem.tab});
  }

  export function horizontal(elem:Element):Element {
    elem.c = (elem.c) ? "flex-row " + elem.c : "flex-row";
    return elem;
  }

  export function vertical(elem:Element):Element {
    elem.c = (elem.c) ? "flex-column " + elem.c : "flex-column";
    return elem;
  }

  //---------------------------------------------------------
  // Inputs
  //---------------------------------------------------------
  export function button(elem:Element):Element {
    elem.c = (elem.c) ? "button " + elem.c : "button";
    elem.t = "button";
    return elem;
  }

  interface TextInputElement extends Element {
    multiline?:boolean
  }
  export function input(elem:TextInputElement) {
    let {multiline} = elem;
    if(multiline) {
      elem.t = "textarea";
    } else {
      elem.t = "input";
      elem.type = "text";
    }
    return elem;
  }
  
  export function checkbox(elem:Element):Element {
    elem.c = (elem.c) ? "checkbox " + elem.c : "checkbox";
    elem.t = "input";
    elem.type = "checkbox"
    return elem;
  }

  //---------------------------------------------------------
  // Components
  //---------------------------------------------------------
  export function spacer(elem:Element = {}):Element {
    elem.c = (elem.c) ? "flex-spacer " + elem.c : "flex-spacer";
    return elem;
  }
}