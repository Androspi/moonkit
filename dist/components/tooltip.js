import { ContainerTemplate, TemplateOperators } from 'htmon';
import { Subscription } from 'rxjs';
export class Tooltip {
    constructor(trigger, componentAttribute, options = {}) {
        this.trigger = trigger;
        this.componentAttribute = componentAttribute;
        this.options = options;
        this.showTooltip = () => {
            const text = this.options.text || this.trigger.getAttribute('tooltip-text');
            if (text || ![null, undefined].includes(this.options.context)) {
                this.status = true;
                const tooltipDirection = this.options.direction || this.trigger.getAttribute('tooltip-direction');
                const elementRefAttr = this.options.parent || this.trigger.getAttribute('tooltip-element-ref');
                let elementRef = elementRefAttr ? document.querySelector(`#${elementRefAttr}, .${elementRefAttr}`) : undefined;
                elementRef = elementRef || document.body;
                // Scroll original antes de insertar el tooltip
                const [scrollTop, scrollLeft] = [elementRef.scrollTop, elementRef.scrollLeft];
                const elementRefClientRect = elementRef.getBoundingClientRect();
                const triggerClientRect = this.trigger.getBoundingClientRect();
                const remElement = document.querySelector('#style-element');
                const remValue = remElement instanceof HTMLStyleElement ? +remElement.getAttribute('font') || 15 : 15;
                const tooltipSpace = 0.75;
                const tooltipContext = this.options.context || { rows: [{ type: 'element', text }], classes: 'primary-tooltip' };
                tooltipContext.type = 'container';
                this.tooltipContainer = TemplateOperators.createTemplate(elementRef, tooltipContext, {}, this.componentAttribute);
                this.tooltipContainer.styles = { maxWidth: `${((this.options.maxWidth || 16) * remValue)}px` };
                this.readyTooltip = this.tooltipContainer.events.ready.subscribe(ev => {
                    if ((ev === null || ev === void 0 ? void 0 : ev.template) instanceof ContainerTemplate && (!ev.template.isDestroyed)) {
                        const centerPoint = (direction) => {
                            const startPoint = triggerClientRect.left + elementRef.scrollLeft - elementRefClientRect.left;
                            const centralPoint = startPoint + (triggerClientRect.width / 2) - (tooltipClientRect.width / 2);
                            if (tooltipClientRect.width > 0 && centralPoint > 0) {
                                ev.template.styles = { left: `${centralPoint}px` };
                                ev.template.target.setAttribute('tooltip-border-direction', direction);
                            }
                            else {
                                ev.template.styles = { left: `${startPoint}px` };
                            }
                        };
                        let tooltipClientRect = ev.template.target.getBoundingClientRect();
                        // position vertical   from 100%  trigger = trigger position bottom + ref scrollTop  - ref top  + spacing
                        // position vertical        50%   trigger = trigger position top    + ref scrollTop  - ref top  + (trigger height / 2) - (elm height / 2)
                        // position vertical   from 0%    trigger = trigger position top    + ref scrollTop  - ref top  - elm height - spacing
                        // position horizontal from 100%  trigger = trigger position right  + ref scrollLeft - ref left + spacing
                        // position horizontal      50%   trigger = trigger position left   + ref scrollLeft - ref left + (trigger width / 2) - (elm width / 2)
                        // position horizontal from 0%    trigger = trigger position left   + ref scrollLeft - ref left - spacing
                        // position horizontal to   0%    trigger = trigger position left   + ref scrollLeft - ref left - elm width - spacing
                        switch (tooltipDirection) {
                            case 'right':
                                ev.template.styles = {
                                    left: `${triggerClientRect.right + scrollLeft - elementRefClientRect.left + (remValue * tooltipSpace)}px`,
                                    top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top + (triggerClientRect.height / 2) - (tooltipClientRect.height / 2)}px`
                                };
                                ev.template.target.setAttribute('tooltip-border-direction', 'right');
                                break;
                            case 'left':
                                ev.template.styles = {
                                    left: `${triggerClientRect.left + scrollLeft - elementRefClientRect.left - tooltipClientRect.width - (remValue * tooltipSpace)}px`,
                                    top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top + (triggerClientRect.height / 2) - (tooltipClientRect.height / 2)}px`
                                };
                                ev.template.target.setAttribute('tooltip-border-direction', 'left');
                                break;
                            case 'top':
                                ev.template.styles = { top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top - tooltipClientRect.height - (remValue * tooltipSpace)}px` };
                                centerPoint('top');
                                break;
                            default:
                                ev.template.styles = { top: `${triggerClientRect.bottom + scrollTop - elementRefClientRect.top + (remValue * tooltipSpace)}px` };
                                centerPoint('bottom');
                                break;
                        }
                        const putTopFromBottom = () => {
                            ev.template.styles = { top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top - tooltipClientRect.height - (remValue * tooltipSpace)}px` };
                            if (ev.template.target.getAttribute('tooltip-border-direction') !== undefined) {
                                ev.template.target.setAttribute('tooltip-border-direction', 'top');
                            }
                            tooltipClientRect = ev.template.target.getBoundingClientRect();
                        };
                        const putRight = () => {
                            ev.template.styles = { whiteSpace: 'nowrap', maxWidth: 'none' };
                            tooltipClientRect = ev.template.target.getBoundingClientRect();
                            ev.template.styles = {
                                left: `${triggerClientRect.right + scrollLeft - elementRefClientRect.left + (remValue * tooltipSpace)}px`,
                                top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top + (triggerClientRect.height / 2) - (tooltipClientRect.height / 2)}px`
                            };
                            ev.template.target.setAttribute('tooltip-border-direction', 'right');
                        };
                        const putLeft = () => {
                            ev.template.styles = { whiteSpace: 'nowrap', maxWidth: 'none' };
                            tooltipClientRect = ev.template.target.getBoundingClientRect();
                            ev.template.styles = {
                                left: `${triggerClientRect.left + scrollLeft - elementRefClientRect.left - tooltipClientRect.width - (remValue * tooltipSpace)}px`,
                                top: `${triggerClientRect.top + scrollTop - elementRefClientRect.top + (triggerClientRect.height / 2) - (tooltipClientRect.height / 2)}px`
                            };
                            ev.template.target.setAttribute('tooltip-border-direction', 'left');
                        };
                        const putBottom = () => {
                            ev.template.styles = { top: `${triggerClientRect.bottom + scrollTop - elementRefClientRect.top + (remValue * tooltipSpace)}px` };
                            centerPoint('bottom');
                            tooltipClientRect = ev.template.target.getBoundingClientRect();
                        };
                        const putBottomFromTop = () => {
                            ev.template.styles = { top: `${triggerClientRect.bottom + scrollTop - elementRefClientRect.top + (remValue * tooltipSpace)}px` };
                            if (ev.template.target.getAttribute('tooltip-border-direction') !== undefined) {
                                ev.template.target.setAttribute('tooltip-border-direction', 'top');
                            }
                            tooltipClientRect = ev.template.target.getBoundingClientRect();
                        };
                        tooltipClientRect = ev.template.target.getBoundingClientRect();
                        switch (tooltipDirection) {
                            case 'right':
                                if (tooltipClientRect.right > elementRefClientRect.right) {
                                    putBottom();
                                }
                                if (tooltipClientRect.bottom > elementRefClientRect.bottom) {
                                    putTopFromBottom();
                                }
                                if (tooltipClientRect.top < elementRefClientRect.top) {
                                    putLeft();
                                }
                                break;
                            case 'left':
                                if (tooltipClientRect.left < elementRefClientRect.left) {
                                    putBottom();
                                }
                                if (tooltipClientRect.bottom > elementRefClientRect.bottom) {
                                    putTopFromBottom();
                                }
                                if (tooltipClientRect.top < elementRefClientRect.top) {
                                    putRight();
                                }
                                break;
                            case 'top':
                                if (tooltipClientRect.top < elementRefClientRect.top) {
                                    putBottomFromTop();
                                }
                                if (tooltipClientRect.bottom > elementRefClientRect.bottom) {
                                    putRight();
                                }
                                if (tooltipClientRect.right > elementRefClientRect.right) {
                                    putLeft();
                                }
                                break;
                            default:
                                if (tooltipClientRect.bottom > elementRefClientRect.bottom) {
                                    putTopFromBottom();
                                }
                                if (tooltipClientRect.top < elementRefClientRect.top) {
                                    putRight();
                                }
                                if (tooltipClientRect.right > elementRefClientRect.right) {
                                    putLeft();
                                }
                                break;
                        }
                    }
                });
            }
        };
        this.hideTooltip = () => {
            this.status = false;
            if (this.readyTooltip instanceof Subscription) {
                this.readyTooltip.unsubscribe();
            }
            if (this.tooltipContainer instanceof ContainerTemplate && !this.tooltipContainer.isDestroyed) {
                this.tooltipContainer.destroy();
            }
        };
        this.toggleTooltip = () => {
            switch (this.status) {
                case undefined:
                    this.showTooltip();
                    break;
                case false:
                    this.showTooltip();
                    break;
                case true:
                    this.hideTooltip();
                    break;
            }
        };
        this.destroy = () => {
            this.trigger.removeAttribute('tooltip-trigger');
            switch (this.toggleAction) {
                case 'click':
                    this.trigger.removeEventListener('click', this.toggleTooltip);
                    break;
                case 'custom': break;
                default:
                    this.trigger.removeEventListener('mouseover', this.showTooltip);
                    this.trigger.removeEventListener('mouseout', this.hideTooltip);
                    break;
            }
            if (this.readyTooltip instanceof Subscription) {
                this.readyTooltip.unsubscribe();
            }
            this.tooltipContainer instanceof ContainerTemplate && !this.tooltipContainer.isDestroyed && this.tooltipContainer.destroy();
        };
        this.init();
    }
    get triggerElement() { return this.trigger; }
    init() {
        this.trigger.setAttribute('tooltip-trigger', '');
        this.toggleAction = this.options.toggleAction || this.trigger.getAttribute('tooltip-toggle-action');
        switch (this.toggleAction) {
            case 'click':
                this.trigger.addEventListener('click', this.toggleTooltip);
                break;
            case 'custom': break;
            default:
                this.trigger.addEventListener('mouseover', this.showTooltip);
                this.trigger.addEventListener('mouseout', this.hideTooltip);
                break;
        }
    }
}
