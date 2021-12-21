import { ContainerTemplateContext, IntersectionTypeList, TemplateEvent } from 'htmon-test';
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
    dataContext: {
        data: ListOptions['data'];
        index: number;
        item: ListOptions['data'][number];
    };
    value: ListOptions['defaultValue'];
}
export interface ListEvents {
    itemSelected: Subject<ListItemSelectedEvent>;
}
export declare class List<OPT extends ListOptions = ListOptions> extends Dropdown<OPT> {
    /** Eventos del componente */
    protected LISTEVENTS: ListEvents;
    /** @get Obtiene los eventos del componente */
    get events(): {
        itemSelected: Subject<ListItemSelectedEvent>;
    };
    /** @set Actualiza el listado y reinicia la visualización del componente */
    set data(val: ListOptions['data']);
    /** @set Actualiza las propiedades del listado y reinicia la visualización del componente */
    set dataFields(val: OPT['dataFields']);
    /** @set Actualiza el valor seleccionado del componente */
    set defaultValue(val: OPT['defaultValue']);
    /** @set Actualiza el límite de elementos mostrados a la vez y reinicia la visualización del componente */
    set itemLimit(val: OPT['itemLimit']);
    /** @set Actualiza el contexto de la plantilla de los elementos */
    set itemArea(val: OPT['templateContext']['item']);
    constructor(trigger: Element, options?: Partial<OPT>, build?: boolean);
    /** Añade al elemento los eventos para abrir el dropdown */
    build(): void;
    /**
     * Selecciona un valor por defecto
     * @param value Valor a seleccionar
     */
    selectInstance: (value: OPT['defaultValue']) => void;
    /**
     * Aumenta la cantidad de items mostrados
     * @param event Información del evento
     */
    expandEvent: (event: MouseEvent & TemplateEvent) => void;
    /**
     * De acuerdo a la tecla presionada enfocará otro elemento o aplicará el evento de selección
     * @param event Información del evento
     */
    navigateList: (event: KeyboardEvent & TemplateEvent) => void;
    /** Elimina las instancias y eventos creados */
    destroy(): Promise<void>;
    /** Genera el contenido del dropdown */
    protected setDropdownContent(): void;
    /**
     * Genera la estructura de los elementos de la lista
     * @param data Listado
     * @returns Estructura de plantilla por elemento
     */
    protected setRowList(data: OPT['data']): Partial<IntersectionTypeList['context']>[];
    /**
     * Genera la estructura de los items de la lista
     * @param item Opción
     * @param index Índice
     * @returns Contexto de plantilla
     */
    protected setData: (item: OPT['data'][number], index: number) => Partial<IntersectionTypeList['context']>;
    /**
     * Genera la estructura del botón que aumenta la cantidad de elementos mostrados
     * @param data Listado de opciones
     * @returns Listado de Contexto de plantilla
     */
    protected setExpandButton(data: Partial<ContainerTemplateContext>[], length: number): Partial<ContainerTemplateContext>[];
    /**
     * Genera la estructura para el título de los grupos
     * @returns Contexto de plantilla
     */
    protected setGroupHeader(): Partial<IntersectionTypeList['context']>;
    /**
     * Genera la estructura para el pié de los grupos
     * @returns Contexto de plantilla o undefined
     */
    protected setGroupFooter(): Partial<IntersectionTypeList['context']> | undefined;
    /**
     * Enfoca el siguiente elemento en la lista
     * @param event Información del event
     */
    protected focusItem: (event: KeyboardEvent) => void;
    /**
     * Obtiene el valor de un elemento y lo asigna al formulario
     * @param event Información del event
     */
    protected selectItem: (event: (KeyboardEvent | MouseEvent) & TemplateEvent) => void;
    /**
     * Ajusta el tamaño del contenedor
     * @param parentRef Referencia del conetenedor
     * @param triggerRef Referencia del boton que activa el dropdown
     */
    protected updateSize(parentRef: Element, triggerRef: Element): void;
    /** Impide el cierre del dropdown cuándo se presiona un elemento no seleccionable */
    private preventWindowClick;
    /**
     * Genera el contexto para la plantilla de los elementos de la lista
     * @returns Contexto de elemento
     */
    private getItemContext;
}
