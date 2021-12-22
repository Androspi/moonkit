var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BehaviorOptions, ContainerTemplate } from 'htmon';
import { first } from 'rxjs/operators';
import { Autocomplete } from './autocomplete';
import { Dropdown } from './dropdown';
import { Modal } from './modal';
import { Collapsable } from './collapsable';
import { List } from './list';
import { Tooltip } from './tooltip';
/** Implementa el comportamiento de autocompletable a los inputs */
function setAutocompleteBehavior() {
    class AutocompleteBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.destroy = () => new Promise(resolve => (this.autocompleteInstance instanceof Autocomplete && this.autocompleteInstance.destroy(), resolve()));
            this.init();
        }
        init() {
            if (this.template.target instanceof HTMLInputElement || this.template.target instanceof HTMLTextAreaElement || this.template.target instanceof HTMLSelectElement) {
                const autocompleteOptions = this.options || {};
                autocompleteOptions.componentAttribute === undefined && (autocompleteOptions.componentAttribute = this.template.componentAttribute);
                autocompleteOptions.data === undefined && (autocompleteOptions.data = []);
                this.autocompleteInstance = new Autocomplete(this.template.target, autocompleteOptions);
            }
        }
    }
    BehaviorOptions.use('autocomplete', AutocompleteBehavior);
}
/** Implementa el comportamiento de plegable */
function setCollapsableBehavior() {
    const that = this;
    class CollapsableBehavior {
        constructor(template, OPTIONS) {
            this.template = template;
            this.OPTIONS = OPTIONS;
            this.destroy = () => new Promise(resolve => { this.collapsableInstance.destroy(); resolve(); });
            this.init();
        }
        /** @get Obtiene las opciones del plegable */
        get options() { return this.OPTIONS; }
        /** @set Actualiza las opciones del plegable */
        set options(val) {
            if ('direction' in val) {
                const direction = val.direction;
                this.OPTIONS.direction = direction;
                if (this.collapsableInstance instanceof Collapsable) {
                    this.collapsableInstance.direction = direction;
                }
            }
            if ('target' in val) {
                const target = val.target;
                this.OPTIONS.target = target;
                if (this.collapsableInstance instanceof Collapsable) {
                    this.collapsableInstance.target = target;
                }
            }
        }
        init() { this.collapsableInstance = new Collapsable(this.template.target, this.OPTIONS, { event: that.system.sidebar.isLarge, delay: 501 }); }
        restart() { this.destroy(); this.init(); }
    }
    BehaviorOptions.use('collapsable', CollapsableBehavior);
}
/** Implementa el comportamiento de desplegable */
function setDropdownBehavior() {
    class DropdownBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.destroy = () => new Promise(resolve => (this.dropdownInstance instanceof Dropdown && this.dropdownInstance.destroy(), resolve()));
            this.init();
        }
        init() {
            const dropdownOptions = this.options || {};
            dropdownOptions.componentAttribute === undefined && (dropdownOptions.componentAttribute = this.template.componentAttribute);
            this.dropdownInstance = new Dropdown(this.template.target, dropdownOptions);
        }
    }
    BehaviorOptions.use('dropdown', DropdownBehavior);
}
/** Implementa el comportamiento de marquesina */
function setMarqueeBehavior() {
    class MarqueeBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.init = () => {
                const parentWidth = this.template.parent instanceof ContainerTemplate ? (this.template.parent.target instanceof HTMLElement ? this.template.parent.target.offsetWidth : 0) : (this.template.parent instanceof HTMLElement ? this.template.parent.offsetWidth : 0);
                const targetWidth = this.template.target instanceof HTMLElement ? this.template.target.offsetWidth : 0;
                const remElement = document.querySelector('#style-element');
                const remValue = remElement instanceof HTMLStyleElement ? +remElement.getAttribute('font') || 15 : 15;
                const duration = ((targetWidth / remValue * 15) + (parentWidth / remValue * 15)) / (this.options.delay || 50);
                if (this.options.updateDuration !== false) {
                    this.template.duration = duration * 1000;
                }
                this.template.styles = { animationDuration: `${duration}s` };
            };
            this.destroy = () => new Promise(resolve => resolve());
            if (this.template instanceof ContainerTemplate) {
                this.template.events.childrenReady.pipe(first((event) => event.status === true && event.context !== undefined)).subscribe(() => this.init());
            }
        }
        restart() { this.destroy(); this.init(); }
    }
    BehaviorOptions.use('marquee', MarqueeBehavior);
}
/** Implementa el comportamiento de tooltip */
function setTooltipBehavior() {
    class TooltipBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.destroy = () => new Promise(resolve => (this.tooltipInstance.destroy(), resolve()));
            this.init();
        }
        init() { this.tooltipInstance = new Tooltip(this.template.target, this.template.componentAttribute, this.options); }
    }
    BehaviorOptions.use('tooltip', TooltipBehavior);
}
/** Implementa el comportamiento de ventana emergente */
function setModalBehavior() {
    class ModalBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.destroy = () => new Promise(resolve => (this.modalInstance instanceof Modal && this.modalInstance.destroy(), resolve()));
            this.init();
        }
        init() {
            if (this.template.target instanceof HTMLElement) {
                const clickEvent = typeof this.options.clickEvent === 'string' ? this.template.callback[this.options.clickEvent] : (typeof this.options.clickEvent === 'function' ? this.options.clickEvent : undefined);
                this.modalInstance = new Modal(this.template.target, Object.assign({ componentAttribute: this.template.componentAttribute }, this.options), clickEvent);
                this.options.modalContext !== undefined && (this.modalInstance.modalContext = this.options.modalContext);
                this.options.headerContext !== undefined && (this.modalInstance.headerContext = this.options.headerContext);
                this.options.bodyContext !== undefined && (this.modalInstance.bodyContext = this.options.bodyContext);
            }
        }
    }
    BehaviorOptions.use('modal', ModalBehavior);
}
/** Implementa el comportamiento para las listas */
function setListBehavior() {
    class ListBehavior {
        constructor(template, options) {
            this.template = template;
            this.options = options;
            this.destroy = () => new Promise((resolve) => __awaiter(this, void 0, void 0, function* () { return (this.listInstance instanceof List && (yield this.listInstance.destroy()), resolve()); }));
            this.init();
        }
        init() {
            const listOptions = this.options || {};
            listOptions.componentAttribute === undefined && (listOptions.componentAttribute = this.template.componentAttribute);
            listOptions.data === undefined && (listOptions.data = []);
            this.listInstance = new List(this.template.target, listOptions);
        }
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
