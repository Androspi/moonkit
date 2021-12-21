import { ContainerTemplate, ContainerTemplateContext, ElementTemplateContext, IntersectionTypeList, TemplateEvent, TemplateOperators } from 'htmon';
import { Subject } from 'rxjs';

import { Dropdown, DropdownArea, DropdownOptions } from './dropdown';

export interface ListArea extends DropdownArea {
  groupBody: Partial<Omit<ContainerTemplateContext, 'rows'>>;
  emptyListItem: Partial<IntersectionTypeList['context']>;
  groupHeader: Partial<IntersectionTypeList['context']>;
  groupFooter: Partial<IntersectionTypeList['context']>;
  item: Partial<IntersectionTypeList['context']>;
}

export interface ListOptions extends DropdownOptions {
  dataFields: Record<'value' | 'text', keyof ListOptions['data'][number]> & Partial<Record<'groupValue' | 'groupText', keyof ListOptions['data'][number]>>;
  data: Record<string | number, any>[];
  templateContext: Partial<ListArea>;
  defaultValue: string | number;
  itemLimit: number;
}

export interface ListItemSelectedEvent {
  dataContext: { data: ListOptions['data'], index: number, item: ListOptions['data'][number] };
  value: ListOptions['defaultValue'];
}

export interface ListEvents {
  itemSelected: Subject<ListItemSelectedEvent>;
}

export class List<OPT extends ListOptions = ListOptions> extends Dropdown<OPT> {
  // PROTECTED
  /** Eventos del componente */
  protected LISTEVENTS: ListEvents = { itemSelected: new Subject<ListItemSelectedEvent>() };
  // GETTERS
  /** @get Obtiene los eventos del componente */
  public get events() { return { ...this.DROPDOWNEVENTS, ...this.LISTEVENTS }; }
  // SETTERS
  /** @set Actualiza el listado y reinicia la visualización del componente */
  public set data(val: ListOptions['data']) {
    this.OPTIONS.data = val;
    this.restart();
    val.length > 0 && this.OPTIONS.defaultValue !== undefined && this.selectInstance(this.OPTIONS.defaultValue);
  }
  /** @set Actualiza las propiedades del listado y reinicia la visualización del componente */
  public set dataFields(val: OPT['dataFields']) {
    this.OPTIONS.dataFields = val;
    this.restart();
  }
  /** @set Actualiza el valor seleccionado del componente */
  public set defaultValue(val: OPT['defaultValue']) {
    this.OPTIONS.defaultValue = val;
    this.selectInstance(val);
  }
  /** @set Actualiza el límite de elementos mostrados a la vez y reinicia la visualización del componente */
  public set itemLimit(val: OPT['itemLimit']) {
    this.OPTIONS.itemLimit = val;
    this.restart();
  }
  /** @set Actualiza el contexto de la plantilla de los elementos */
  public set itemArea(val: OPT['templateContext']['item']) {
    this.OPTIONS.templateContext.item = val;
    this.restart();
  }

  constructor(trigger: Element, options: Partial<OPT> = {}, build = true) {
    super(trigger, options, false); build === true && this.build();
  }

  /** Añade al elemento los eventos para abrir el dropdown */
  public build() {
    this.OPTIONS.dataFields === undefined && (this.OPTIONS.dataFields = { text: undefined, value: undefined });
    this.OPTIONS.data === undefined && (this.OPTIONS.data = []);
    this.OPTIONS.methods === undefined && (this.OPTIONS.methods = {});
    this.OPTIONS.methods = { navigateList: this.navigateList, expandEvent: this.expandEvent, selectItem: this.selectItem, preventWindowClick: this.preventWindowClick, ...this.OPTIONS.methods };
    this.TRIGGER.addEventListener('keydown', this.focusItem);
    'defaultValue' in this.OPTIONS && (this.selectInstance(this.OPTIONS.defaultValue));
    super.build();
  }
  /**
   * Selecciona un valor por defecto
   * @param value Valor a seleccionar
   */
  public selectInstance = (value: OPT['defaultValue']) => {
    if (([null, undefined, ''] as any[]).includes(value)) {
      (this.TRIGGER instanceof HTMLInputElement || this.TRIGGER instanceof HTMLTextAreaElement || this.TRIGGER instanceof HTMLSelectElement) && (this.TRIGGER.value = '');
    }
    if (this.OPTIONS.data?.length > 0) {
      if (this.OPTIONS.dataFields?.value !== undefined) {
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
      } else { console.warn(`Property 'dataFields.value' must be defined`); }
    }
  }
  /**
   * Aumenta la cantidad de items mostrados
   * @param event Información del evento
   */
  public expandEvent = (event: MouseEvent & TemplateEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropdownTemplate instanceof ContainerTemplate) {
      const expandData = event.templateEvent.target.dataContext.expand;
      const rowData: any[] = expandData.data.slice(expandData.startAt, expandData.startAt + expandData.length);
      if (rowData.length > 0) {
        const groupKeys = [this.OPTIONS.dataFields?.groupValue, this.OPTIONS.dataFields?.groupText];
        if (groupKeys[0] !== undefined) {
          const groupList = Array.from(new Set(rowData.map(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}`)));
          const rowList: Record<string | number, { groupValue: any, groupText: any, context: Partial<IntersectionTypeList['context']> }> = rowData.reduce((ref, item, i) => {
            ref[i] = { groupValue: item[groupKeys[0]], groupText: item[groupKeys[0]], context: this.setData(item, i + expandData.startAt) };
            return ref;
          }, {});
          groupList.forEach((group) => {
            const groupValues = group.split('|-|').filter(k => k !== '');
            const groupContext = Object.keys(rowList).filter(key => rowList[key].groupValue === groupValues[0]);
            const groupData = rowData.filter(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}` === group);
            const groupTemplate = TemplateOperators.templateSelector(this.dropdownTemplate.childrenTree, { name: `dropdown-area-group-container-${groupValues[0]}` });
            if (groupTemplate instanceof ContainerTemplate) {
              const groupTemplateBody = TemplateOperators.templateSelector<ContainerTemplate>(groupTemplate.childrenTree, { name: 'dropdown-area-group-body' });
              groupContext.forEach(key => groupTemplateBody.push(rowList[key].context, false));
              groupTemplate.dataContext.dropdown.data = groupTemplate.dataContext.dropdown.data.concat(groupData);
            } else {
              const groupHeader = this.setGroupHeader();
              const groupFooter = this.setGroupFooter();
              const groupBody: Partial<ContainerTemplateContext> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.groupBody || {}, ['node']);
              groupBody.name = 'dropdown-area-group-body';
              groupBody.type = 'container';
              groupBody.rows = groupContext.map(key => rowList[key].context);
              const groupContextRows: Partial<IntersectionTypeList['context']>[] = [groupHeader, groupBody];
              groupFooter !== undefined && groupContextRows.push(groupFooter);
              this.dropdownTemplate.push({
                dataContext: { dropdown: { data: groupData, groupValue: groupValues[0], groupText: groupValues[1] !== undefined ? groupValues[1] : groupValues[0] } },
                name: `dropdown-area-group-container-${groupValues[0]}`,
                rows: groupContextRows,
                type: 'container',
              }, false);
            }
          });
        } else {
          const listItems = TemplateOperators.templateSelectorAll(this.dropdownTemplate.children, { name: 'dropdown-area-item' });
          const endAt = listItems.length > 0 ? (this.dropdownTemplate.children.lastIndexOf(listItems[listItems.length - 1]) + 1) : expandData.startAt;
          rowData.forEach((item, i) => {
            const context = this.setData(item, i + expandData.startAt);
            this.dropdownTemplate.push(context, false, endAt + i);
          });
        }
        expandData.startAt = expandData.startAt + expandData.length;
        const nextRowData: any[] = expandData.data.slice(expandData.startAt, expandData.startAt + expandData.length);
        if (nextRowData.length === 0) { event.templateEvent.target.destroy(); }
        this.trigger instanceof HTMLElement && this.trigger.focus();
      } else { event.templateEvent.target.destroy(); }
    }
  }
  /**
   * De acuerdo a la tecla presionada enfocará otro elemento o aplicará el evento de selección
   * @param event Información del evento
   */
  public navigateList = (event: KeyboardEvent & TemplateEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        const adChildren = (event.templateEvent.target.parent as ContainerTemplate).children;
        const adCurrentIndex: number = adChildren.indexOf(event.templateEvent.target);
        const nextElement = adChildren[adCurrentIndex + 1];
        if (nextElement !== undefined) {
          nextElement.target instanceof HTMLElement && nextElement.target.focus();
        } else { this.trigger instanceof HTMLElement && this.trigger.focus(); }
        break;
      case 'ArrowUp':
        const auChildren = (event.templateEvent.target.parent as ContainerTemplate).children;
        const auCurrentIndex: number = auChildren.indexOf(event.templateEvent.target);
        const lastElement = auChildren[auCurrentIndex - 1];
        if (lastElement !== undefined) {
          lastElement.target instanceof HTMLElement && lastElement.target.focus();
        } else { this.trigger instanceof HTMLElement && this.trigger.focus(); }
        break;
      case 'Enter': this.selectItem(event); break;
      case 'Escape': this.close(new PointerEvent('click')); break;
    }
  }
  /** Elimina las instancias y eventos creados */
  public destroy(): Promise<void> {
    const parentDestroy = super.destroy;
    return new Promise(async resolve => {
      this.trigger.removeEventListener('keydown', this.focusItem);
      await parentDestroy.call(this);
      resolve();
    });
  }
  /** Genera el contenido del dropdown */
  protected setDropdownContent() {
    if (this.OPTIONS.data?.length > 0) {
      const rowList = this.setRowList(this.OPTIONS.data.slice(0, this.OPTIONS.itemLimit));
      const expandButton = this.setExpandButton(this.OPTIONS.data, this.OPTIONS.data.length);
      this.dropdownTemplate.rows = [...rowList, ...expandButton];
    } else {
      const emptyListItem = TemplateOperators.copyOf(this.OPTIONS.templateContext?.emptyListItem || {}, ['node']);
      emptyListItem.classes === undefined && (emptyListItem.classes = 'list-item');
      emptyListItem.attributes === undefined && (emptyListItem.attributes = {});
      emptyListItem.type === undefined && (emptyListItem.type = 'element');
      emptyListItem.tag === undefined && (emptyListItem.tag = 'li');
      emptyListItem.name = 'dropdown-area-empty-list';
      emptyListItem.attributes.tabindex === undefined && (emptyListItem.attributes.tabindex = '0');
      if (emptyListItem.type === 'element') {
        const elementContext = emptyListItem as ElementTemplateContext;
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
  protected setRowList(data: OPT['data']): Partial<IntersectionTypeList['context']>[] {
    const groupKeys = [this.OPTIONS.dataFields?.groupValue, this.OPTIONS.dataFields?.groupText];
    let rowList: Partial<IntersectionTypeList['context']>[] = [];
    if (groupKeys[0] !== undefined) {
      const groupList = Array.from(new Set(data.map(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}`)));
      rowList = groupList.map((group): Partial<ContainerTemplateContext> => {
        const groupValues = group.split('|-|').filter(k => k !== '');
        const groupHeader = this.setGroupHeader();
        const groupFooter = this.setGroupFooter();
        const groupData = data.filter(item => `${item[groupKeys[0]] || ''}|-|${item[groupKeys[1]] || ''}` === group);
        const groupBody: Partial<ContainerTemplateContext> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.groupBody || {}, ['node']);
        groupBody.classes === undefined && (groupBody.classes = 'primary-list padding-0-important');
        groupBody.tag === undefined && (groupBody.tag = 'ul');
        groupBody.name = 'dropdown-area-group-body';
        groupBody.type = 'container';
        groupBody.rows = groupData.map(this.setData);
        const groupContextRows: Partial<IntersectionTypeList['context']>[] = [groupHeader, groupBody];
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
    } else { rowList = data.slice(0, this.OPTIONS.itemLimit).map(this.setData); }
    return rowList;
  }
  /**
   * Genera la estructura de los items de la lista
   * @param item Opción
   * @param index Índice
   * @returns Contexto de plantilla
   */
  protected setData = (item: OPT['data'][number], index: number): Partial<IntersectionTypeList['context']> => {
    const context = this.getItemContext();
    context.dataContext === undefined && (context.dataContext = {});
    context.addEvents === undefined && (context.addEvents = []);
    context.addEvents.push(['keydown', { name: 'navigateList' }], ['click', { name: 'selectItem' }]);
    context.dataContext.dropdown = { index, item, data: this.OPTIONS.data };
    return context;
  }
  /**
   * Genera la estructura del botón que aumenta la cantidad de elementos mostrados
   * @param data Listado de opciones
   * @returns Listado de Contexto de plantilla
   */
  protected setExpandButton(data: Partial<ContainerTemplateContext>[], length: number): Partial<ContainerTemplateContext>[] {
    const expand: Partial<ContainerTemplateContext>[] = [];
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
  protected setGroupHeader(): Partial<IntersectionTypeList['context']> {
    const groupHeader = TemplateOperators.copyOf(this.OPTIONS.templateContext?.groupHeader || {}, ['node']);
    groupHeader.addEvents === undefined && (groupHeader.addEvents = []);
    groupHeader.addEvents.push(['click', { name: 'preventWindowClick' }]);
    groupHeader.classes === undefined && (groupHeader.classes = 'group-item');
    groupHeader.type === undefined && (groupHeader.type = 'element');
    groupHeader.name = 'dropdown-area-group-header';
    if (groupHeader.type === 'element') {
      const elementContext = groupHeader as ElementTemplateContext;
      elementContext.text === undefined && (elementContext.text = '{{getParent()?.dropdown?.groupText}} ({{getParent()?.dropdown?.data?.length}})');
    }
    return groupHeader;
  }
  /**
   * Genera la estructura para el pié de los grupos
   * @returns Contexto de plantilla o undefined
   */
  protected setGroupFooter(): Partial<IntersectionTypeList['context']> | undefined {
    let groupFooter;
    if (this.OPTIONS.templateContext?.groupFooter !== undefined) {
      groupFooter = TemplateOperators.copyOf(this.OPTIONS.templateContext.groupFooter, ['node']);
      groupFooter.name = 'dropdown-area-group-footer';
      groupFooter.addEvents === undefined && (groupFooter.addEvents = []);
      groupFooter.addEvents.push(['click', { name: 'preventWindowClick' }]);
    }
    return groupFooter;
  }
  /**
   * Enfoca el siguiente elemento en la lista
   * @param event Información del event
   */
  protected focusItem = (event: KeyboardEvent) => {
    const children = TemplateOperators.templateSelectorAll(this.dropdownTemplate.childrenTree, { name: 'dropdown-area-item' });
    if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); }
    if (children.length > 0) {
      switch (event.key) {
        case 'ArrowUp': children[children.length - 1].target instanceof HTMLElement && (children[children.length - 1].target as HTMLElement).focus(); break;
        case 'Tab': this.dropdownTemplate.target instanceof HTMLElement && this.dropdownTemplate.target.focus(); break;
        case 'ArrowDown': children[0].target instanceof HTMLElement && children[0].target.focus(); break;
        case 'Escape': this.close(new PointerEvent('click')); break;
      }
    }
  }
  /**
   * Obtiene el valor de un elemento y lo asigna al formulario
   * @param event Información del event
   */
  protected selectItem = (event: (KeyboardEvent | MouseEvent) & TemplateEvent) => {
    this.TRIGGER.removeEventListener('keydown', this.focusItem);
    this.TRIGGER.removeEventListener('click', this.open);
    document.removeEventListener('click', this.close);
    const dropdownElement = event.templateEvent.target;
    const dropdownEvent: ListItemSelectedEvent = {
      value: this.OPTIONS.dataFields?.value !== undefined ? dropdownElement.dataContext.dropdown.item[this.OPTIONS.dataFields.value] : undefined,
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
  }
  /**
   * Ajusta el tamaño del contenedor
   * @param parentRef Referencia del conetenedor
   * @param triggerRef Referencia del boton que activa el dropdown
   */
  protected updateSize(parentRef: Element, triggerRef: Element) {
    super.updateSize(parentRef, triggerRef.parentElement instanceof HTMLLabelElement ? triggerRef.parentElement : triggerRef);
  }
  /** Impide el cierre del dropdown cuándo se presiona un elemento no seleccionable */
  private preventWindowClick = () => {
    document.removeEventListener('click', this.close);
    setTimeout(() => document.addEventListener('click', this.close), 0);
  }
  /**
   * Genera el contexto para la plantilla de los elementos de la lista
   * @returns Contexto de elemento
   */
  private getItemContext(): Partial<IntersectionTypeList['context']> {
    const context: Partial<IntersectionTypeList['context']> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.item || {}, ['node']);
    context.classes === undefined && (context.classes = 'list-item');
    context.type === undefined && (context.type = 'element');
    context.tag === undefined && (context.tag = 'li');
    context.name = 'dropdown-area-item';
    context.attributes === undefined && (context.attributes = {});
    context.attributes.tabIndex === undefined && (context.attributes.tabIndex = '0');
    if (context.type === 'element') {
      const ctx = context as Partial<ElementTemplateContext>;
      ctx.text === undefined && (ctx.text = `{{dropdown.item["${this.OPTIONS.dataFields.text}"]}}`);
    }
    return context;
  }

}
