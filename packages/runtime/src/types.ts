


export type Signal<T> = () => T;
export type Setter<T> = (value: T | ((prev: T) => T)) => void;
export type SignalTuple<T> = readonly [Signal<T>, Setter<T>];


export type EffectFn = () => void;
export type EffectCleanup = () => void;
export type EffectRunner = EffectFn & {
  deps?: Set<Set<EffectFn>>;
  disposed?: boolean;
  name?: string;
};


export type ComputedFn<T> = () => T | Promise<T>;
export type Computed<T> = (() => T) & { _isComputed?: boolean };


export interface ComponentProps {
  children?: any;
  key?: string | number;
  ref?: (element: Element | null) => void;
}

export type Component<P extends ComponentProps = ComponentProps> = (props: P) => Node;


export interface JSXElement {
  type: string | Component<any>;
  props: Record<string, any>;
  key?: string | number;
}


export type Child = 
  | Node 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | (() => any) 
  | Child[];


export type RouteMap = Record<string, Component<any> | undefined>;
export type RouteGuard = (to: string, from: string) => boolean | string | Promise<boolean | string>;
export type RouterMode = 'hash' | 'history';

export interface RouterConfig {
  mode?: RouterMode;
  routes: RouteMap;
  beforeEnter?: RouteGuard;
  beforeEach?: RouteGuard;
  afterEach?: (to: string, from: string) => void;
}

export interface RouteContext {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface Router {
  RouterView: Component;
  push: (path: string) => Promise<boolean>;
  replace: (path: string) => void;
  path: Signal<string>;
  context: Signal<RouteContext>;
}


export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => Node;
  overscan?: number;
}

export interface IntersectionObserverHook {
  isIntersecting: Signal<boolean>;
  observe: (element: Element) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
}


export interface SignalInfo {
  name: string;
  value: any;
  subscribers: number;
  lastUpdated: number;
}

export interface EffectInfo {
  name: string;
  dependencies: string[];
  lastRun: number;
  isDisposed: boolean;
}

export interface DevToolsStats {
  signals: SignalInfo[];
  effects: EffectInfo[];
}


export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;


export type EventHandler<T = Event> = (event: T) => void;
export type MouseEventHandler = EventHandler<MouseEvent>;
export type KeyboardEventHandler = EventHandler<KeyboardEvent>;
export type ChangeEventHandler = EventHandler<Event>;


export interface CSSProperties extends Partial<CSSStyleDeclaration> {
  [key: string]: any;
}


export interface HTMLAttributes {
  id?: string;
  className?: string;
  style?: CSSProperties | string | (() => CSSProperties | string);
  title?: string;
  role?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  tabIndex?: number;
  draggable?: boolean;
  contentEditable?: boolean;
  spellCheck?: boolean;
  translate?: 'yes' | 'no';
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  hidden?: boolean;
  accessKey?: string;
  contextMenu?: string;
  dataSet?: Record<string, string>;
}


export interface MouseEventAttributes {
  onClick?: MouseEventHandler;
  onDoubleClick?: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
  onMouseUp?: MouseEventHandler;
  onMouseMove?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  onMouseOver?: MouseEventHandler;
  onMouseOut?: MouseEventHandler;
  onContextMenu?: MouseEventHandler;
}


export interface KeyboardEventAttributes {
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onKeyPress?: KeyboardEventHandler;
}


export interface FormEventAttributes {
  onChange?: ChangeEventHandler;
  onInput?: EventHandler<Event>;
  onSubmit?: EventHandler<Event>;
  onReset?: EventHandler<Event>;
  onFocus?: EventHandler<FocusEvent>;
  onBlur?: EventHandler<FocusEvent>;
}


export interface DragEventAttributes {
  onDrag?: EventHandler<DragEvent>;
  onDragStart?: EventHandler<DragEvent>;
  onDragEnd?: EventHandler<DragEvent>;
  onDragEnter?: EventHandler<DragEvent>;
  onDragLeave?: EventHandler<DragEvent>;
  onDragOver?: EventHandler<DragEvent>;
  onDrop?: EventHandler<DragEvent>;
}


export type AllHTMLAttributes = 
  & HTMLAttributes 
  & MouseEventAttributes 
  & KeyboardEventAttributes 
  & FormEventAttributes 
  & DragEventAttributes
  & { children?: any };


export interface AnchorAttributes extends AllHTMLAttributes {
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  download?: string;
}

export interface ImageAttributes extends AllHTMLAttributes {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

export interface InputAttributes extends AllHTMLAttributes {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'checkbox' | 'radio' | 'range' | 'submit' | 'reset' | 'button' | 'hidden';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  multiple?: boolean;
  accept?: string;
}

export interface TextareaAttributes extends AllHTMLAttributes {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  rows?: number;
  cols?: number;
  wrap?: 'soft' | 'hard' | 'off';
}

export interface SelectAttributes extends AllHTMLAttributes {
  value?: string | number | string[];
  defaultValue?: string | number | string[];
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: number;
  autoFocus?: boolean;
}


declare global {
  namespace JSX {
    interface ElementChildrenAttribute {
      children: {};
    }
    
    interface IntrinsicElements {
      
      a: AnchorAttributes;
      abbr: AllHTMLAttributes;
      address: AllHTMLAttributes;
      area: AllHTMLAttributes;
      article: AllHTMLAttributes;
      aside: AllHTMLAttributes;
      audio: AllHTMLAttributes;
      b: AllHTMLAttributes;
      base: AllHTMLAttributes;
      bdi: AllHTMLAttributes;
      bdo: AllHTMLAttributes;
      big: AllHTMLAttributes;
      blockquote: AllHTMLAttributes;
      body: AllHTMLAttributes;
      br: AllHTMLAttributes;
      button: AllHTMLAttributes;
      canvas: AllHTMLAttributes;
      caption: AllHTMLAttributes;
      cite: AllHTMLAttributes;
      code: AllHTMLAttributes;
      col: AllHTMLAttributes;
      colgroup: AllHTMLAttributes;
      data: AllHTMLAttributes;
      datalist: AllHTMLAttributes;
      dd: AllHTMLAttributes;
      del: AllHTMLAttributes;
      details: AllHTMLAttributes;
      dfn: AllHTMLAttributes;
      dialog: AllHTMLAttributes;
      div: AllHTMLAttributes;
      dl: AllHTMLAttributes;
      dt: AllHTMLAttributes;
      em: AllHTMLAttributes;
      embed: AllHTMLAttributes;
      fieldset: AllHTMLAttributes;
      figcaption: AllHTMLAttributes;
      figure: AllHTMLAttributes;
      footer: AllHTMLAttributes;
      form: AllHTMLAttributes;
      h1: AllHTMLAttributes;
      h2: AllHTMLAttributes;
      h3: AllHTMLAttributes;
      h4: AllHTMLAttributes;
      h5: AllHTMLAttributes;
      h6: AllHTMLAttributes;
      head: AllHTMLAttributes;
      header: AllHTMLAttributes;
      hgroup: AllHTMLAttributes;
      hr: AllHTMLAttributes;
      html: AllHTMLAttributes;
      i: AllHTMLAttributes;
      iframe: AllHTMLAttributes;
      img: ImageAttributes;
      input: InputAttributes;
      ins: AllHTMLAttributes;
      kbd: AllHTMLAttributes;
      label: AllHTMLAttributes;
      legend: AllHTMLAttributes;
      li: AllHTMLAttributes;
      link: AllHTMLAttributes;
      main: AllHTMLAttributes;
      map: AllHTMLAttributes;
      mark: AllHTMLAttributes;
      menu: AllHTMLAttributes;
      meta: AllHTMLAttributes;
      meter: AllHTMLAttributes;
      nav: AllHTMLAttributes;
      noscript: AllHTMLAttributes;
      object: AllHTMLAttributes;
      ol: AllHTMLAttributes;
      optgroup: AllHTMLAttributes;
      option: AllHTMLAttributes;
      output: AllHTMLAttributes;
      p: AllHTMLAttributes;
      param: AllHTMLAttributes;
      picture: AllHTMLAttributes;
      pre: AllHTMLAttributes;
      progress: AllHTMLAttributes;
      q: AllHTMLAttributes;
      rp: AllHTMLAttributes;
      rt: AllHTMLAttributes;
      ruby: AllHTMLAttributes;
      s: AllHTMLAttributes;
      samp: AllHTMLAttributes;
      script: AllHTMLAttributes;
      section: AllHTMLAttributes;
      select: SelectAttributes;
      small: AllHTMLAttributes;
      source: AllHTMLAttributes;
      span: AllHTMLAttributes;
      strong: AllHTMLAttributes;
      style: AllHTMLAttributes;
      sub: AllHTMLAttributes;
      summary: AllHTMLAttributes;
      sup: AllHTMLAttributes;
      table: AllHTMLAttributes;
      tbody: AllHTMLAttributes;
      td: AllHTMLAttributes;
      template: AllHTMLAttributes;
      textarea: TextareaAttributes;
      tfoot: AllHTMLAttributes;
      th: AllHTMLAttributes;
      thead: AllHTMLAttributes;
      time: AllHTMLAttributes;
      title: AllHTMLAttributes;
      tr: AllHTMLAttributes;
      track: AllHTMLAttributes;
      u: AllHTMLAttributes;
      ul: AllHTMLAttributes;
      var: AllHTMLAttributes;
      video: AllHTMLAttributes;
      wbr: AllHTMLAttributes;
    }
  }
}
