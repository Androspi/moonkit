import { ContainerTemplate, ContainerTemplateContext, IntersectionTypeList, SomeContainerTemplateTypeList, Template, TemplateEvent, TemplateOperators, TemplateProperties } from 'htmon-test';

export interface ModalClickEvent {
  event: MouseEvent;
  template: Modal;
  params: any;
}

export interface ModalOptions {
  parent: string | Element | SomeContainerTemplateTypeList['template'];
  methods: TemplateProperties['methods'];
  event: ModalClickEvent['params'];
  componentAttribute: Attr;
}

export interface ModalProperties {
  clickEvent: string | ((event: CustomEvent<ModalClickEvent>) => void);
  headerContext: string | Partial<IntersectionTypeList['context']>[];
  bodyContext: string | Partial<IntersectionTypeList['context']>[];
  modalContext: string | Partial<ContainerTemplateContext>;
}

export class Modal {

  private readonly defaultModalContext: Partial<ContainerTemplateContext> = {
    classes: 'modal-surface modal-surface-active animated-modal-content',
    type: 'container',
    rows: [{
      classes: 'modal-content animated-modal-content',
      type: 'container',
      rows: [{
        classes: 'primary-modal',
        type: 'container',
        rows: [{
          classes: 'modal-header-style',
          type: 'container',
          rows: [{
            classes: 'material-icons modal-close-icon-style',
            addEvents: [['click', { name: 'closeModal' }]],
            attributes: { tabindex: '0' },
            name: 'modal-close',
            type: 'element',
            text: 'close',
          }, {
            name: 'modal-header',
            type: 'container',
          }]
        }, {
          classes: 'modal-body-style',
          name: 'modal-body',
          type: 'container',
        }]
      }]
    }]
  };

  public modalContext: ModalProperties['modalContext'] = this.defaultModalContext;
  public headerContext: ModalProperties['headerContext'];
  public bodyContext: ModalProperties['bodyContext'];

  private copy: { header: string, body: string } = { header: undefined, body: undefined };
  public template: ContainerTemplate;

  constructor(public trigger: HTMLElement, public options: Partial<ModalOptions>, public clickEvent?: (event: CustomEvent<ModalClickEvent>) => void) {
    trigger.addEventListener('click', this.click);
  }

  private click = (event: MouseEvent) => {
    typeof this.clickEvent === 'function' && this.clickEvent(new CustomEvent('customClick', { detail: { event, params: this.options.event, template: this } }));
    this.open();
  }

  public open() {
    if (this.modalContext !== undefined) {
      const parent = typeof this.options.parent === 'string' ? document.querySelector(this.options.parent) : this.options.parent;
      const modalMethods: TemplateProperties['methods'] = { closeModal: this.close };
      const modalContext: Partial<ContainerTemplateContext> = typeof this.modalContext === 'string' ? { node: { element: document.querySelector(this.modalContext) }, type: 'container', addClasses: 'modal-surface-active' } : this.modalContext;
      const componentAttribute: Attr = typeof this.modalContext === 'string' ? undefined : this.options.componentAttribute;
      this.template = TemplateOperators.createTemplate(parent, modalContext, { ...modalMethods, ...(this.options.methods || {}) }, componentAttribute);
      const headerTemplate = TemplateOperators.templateSelector<ContainerTemplate>(this.template.childrenTree, { name: 'modal-header' });
      const bodyTemplate = TemplateOperators.templateSelector<ContainerTemplate>(this.template.childrenTree, { name: 'modal-body' });
      const closeTemplates = TemplateOperators.templateSelectorAll(this.template.childrenTree, { name: 'modal-close' });
      const modalContent = this.template.children[0];
      if (modalContent instanceof Template && modalContent.target.classList.contains('modal-content')) {
        this.template.addEvents([['keyup', { name: 'closeModal' }]]);
        modalContent.addEvents([['click', { name: 'closeModal' }]]);
      } else { this.template.addEvents([['click', { name: 'closeModal' }], ['keyup', { name: 'closeModal' }]]); }
      this.template.loadTemplate({ attributes: { tabindex: '0' } });
      this.template.target instanceof HTMLElement && this.template.target.focus();
      closeTemplates.forEach(button => button.addEvents([['click', { name: 'closeModal' }]]));
      [
        [headerTemplate, this.headerContext as Partial<IntersectionTypeList['context']>[], 'header'],
        [bodyTemplate, this.bodyContext as Partial<IntersectionTypeList['context']>[], 'body']
      ].forEach(([template, context, copy]: [ContainerTemplate, Partial<IntersectionTypeList['context']>[], string], index: number) => {
        if (context !== undefined && template instanceof ContainerTemplate) {
          this.copy[copy] = template.target.innerHTML;
          template.target.innerHTML = '';
          switch (typeof context) {
            case 'object': context !== null && (context instanceof Template ? template.push(context, true, index) : template.loadTemplate({ rows: context })); break;
            case 'string': template.target.innerHTML = context; break;
          }
        }
      });
    }
  }

  public close = (event?: (MouseEvent | KeyboardEvent) & TemplateEvent) => new Promise<void>(async resolve => {
    if (
      (event instanceof MouseEvent && event.target === event.templateEvent.target.target) ||
      (event instanceof KeyboardEvent && event.key === 'Escape') || event === undefined
    ) {
      const headerTemplate = TemplateOperators.templateSelector<ContainerTemplate>(this.template.childrenTree, { name: 'modal-header' });
      const bodyTemplate = TemplateOperators.templateSelector<ContainerTemplate>(this.template.childrenTree, { name: 'modal-body' });
      if (typeof this.modalContext === 'string') {
        const modalElement: HTMLElement = document.querySelector(this.modalContext);
        modalElement instanceof HTMLElement && modalElement.classList.remove('modal-surface-active');
        [[headerTemplate, this.headerContext, 'header'], [bodyTemplate, this.bodyContext, 'body']].forEach(
          ([template, context, copy]: [ContainerTemplate, Partial<IntersectionTypeList['context']>[], string]) => {
            context !== undefined && template instanceof ContainerTemplate && (template.target.innerHTML = this.copy[copy]);
          }
        );
      }
      this.template instanceof Template && (event === undefined ? await this.template.destroy() : this.template.destroy());
    }
    resolve();
  })

  public destroy() {
    this.trigger instanceof HTMLElement && this.trigger.removeEventListener('click', this.click);
    this.template instanceof ContainerTemplate && this.template.destroy();
  }

}
