import { ContainerTemplate, ContainerTemplateContext, IntersectionTypeList, SomeContainerTemplateTypeList, TemplateEvent, TemplateProperties } from 'htmon';
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
export declare class Modal {
    trigger: HTMLElement;
    options: Partial<ModalOptions>;
    clickEvent?: (event: CustomEvent<ModalClickEvent>) => void;
    private readonly defaultModalContext;
    modalContext: ModalProperties['modalContext'];
    headerContext: ModalProperties['headerContext'];
    bodyContext: ModalProperties['bodyContext'];
    private copy;
    template: ContainerTemplate;
    constructor(trigger: HTMLElement, options: Partial<ModalOptions>, clickEvent?: (event: CustomEvent<ModalClickEvent>) => void);
    private click;
    open(): void;
    close: (event?: (MouseEvent | KeyboardEvent) & TemplateEvent) => Promise<void>;
    destroy(): void;
}
