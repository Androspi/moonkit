var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TemplateOperators } from 'htmon';
import { List } from './list';
export class Autocomplete extends List {
    constructor(trigger, options = {}, build = true) {
        super(trigger, options, false);
        // PRIVATE
        /** Almacena la instancia del timer de búsqueda */
        this.SEARCHTIMER = 0;
        /** Añade al elemento los eventos para abrir el dropdown y filtrar sus elementos */
        this.build = () => {
            this.OPTIONS.excludedElements === undefined && (this.OPTIONS.excludedElements = []);
            this.OPTIONS.minSearchKeys === undefined && (this.OPTIONS.minSearchKeys = 0);
            this.OPTIONS.itemLimit === undefined && (this.OPTIONS.itemLimit = Infinity);
            this.OPTIONS.searchDelay === undefined && (this.OPTIONS.searchDelay = 0);
            this.OPTIONS.keywords === undefined && (this.OPTIONS.keywords = []);
            super.build();
            this.dropdownTemplate.addMethods('clearSelection', this.clearSelection);
            this.dropdownTemplate.addMethods('removeTag', this.removeTag);
            this.trigger.setAttribute('autocomplete', 'off');
            this.trigger.addEventListener('dblclick', this.clearSelectionWithFocus);
            this.trigger.addEventListener('keyup', this.searcher);
        };
        /** Limpia el valor seleccionado en el formulario y enfoca el formulario */
        this.clearSelectionWithFocus = () => {
            const trigger = this.TRIGGER;
            trigger.value = '';
            trigger.focus();
            this.ISOPEN === false && trigger.click();
        };
        /** Limpia el valor seleccionado en el formulario */
        this.clearSelection = () => {
            const trigger = this.TRIGGER;
            trigger.value = '';
            trigger.blur();
        };
        /**
         * Redirecciona el evento open de dropdown al evento searcher
         * @param event Información del evento
         */
        this.open = (event) => { this.ISOPEN === false ? this.searcher(event) : (this.ISOPEN = false); };
        /**
         * Filtra los elementos del dropdown
         * @param event Información del evento
         */
        this.searcher = (event) => {
            const parent = this.parent;
            parent !== this.dropdownTemplate.target.parentElement && parent.appendChild(this.dropdownTemplate.target);
            if (event instanceof MouseEvent || (event instanceof KeyboardEvent && !['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key))) {
                this.ISOPEN = true;
                clearTimeout(this.SEARCHTIMER);
                this.SEARCHTIMER = window.setTimeout(() => {
                    var _a;
                    const value = event.target.value;
                    const searchValue = typeof value === 'string' ? this.normalizeText(value).replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ') : (`${value}`);
                    if (((_a = this.OPTIONS.data) === null || _a === void 0 ? void 0 : _a.length) > 0 && (typeof value === 'string' ? value : `${value}`).length >= this.OPTIONS.minSearchKeys) {
                        const filteredData = this.OPTIONS.data.filter(item => {
                            var _a;
                            const keywords = this.OPTIONS.keywords.map(key => item[key]);
                            const searchList = this.normalizeText(keywords.join('')).replace(/\s+/g, '');
                            if (((_a = this.OPTIONS.dataFields) === null || _a === void 0 ? void 0 : _a.value) !== undefined && this.OPTIONS.excludedElements.includes(item[this.OPTIONS.dataFields.value])) {
                                return false;
                            }
                            return searchValue.split(' ').every(el => searchList.includes(el));
                        });
                        const rowList = filteredData.length > 0 ? this.setRowList(filteredData.slice(0, this.OPTIONS.itemLimit)) : [this.setNotFoundElement()];
                        const expandButton = this.setExpandButton(filteredData, filteredData.length);
                        const detailItem = this.setTagSection(value);
                        this.dropdownTemplate.rows = [detailItem, ...rowList, ...expandButton];
                    }
                    else {
                        this.dropdownTemplate.destroyChildren();
                    }
                    this.updateSize(parent, this.trigger);
                    document.removeEventListener('click', this.close);
                    setTimeout(() => this.dropdownTemplate.rows.length > 0 && document.addEventListener('click', this.close), 0);
                }, this.OPTIONS.searchDelay);
            }
        };
        /**
         * Gnera la estructura para las etiquetas
         * @param value Valor de la etiqueta
         * @returns Contexto de plantilla
         */
        this.setTagElement = (value) => {
            var _a;
            const tagElement = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.tagElement) || {}, ['node']);
            tagElement.dataContext === undefined && (tagElement.dataContext = {});
            tagElement.dataContext.dropdown === undefined && (tagElement.dataContext.dropdown = { tag: value });
            tagElement.styles === undefined && (tagElement.styles = {});
            tagElement.styles.backgroundColor === undefined && (tagElement.styles.backgroundColor = 'rgba(255, 255, 255, 0.1)');
            tagElement.styles.borderRadius === undefined && (tagElement.styles.borderRadius = '0.26rem');
            tagElement.styles.marginLeft === undefined && (tagElement.styles.marginLeft = '0.13rem');
            tagElement.styles.display === undefined && (tagElement.styles.display = 'inline-block');
            tagElement.styles.padding === undefined && (tagElement.styles.padding = '0.13rem');
            tagElement.type === undefined && (tagElement.type = 'container');
            tagElement.name = 'dropdown-area-tag-element';
            if (tagElement.type === 'container') {
                const sectionElement = tagElement;
                if (sectionElement.rows === undefined) {
                    sectionElement.rows = [
                        { type: 'element', text: '{{getParent()?.dropdown?.tag}}', classes: 'vertical-align-middle', tag: 'span' },
                        { type: 'element', text: 'close', tag: 'i', classes: 'material-icons-round cursor-pointer vertical-align-middle', styles: { fontSize: '1.1em' }, addEvents: [['click', { name: 'removeTag' }]] },
                    ];
                }
            }
            return tagElement;
        };
        /**
         * Elimina caracteres especiales del texto
         * @param value Texto a formatear
         * @returns Texto formateado
         */
        this.normalizeText = (value) => (value || '').toLowerCase().normalize('NFD').replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, '$1');
        /**
         * Elimina etiquetas de filtro del formulario
         * @param event Información del evento y la plantlla
         */
        this.removeTag = (event) => {
            var _a, _b, _c, _d, _e;
            const inputValue = ((_c = (_b = (_a = event.templateEvent.target.propertyTree.getParent()) === null || _a === void 0 ? void 0 : _a.getParent()) === null || _b === void 0 ? void 0 : _b.dropdown) === null || _c === void 0 ? void 0 : _c.inputValue) || '';
            const tagValue = ((_e = (_d = event.templateEvent.target.propertyTree.getParent()) === null || _d === void 0 ? void 0 : _d.dropdown) === null || _e === void 0 ? void 0 : _e.tag) || '';
            const haveSpace = inputValue.match(` ${tagValue}`);
            const value = inputValue.replace(haveSpace !== null ? ` ${tagValue}` : tagValue, '');
            const trigger = this.TRIGGER;
            trigger.value = value;
            trigger.focus();
            const customEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
            Object.defineProperty(customEvent, 'target', { value: this.trigger, enumerable: true });
            this.searcher(customEvent);
        };
        build === true && this.build();
    }
    // SETTERS
    set minSearchKeys(val) { this.OPTIONS.minSearchKeys = val; }
    set searchDelay(val) { this.OPTIONS.searchDelay = val; }
    set keywords(val) { this.OPTIONS.keywords = val; }
    set excludedElements(val) {
        this.OPTIONS.excludedElements = val;
        if (this.dropdownTemplate.isDestroyed === false && this.dropdownTemplate.children.length > 0 && this.OPTIONS.dataFields.value !== undefined) {
            this.dropdownTemplate.childrenTree.filter(child => {
                var _a, _b, _c, _d;
                if (((_b = (_a = child.dataContext) === null || _a === void 0 ? void 0 : _a.dropdown) === null || _b === void 0 ? void 0 : _b.item) !== undefined) {
                    return val.includes((_d = (_c = child.dataContext) === null || _c === void 0 ? void 0 : _c.dropdown) === null || _d === void 0 ? void 0 : _d.item[this.OPTIONS.dataFields.value]);
                }
                return false;
            }).forEach(item => item.destroy());
        }
    }
    /** Destruye las instancias y completa los eventos */
    destroy() {
        const parentDestroy = super.destroy;
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.trigger.removeEventListener('dblclick', this.clearSelectionWithFocus);
            this.trigger.removeEventListener('keyup', this.searcher);
            clearTimeout(this.SEARCHTIMER);
            yield parentDestroy.call(this);
            resolve();
        }));
    }
    /**
     * Genera la estructura para el contenedor de las etiquetas
     * @param value Text ingresado
     * @returns Contexto de plantilla
     */
    setTagSection(value) {
        var _a;
        const tagSection = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.tagSection) || {}, ['node']);
        tagSection.styles === undefined && (tagSection.styles = {});
        tagSection.styles.display = tagSection.styles.display === undefined ? ('{{dropdown?.inputValue !== "" ? "block" : "none"}}') : (`{{dropdown?.inputValue !== "" ? "${tagSection.styles.display}" : "none"}}`);
        tagSection.dataContext === undefined && (tagSection.dataContext = {});
        tagSection.dataContext.dropdown === undefined && (tagSection.dataContext.dropdown = { inputValue: value });
        tagSection.addEvents === undefined && (tagSection.addEvents = []);
        tagSection.addEvents.push(['click', { name: 'preventWindowClick' }]);
        tagSection.classes === undefined && (tagSection.classes = 'list-item not-selectable-list-item text-align-center padding-0-important');
        tagSection.tag === undefined && (tagSection.tag = 'li');
        tagSection.name = 'dropdown-area-tag-section';
        tagSection.type = 'container';
        if (tagSection.rows === undefined) {
            tagSection.rows = [{ type: 'element', text: 'Resultados de búsqueda para:', tag: 'span' }];
        }
        tagSection.rows.push(...(typeof value === 'number' ? `${value}` : value).split(' ').filter(item => item !== '').map(this.setTagElement));
        return tagSection;
    }
    /**
     * Genera la estructura para mostrar cuando la búsqueda arroja un resultado vacío
     * @returns Contexto de plantilla
     */
    setNotFoundElement() {
        var _a;
        const notFoundItem = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.notFoundItem) || {}, ['node']);
        notFoundItem.classes === undefined && (notFoundItem.classes = 'list-item');
        notFoundItem.attributes === undefined && (notFoundItem.attributes = {});
        notFoundItem.attributes.tabindex === undefined && (notFoundItem.attributes.tabindex = '0');
        notFoundItem.type === undefined && (notFoundItem.type = 'element');
        notFoundItem.tag === undefined && (notFoundItem.tag = 'li');
        notFoundItem.name = 'dropdown-area-not-found-element';
        if (notFoundItem.type === 'element') {
            const elementContext = notFoundItem;
            elementContext.text === undefined && (elementContext.text = 'No se encontraron coincidencias');
        }
        return notFoundItem;
    }
}
