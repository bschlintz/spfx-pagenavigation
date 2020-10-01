export type PageNavLink = {
  title: string;
  url: string;
  id?: string;
  newTab?: boolean;
  children?: PageNavLink[];
  childrenExpanded?: boolean;
}
