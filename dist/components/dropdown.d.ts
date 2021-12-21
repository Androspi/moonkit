import { TemplateFamily, ContainerTemplate, ContainerTemplateContext, TemplateProperties, IntersectionTypeList } from 'htmon-test';
export interface DropdownArea {
    dropdown: Partial<Omit<ContainerTemplateContext, 'rows' | 'type' | 'name'>>;
    content: Partial<IntersectionTypeList['context']>[];
}
export interface DropdownOptions {
    parent: string | TemplateFamily['parent'];
    methods: TemplateProperties['methods'];
    templateContext: Partial<DropdownArea>;
    componentAttribute?: Attr;
}
export declare type DropdownEvents = {};
export declare class Dropdown<OPT extends DropdownOptions = DropdownOptions> {
    /** Es verdadero cuando el desplegable está abierto */
    protected ISOPEN: boolean;
    /** Almacena el padre label del ejecutor */
    protected TRIGGERPARENT: ContainerTemplate;
    /** Eventos del componente */
    protected DROPDOWNEVENTS: DropdownEvents;
    /** Opciones del componente */
    protected OPTIONS: Partial<OPT>;
    /** Identificador del componente */
    protected INSTANCEID: string;
    /** Elemento ejecutor */
    protected TRIGGER: Element;
    /** @get Obtiene el elemento ejecutor */
    get trigger(): Dropdown['TRIGGER'];
    /** @get Obtiene los eventos del componente */
    get events(): DropdownEvents;
    /** @set Obtiene las opciones del componente */
    get options(): Partial<OPT>;
    /** @get Actualiza las opciones del componente */
    set options(val: Partial<OPT>);
    /** @set Actualiza el contenedor del componente */
    protected set parent(val: OPT['parent']);
    /** @get Obtiene el contenedo del componente */
    protected get parent(): OPT['parent'];
    /** @set Actualiza las opciones de las areas del componente */
    protected set templateContext(val: OPT['templateContext']);
    /** @set Actualiza el contexto de la plantilla del contenido del dropdown */
    set contentArea(val: OPT['templateContext']['content']);
    /** @set Actualiza el contexto de la plantilla del dropdown */
    set dropdownArea(val: Omit<OPT['templateContext']['dropdown'], 'tag'>);
    /** Plantilla del contenido deplegable */
    dropdownTemplate: ContainerTemplate;
    /** Es verdadero cuando el componente está siendo actualizado */
    private ISRESTARTING;
    constructor(trigger: Dropdown['TRIGGER'], options?: Partial<OPT>, build?: boolean);
    /** Añade al elemento ejecutor los eventos para abrir el dropdown */
    build(): void;
    /** Elimina las instancias y eventos creados */
    destroy(): Promise<void>;
    /** Genera el contenido del dropdown y ajusta el tamaño del contenedor */
    protected open: (event: MouseEvent) => void;
    /** Genera el contenido del dropdown */
    protected setDropdownContent(): void;
    /** Ajusta el tamaño del contenedor */
    protected updateSize(elementRef: Element, triggerRef: Element): void;
    /**
     *  Elimina eventos de la ventana y cierra el dropdown
     * @param event Información del evento
     */
    protected close: (event: PointerEvent) => void;
    /** Elimina los componentes de la plantilla y reconstruye el dropdown */
    protected restart(): void;
}
