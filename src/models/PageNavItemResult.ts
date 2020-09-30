import { PageNavItem } from "./PageNavItem";

export type PageNavItemResult = {
  type: 'ItemCreated' | 'ItemUpdated' | 'ItemFound' | 'ItemMissing' | 'Error';
  errorMessage?: string;
  item?: PageNavItem;
}
