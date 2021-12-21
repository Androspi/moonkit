import { TemplateBehaviorClass, ContainerTemplateProperties } from 'htmon-test';
import { Autocomplete, AutocompleteOptions } from '../components/autocomplete';
import { Collapsable, CollapsableOptions } from '../components/collapsable';
import { Modal, ModalOptions, ModalProperties } from '../components/modal';
import { Dropdown, DropdownOptions } from '../components/dropdown';
import { Tooltip, TooltipOptions } from '../components/tooltip';
import { List, ListOptions } from '../components/list';
export interface AutocompleteBehaviorProperties {
    autocompleteInstance: Autocomplete;
}
export declare type AutocompleteBehaviorOptions = Partial<AutocompleteOptions>;
export declare type CollapsableBehaviorOptions = Partial<CollapsableOptions>;
export interface CollapsableBehaviorProperties {
    collapsableInstance: Collapsable;
    restart: () => void;
}
export interface DropdownBehaviorProperties {
    dropdownInstance: Dropdown;
}
export declare type DropdownBehaviorOptions = Partial<DropdownOptions>;
export interface MarqueeBehaviorProperties {
    restart: () => void;
}
export interface MarqueeBehaviorOptions {
    updateDuration?: boolean;
    delay?: number;
}
export interface TooltipBehaviorProperties {
    tooltipInstance: Tooltip;
}
export declare type TooltipBehaviorOptions = Partial<TooltipOptions>;
export interface LoaderBehaviorProperties {
    loader: (isLoading: boolean, value: number) => void;
    increase: () => void;
    isLoading: boolean;
}
export interface LoaderBehaviorOptions {
    childrenContext?: ContainerTemplateProperties['rows'][number];
    destroy: (ref: any) => void;
}
export declare type ModalBehaviorOptions = Partial<ModalOptions & ModalProperties>;
export interface ModalBehaviorProperties {
    modalInstance: Modal;
}
export interface VideoBehaviorOptions {
    updateDuration?: boolean;
}
export declare type VimeoBehaviorOptions = {};
export interface ListBehaviorProperties {
    listInstance: List;
}
export declare type ListBehaviorOptions = Partial<ListOptions>;
declare global {
    namespace TemplateBehavior {
        interface BehaviorList {
            autocomplete: InstanceType<TemplateBehaviorClass<BehaviorOptionList['autocomplete']>> & AutocompleteBehaviorProperties;
            collapsable: InstanceType<TemplateBehaviorClass<BehaviorOptionList['collapsable']>> & CollapsableBehaviorProperties;
            dropdown: InstanceType<TemplateBehaviorClass<BehaviorOptionList['dropdown']>> & DropdownBehaviorProperties;
            tooltip: InstanceType<TemplateBehaviorClass<BehaviorOptionList['tooltip']>> & TooltipBehaviorProperties;
            marquee: InstanceType<TemplateBehaviorClass<BehaviorOptionList['marquee']>> & MarqueeBehaviorProperties;
            loader: InstanceType<TemplateBehaviorClass<BehaviorOptionList['loader']>> & LoaderBehaviorProperties;
            modal: InstanceType<TemplateBehaviorClass<BehaviorOptionList['modal']>> & ModalBehaviorProperties;
            list: InstanceType<TemplateBehaviorClass<BehaviorOptionList['list']>> & ListBehaviorProperties;
            vimeo: InstanceType<TemplateBehaviorClass<BehaviorOptionList['vimeo']>>;
            video: InstanceType<TemplateBehaviorClass<BehaviorOptionList['video']>>;
        }
        interface BehaviorOptionList {
            autocomplete: AutocompleteBehaviorOptions;
            collapsable: CollapsableBehaviorOptions;
            dropdown: DropdownBehaviorOptions;
            tooltip: TooltipBehaviorOptions;
            marquee: MarqueeBehaviorOptions;
            loader: LoaderBehaviorOptions;
            vimeo: VimeoBehaviorOptions;
            video: VideoBehaviorOptions;
            modal: ModalBehaviorOptions;
            list: ListBehaviorOptions;
        }
    }
}
