export type PageNavLink = {
  title: string;
  url: string;
  ordinal?: number;
  newTab?: boolean;
  children?: PageNavLink[];
  childrenExpanded?: boolean;
}
