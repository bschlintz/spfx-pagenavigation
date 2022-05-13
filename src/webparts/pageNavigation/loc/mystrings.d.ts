declare interface IPageNavigationWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  BaseNavTitleFieldLabel: string;
  PropertyPaneOverrideEnabled: string;
  PropertyPaneOverridePageUrl: string;
  PropertyPaneOverridePageUrlDescription: string;
}

declare module 'PageNavigationWebPartStrings' {
  const strings: IPageNavigationWebPartStrings;
  export = strings;
}
