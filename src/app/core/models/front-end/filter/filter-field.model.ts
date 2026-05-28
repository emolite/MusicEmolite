// filter-field.model.ts

export type FilterFieldType = 'text' | 'select';

export interface FilterOption {
    label: string;
    value: any;
}

export interface FilterField {
    key: string;
    label: string;
    type: FilterFieldType;
    placeholder?: string;
    options?: FilterOption[];
}