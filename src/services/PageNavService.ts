import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PageNavLink } from "../models/PageNavLink";

export default class PageNavService {
  private _context: WebPartContext;
  private _pageUrl: string;

  constructor(context: WebPartContext, pageUrl: string) {
    this._context = context;
    this._pageUrl = pageUrl;
  }

  public getNavLinks = async (): Promise<PageNavLink[]> => {
    return [
      { title: 'Top Link A', url: 'https://bing.com', children: [
        { title: 'Child AA', url: 'https://bing.com', newTab: true, children: [
          { title: 'Child AAA', url: 'https://bing.com'},
          { title: 'Child AAB', url: 'https://bing.com'},
          { title: 'Child AAC', url: 'https://bing.com'},
        ] },
        { title: 'Child AB', url: 'https://bing.com'},
        { title: 'Child AC', url: 'https://bing.com'},
      ]},
      { title: 'Top Link B', url: 'https://bing.com', children: [
        { title: 'Child BA', url: 'https://bing.com', newTab: true },
        { title: 'Child BB', url: 'https://bing.com'},
        { title: 'Child BC', url: 'https://bing.com'},
      ]},
      { title: 'Top Link C', url: 'https://bing.com', children: [
        { title: 'Child CA', url: 'https://bing.com', newTab: true },
        { title: 'Child CB', url: 'https://bing.com'},
        { title: 'Child CC', url: 'https://bing.com'},
      ]},
      { title: 'Top Link D', url: 'https://bing.com', children: [
        { title: 'Child DA', url: 'https://bing.com', newTab: true },
        { title: 'Child DB', url: 'https://bing.com'},
        { title: 'Child DC', url: 'https://bing.com'},
      ]},
    ];
  }
}
