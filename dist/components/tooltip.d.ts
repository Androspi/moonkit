import { ContainerTemplateContext } from 'htmon-test';
export interface TooltipOptions {
    direction: 'bottom' | 'right' | 'left' | 'top';
    toggleAction: 'click' | 'custom' | 'mouse';
    context: Partial<ContainerTemplateContext>;
    maxWidth: number;
    parent: string;
    text: string;
}
export declare class Tooltip {
    private trigger;
    private componentAttribute?;
    options: Partial<TooltipOptions>;
    private toggleAction;
    private tooltipContainer;
    private status;
    get triggerElement(): Element;
    private readyTooltip;
    constructor(trigger: Element, componentAttribute?: Attr, options?: Partial<TooltipOptions>);
    init(): void;
    showTooltip: () => void;
    hideTooltip: () => void;
    toggleTooltip: () => void;
    destroy: () => void;
}
