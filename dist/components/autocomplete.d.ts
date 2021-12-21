import { ContainerTemplateContext, IntersectionTypeList } from 'htmon-test';
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
export declare class Autocomplete<OPT extends AutocompleteOptions = AutocompleteOptions> extends List<OPT> {
    /** Almacena la instancia del timer de búsqueda */
    private SEARCHTIMER;
    set minSearchKeys(val: OPT['minSearchKeys']);
    set searchDelay(val: OPT['searchDelay']);
    set keywords(val: OPT['keywords']);
    set excludedElements(val: OPT['excludedElements']);
    constructor(trigger: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options?: Partial<OPT>, build?: boolean);
    /** Añade al elemento los eventos para abrir el dropdown y filtrar sus elementos */
    build: () => void;
    /** Destruye las instancias y completa los eventos */
    destroy(): Promise<void>;
    /** Limpia el valor seleccionado en el formulario y enfoca el formulario */
    clearSelectionWithFocus: () => void;
    /** Limpia el valor seleccionado en el formulario */
    clearSelection: () => void;
    /**
     * Redirecciona el evento open de dropdown al evento searcher
     * @param event Información del evento
     */
    protected open: (event: MouseEvent) => void;
    /**
     * Filtra los elementos del dropdown
     * @param event Información del evento
     */
    private searcher;
    /**
     * Genera la estructura para el contenedor de las etiquetas
     * @param value Text ingresado
     * @returns Contexto de plantilla
     */
    private setTagSection;
    /**
     * Gnera la estructura para las etiquetas
     * @param value Valor de la etiqueta
     * @returns Contexto de plantilla
     */
    private setTagElement;
    /**
     * Genera la estructura para mostrar cuando la búsqueda arroja un resultado vacío
     * @returns Contexto de plantilla
     */
    private setNotFoundElement;
    /**
     * Elimina caracteres especiales del texto
     * @param value Texto a formatear
     * @returns Texto formateado
     */
    private normalizeText;
    /**
     * Elimina etiquetas de filtro del formulario
     * @param event Información del evento y la plantlla
     */
    private removeTag;
}
