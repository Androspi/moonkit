import { Subject, Subscription } from 'rxjs';

export interface CollapsableOptions {
  direction: 'vertical' | 'horizontal';
  allowClick: boolean;
  target: string;
}

export interface CollapsableSizeChanger {
  event: Subject<any>;
  delay: number;
}

export class Collapsable {

  /** Almacena la suscripción del evento MutationObserver del body */
  private bodyObserver: MutationObserver;
  /** Almacena la suscripción del evento sizeChanger */
  private sizeChangerTimeOut: number;
  private sizeChangerSubscription: Subscription;

  /** Elemento HTML del contenido plegable. */
  private CONTAINER: HTMLElement;
  /** @get Obtiene Elemento HTML del contenido plegable. */
  public get container(): HTMLElement { return this.CONTAINER; }
  /** @set Actualiza el elemento HTML del contenido plegable. */
  public set container(val: HTMLElement) {
    this.CONTAINER = val;
    if (this.ISACTIVE) {
      this.ISACTIVE = false;
      this.CONTAINER.classList.add('activated-collapsable-content');
      if (this.OPTIONS.direction === 'horizontal') {
        this.container.style.maxWidth = null;
      } else { this.container.style.maxHeight = null; }
      this.setDirection();
    }
  }

  /** @set Actualiza la dirección de pliegue del contenido. */
  public set direction(val: CollapsableOptions['direction']) {
    this.OPTIONS.direction = val;
    if (this.ISACTIVE && this.CONTAINER instanceof HTMLElement) {
      this.ISACTIVE = false;
      if (val === 'horizontal') {
        this.container.style.maxWidth = null;
      } else { this.container.style.maxHeight = null; }
      this.setDirection();
    }
  }

  /** @set Actualiza el elemento HTML del contenido plegable cuando este esté disponible en el DOM. */
  public set target(val: CollapsableOptions['target']) {
    this.bodyObserver !== undefined && this.bodyObserver.disconnect();
    this.OPTIONS.target = val;
    const element = document.querySelector(val);
    if (element instanceof HTMLElement) {
      this.container = element;
      this.container.setAttribute('collapsableof', this.COLLAPSABLEID);
    } else {
      this.bodyObserver = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.target instanceof Element) {
            const target = mutation.target.querySelector(val);
            if (target instanceof HTMLElement) {
              this.bodyObserver.disconnect();
              this.container = target;
              this.container.setAttribute('collapsableof', this.COLLAPSABLEID);
            }
          }
        }
      });
      this.bodyObserver.observe(document.body, { attributes: false, childList: true, subtree: true });
    }
  }

  /** Si es verdadero significa que el plegable está abierto */
  private ISACTIVE = false;
  /** @get Obtiene el estado del plegable */
  public get isActive(): boolean { return this.ISACTIVE; }

  /** @get Obtiene las opciones del plegable */
  public get options(): CollapsableOptions { return this.OPTIONS; }
  /** Opciones del plegable */
  private OPTIONS: CollapsableOptions = {
    direction: 'vertical',
    target: undefined,
    allowClick: true
  };
  /** Identificador del componente */
  private COLLAPSABLEID: string;

  /** Si es verdadero, entonces el plegable se abre o cierra con la acción click */
  private ALLOWCLICK: CollapsableOptions['allowClick'] = true;
  /** @set Actualiza el método click que abre o cierra el componente */
  public set allowClick(val: CollapsableOptions['allowClick']) {
    this.ALLOWCLICK = val;
    switch (this.ALLOWCLICK) {
      case false: this.trigger.removeEventListener('click', this.toggleContainer); break;
      case true: this.trigger.addEventListener('click', this.toggleContainer); break;
    }
  }

  constructor(public trigger: Element, options: Partial<CollapsableOptions> = {}, public sizeChanger?: CollapsableSizeChanger) {
    this.COLLAPSABLEID = Math.random().toString(16).substring(2);
    const target = options.target || this.trigger.getAttribute('collapsable-content-target');
    options.direction !== undefined && (this.OPTIONS.direction = options.direction);

    if (this.sizeChanger !== undefined && this.sizeChanger.event instanceof Subject) {
      this.sizeChangerSubscription = this.sizeChanger.event.subscribe(() => {
        /** Espera 5 segundos que dura la animación de la barra lateral */
        this.sizeChangerTimeOut = window.setTimeout(() => {
          if (this.CONTAINER instanceof Element) {
            if (this.ISACTIVE === true) {
              if (this.OPTIONS.direction === 'horizontal') {
                this.CONTAINER.style.maxWidth = null;
              } else { this.CONTAINER.style.maxHeight = null; }
              this.setDirection();
            }
          }
        }, this.sizeChanger.delay || 0);
      });
    }

    this.trigger.classList.contains('activated-collapsable') && (this.ISACTIVE = true);
    this.trigger.addEventListener('updateCollapsableContentSize', this.updateDirection);
    this.trigger.addEventListener('toggleCollapsable', this.toggleContainer);
    this.trigger.setAttribute('iscollapsable', this.COLLAPSABLEID);

    this.target = target;
    this.allowClick = 'allowClick' in options ? options.allowClick : this.OPTIONS.allowClick;
  }

  public toggleContainer = () => {
    if (!document.body.contains(this.CONTAINER)) { this.target = this.OPTIONS.target; }
    if (this.CONTAINER instanceof HTMLElement) {
      this.CONTAINER.classList.toggle('activated-collapsable-content');
      this.trigger.classList.toggle('activated-collapsable');
      this.setDirection();
    } else { this.target = this.OPTIONS.target; }
  }

  private setDirection() {
    switch (this.OPTIONS.direction) {
      case 'horizontal': this.setWidth(); break;
      default: this.setHeight(); break;
    }
  }

  /**
   * Actualiza el tamaño del contenedor del plegable
   * @param event Información del evento
   */
  private updateDirection = (event: Event | CustomEvent<{ size: number; }>) => {
    const adjust: number = 'detail' in event ? (event.detail.size || 0) : 0;
    switch (this.OPTIONS.direction) {
      case 'horizontal': this.CONTAINER.style.maxWidth ? this.calculateWidth(adjust) : ((this.CONTAINER.style.maxWidth as any) = null, (this.CONTAINER.style.minWidth as any) = null); break;
      default: this.CONTAINER.style.maxHeight ? this.calculateHeight(adjust) : ((this.CONTAINER.style.maxHeight as any) = null, (this.CONTAINER.style.minHeight as any) = null); break;
    }
  }

  private setHeight(adjust = 0) {
    this.ISACTIVE = !this.ISACTIVE;
    this.CONTAINER.setAttribute('collapsable-direction', 'vertical');
    if (this.CONTAINER.style.maxHeight) {
      this.CONTAINER.style.maxHeight = null;
      this.updateParent(this.CONTAINER, 0);
    } else { this.calculateHeight(adjust); }
  }

  private setWidth(adjust = 0) {
    this.ISACTIVE = !this.ISACTIVE;
    this.CONTAINER.setAttribute('collapsable-direction', 'horizontal');
    if (this.CONTAINER.style.maxWidth) {
      this.CONTAINER.style.maxWidth = null;
      this.CONTAINER.style.minWidth = null;
      this.updateParent(this.CONTAINER, 0);
    } else { this.calculateWidth(adjust); }
  }

  private calculateHeight(adjust = 0) {
    let maxHeight = this.CONTAINER.getAttribute('max-height');
    `${maxHeight}`.includes('%') && (maxHeight = `${this.CONTAINER.parentElement.offsetHeight * +(maxHeight.replace(/%/g, '')) / 100}`);
    this.CONTAINER.style.maxHeight = `${(![null, undefined].includes(maxHeight) ? +maxHeight : this.CONTAINER.scrollHeight) + adjust}px`;
    this.updateParent(this.CONTAINER, +this.CONTAINER.style.maxHeight.replace(/px|\%|rem|em|cm|pt|vh|vw|vmx|vmn/g, ''));
  }

  private calculateWidth(adjust = 0) {
    let maxWidth = this.CONTAINER.getAttribute('max-width');
    `${maxWidth}`.includes('%') && (maxWidth = `${this.CONTAINER.parentElement.offsetWidth * +(maxWidth.replace(/[^0-9.]/g, '')) / 100}`);
    this.CONTAINER.style.maxWidth = `${(![null, undefined].includes(maxWidth) ? +maxWidth : this.CONTAINER.scrollWidth) + adjust}px`;
    this.CONTAINER.style.minWidth = this.CONTAINER.style.maxWidth;
    this.updateParent(this.CONTAINER, +this.CONTAINER.style.maxWidth.replace(/px|\%|rem|em|cm|pt|vh|vw|vmx|vmn/g, ''));
  }

  public destroy() {
    this.sizeChangerSubscription !== undefined && this.sizeChangerSubscription.unsubscribe();
    this.bodyObserver !== undefined && this.bodyObserver.disconnect();
    this.trigger.removeEventListener('click', this.toggleContainer);
    window.clearTimeout(this.sizeChangerTimeOut);
  }

  /**
   * Revisa si el plegable hace parte de otro plegable y actualiza su contenido
   * @param element Elemento a verificar
   * @param size Tamaño a aumentar
   */
  private updateParent(element: HTMLElement, size: number) {
    if (element instanceof HTMLElement && element.parentElement instanceof HTMLElement) {
      const collapsableId = element.parentElement.getAttribute('collapsableof');
      if (collapsableId !== null) {
        const trigger: Element | null = document.querySelector(`[iscollapsable="${collapsableId}"]`);
        trigger instanceof Element && trigger.dispatchEvent(new CustomEvent('updateCollapsableContentSize', { detail: { size } }));
      } else { this.updateParent(element.parentElement, size); }
    }
  }

}
