export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'image' | 'date' | 'status' | 'badge' | 'custom';
  sortable?: boolean;
  /** Only used when type = 'badge'. Renders a pill based on the row value being truthy/falsy. */
  badgeConfig?: {
    trueLabel: string;
    falseLabel: string;
    trueClass?: string;
    falseClass?: string;
  };
}