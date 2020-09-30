import { PageNavLink } from "./PageNavLink";

export type PageNavItem = {
  Title: string;
  NavigationData: PageNavLink[];
  PageUrl: string;
  ItemId?: number;
}
