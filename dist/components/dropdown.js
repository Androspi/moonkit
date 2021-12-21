var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TemplateOptions, ContainerTemplate, TemplateOperators } from 'htmon';
export class Dropdown {
    constructor(trigger, options = {}, build = true) {
        // PROTECTED
        /** Es verdadero cuando el desplegable está abierto */
        this.ISOPEN = false;
        /** Eventos del componente */
        this.DROPDOWNEVENTS = {};
        // PRIVATE
        /** Es verdadero cuando el componente está siendo actualizado */
        this.ISRESTARTING = false;
        /** Genera el contenido del dropdown y ajusta el tamaño del contenedor */
        this.open = (event) => {
            if (this.ISOPEN === false) {
                this.ISOPEN = true;
                const parent = this.parent;
                parent !== this.dropdownTemplate.target.parentElement && parent.appendChild(this.dropdownTemplate.target);
                this.setDropdownContent();
                this.updateSize(parent, this.trigger);
                document.removeEventListener('click', this.close);
                setTimeout(() => this.dropdownTemplate.children.length > 0 && document.addEventListener('click', this.close), 0);
            }
            else {
                this.ISOPEN = false;
            }
        };
        /**
         *  Elimina eventos de la ventana y cierra el dropdown
         * @param event Información del evento
         */
        this.close = (event) => {
            if (this.dropdownTemplate.isDestroyed !== true && !this.dropdownTemplate.childrenTree.some(template => template.target === event.target)) {
                if (![this.TRIGGERPARENT, ...this.TRIGGERPARENT.childrenTree.filter(template => template.target !== this.TRIGGER)].some(template => template.target === event.target)) {
                    document.removeEventListener('click', this.close);
                    this.dropdownTemplate.destroyChildren();
                    this.ISOPEN = false;
                }
            }
        };
        this.INSTANCEID = `${Math.random().toString(16).substring(2)}`;
        this.TRIGGER = trigger;
        this.OPTIONS = options;
        build === true && this.build();
    }
    // GETTERS
    /** @get Obtiene el elemento ejecutor */
    get trigger() { return this.TRIGGER; }
    /** @get Obtiene los eventos del componente */
    get events() { return this.DROPDOWNEVENTS; }
    // GETTERS AND SETTERS
    /** @set Obtiene las opciones del componente */
    get options() { return this.OPTIONS; }
    /** @get Actualiza las opciones del componente */
    set options(val) {
        Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[key] = val[key]));
    }
    /** @set Actualiza el contenedor del componente */
    set parent(val) { this.OPTIONS.parent = val; }
    /** @get Obtiene el contenedo del componente */
    get parent() {
        let parent;
        if (typeof this.OPTIONS.parent === 'string') {
            parent = document.querySelector(this.OPTIONS.parent);
            if (parent === null) {
                const selector = this.OPTIONS.parent.replace(/.*#/g, '').replace(/(\.| |,)(.*)/g, '');
                const branch = TemplateOptions.tree.find(item => item.id === selector || item.name === selector);
                parent = branch instanceof ContainerTemplate ? branch.target : document.body;
            }
        }
        else if (this.OPTIONS.parent instanceof ContainerTemplate) {
            parent = this.OPTIONS.parent.target;
        }
        else if (this.OPTIONS.parent instanceof Element) {
            parent = this.OPTIONS.parent;
        }
        return parent;
    }
    // SETTERS
    /** @set Actualiza las opciones de las areas del componente */
    set templateContext(val) {
        Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[`${key}Area`] = val[key]));
    }
    /** @set Actualiza el contexto de la plantilla del contenido del dropdown */
    set contentArea(val) {
        this.OPTIONS.templateContext.content = val;
        this.restart();
    }
    /** @set Actualiza el contexto de la plantilla del dropdown */
    set dropdownArea(val) {
        this.OPTIONS.templateContext.dropdown = val;
        if (this.dropdownTemplate instanceof ContainerTemplate && this.dropdownTemplate.isDestroyed === false) {
            this.dropdownTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
        }
    }
    /** Añade al elemento ejecutor los eventos para abrir el dropdown */
    build() {
        var _a;
        this.OPTIONS.templateContext === undefined && (this.OPTIONS.templateContext = {});
        this.OPTIONS.parent === undefined && (this.OPTIONS.parent = document.body);
        this.OPTIONS.methods === undefined && (this.OPTIONS.methods = {});
        this.TRIGGER.addEventListener('click', this.open);
        // Genera la plantilla para el dropdown
        const dropdownMethods = this.OPTIONS.methods;
        const dropdownContext = ((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.dropdown) || {};
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
        this.dropdownTemplate = TemplateOperators.createTemplate(undefined, dropdownContext, dropdownMethods, this.OPTIONS.componentAttribute);
        if (this.TRIGGER.parentElement instanceof HTMLLabelElement) {
            this.TRIGGERPARENT = TemplateOperators.createTemplate(undefined, { type: 'container', node: { element: this.TRIGGER.parentElement } }, {}, undefined);
        }
    }
    /** Elimina las instancias y eventos creados */
    destroy() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dropdownTemplate instanceof ContainerTemplate && (yield this.dropdownTemplate.destroy());
            this.TRIGGERPARENT instanceof ContainerTemplate && this.TRIGGERPARENT.destroy();
            Object.keys(this.events).map(event => this.events[event].complete());
            this.trigger.removeEventListener('click', this.open);
            document.removeEventListener('click', this.close);
            resolve();
        }));
    }
    /** Genera el contenido del dropdown */
    setDropdownContent() {
        var _a;
        if (((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.content) !== undefined) {
            this.dropdownTemplate.rows = this.OPTIONS.templateContext.content.map(item => {
                const context = TemplateOperators.copyOf(item, ['node']);
                context.name = 'dropdown-area-content';
                return context;
            });
        }
    }
    /** Ajusta el tamaño del contenedor */
    updateSize(elementRef, triggerRef) {
        const elementRefClientRect = elementRef.getBoundingClientRect();
        const triggerClientRect = triggerRef.getBoundingClientRect();
        this.dropdownTemplate.styles = {
            top: `${triggerClientRect.bottom + elementRef.scrollTop - elementRefClientRect.top}px`,
            left: `${triggerClientRect.x - elementRefClientRect.left}px`,
            width: `${triggerClientRect.width}px`,
        };
    }
    /** Elimina los componentes de la plantilla y reconstruye el dropdown */
    restart() {
        if (this.ISRESTARTING === false && this.dropdownTemplate.children.length > 0) {
            this.ISRESTARTING = true;
            (() => __awaiter(this, void 0, void 0, function* () {
                yield this.dropdownTemplate.destroyChildren();
                const event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
                Object.defineProperty(event, 'target', { value: this.trigger, enumerable: true });
                this.open(event);
                this.ISRESTARTING = false;
            }))();
        }
    }
}
