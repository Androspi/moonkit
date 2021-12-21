import { ContainerTemplateContext, IterableTemplateContext, ContainerTemplate, IterableTemplate, TemplateOperators } from 'htmon';

export class Slider {

  private sliderTemplate: ContainerTemplate;
  private elements: NodeListOf<Element>;
  private container: Element;

  constructor(container: Element, componentAttribute?: Attr, id?: string) {
    !id ? id = `Slider-${Math.random().toString(16).substring(2)}` : null;

    this.container = container;
    this.elements = container.querySelectorAll('.iterable-element');
    this.elements.forEach(item => container.removeChild(item));

    const bottomControlElement: HTMLElement = container.querySelector('.slider-bottom-control');
    const rightControlElement: HTMLElement = container.querySelector('.slider-right-control');
    const leftControlElement: HTMLElement = container.querySelector('.slider-left-control');
    const contentControlElement: HTMLElement = container.querySelector('.slider-content');
    let iterableId = `iterable-${id}`;

    const contentContext: Partial<IterableTemplateContext> = {
      classes: 'slider-content',
      type: 'iterable',
      id: iterableId,
      rows: Array.from(this.elements).map(node => ({
        duration: node.getAttribute('element-duration') ? +node.getAttribute('element-duration') : undefined,
        node: { element: node, removable: true },
        type: 'element',
      }))
    };

    if (contentControlElement) {
      iterableId = contentControlElement.getAttribute('id') || contentContext.id;
      contentContext.node = { element: contentControlElement };
      contentContext.id = iterableId;
      delete contentContext.classes;
    }

    const leftControlContext: Partial<ContainerTemplateContext> = {
      behavior: { iterableController: { action: 'return', target: iterableId } },
      classes: 'slider-left-control material-icons-round',
      attributes: { 'after-content': 'chevron_left' },
      type: 'container'
    };

    if (leftControlElement) {
      leftControlContext.node = { element: leftControlElement };
      delete leftControlContext.attributes;
      delete leftControlContext.classes;
    }

    const rightControlContext: Partial<ContainerTemplateContext> = {
      behavior: { iterableController: { action: 'advance', target: iterableId } },
      classes: 'slider-right-control material-icons-round',
      attributes: { 'after-content': 'chevron_right' },
      type: 'container'
    };

    if (rightControlElement) {
      rightControlContext.node = { element: rightControlElement };
      delete rightControlContext.attributes;
      delete rightControlContext.classes;
    }

    const bottomControlContext: Partial<ContainerTemplateContext> = {
      classes: 'slider-bottom-control',
      type: 'container',
      behavior: {
        listPreview: {
          templateContextInactive: { attributes: { 'after-content': 'radio_button_unchecked', 'after-hoverable-content': 'radio_button_checked' } },
          templateContextActive: { attributes: { 'after-content': 'radio_button_checked' } },
          templateContext: { classes: 'material-icons-round', type: 'element' },
          target: iterableId
        }
      },
    };

    if (bottomControlElement) {
      bottomControlContext.node = { element: bottomControlElement };
      delete bottomControlContext.classes;
    }

    this.sliderTemplate = TemplateOperators.createTemplate(container, { classes: 'primary-slider', type: 'container' }, {}, componentAttribute);
    const bottomControl = TemplateOperators.createTemplate(this.sliderTemplate, bottomControlContext, {}, componentAttribute);
    const rightControl = TemplateOperators.createTemplate(this.sliderTemplate, rightControlContext, {}, componentAttribute);
    const leftControl = TemplateOperators.createTemplate(this.sliderTemplate, leftControlContext, {}, componentAttribute);
    const contentControl = TemplateOperators.createTemplate<IterableTemplate>(this.sliderTemplate, contentContext, {}, componentAttribute);
    contentControl.events.childrenShownChanges.subscribe(item => {
      const slideRightName = item.currentChildrenShown[0].target.getAttribute('slide-right') || 'slide-right';
      const slideLeftName = item.currentChildrenShown[0].target.getAttribute('slide-left') || 'slide-left';
      if (item.length > 2 && item.lastChildrenShownIndex === 0 && item.currentChildrenShownIndex === (item.length - 1)) {
        item.currentChildrenShown[0].target.classList.remove(slideLeftName);
        item.currentChildrenShown[0].target.classList.add(slideRightName);
      } else if (item.length > 2 && item.lastChildrenShownIndex === (item.length - 1) && item.currentChildrenShownIndex === 0) {
        item.currentChildrenShown[0].target.classList.remove(slideRightName);
        item.currentChildrenShown[0].target.classList.add(slideLeftName);
      } else if (item.currentChildrenShownIndex > item.lastChildrenShownIndex) {
        item.currentChildrenShown[0].target.classList.remove(slideRightName);
        item.currentChildrenShown[0].target.classList.add(slideLeftName);
      } else if (item.lastChildrenShownIndex === item.currentChildrenShownIndex) {
        item.currentChildrenShown[0].target.classList.remove(slideRightName);
        item.currentChildrenShown[0].target.classList.remove(slideLeftName);
      } else {
        item.currentChildrenShown[0].target.classList.remove(slideLeftName);
        item.currentChildrenShown[0].target.classList.add(slideRightName);
      }
      const updateHeight = () => {
        if (Array.from(item.currentChildrenShown[0].target.querySelectorAll('img')).every(elm => elm.complete && elm.naturalHeight)) {
          this.sliderTemplate.styles = { height: `${(item.currentChildrenShown[0].target as HTMLElement).offsetHeight}px` };
        } else { setTimeout(updateHeight, 0); }
      };
      updateHeight();
    });
  }

  restoreChildren() { this.elements.forEach(item => this.container.appendChild(item)); }

  destroy() { this.sliderTemplate.destroy(); }

}
