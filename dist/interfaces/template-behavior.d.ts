import { TemplateBehaviorClass } from 'htmon';
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
export declare type ModalBehaviorOptions = Partial<ModalOptions & ModalProperties>;
export interface ModalBehaviorProperties {
    modalInstance: Modal;
}
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
            modal: InstanceType<TemplateBehaviorClass<BehaviorOptionList['modal']>> & ModalBehaviorProperties;
            list: InstanceType<TemplateBehaviorClass<BehaviorOptionList['list']>> & ListBehaviorProperties;
        }
        interface BehaviorOptionList {
            autocomplete: AutocompleteBehaviorOptions;
            collapsable: CollapsableBehaviorOptions;
            dropdown: DropdownBehaviorOptions;
            tooltip: TooltipBehaviorOptions;
            marquee: MarqueeBehaviorOptions;
            modal: ModalBehaviorOptions;
            list: ListBehaviorOptions;
        }
    }
}
