var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContainerTemplate, Template, TemplateOperators } from 'htmon-test';
export class Modal {
    constructor(trigger, options, clickEvent) {
        this.trigger = trigger;
        this.options = options;
        this.clickEvent = clickEvent;
        this.defaultModalContext = {
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
        this.modalContext = this.defaultModalContext;
        this.copy = { header: undefined, body: undefined };
        this.click = (event) => {
            typeof this.clickEvent === 'function' && this.clickEvent(new CustomEvent('customClick', { detail: { event, params: this.options.event, template: this } }));
            this.open();
        };
        this.close = (event) => new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if ((event instanceof MouseEvent && event.target === event.templateEvent.target.target) ||
                (event instanceof KeyboardEvent && event.key === 'Escape') || event === undefined) {
                const headerTemplate = TemplateOperators.templateSelector(this.template.childrenTree, { name: 'modal-header' });
                const bodyTemplate = TemplateOperators.templateSelector(this.template.childrenTree, { name: 'modal-body' });
                if (typeof this.modalContext === 'string') {
                    const modalElement = document.querySelector(this.modalContext);
                    modalElement instanceof HTMLElement && modalElement.classList.remove('modal-surface-active');
                    [[headerTemplate, this.headerContext, 'header'], [bodyTemplate, this.bodyContext, 'body']].forEach(([template, context, copy]) => {
                        context !== undefined && template instanceof ContainerTemplate && (template.target.innerHTML = this.copy[copy]);
                    });
                }
                this.template instanceof Template && (event === undefined ? yield this.template.destroy() : this.template.destroy());
            }
            resolve();
        }));
        trigger.addEventListener('click', this.click);
    }
    open() {
        if (this.modalContext !== undefined) {
            const parent = typeof this.options.parent === 'string' ? document.querySelector(this.options.parent) : this.options.parent;
            const modalMethods = { closeModal: this.close };
            const modalContext = typeof this.modalContext === 'string' ? { node: { element: document.querySelector(this.modalContext) }, type: 'container', addClasses: 'modal-surface-active' } : this.modalContext;
            const componentAttribute = typeof this.modalContext === 'string' ? undefined : this.options.componentAttribute;
            this.template = TemplateOperators.createTemplate(parent, modalContext, Object.assign(Object.assign({}, modalMethods), (this.options.methods || {})), componentAttribute);
            const headerTemplate = TemplateOperators.templateSelector(this.template.childrenTree, { name: 'modal-header' });
            const bodyTemplate = TemplateOperators.templateSelector(this.template.childrenTree, { name: 'modal-body' });
            const closeTemplates = TemplateOperators.templateSelectorAll(this.template.childrenTree, { name: 'modal-close' });
            const modalContent = this.template.children[0];
            if (modalContent instanceof Template && modalContent.target.classList.contains('modal-content')) {
                this.template.addEvents([['keyup', { name: 'closeModal' }]]);
                modalContent.addEvents([['click', { name: 'closeModal' }]]);
            }
            else {
                this.template.addEvents([['click', { name: 'closeModal' }], ['keyup', { name: 'closeModal' }]]);
            }
            this.template.loadTemplate({ attributes: { tabindex: '0' } });
            this.template.target instanceof HTMLElement && this.template.target.focus();
            closeTemplates.forEach(button => button.addEvents([['click', { name: 'closeModal' }]]));
            [
                [headerTemplate, this.headerContext, 'header'],
                [bodyTemplate, this.bodyContext, 'body']
            ].forEach(([template, context, copy], index) => {
                if (context !== undefined && template instanceof ContainerTemplate) {
                    this.copy[copy] = template.target.innerHTML;
                    template.target.innerHTML = '';
                    switch (typeof context) {
                        case 'object':
                            context !== null && (context instanceof Template ? template.push(context, true, index) : template.loadTemplate({ rows: context }));
                            break;
                        case 'string':
                            template.target.innerHTML = context;
                            break;
                    }
                }
            });
        }
    }
    destroy() {
        this.trigger instanceof HTMLElement && this.trigger.removeEventListener('click', this.click);
        this.template instanceof ContainerTemplate && this.template.destroy();
    }
}
