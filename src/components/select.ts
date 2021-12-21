import { ContainerTemplate, ContainerTemplateContext, ElementTemplate, ElementTemplateContext, IntersectionTypeList, TemplateOperators } from 'htmon';
import { Subject } from 'rxjs';

import { Autocomplete, AutocompleteOptions } from './autocomplete';
import { ListOptions, ListItemSelectedEvent, List } from './list';

export interface SelectArea {
  title: Partial<Omit<IntersectionTypeList['context'], 'rows' | 'type' | 'tag' | 'name'>>;
  select: Partial<Omit<ContainerTemplateContext, 'rows' | 'type' | 'tag' | 'name'>>;
  list: Partial<Omit<ElementTemplateContext, 'rows' | 'type' | 'tag' | 'name'>>;
  icon: Partial<Omit<ElementTemplateContext, 'rows' | 'type' | 'tag' | 'name'>>;
}

export interface SelectOptions {
  listOptions: Partial<AutocompleteOptions | ListOptions>;
  templateContext: Partial<SelectArea>;
  defaultValue: string | number;
  componentAttribute?: Attr;
  useAutocomplete: boolean;
  placeholder: string;
  name: string;
}

export class Select {

  // PROTECTED
  protected SELECTEVENTS = { itemSelected: new Subject<ListItemSelectedEvent>() };
  protected OPTIONS: Partial<SelectOptions>;
  protected TRIGGER: HTMLSelectElement;
  protected INSTANCEID: string;
  // GETTERS
  public get trigger(): Select['TRIGGER'] { return this.TRIGGER; }
  public get events() { return this.SELECTEVENTS; }
  // GETTERS AND SETTERS
  public get options(): Select['OPTIONS'] { return this.OPTIONS; }
  public set options(val: Select['OPTIONS']) {
    Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[key] = val[key]));
  }
  // SETTERS
  /** Actualiza el título del select */
  public set name(val: SelectOptions['name']) {
    this.OPTIONS.name = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const titleTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-title' });
      if (titleTemplate === undefined) {
        const titleContext: Partial<ElementTemplateContext> = this.options.templateContext.title || {};
        titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
        titleContext.name = 'select-area-title';
        titleContext.type = 'element';
        titleContext.text = val;
        this.selectTemplate.push(titleContext, false, 1);
      } else { titleTemplate.text = val; }
    }
  }
  /* Actualiza el placeholder del input del select */
  public set placeholder(val: SelectOptions['placeholder']) {
    this.OPTIONS.placeholder = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const inputTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
      inputTemplate.attributes = { placeholder: val };
    }
  }
  /** Selecciona un valor por defecto en el input del select */
  public set defaultValue(val: SelectOptions['defaultValue']) {
    this.OPTIONS.defaultValue = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const behaviorTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
      if (behaviorTemplate instanceof ElementTemplate && behaviorTemplate.isDestroyed === false) {
        const selected = this.OPTIONS.useAutocomplete === true ? 'autocomplete' : 'list';
        const behaviorInstance: List = behaviorTemplate.behaviorInstances[selected][`${selected}Instance`];
        behaviorInstance.selectInstance(val);
      }
    }
  }
  /** Cambia el comportamiento del input del select */
  public set useAutocomplete(val: SelectOptions['useAutocomplete']) {
    this.OPTIONS.useAutocomplete = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      (async () => {
        const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
        const inputTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
        const behaviorOptions = TemplateOperators.copyOf(inputTemplate.behaviorInstances[selected].options);
        await inputTemplate.behaviorInstances[selected].destroy();
        inputTemplate.loadTemplate({ behavior: { [val === true ? 'autocomplete' : 'list']: behaviorOptions } });
      })();
    }
  }
  /** Actualiza el contexto de los componentes de la plantilla del select */
  public set templateContext(val: SelectOptions['templateContext']) {
    Object.keys(val).map(key => key.toLowerCase()).forEach(key => key in this && (this[`${key}Area`] = val[key]));
  }
  /** Actualiza el contexto de la plantilla del select */
  public set selectArea(val: SelectOptions['templateContext']['select']) {
    this.OPTIONS.templateContext.select = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      this.selectTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
    }
  }
  /** Actualiza el contexto de la plantilla del título */
  public set titleArea(val: SelectOptions['templateContext']['title']) {
    this.OPTIONS.templateContext.title = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const titleTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-title' });
      if (titleTemplate === undefined) {
        const titleContext: Partial<ElementTemplateContext> = val || {};
        titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
        titleContext.name = 'select-area-title';
        titleContext.text = this.OPTIONS.name;
        titleContext.type = 'element';
        this.selectTemplate.push(titleContext, false, 1);
      } else { titleTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']); }
    }
  }
  /** Actualiza el contexto de la plantilla del input */
  public set listArea(val: SelectOptions['templateContext']['list']) {
    this.OPTIONS.templateContext.list = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const listTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
      listTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
    }
  }
  /** Actualiza el contexto de la plantilla del ícono */
  public set iconArea(val: SelectOptions['templateContext']['icon']) {
    this.OPTIONS.templateContext.list = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const iconTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-icon' });
      iconTemplate.loadTemplate(val, ['rows', 'type', 'tag', 'name']);
    }
  }
  /** Actualiza las opciones del comportamiento del input */
  public set listOptions(val: SelectOptions['listOptions']) {
    this.OPTIONS.listOptions = val;
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false) {
      const listTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
      const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
      (listTemplate.behaviorInstances[selected].options as Partial<AutocompleteOptions | ListOptions>) = val;
    }
  }
  /** Actualiza la data del listado */
  public set listData(val: SelectOptions['listOptions']['data']) {
    if (this.selectTemplate instanceof ContainerTemplate && this.selectTemplate.isDestroyed === false && val !== undefined) {
      const listTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
      const selected = this.options.useAutocomplete === true ? 'autocomplete' : 'list';
      const behaviorInstance = listTemplate.behaviorInstances[selected][`${selected}Instance`] as List | Autocomplete;
      behaviorInstance.data = val;
      val.length > 0 && this.OPTIONS.defaultValue !== undefined && behaviorInstance.selectInstance(this.OPTIONS.defaultValue);
    }
  }
  // PUBLIC
  public selectTemplate: ContainerTemplate;

  private TRIGGERTEMPLATE: ContainerTemplate;

  constructor(trigger: Select['TRIGGER'], options: Partial<SelectOptions> = {}) {
    this.INSTANCEID = `${Math.random().toString(16).substring(2)}`;
    this.TRIGGER = trigger;
    this.OPTIONS = options;
    this.build();
  }

  /** Genera la estructura visual del select */
  public build() {
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
      const BORef = behaviorOptions as Partial<AutocompleteOptions>;
      BORef.keywords === undefined && (BORef.keywords = Object.values(this.OPTIONS.listOptions?.dataFields || {}));
      BORef.itemLimit === undefined && (BORef.itemLimit = 10);
    }
    // Genera la estructura del input que activará el dropdown
    const valueContext: Partial<ElementTemplateContext> = this.OPTIONS.templateContext.list || {};
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
    } else { valueContext.behavior.autocomplete = behaviorOptions; }
    // Genera la estructura del ícono
    const iconContext: Partial<ElementTemplateContext> = this.OPTIONS.templateContext.icon || {};
    iconContext.classes === undefined && (iconContext.classes = 'material-icons-round select-icon-section');
    iconContext.text === undefined && (iconContext.text = 'expand_more');
    iconContext.name = 'select-area-icon';
    iconContext.type = 'element';
    // Estructura ícono + título
    const rowContext: Partial<ElementTemplateContext>[] = [iconContext];
    if (this.OPTIONS.name !== undefined) {
      // Genera la estructura del título
      const titleContext: Partial<ElementTemplateContext> = this.OPTIONS.templateContext.title || {};
      titleContext.classes === undefined && (titleContext.classes = 'select-title-section');
      titleContext.name = 'select-area-title';
      titleContext.text = this.OPTIONS.name;
      titleContext.type = 'element';
      rowContext.push(titleContext);
    }
    // Genera la estructura del select
    const containerContext: Partial<ContainerTemplateContext> = this.OPTIONS.templateContext.select || {};
    containerContext.attributes === undefined && (containerContext.attributes = {});
    containerContext.attributes.tabindex === undefined && (containerContext.attributes.tabindex = '0');
    containerContext.classes === undefined && (containerContext.classes = 'primary-select');
    containerContext.name = `select-area-${this.INSTANCEID}`;
    containerContext.rows = [...rowContext, valueContext];
    containerContext.type = 'container';
    containerContext.tag = 'label';
    this.selectTemplate = TemplateOperators.createTemplate(undefined, containerContext, {}, this.OPTIONS.componentAttribute);
    this.trigger.after(this.selectTemplate.target);
    const behaviorTemplate = TemplateOperators.templateSelector<ElementTemplate>(this.selectTemplate.childrenTree, { name: 'select-area-dropdown' });
    if (behaviorTemplate instanceof ElementTemplate) {
      const selected = this.OPTIONS.useAutocomplete === true ? 'autocomplete' : 'list';
      const behaviorInstance: List = behaviorTemplate.behaviorInstances[selected][`${selected}Instance`];
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
  public destroy(): Promise<void> {
    return new Promise(async resolve => {
      this.selectTemplate instanceof ContainerTemplate && await this.selectTemplate.destroy();
      Object.keys(this.events).map(event => this.events[event].complete());
      this.trigger.style.display = 'block';
      resolve();
    });
  }

}

