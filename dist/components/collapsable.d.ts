import { Subject } from 'rxjs';
export interface CollapsableOptions {
    direction: 'vertical' | 'horizontal';
    allowClick: boolean;
    target: string;
}
export interface CollapsableSizeChanger {
    event: Subject<any>;
    delay: number;
}
export declare class Collapsable {
    trigger: Element;
    sizeChanger?: CollapsableSizeChanger;
    /** Almacena la suscripción del evento MutationObserver del body */
    private bodyObserver;
    /** Almacena la suscripción del evento sizeChanger */
    private sizeChangerTimeOut;
    private sizeChangerSubscription;
    /** Elemento HTML del contenido plegable. */
    private CONTAINER;
    /** @get Obtiene Elemento HTML del contenido plegable. */
    get container(): HTMLElement;
    /** @set Actualiza el elemento HTML del contenido plegable. */
    set container(val: HTMLElement);
    /** @set Actualiza la dirección de pliegue del contenido. */
    set direction(val: CollapsableOptions['direction']);
    /** @set Actualiza el elemento HTML del contenido plegable cuando este esté disponible en el DOM. */
    set target(val: CollapsableOptions['target']);
    /** Si es verdadero significa que el plegable está abierto */
    private ISACTIVE;
    /** @get Obtiene el estado del plegable */
    get isActive(): boolean;
    /** @get Obtiene las opciones del plegable */
    get options(): CollapsableOptions;
    /** Opciones del plegable */
    private OPTIONS;
    /** Identificador del componente */
    private COLLAPSABLEID;
    /** Si es verdadero, entonces el plegable se abre o cierra con la acción click */
    private ALLOWCLICK;
    /** @set Actualiza el método click que abre o cierra el componente */
    set allowClick(val: CollapsableOptions['allowClick']);
    constructor(trigger: Element, options?: Partial<CollapsableOptions>, sizeChanger?: CollapsableSizeChanger);
    toggleContainer: () => void;
    private setDirection;
    /**
     * Actualiza el tamaño del contenedor del plegable
     * @param event Información del evento
     */
    private updateDirection;
    private setHeight;
    private setWidth;
    private calculateHeight;
    private calculateWidth;
    destroy(): void;
    /**
     * Revisa si el plegable hace parte de otro plegable y actualiza su contenido
     * @param element Elemento a verificar
     * @param size Tamaño a aumentar
     */
    private updateParent;
}
