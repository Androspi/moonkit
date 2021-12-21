import { ContainerTemplate, ContainerTemplateContext, ElementTemplateContext, IntersectionTypeList } from 'htmon';
import { Subject } from 'rxjs';
import { AutocompleteOptions } from './autocomplete';
import { ListOptions, ListItemSelectedEvent } from './list';
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
export declare class Select {
    protected SELECTEVENTS: {
        itemSelected: Subject<ListItemSelectedEvent>;
    };
    protected OPTIONS: Partial<SelectOptions>;
    protected TRIGGER: HTMLSelectElement;
    protected INSTANCEID: string;
    get trigger(): Select['TRIGGER'];
    get events(): {
        itemSelected: Subject<ListItemSelectedEvent>;
    };
    get options(): Select['OPTIONS'];
    set options(val: Select['OPTIONS']);
    /** Actualiza el título del select */
    set name(val: SelectOptions['name']);
    set placeholder(val: SelectOptions['placeholder']);
    /** Selecciona un valor por defecto en el input del select */
    set defaultValue(val: SelectOptions['defaultValue']);
    /** Cambia el comportamiento del input del select */
    set useAutocomplete(val: SelectOptions['useAutocomplete']);
    /** Actualiza el contexto de los componentes de la plantilla del select */
    set templateContext(val: SelectOptions['templateContext']);
    /** Actualiza el contexto de la plantilla del select */
    set selectArea(val: SelectOptions['templateContext']['select']);
    /** Actualiza el contexto de la plantilla del título */
    set titleArea(val: SelectOptions['templateContext']['title']);
    /** Actualiza el contexto de la plantilla del input */
    set listArea(val: SelectOptions['templateContext']['list']);
    /** Actualiza el contexto de la plantilla del ícono */
    set iconArea(val: SelectOptions['templateContext']['icon']);
    /** Actualiza las opciones del comportamiento del input */
    set listOptions(val: SelectOptions['listOptions']);
    /** Actualiza la data del listado */
    set listData(val: SelectOptions['listOptions']['data']);
    selectTemplate: ContainerTemplate;
    private TRIGGERTEMPLATE;
    constructor(trigger: Select['TRIGGER'], options?: Partial<SelectOptions>);
    /** Genera la estructura visual del select */
    build(): void;
    /** Dstruye las instancias */
    destroy(): Promise<void>;
}
