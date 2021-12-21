import { BehaviorOptions, ContainerTemplate, IntersectionTypeList } from 'htmon';
import { first } from 'rxjs/operators';

import { Autocomplete, AutocompleteOptions } from './autocomplete';
import { Dropdown, DropdownOptions } from './dropdown';
import { Modal, ModalProperties } from './modal';
import { Collapsable } from './collapsable';
import { List, ListOptions } from './list';
import { Tooltip } from './tooltip';

import { AutocompleteBehaviorOptions, AutocompleteBehaviorProperties, CollapsableBehaviorOptions, CollapsableBehaviorProperties, DropdownBehaviorOptions, DropdownBehaviorProperties, ListBehaviorOptions, ListBehaviorProperties, MarqueeBehaviorOptions, MarqueeBehaviorProperties, ModalBehaviorProperties, TooltipBehaviorOptions, TooltipBehaviorProperties } from '../interfaces/template-behavior';

/** Implementa el comportamiento de autocompletable a los inputs */
function setAutocompleteBehavior() {
  class AutocompleteBehavior implements AutocompleteBehaviorProperties {
    autocompleteInstance: Autocomplete;

    constructor(public template: IntersectionTypeList['template'], public options: AutocompleteBehaviorOptions) { this.init(); }

    init() {
      if (this.template.target instanceof HTMLInputElement || this.template.target instanceof HTMLTextAreaElement || this.template.target instanceof HTMLSelectElement) {
        const autocompleteOptions: Partial<AutocompleteOptions> = this.options || {};
        autocompleteOptions.componentAttribute === undefined && (autocompleteOptions.componentAttribute = this.template.componentAttribute);
        autocompleteOptions.data === undefined && (autocompleteOptions.data = []);
        this.autocompleteInstance = new Autocomplete(this.template.target, autocompleteOptions);
      }
    }

    destroy = (): Promise<void> => new Promise(resolve => (this.autocompleteInstance instanceof Autocomplete && this.autocompleteInstance.destroy(), resolve()));
  }
  BehaviorOptions.use('autocomplete', AutocompleteBehavior);
}

/** Implementa el comportamiento de plegable */
function setCollapsableBehavior() {
  const that = this;
  class CollapsableBehavior implements CollapsableBehaviorProperties {

    /** Instancia del componente Plegable */
    public collapsableInstance: Collapsable;

    /** @get Obtiene las opciones del plegable */
    public get options(): CollapsableBehaviorOptions { return this.OPTIONS; }
    /** @set Actualiza las opciones del plegable */
    public set options(val: CollapsableBehaviorOptions) {
      if ('direction' in val) {
        const direction: CollapsableBehaviorOptions['direction'] = val.direction;
        this.OPTIONS.direction = direction;
        if (this.collapsableInstance instanceof Collapsable) {
          this.collapsableInstance.direction = direction;
        }
      }
      if ('target' in val) {
        const target: CollapsableBehaviorOptions['target'] = val.target;
        this.OPTIONS.target = target;
        if (this.collapsableInstance instanceof Collapsable) {
          this.collapsableInstance.target = target;
        }
      }
    }

    constructor(public template: IntersectionTypeList['template'], private OPTIONS: CollapsableBehaviorOptions) { this.init(); }

    init() { this.collapsableInstance = new Collapsable(this.template.target, this.OPTIONS, { event: that.system.sidebar.isLarge, delay: 501 }); }

    restart() { this.destroy(); this.init(); }

    destroy = (): Promise<void> => new Promise(resolve => { this.collapsableInstance.destroy(); resolve(); });

  }
  BehaviorOptions.use('collapsable', CollapsableBehavior);
}

/** Implementa el comportamiento de desplegable */
function setDropdownBehavior() {
  class DropdownBehavior implements DropdownBehaviorProperties {
    dropdownInstance: Dropdown;

    constructor(public template: IntersectionTypeList['template'], public options: DropdownBehaviorOptions) { this.init(); }

    init() {
      const dropdownOptions: Partial<DropdownOptions> = this.options || {};
      dropdownOptions.componentAttribute === undefined && (dropdownOptions.componentAttribute = this.template.componentAttribute);
      this.dropdownInstance = new Dropdown(this.template.target, dropdownOptions);
    }

    destroy = (): Promise<void> => new Promise(resolve => (this.dropdownInstance instanceof Dropdown && this.dropdownInstance.destroy(), resolve()));
  }
  BehaviorOptions.use('dropdown', DropdownBehavior);
}

/** Implementa el comportamiento de marquesina */
function setMarqueeBehavior() {
  class MarqueeBehavior implements MarqueeBehaviorProperties {
    constructor(public template: ContainerTemplate, public options: MarqueeBehaviorOptions) {
      if (this.template instanceof ContainerTemplate) {
        this.template.events.childrenReady.pipe(first(event => event.status === true && event.context !== undefined)).subscribe(() => this.init());
      }
    }

    init = () => {
      const parentWidth = this.template.parent instanceof ContainerTemplate ? (this.template.parent.target instanceof HTMLElement ? this.template.parent.target.offsetWidth : 0) : (this.template.parent instanceof HTMLElement ? this.template.parent.offsetWidth : 0);
      const targetWidth = this.template.target instanceof HTMLElement ? this.template.target.offsetWidth : 0;
      const remElement: HTMLStyleElement = document.querySelector('#style-element');
      const remValue: number = remElement instanceof HTMLStyleElement ? +remElement.getAttribute('font') || 15 : 15;
      const duration = ((targetWidth / remValue * 15) + (parentWidth / remValue * 15)) / (this.options.delay || 50);
      if (this.options.updateDuration !== false) { this.template.duration = duration * 1000; }
      this.template.styles = { animationDuration: `${duration}s` };
    }

    restart() { this.destroy(); this.init(); }

    destroy = (): Promise<void> => new Promise(resolve => resolve());
  }
  BehaviorOptions.use('marquee', MarqueeBehavior);
}

/** Implementa el comportamiento de tooltip */
function setTooltipBehavior() {
  class TooltipBehavior implements TooltipBehaviorProperties {
    tooltipInstance: Tooltip;

    constructor(public template: IntersectionTypeList['template'], public options: TooltipBehaviorOptions) { this.init(); }

    init() { this.tooltipInstance = new Tooltip(this.template.target, this.template.componentAttribute, this.options); }

    destroy = (): Promise<void> => new Promise(resolve => (this.tooltipInstance.destroy(), resolve()));
  }
  BehaviorOptions.use('tooltip', TooltipBehavior);
}

/** Implementa el comportamiento de ventana emergente */
function setModalBehavior() {
  class ModalBehavior implements ModalBehaviorProperties {
    modalInstance: Modal;

    constructor(public template: IntersectionTypeList['template'], public options: ModalProperties) { this.init(); }

    init() {
      if (this.template.target instanceof HTMLElement) {
        const clickEvent: Exclude<ModalProperties['clickEvent'], string> = typeof this.options.clickEvent === 'string' ? this.template.callback[this.options.clickEvent] : (typeof this.options.clickEvent === 'function' ? this.options.clickEvent : undefined);
        this.modalInstance = new Modal(this.template.target, { ...{ componentAttribute: this.template.componentAttribute }, ...this.options }, clickEvent);
        this.options.modalContext !== undefined && (this.modalInstance.modalContext = this.options.modalContext);
        this.options.headerContext !== undefined && (this.modalInstance.headerContext = this.options.headerContext);
        this.options.bodyContext !== undefined && (this.modalInstance.bodyContext = this.options.bodyContext);
      }
    }
    destroy = (): Promise<void> => new Promise(resolve => (this.modalInstance instanceof Modal && this.modalInstance.destroy(), resolve()));
  }
  BehaviorOptions.use('modal', ModalBehavior);
}

/** Implementa el comportamiento para las listas */
function setListBehavior() {
  class ListBehavior implements ListBehaviorProperties {
    listInstance: List;

    constructor(public template: IntersectionTypeList['template'], public options: ListBehaviorOptions) { this.init(); }

    init() {
      const listOptions: Partial<ListOptions> = this.options || {};
      listOptions.componentAttribute === undefined && (listOptions.componentAttribute = this.template.componentAttribute);
      listOptions.data === undefined && (listOptions.data = []);
      this.listInstance = new List(this.template.target, listOptions);
    }

    destroy = (): Promise<void> => new Promise(async resolve => (this.listInstance instanceof List && await this.listInstance.destroy(), resolve()));
  }
  BehaviorOptions.use('list', ListBehavior);
}

/** Añade comportamientos especiales a las plantillas */
setAutocompleteBehavior();
setCollapsableBehavior();
setDropdownBehavior();
setMarqueeBehavior();
setTooltipBehavior();
setModalBehavior();
setListBehavior();