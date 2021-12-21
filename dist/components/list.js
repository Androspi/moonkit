var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContainerTemplate, TemplateOperators } from 'htmon-test';
import { Subject } from 'rxjs';
import { Dropdown } from './dropdown';
export class List extends Dropdown {
    constructor(trigger, options = {}, build = true) {
        super(trigger, options, false);
        // PROTECTED
        /** Eventos del componente */
        this.LISTEVENTS = { itemSelected: new Subject() };
        /**
         * Selecciona un valor por defecto
         * @param value Valor a seleccionar
         */
        this.selectInstance = (value) => {
            var _a, _b;
            if ([null, undefined, ''].includes(value)) {
                (this.TRIGGER instanceof HTMLInputElement || this.TRIGGER instanceof HTMLTextAreaElement || this.TRIGGER instanceof HTMLSelectElement) && (this.TRIGGER.value = '');
            }
            if (((_a = this.OPTIONS.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                if (((_b = this.OPTIONS.dataFields) === null || _b === void 0 ? void 0 : _b.value) !== undefined) {
                    const index = this.OPTIONS.data.findIndex(elm => {
                        switch (`${typeof value}|${typeof elm[this.OPTIONS.dataFields.value]}`) {
                            case 'string|string': return value === elm[this.OPTIONS.dataFields.value];
                            case 'number|number': return value === elm[this.OPTIONS.dataFields.value];
                            case 'number|string': return `${value}` === elm[this.OPTIONS.dataFields.value];
                            case 'string|number': return value === `${elm[this.OPTIONS.dataFields.value]}`;
                        }
                    });
                    if (index !== -1) {
                        const context = this.getItemContext();
                        context.dataContext === undefined && (context.dataContext = {});
                        context.dataContext.dropdown = { data: this.OPTIONS.data, index, item: this.OPTIONS.data[index] };
                        const dropdownMethods = { navigateList: this.navigateList, selectItem: this.selectItem, preventWindowClick: this.preventWindowClick };
                        const dropdownElement = TemplateOperators.createTemplate(undefined, context, dropdownMethods, this.OPTIONS.componentAttribute);
                        if (this.TRIGGER instanceof HTMLInputElement || this.TRIGGER instanceof HTMLTextAreaElement || this.TRIGGER instanceof HTMLSelectElement) {
                            this.TRIGGER.value = this.OPTIONS.data[index][this.OPTIONS.dataFields.text];
                            this.TRIGGER.dispatchEvent(new Event('change'));
                        }
                        this.events.itemSelected.next({ dataContext: context.dataContext.dropdown, value: this.OPTIONS.data[index][this.OPTIONS.dataFields.value] });
                        dropdownElement.destroy();
                    }
                }
                else {
                    console.warn(`Property 'dataFields.value' must be defined`);
                }
            }
        };
        /**
         * Aumenta la cantidad de items mostrados
         * @param event Información del evento
         */
        this.expandEvent = (event) => {
            var _a, _b;
            event.preventDefault();
            event.stopPropagation();
            if (this.dropdownTemplate instanceof ContainerTemplate) {
                const expandData = event.templateEvent.target.dataContext.expand;
                const rowData = expandData.data.slice(expandData.startAt, expandData.startAt + expandData.length);
                if (rowData.length > 0) {
                    const groupKeys = [(_a = this.OPTIONS.dataFields) === null || _a === void 0 ? void 0 : _a.groupValue, (_b = this.OPTIONS.dataFields) === null || _b === void 0 ? void 0 : _b.groupText];
                    if (groupKeys[0] !== undefined) {
                        const groupList = Array.from(new Set(rowData.map(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}`)));
                        const rowList = rowData.reduce((ref, item, i) => {
                            ref[i] = { groupValue: item[groupKeys[0]], groupText: item[groupKeys[0]], context: this.setData(item, i + expandData.startAt) };
                            return ref;
                        }, {});
                        groupList.forEach((group) => {
                            var _a;
                            const groupValues = group.split('|-|').filter(k => k !== '');
                            const groupContext = Object.keys(rowList).filter(key => rowList[key].groupValue === groupValues[0]);
                            const groupData = rowData.filter(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}` === group);
                            const groupTemplate = TemplateOperators.templateSelector(this.dropdownTemplate.childrenTree, { name: `dropdown-area-group-container-${groupValues[0]}` });
                            if (groupTemplate instanceof ContainerTemplate) {
                                const groupTemplateBody = TemplateOperators.templateSelector(groupTemplate.childrenTree, { name: 'dropdown-area-group-body' });
                                groupContext.forEach(key => groupTemplateBody.push(rowList[key].context, false));
                                groupTemplate.dataContext.dropdown.data = groupTemplate.dataContext.dropdown.data.concat(groupData);
                            }
                            else {
                                const groupHeader = this.setGroupHeader();
                                const groupFooter = this.setGroupFooter();
                                const groupBody = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.groupBody) || {}, ['node']);
                                groupBody.name = 'dropdown-area-group-body';
                                groupBody.type = 'container';
                                groupBody.rows = groupContext.map(key => rowList[key].context);
                                const groupContextRows = [groupHeader, groupBody];
                                groupFooter !== undefined && groupContextRows.push(groupFooter);
                                this.dropdownTemplate.push({
                                    dataContext: { dropdown: { data: groupData, groupValue: groupValues[0], groupText: groupValues[1] !== undefined ? groupValues[1] : groupValues[0] } },
                                    name: `dropdown-area-group-container-${groupValues[0]}`,
                                    rows: groupContextRows,
                                    type: 'container',
                                }, false);
                            }
                        });
                    }
                    else {
                        const listItems = TemplateOperators.templateSelectorAll(this.dropdownTemplate.children, { name: 'dropdown-area-item' });
                        const endAt = listItems.length > 0 ? (this.dropdownTemplate.children.lastIndexOf(listItems[listItems.length - 1]) + 1) : expandData.startAt;
                        rowData.forEach((item, i) => {
                            const context = this.setData(item, i + expandData.startAt);
                            this.dropdownTemplate.push(context, false, endAt + i);
                        });
                    }
                    expandData.startAt = expandData.startAt + expandData.length;
                    const nextRowData = expandData.data.slice(expandData.startAt, expandData.startAt + expandData.length);
                    if (nextRowData.length === 0) {
                        event.templateEvent.target.destroy();
                    }
                    this.trigger instanceof HTMLElement && this.trigger.focus();
                }
                else {
                    event.templateEvent.target.destroy();
                }
            }
        };
        /**
         * De acuerdo a la tecla presionada enfocará otro elemento o aplicará el evento de selección
         * @param event Información del evento
         */
        this.navigateList = (event) => {
            switch (event.key) {
                case 'ArrowDown':
                    const adChildren = event.templateEvent.target.parent.children;
                    const adCurrentIndex = adChildren.indexOf(event.templateEvent.target);
                    const nextElement = adChildren[adCurrentIndex + 1];
                    if (nextElement !== undefined) {
                        nextElement.target instanceof HTMLElement && nextElement.target.focus();
                    }
                    else {
                        this.trigger instanceof HTMLElement && this.trigger.focus();
                    }
                    break;
                case 'ArrowUp':
                    const auChildren = event.templateEvent.target.parent.children;
                    const auCurrentIndex = auChildren.indexOf(event.templateEvent.target);
                    const lastElement = auChildren[auCurrentIndex - 1];
                    if (lastElement !== undefined) {
                        lastElement.target instanceof HTMLElement && lastElement.target.focus();
                    }
                    else {
                        this.trigger instanceof HTMLElement && this.trigger.focus();
                    }
                    break;
                case 'Enter':
                    this.selectItem(event);
                    break;
                case 'Escape':
                    this.close(new PointerEvent('click'));
                    break;
            }
        };
        /**
         * Genera la estructura de los items de la lista
         * @param item Opción
         * @param index Índice
         * @returns Contexto de plantilla
         */
        this.setData = (item, index) => {
            const context = this.getItemContext();
            context.dataContext === undefined && (context.dataContext = {});
            context.addEvents === undefined && (context.addEvents = []);
            context.addEvents.push(['keydown', { name: 'navigateList' }], ['click', { name: 'selectItem' }]);
            context.dataContext.dropdown = { index, item, data: this.OPTIONS.data };
            return context;
        };
        /**
         * Enfoca el siguiente elemento en la lista
         * @param event Información del event
         */
        this.focusItem = (event) => {
            const children = TemplateOperators.templateSelectorAll(this.dropdownTemplate.childrenTree, { name: 'dropdown-area-item' });
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
            }
            if (children.length > 0) {
                switch (event.key) {
                    case 'ArrowUp':
                        children[children.length - 1].target instanceof HTMLElement && children[children.length - 1].target.focus();
                        break;
                    case 'Tab':
                        this.dropdownTemplate.target instanceof HTMLElement && this.dropdownTemplate.target.focus();
                        break;
                    case 'ArrowDown':
                        children[0].target instanceof HTMLElement && children[0].target.focus();
                        break;
                    case 'Escape':
                        this.close(new PointerEvent('click'));
                        break;
                }
            }
        };
        /**
         * Obtiene el valor de un elemento y lo asigna al formulario
         * @param event Información del event
         */
        this.selectItem = (event) => {
            var _a;
            this.TRIGGER.removeEventListener('keydown', this.focusItem);
            this.TRIGGER.removeEventListener('click', this.open);
            document.removeEventListener('click', this.close);
            const dropdownElement = event.templateEvent.target;
            const dropdownEvent = {
                value: ((_a = this.OPTIONS.dataFields) === null || _a === void 0 ? void 0 : _a.value) !== undefined ? dropdownElement.dataContext.dropdown.item[this.OPTIONS.dataFields.value] : undefined,
                dataContext: dropdownElement.dataContext.dropdown,
            };
            if (this.TRIGGER instanceof HTMLInputElement || this.TRIGGER instanceof HTMLTextAreaElement || this.TRIGGER instanceof HTMLSelectElement) {
                this.TRIGGER.value = dropdownElement.dataContext.dropdown.item[this.OPTIONS.dataFields.text];
                this.TRIGGER.dispatchEvent(new Event('change'));
            }
            this.events.itemSelected.next(dropdownEvent);
            this.dropdownTemplate.destroyChildren();
            this.ISOPEN = false;
            setTimeout(() => {
                this.TRIGGER.addEventListener('keydown', this.focusItem);
                this.TRIGGER.addEventListener('click', this.open);
            }, 0);
        };
        /** Impide el cierre del dropdown cuándo se presiona un elemento no seleccionable */
        this.preventWindowClick = () => {
            document.removeEventListener('click', this.close);
            setTimeout(() => document.addEventListener('click', this.close), 0);
        };
        build === true && this.build();
    }
    // GETTERS
    /** @get Obtiene los eventos del componente */
    get events() { return Object.assign(Object.assign({}, this.DROPDOWNEVENTS), this.LISTEVENTS); }
    // SETTERS
    /** @set Actualiza el listado y reinicia la visualización del componente */
    set data(val) {
        this.OPTIONS.data = val;
        this.restart();
        val.length > 0 && this.OPTIONS.defaultValue !== undefined && this.selectInstance(this.OPTIONS.defaultValue);
    }
    /** @set Actualiza las propiedades del listado y reinicia la visualización del componente */
    set dataFields(val) {
        this.OPTIONS.dataFields = val;
        this.restart();
    }
    /** @set Actualiza el valor seleccionado del componente */
    set defaultValue(val) {
        this.OPTIONS.defaultValue = val;
        this.selectInstance(val);
    }
    /** @set Actualiza el límite de elementos mostrados a la vez y reinicia la visualización del componente */
    set itemLimit(val) {
        this.OPTIONS.itemLimit = val;
        this.restart();
    }
    /** @set Actualiza el contexto de la plantilla de los elementos */
    set itemArea(val) {
        this.OPTIONS.templateContext.item = val;
        this.restart();
    }
    /** Añade al elemento los eventos para abrir el dropdown */
    build() {
        this.OPTIONS.dataFields === undefined && (this.OPTIONS.dataFields = { text: undefined, value: undefined });
        this.OPTIONS.data === undefined && (this.OPTIONS.data = []);
        this.OPTIONS.methods === undefined && (this.OPTIONS.methods = {});
        this.OPTIONS.methods = Object.assign({ navigateList: this.navigateList, expandEvent: this.expandEvent, selectItem: this.selectItem, preventWindowClick: this.preventWindowClick }, this.OPTIONS.methods);
        this.TRIGGER.addEventListener('keydown', this.focusItem);
        'defaultValue' in this.OPTIONS && (this.selectInstance(this.OPTIONS.defaultValue));
        super.build();
    }
    /** Elimina las instancias y eventos creados */
    destroy() {
        const parentDestroy = super.destroy;
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.trigger.removeEventListener('keydown', this.focusItem);
            yield parentDestroy.call(this);
            resolve();
        }));
    }
    /** Genera el contenido del dropdown */
    setDropdownContent() {
        var _a, _b;
        if (((_a = this.OPTIONS.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const rowList = this.setRowList(this.OPTIONS.data.slice(0, this.OPTIONS.itemLimit));
            const expandButton = this.setExpandButton(this.OPTIONS.data, this.OPTIONS.data.length);
            this.dropdownTemplate.rows = [...rowList, ...expandButton];
        }
        else {
            const emptyListItem = TemplateOperators.copyOf(((_b = this.OPTIONS.templateContext) === null || _b === void 0 ? void 0 : _b.emptyListItem) || {}, ['node']);
            emptyListItem.classes === undefined && (emptyListItem.classes = 'list-item');
            emptyListItem.attributes === undefined && (emptyListItem.attributes = {});
            emptyListItem.type === undefined && (emptyListItem.type = 'element');
            emptyListItem.tag === undefined && (emptyListItem.tag = 'li');
            emptyListItem.name = 'dropdown-area-empty-list';
            emptyListItem.attributes.tabindex === undefined && (emptyListItem.attributes.tabindex = '0');
            if (emptyListItem.type === 'element') {
                const elementContext = emptyListItem;
                elementContext.text === undefined && (elementContext.text = 'Vacío');
            }
            this.dropdownTemplate.rows = [emptyListItem];
        }
    }
    /**
     * Genera la estructura de los elementos de la lista
     * @param data Listado
     * @returns Estructura de plantilla por elemento
     */
    setRowList(data) {
        var _a, _b;
        const groupKeys = [(_a = this.OPTIONS.dataFields) === null || _a === void 0 ? void 0 : _a.groupValue, (_b = this.OPTIONS.dataFields) === null || _b === void 0 ? void 0 : _b.groupText];
        let rowList = [];
        if (groupKeys[0] !== undefined) {
            const groupList = Array.from(new Set(data.map(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}`)));
            rowList = groupList.map((group) => {
                var _a;
                const groupValues = group.split('|-|').filter(k => k !== '');
                const groupHeader = this.setGroupHeader();
                const groupFooter = this.setGroupFooter();
                const groupData = data.filter(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}` === group);
                const groupBody = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.groupBody) || {}, ['node']);
                groupBody.classes === undefined && (groupBody.classes = 'primary-list padding-0-important');
                groupBody.tag === undefined && (groupBody.tag = 'ul');
                groupBody.name = 'dropdown-area-group-body';
                groupBody.type = 'container';
                groupBody.rows = groupData.map(this.setData);
                const groupContextRows = [groupHeader, groupBody];
                groupFooter !== undefined && groupContextRows.push(groupFooter);
                return {
                    classes: 'not-selectable-list-item list-item padding-0-important',
                    dataContext: { dropdown: { data: groupData, groupValue: groupValues[0], groupText: groupValues[1] !== undefined ? groupValues[1] : groupValues[0] } },
                    name: `dropdown-area-group-container-${groupValues[0]}`,
                    rows: groupContextRows,
                    type: 'container',
                    tag: 'li'
                };
            });
        }
        else {
            rowList = data.slice(0, this.OPTIONS.itemLimit).map(this.setData);
        }
        return rowList;
    }
    /**
     * Genera la estructura del botón que aumenta la cantidad de elementos mostrados
     * @param data Listado de opciones
     * @returns Listado de Contexto de plantilla
     */
    setExpandButton(data, length) {
        const expand = [];
        length > this.OPTIONS.itemLimit && expand.push({
            dataContext: { expand: { startAt: this.OPTIONS.itemLimit, length: this.OPTIONS.itemLimit, data } },
            behavior: { tooltip: { text: 'Ampliar selección', parent: 'page-content' } },
            classes: 'list-item text-align-center padding-0-important',
            addEvents: [['click', { name: 'expandEvent' }]],
            name: 'dropdown-area-expand',
            type: 'container',
            tag: 'li',
            rows: [{
                    classes: 'material-icons-round',
                    styles: { fontSize: '2.5em' },
                    text: 'expand_more',
                    type: 'element',
                    tag: 'i'
                }]
        });
        return expand;
    }
    /**
     * Genera la estructura para el título de los grupos
     * @returns Contexto de plantilla
     */
    setGroupHeader() {
        var _a;
        const groupHeader = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.groupHeader) || {}, ['node']);
        groupHeader.addEvents === undefined && (groupHeader.addEvents = []);
        groupHeader.addEvents.push(['click', { name: 'preventWindowClick' }]);
        groupHeader.classes === undefined && (groupHeader.classes = 'group-item');
        groupHeader.type === undefined && (groupHeader.type = 'element');
        groupHeader.name = 'dropdown-area-group-header';
        if (groupHeader.type === 'element') {
            const elementContext = groupHeader;
            elementContext.text === undefined && (elementContext.text = '{{getParent()?.dropdown?.groupText}} ({{getParent()?.dropdown?.data?.length}})');
        }
        return groupHeader;
    }
    /**
     * Genera la estructura para el pié de los grupos
     * @returns Contexto de plantilla o undefined
     */
    setGroupFooter() {
        var _a;
        let groupFooter;
        if (((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.groupFooter) !== undefined) {
            groupFooter = TemplateOperators.copyOf(this.OPTIONS.templateContext.groupFooter, ['node']);
            groupFooter.name = 'dropdown-area-group-footer';
            groupFooter.addEvents === undefined && (groupFooter.addEvents = []);
            groupFooter.addEvents.push(['click', { name: 'preventWindowClick' }]);
        }
        return groupFooter;
    }
    /**
     * Ajusta el tamaño del contenedor
     * @param parentRef Referencia del conetenedor
     * @param triggerRef Referencia del boton que activa el dropdown
     */
    updateSize(parentRef, triggerRef) {
        super.updateSize(parentRef, triggerRef.parentElement instanceof HTMLLabelElement ? triggerRef.parentElement : triggerRef);
    }
    /**
     * Genera el contexto para la plantilla de los elementos de la lista
     * @returns Contexto de elemento
     */
    getItemContext() {
        var _a;
        const context = TemplateOperators.copyOf(((_a = this.OPTIONS.templateContext) === null || _a === void 0 ? void 0 : _a.item) || {}, ['node']);
        context.classes === undefined && (context.classes = 'list-item');
        context.type === undefined && (context.type = 'element');
        context.tag === undefined && (context.tag = 'li');
        context.name = 'dropdown-area-item';
        context.attributes === undefined && (context.attributes = {});
        context.attributes.tabIndex === undefined && (context.attributes.tabIndex = '0');
        if (context.type === 'element') {
            const ctx = context;
            ctx.text === undefined && (ctx.text = `{{dropdown.item["${this.OPTIONS.dataFields.text}"]}}`);
        }
        return context;
    }
}
