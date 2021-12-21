import { ContainerTemplateContext, ElementTemplateContext, IntersectionTypeList, TemplateEvent, TemplateOperators } from 'htmon';

import { List, ListArea, ListOptions } from './list';

export interface AutocompleteArea extends ListArea {
  notFoundItem: Partial<IntersectionTypeList['context']>;
  tagElement: Partial<IntersectionTypeList['context']>;
  tagSection: Partial<ContainerTemplateContext>;
}

export interface AutocompleteOptions extends ListOptions {
  keywords: (keyof AutocompleteOptions['data'][number])[];
  templateContext: Partial<AutocompleteArea>;
  excludedElements: (string | number)[];
  minSearchKeys: number;
  searchDelay: number;
}

export class Autocomplete<OPT extends AutocompleteOptions = AutocompleteOptions> extends List<OPT> {

  // PRIVATE
  /** Almacena la instancia del timer de búsqueda */
  private SEARCHTIMER = 0;
  // SETTERS
  public set minSearchKeys(val: OPT['minSearchKeys']) { this.OPTIONS.minSearchKeys = val; }
  public set searchDelay(val: OPT['searchDelay']) { this.OPTIONS.searchDelay = val; }
  public set keywords(val: OPT['keywords']) { this.OPTIONS.keywords = val; }
  public set excludedElements(val: OPT['excludedElements']) {
    this.OPTIONS.excludedElements = val;
    if (this.dropdownTemplate.isDestroyed === false && this.dropdownTemplate.children.length > 0 && this.OPTIONS.dataFields.value !== undefined) {
      this.dropdownTemplate.childrenTree.filter(child => {
        if (child.dataContext?.dropdown?.item !== undefined) {
          return val.includes(child.dataContext?.dropdown?.item[this.OPTIONS.dataFields.value]);
        }
        return false;
      }).forEach(item => item.destroy());
    }
  }

  constructor(trigger: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: Partial<OPT> = {}, build = true) {
    super(trigger, options, false); build === true && this.build();
  }

  /** Añade al elemento los eventos para abrir el dropdown y filtrar sus elementos */
  public build = () => {
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
  }
  /** Destruye las instancias y completa los eventos */
  public destroy(): Promise<void> {
    const parentDestroy = super.destroy;
    return new Promise(async resolve => {
      this.trigger.removeEventListener('dblclick', this.clearSelectionWithFocus);
      this.trigger.removeEventListener('keyup', this.searcher);
      clearTimeout(this.SEARCHTIMER);
      await parentDestroy.call(this);
      resolve();
    });
  }
  /** Limpia el valor seleccionado en el formulario y enfoca el formulario */
  public clearSelectionWithFocus = () => {
    const trigger = this.TRIGGER as HTMLInputElement | HTMLTextAreaElement;
    trigger.value = '';
    trigger.focus();
    this.ISOPEN === false && trigger.click();
  }
  /** Limpia el valor seleccionado en el formulario */
  public clearSelection = () => {
    const trigger = this.TRIGGER as HTMLInputElement | HTMLTextAreaElement;
    trigger.value = '';
    trigger.blur();
  }
  /**
   * Redirecciona el evento open de dropdown al evento searcher
   * @param event Información del evento
   */
  protected open = (event: MouseEvent) => { this.ISOPEN === false ? this.searcher(event) : (this.ISOPEN = false); };
  /**
   * Filtra los elementos del dropdown
   * @param event Información del evento
   */
  private searcher = (event: KeyboardEvent | MouseEvent) => {
    const parent = this.parent as HTMLElement;
    parent !== this.dropdownTemplate.target.parentElement && parent.appendChild(this.dropdownTemplate.target);
    if (event instanceof MouseEvent || (event instanceof KeyboardEvent && !['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key))) {
      this.ISOPEN = true;
      clearTimeout(this.SEARCHTIMER);
      this.SEARCHTIMER = window.setTimeout(() => {
        const value: string | number = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
        const searchValue: string = typeof value === 'string' ? this.normalizeText(value).replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ') : (`${value}`);
        if (this.OPTIONS.data?.length > 0 && (typeof value === 'string' ? value : `${value}`).length >= this.OPTIONS.minSearchKeys) {
          const filteredData = this.OPTIONS.data.filter(item => {
            const keywords = this.OPTIONS.keywords.map(key => item[key]);
            const searchList = this.normalizeText(keywords.join('')).replace(/\s+/g, '');
            if (this.OPTIONS.dataFields?.value !== undefined && this.OPTIONS.excludedElements.includes(item[this.OPTIONS.dataFields.value])) { return false; }
            return searchValue.split(' ').every(el => searchList.includes(el));
          });
          const rowList = filteredData.length > 0 ? this.setRowList(filteredData.slice(0, this.OPTIONS.itemLimit)) : [this.setNotFoundElement()];
          const expandButton = this.setExpandButton(filteredData, filteredData.length);
          const detailItem = this.setTagSection(value);
          this.dropdownTemplate.rows = [detailItem, ...rowList, ...expandButton];
        } else { this.dropdownTemplate.destroyChildren(); }
        this.updateSize(parent, this.trigger);
        document.removeEventListener('click', this.close);
        setTimeout(() => this.dropdownTemplate.rows.length > 0 && document.addEventListener('click', this.close), 0);
      }, this.OPTIONS.searchDelay);
    }
  }
  /**
   * Genera la estructura para el contenedor de las etiquetas
   * @param value Text ingresado
   * @returns Contexto de plantilla
   */
  private setTagSection(value: string | number): Partial<ContainerTemplateContext> {
    const tagSection: Partial<ContainerTemplateContext> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.tagSection || {}, ['node']);
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
   * Gnera la estructura para las etiquetas
   * @param value Valor de la etiqueta
   * @returns Contexto de plantilla
   */
  private setTagElement = (value: string): Partial<IntersectionTypeList['context']> => {
    const tagElement: Partial<IntersectionTypeList['context']> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.tagElement || {}, ['node']);
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
      const sectionElement = tagElement as ContainerTemplateContext;
      if (sectionElement.rows === undefined) {
        sectionElement.rows = [
          { type: 'element', text: '{{getParent()?.dropdown?.tag}}', classes: 'vertical-align-middle', tag: 'span' },
          { type: 'element', text: 'close', tag: 'i', classes: 'material-icons-round cursor-pointer vertical-align-middle', styles: { fontSize: '1.1em' }, addEvents: [['click', { name: 'removeTag' }]] },
        ];
      }
    }
    return tagElement;
  }
  /**
   * Genera la estructura para mostrar cuando la búsqueda arroja un resultado vacío
   * @returns Contexto de plantilla
   */
  private setNotFoundElement(): Partial<IntersectionTypeList['context']> {
    const notFoundItem: Partial<IntersectionTypeList['context']> = TemplateOperators.copyOf(this.OPTIONS.templateContext?.notFoundItem || {}, ['node']);
    notFoundItem.classes === undefined && (notFoundItem.classes = 'list-item');
    notFoundItem.attributes === undefined && (notFoundItem.attributes = {});
    notFoundItem.attributes.tabindex === undefined && (notFoundItem.attributes.tabindex = '0');
    notFoundItem.type === undefined && (notFoundItem.type = 'element');
    notFoundItem.tag === undefined && (notFoundItem.tag = 'li');
    notFoundItem.name = 'dropdown-area-not-found-element';
    if (notFoundItem.type === 'element') {
      const elementContext = notFoundItem as ElementTemplateContext;
      elementContext.text === undefined && (elementContext.text = 'No se encontraron coincidencias');
    }
    return notFoundItem;
  }
  /**
   * Elimina caracteres especiales del texto
   * @param value Texto a formatear
   * @returns Texto formateado
   */
  private normalizeText = (value: string): string => (value || '').toLowerCase().normalize('NFD').replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, '$1');
  /**
   * Elimina etiquetas de filtro del formulario
   * @param event Información del evento y la plantlla
   */
  private removeTag = (event: MouseEvent & TemplateEvent) => {
    const inputValue = event.templateEvent.target.propertyTree.getParent()?.getParent()?.dropdown?.inputValue || '';
    const tagValue = event.templateEvent.target.propertyTree.getParent()?.dropdown?.tag || '';
    const haveSpace = inputValue.match(` ${tagValue}`);
    const value = inputValue.replace(haveSpace !== null ? ` ${tagValue}` : tagValue, '');
    const trigger = this.TRIGGER as HTMLInputElement | HTMLTextAreaElement;
    trigger.value = value;
    trigger.focus();
    const customEvent: MouseEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
    Object.defineProperty(customEvent, 'target', { value: this.trigger, enumerable: true });
    this.searcher(customEvent);
  }

}
