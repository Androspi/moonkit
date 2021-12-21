import { TemplateBehaviorClass } from 'htmon';

import { Autocomplete, AutocompleteOptions } from '../components/autocomplete';
import { Collapsable, CollapsableOptions } from '../components/collapsable';
import { Modal, ModalOptions, ModalProperties } from '../components/modal';
import { Dropdown, DropdownOptions } from '../components/dropdown';
import { Tooltip, TooltipOptions } from '../components/tooltip';
import { List, ListOptions } from '../components/list';

// Autocomplete
export interface AutocompleteBehaviorProperties { autocompleteInstance: Autocomplete; }
export type AutocompleteBehaviorOptions = Partial<AutocompleteOptions>;
// Collapsable
export type CollapsableBehaviorOptions = Partial<CollapsableOptions>;
export interface CollapsableBehaviorProperties {
  collapsableInstance: Collapsable;
  restart: () => void;
}
// Dropdown
export interface DropdownBehaviorProperties { dropdownInstance: Dropdown; }
export type DropdownBehaviorOptions = Partial<DropdownOptions>;
// Marquee
export interface MarqueeBehaviorProperties { restart: () => void; }
export interface MarqueeBehaviorOptions {
  updateDuration?: boolean;
  delay?: number;
}
// Tooltip
export interface TooltipBehaviorProperties { tooltipInstance: Tooltip; }
export type TooltipBehaviorOptions = Partial<TooltipOptions>;
// Modal
export type ModalBehaviorOptions = Partial<ModalOptions & ModalProperties>;
export interface ModalBehaviorProperties { modalInstance: Modal; }
// List
export interface ListBehaviorProperties { listInstance: List; }
export type ListBehaviorOptions = Partial<ListOptions>;

// BehaviorList
// tslint:disable-next-line: no-namespace
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
