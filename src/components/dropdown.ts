import { TemplateFamily, TemplateOptions, ContainerTemplate, ContainerTemplateContext, TemplateOperators, TemplateProperties, IntersectionTypeList } from 'htmon-test';

export interface DropdownArea {
  dropdown: Partial<Omit<ContainerTemplateContext, 'rows' | 'type' | 'name'>>;
  content: Partial<IntersectionTypeList['context']>[];
}

export interface DropdownOptions {
  parent: string | TemplateFamily['parent'];
  methods: TemplateProperties['methods'];
  templateContext: Partial<DropdownArea>;
  componentAttribute?: Attr;
}

export type DropdownEvents = {};

export class Dropdown<OPT extends DropdownOptions = DropdownOptions> {
  // PROTECTED
  /** Es verdadero cuando el desplegable está abierto */
  protected ISOPEN = false;
  /** Almacena el padre label del ejecutor */
  protected TRIGGERPARENT: ContainerTemplate;
  /** Eventos del componente */
  protected DROPDOWNEVENTS: DropdownEvents = {};
  /** Opciones del componente */
  protected OPTIONS: Partial<OPT>;
  /** Identificador del componente */
  protected INSTANCEID: string;
  /** Elemento ejecutor */
  protected TRIGGER: Element;
  // GETTERS
  /** @get Obtiene el elemento ejecutor */
  public get trigger(): Dropdown['TRIGGER'] { return this.TRIGGER; }
  /** @get Obtiene los eventos del componente */
  public get events() { return this.DROPDOWNEVENTS; }
  // GETTERS AND SETTERS
  /** @set Obtiene las opciones del componente */
  public get options(): Partial<OPT> { return this.OPTIONS; }
  /** @get Actualiza las opciones del componente */
  public set options(val: Partial<OPT>) {
    Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[key] = val[key]));
  }
  /** @set Actualiza el contenedor del componente */
  protected set parent(val: OPT['parent']) { this.OPTIONS.parent = val; }
  /** @get Obtiene el contenedo del componente */
  protected get parent(): OPT['parent'] {
    let parent: Element;
    if (typeof this.OPTIONS.parent === 'string') {
      parent = document.querySelector(this.OPTIONS.parent);
      if (parent === null) {
        const selector = this.OPTIONS.parent.replace(/.*#/g, '').replace(/(\.| |,)(.*)/g, '');
        const branch = TemplateOptions.tree.find(item => item.id === selector || item.name === selector);
        parent = branch instanceof ContainerTemplate ? branch.target : document.body;
      }
    }
    else if (this.OPTIONS.parent instanceof ContainerTemplate) { parent = this.OPTIONS.parent.target; }
    else if (this.OPTIONS.parent instanceof Element) { parent = this.OPTIONS.parent; }
    return parent;
  }
  // SETTERS
  /** @set Actualiza las opciones de las areas del componente */
  protected set templateContext(val: OPT['templateContext']) {
    Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[`${key}Area`] = val[key]));
  }
  /** @set Actualiza el contexto de la plantilla del contenido del dropdown */
  public set contentArea(val: OPT['templateContext']['content']) {
    this.OPTIONS.templateContext.content = val;
    this.restart();
  }
  /** @set Actualiza el contexto de la plantilla del dropdown */
  public set dropdownArea(val: Omit<OPT['templateContext']['dropdown'], 'tag'>) {
    this.OPTIONS.templateContext.dropdown = val;
    if (this.dropdownTemplate instanceof ContainerTemplate && this.dropdownTemplate.isDestroyed === false) {
      this.dropdownTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
    }
  }
  // PUBLIC
  /** Plantilla del contenido deplegable */
  public dropdownTemplate: ContainerTemplate;
  // PRIVATE
  /** Es verdadero cuando el componente está siendo actualizado */
  private ISRESTARTING = false;

  constructor(trigger: Dropdown['TRIGGER'], options: Partial<OPT> = {}, build = true) {
    this.INSTANCEID = `${Math.random().toString(16).substring(2)}`;
    this.TRIGGER = trigger;
    this.OPTIONS = options;
    build === true && this.build();
  }

  /** Añade al elemento ejecutor los eventos para abrir el dropdown */
  public build() {
    this.OPTIONS.templateContext === undefined && (this.OPTIONS.templateContext = {});
    this.OPTIONS.parent === undefined && (this.OPTIONS.parent = document.body);
    this.OPTIONS.methods === undefined && (this.OPTIONS.methods = {});
    this.TRIGGER.addEventListener('click', this.open);
    // Genera la plantilla para el dropdown
    const dropdownMethods = this.OPTIONS.methods;
    const dropdownContext: Partial<ContainerTemplateContext> = this.OPTIONS.templateContext?.dropdown || {};
    dropdownContext.classes === undefined && (dropdownContext.classes = 'primary-list selectable-list shadowed-list margin-vertical-0 overflow-auto pretty-scrollbar');
    dropdownContext.attributes === undefined && (dropdownContext.attributes = {});
    dropdownContext.styles === undefined && (dropdownContext.styles = {});
    dropdownContext.styles.transition === undefined && (dropdownContext.styles.transition = 'height 0.5s ease');
    dropdownContext.attributes.tabindex === undefined && (dropdownContext.attributes.tabindex = '0');
    dropdownContext.styles.position === undefined && (dropdownContext.styles.position = 'absolute');
    dropdownContext.styles.maxHeight === undefined && (dropdownContext.styles.maxHeight = '15rem');
    dropdownContext.styles.zIndex === undefined && (dropdownContext.styles.zIndex = '1');
    dropdownContext.tag === undefined && (dropdownContext.tag = 'ul');
    dropdownContext.name = `dropdown-area-${this.INSTANCEID}`;
    dropdownContext.type = 'container';
    this.dropdownTemplate = TemplateOperators.createTemplate<ContainerTemplate>(undefined, dropdownContext, dropdownMethods, this.OPTIONS.componentAttribute);
    if (this.TRIGGER.parentElement instanceof HTMLLabelElement) {
      this.TRIGGERPARENT = TemplateOperators.createTemplate(undefined, { type: 'container', node: { element: this.TRIGGER.parentElement } }, {}, undefined);
    }
  }
  /** Elimina las instancias y eventos creados */
  public destroy(): Promise<void> {
    return new Promise(async resolve => {
      this.dropdownTemplate instanceof ContainerTemplate && await this.dropdownTemplate.destroy();
      this.TRIGGERPARENT instanceof ContainerTemplate && this.TRIGGERPARENT.destroy();
      Object.keys(this.events).map(event => this.events[event].complete());
      this.trigger.removeEventListener('click', this.open);
      document.removeEventListener('click', this.close);
      resolve();
    });
  }
  /** Genera el contenido del dropdown y ajusta el tamaño del contenedor */
  protected open = (event: MouseEvent) => {
    if (this.ISOPEN === false) {
      this.ISOPEN = true;
      const parent = this.parent as Element;
      parent !== this.dropdownTemplate.target.parentElement && parent.appendChild(this.dropdownTemplate.target);
      this.setDropdownContent();
      this.updateSize(parent, this.trigger);
      document.removeEventListener('click', this.close);
      setTimeout(() => this.dropdownTemplate.children.length > 0 && document.addEventListener('click', this.close), 0);
    } else { this.ISOPEN = false; }
  }
  /** Genera el contenido del dropdown */
  protected setDropdownContent() {
    if (this.OPTIONS.templateContext?.content !== undefined) {
      this.dropdownTemplate.rows = this.OPTIONS.templateContext.content.map(item => {
        const context = TemplateOperators.copyOf(item, ['node']);
        context.name = 'dropdown-area-content';
        return context;
      });
    }
  }
  /** Ajusta el tamaño del contenedor */
  protected updateSize(elementRef: Element, triggerRef: Element) {
    const elementRefClientRect = elementRef.getBoundingClientRect();
    const triggerClientRect = triggerRef.getBoundingClientRect();
    this.dropdownTemplate.styles = {
      top: `${triggerClientRect.bottom + elementRef.scrollTop - elementRefClientRect.top}px`,
      left: `${triggerClientRect.x - elementRefClientRect.left}px`,
      width: `${triggerClientRect.width}px`,
    };
  }
  /**
   *  Elimina eventos de la ventana y cierra el dropdown
   * @param event Información del evento
   */
  protected close = (event: PointerEvent) => {
    if (this.dropdownTemplate.isDestroyed !== true && !this.dropdownTemplate.childrenTree.some(template => template.target === event.target)) {
      if (![this.TRIGGERPARENT, ...this.TRIGGERPARENT.childrenTree.filter(template => template.target !== this.TRIGGER)].some(template => template.target === event.target)) {
        document.removeEventListener('click', this.close);
        this.dropdownTemplate.destroyChildren();
        this.ISOPEN = false;
      }
    }
  }
  /** Elimina los componentes de la plantilla y reconstruye el dropdown */
  protected restart() {
    if (this.ISRESTARTING === false && this.dropdownTemplate.children.length > 0) {
      this.ISRESTARTING = true;
      (async () => {
        await this.dropdownTemplate.destroyChildren();
        const event: MouseEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        Object.defineProperty(event, 'target', { value: this.trigger, enumerable: true });
        this.open(event);
        this.ISRESTARTING = false;
      })();
    }
  }

}
