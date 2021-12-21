var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContainerTemplate, ElementTemplate, TemplateOperators } from 'htmon';
import { Subject } from 'rxjs';
export class Select {
    constructor(trigger, options = {}) {
        // PROTECTED
        this.SELECTEVENTS = { itemSelected: new Subject() };
        this.INSTANCEID = `${Math.random().toString(16).substring(2)}`;
        this.TRIGGER = trigger;
        this.OPTIONS = options;
        this.build();
    }
    // GETTERS
    get trigger() { return this.TRIGGER; }
    get events() { return this.SELECTEVENTS; }
    // GETTERS AND SETTERS
    get options() { return this.OPTIONS; }
    set options(val) {
        Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[key] = val[key]));
    }
    // SETTERS
    /** Actualiza el título del select */
    set name(val) {
        this.OPTIONS.name = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const titleTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-title' });
            if (titleTemplate === undefined) {
                const titleContext = this.options.templateContext.title || {};
                titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
                titleContext.name = 'select-area-title';
                titleContext.type = 'element';
                titleContext.text = val;
                this.selectTemplate.push(titleContext, false, 1);
            }
            else {
                titleTemplate.text = val;
            }
        }
    }
    /* Actualiza el placeholder del input del select */
    set placeholder(val) {
        this.OPTIONS.placeholder = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const inputTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
            inputTemplate.attributes = { placeholder: val };
        }
    }
    /** Selecciona un valor por defecto en el input del select */
    set defaultValue(val) {
        this.OPTIONS.defaultValue = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const behaviorTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
            if (behaviorTemplate instanceof ElementTemplate && behaviorTemplate.isDestroyed === false) {
                const selected = this.OPTIONS.useAutocomplete === true ? 'autocomplete' : 'list';
                const behaviorInstance = behaviorTemplate.behaviorInstances[selected][`${selected}Instance`];
                behaviorInstance.selectInstance(val);
            }
        }
    }
    /** Cambia el comportamiento del input del select */
    set useAutocomplete(val) {
        this.OPTIONS.useAutocomplete = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            (() => __awaiter(this, void 0, void 0, function* () {
                const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
                const inputTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
                const behaviorOptions = TemplateOperators.copyOf(inputTemplate.behaviorInstances[selected].options);
                yield inputTemplate.behaviorInstances[selected].destroy();
                inputTemplate.loadTemplate({ behavior: { [val === true ? 'autocomplete' : 'list']: behaviorOptions } });
            }))();
        }
    }
    /** Actualiza el contexto de los componentes de la plantilla del select */
    set templateContext(val) {
        Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[`${key}Area`] = val[key]));
    }
    /** Actualiza el contexto de la plantilla del select */
    set selectArea(val) {
        this.OPTIONS.templateContext.select = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            this.selectTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
        }
    }
    /** Actualiza el contexto de la plantilla del título */
    set titleArea(val) {
        this.OPTIONS.templateContext.title = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const titleTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-title' });
            if (titleTemplate === undefined) {
                const titleContext = val || {};
                titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
                titleContext.name = 'select-area-title';
                titleContext.text = this.OPTIONS.name;
                titleContext.type = 'element';
                this.selectTemplate.push(titleContext, false, 1);
            }
            else {
                titleTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
            }
        }
    }
    /** Actualiza el contexto de la plantilla del input */
    set listArea(val) {
        this.OPTIONS.templateContext.list = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const listTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
            listTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
        }
    }
    /** Actualiza el contexto de la plantilla del ícono */
    set iconArea(val) {
        this.OPTIONS.templateContext.list = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const iconTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-icon' });
            iconTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
        }
    }
    /** Actualiza las opciones del comportamiento del input */
    set listOptions(val) {
        this.OPTIONS.listOptions = val;
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
            const listTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
            const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
            listTemplate.behaviorInstances[selected].options = val;
        }
    }
    /** Actualiza la data del listado */
    set listData(val) {
        if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false && val !== undefined) {
            const listTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
            const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
            const behaviorInstance = listTemplate.behaviorInstances[selected][`${selected}Instance`];
            behaviorInstance.data = val;
            val.length > 0 && this.OPTIONS.defaultValue !== undefined && behaviorInstance.selectInstance(this.OPTIONS.defaultValue);
        }
    }
    /** Genera la estructura visual del select */
    build() {
        var _a;
        this.OPTIONS.templateContext === undefined && (this.OPTIONS.templateContext = {});
        this.OPTIONS.useAutocomplete === undefined && (this.OPTIONS.useAutocomplete = false);
        this.OPTIONS.placeholder === undefined && (this.OPTIONS.placeholder = '');
        this.trigger.style.display = 'none';
        // Genera las opciones del dropdown
        const behaviorOptions = TemplateOperators.copyOf(this.OPTIONS.listOptions, ['node']);
        behaviorOptions.parent === undefined && (behaviorOptions.parent = '.page-content');
        behaviorOptions.templateContext === undefined && (behaviorOptions.templateContext = {});
        behaviorOptions.templateContext.dropdown === undefined && (behaviorOptions.templateContext.dropdown = {});
        behaviorOptions.templateContext.dropdown.classes === undefined && (behaviorOptions.templateContext.dropdown.classes = 'primary-list selectable-list shadowed-list margin-vertical-0 overflow-auto pretty-scrollbar');
        behaviorOptions.templateContext.dropdown.styles === undefined && (behaviorOptions.templateContext.dropdown.styles = {});
        behaviorOptions.templateContext.dropdown.styles.maxHeight === undefined && (behaviorOptions.templateContext.dropdown.styles.maxHeight = '15rem');
        if (this.OPTIONS.useAutocomplete === true) {
            const BORef = behaviorOptions;
            BORef.keywords === undefined && (BORef.keywords = Object.values(((_a = this.OPTIONS.listOptions) === null || _a === void 0 ? void 0 : _a.dataFields) || {}));
            BORef.itemLimit === undefined && (BORef.itemLimit = 10);
        }
        // Genera la estructura del input que activará el dropdown
        const valueContext = this.OPTIONS.templateContext.list || {};
        valueContext.classes === undefined && (valueContext.classes = 'select-value-section primary-input cursor-pointer');
        valueContext.attributes === undefined && (valueContext.attributes = {});
        valueContext.attributes.type === undefined && (valueContext.attributes.type = 'text');
        valueContext.behavior === undefined && (valueContext.behavior = {});
        valueContext.attributes.placeholder = this.OPTIONS.placeholder;
        valueContext.name = 'select-area-dropdown';
        valueContext.type = 'element';
        valueContext.tag = 'input';
        if (this.OPTIONS.useAutocomplete === false) {
            valueContext.styles === undefined && (valueContext.styles = {});
            valueContext.styles.textOverflow === undefined && (valueContext.styles.textOverflow = 'ellipsis');
            valueContext.styles.whiteSpace === undefined && (valueContext.styles.whiteSpace = 'nowrap');
            valueContext.styles.overflow === undefined && (valueContext.styles.overflow = 'hidden');
            valueContext.attributes.readonly = 'true';
            valueContext.behavior.list = behaviorOptions;
        }
        else {
            valueContext.behavior.autocomplete = behaviorOptions;
        }
        // Genera la estructura del ícono
        const iconContext = this.OPTIONS.templateContext.icon || {};
        iconContext.classes === undefined && (iconContext.classes = 'material-icons-round select-icon-section');
        iconContext.text === undefined && (iconContext.text = 'expand_more');
        iconContext.name = 'select-area-icon';
        iconContext.type = 'element';
        // Estructura ícono + título
        const rowContext = [iconContext];
        if (this.OPTIONS.name !== undefined) {
            // Genera la estructura del título
            const titleContext = this.OPTIONS.templateContext.title || {};
            titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
            titleContext.name = 'select-area-title';
            titleContext.text = this.OPTIONS.name;
            titleContext.type = 'element';
            rowContext.push(titleContext);
        }
        // Genera la estructura del select
        const containerContext = this.OPTIONS.templateContext.select || {};
        containerContext.attributes === undefined && (containerContext.attributes = {});
        containerContext.attributes.tabindex === undefined && (containerContext.attributes.tabindex = '0');
        containerContext.classes === undefined && (containerContext.classes = 'primary-select');
        containerContext.name = `select-area-${this.INSTANCEID}`;
        containerContext.rows = [...rowContext, valueContext];
        containerContext.type = 'container';
        containerContext.tag = 'label';
        this.selectTemplate = TemplateOperators.createTemplate(undefined, containerContext, {}, this.OPTIONS.componentAttribute);
        this.trigger.after(this.selectTemplate.target);
        const behaviorTemplate = TemplateOperators.templateSelector(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
        if (behaviorTemplate instanceof ElementTemplate) {
            const selected = this.OPTIONS.useAutocomplete === true ? 'autocomplete' : 'list';
            const behaviorInstance = behaviorTemplate.behaviorInstances[selected][`${selected}Instance`];
            behaviorInstance.events.itemSelected.subscribe({
                next: event => {
                    this.TRIGGER.value = typeof event.value === 'number' ? `${event.value}` : event.value;
                    this.TRIGGER.dispatchEvent(new Event('change'));
                    this.events.itemSelected.next(event);
                }
            });
            this.OPTIONS.defaultValue !== undefined && behaviorInstance.selectInstance(this.OPTIONS.defaultValue);
        }
    }
    /** Dstruye las instancias */
    destroy() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.selectTemplate instanceof ContainerTemplate && (yield this.selectTemplate.destroy());
            Object.keys(this.events).map(event => this.events[event].complete());
            this.trigger.style.display = 'block';
            resolve();
        }));
    }
}
