import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from '@microsoft/sp-http';
import { PageNavItem } from "../models/PageNavItem";
import { PageNavItemResult } from "../models/PageNavItemResult";

const PAGE_NAV_LIST_TITLE = "Page Navigation";

export default class PageNavService {
  private _context: WebPartContext;
  private _serverRelativePageUrl: string;

  constructor(context: WebPartContext, serverRelativePageUrl: string) {
    this._context = context;
    this._serverRelativePageUrl = serverRelativePageUrl ? serverRelativePageUrl.toLowerCase() : 'NO_PAGE_URL_SPECIFIED';
  }

  get context(): WebPartContext {
    return this._context;
  }

  private _makeDefaultNavItem = (pageUrl: string): PageNavItem => {
    return {
      Title: "Page Navigation",
      PageUrl: pageUrl,
      NavigationData: []
    };
  }

  private _getPageNavItem = async (): Promise<PageNavItem> => {
    const apiPath = `/_api/lists/getbytitle('${PAGE_NAV_LIST_TITLE}')/items?$filter=PageUrl eq '${this._serverRelativePageUrl}'`;
    const response = await this._context.spHttpClient.get(`${this._context.pageContext.web.absoluteUrl}${apiPath}`, SPHttpClient.configurations.v1);
    if (response.ok) {
      const result = await response.json();
      if (!result.value) return null;
      else if (result.value.length === 1) {
        const item = result.value[0];
        try {
          const data = item.NavigationData ? JSON.parse(item.NavigationData) : null;
          return {
            ItemId: item.ID,
            Title: item.Title,
            PageUrl: item.PageUrl,
            NavigationData: data
          };
        }
        catch (error) {
          throw new Error(`Unable to parse NavigationData for page navigation list item. Details: ${error.message}`);
        }
      }
    }
    else throw new Error(`Unable to fetch page navigation list item. Details: HTTP ${response.status} ${response.statusText}`);
  }

  private _addPageNavItem = async (item: PageNavItem): Promise<PageNavItem> => {
    const apiPath = `/_api/lists/getbytitle('${PAGE_NAV_LIST_TITLE}')/items`;
    const response = await this._context.spHttpClient.post(`${this._context.pageContext.web.absoluteUrl}${apiPath}`, SPHttpClient.configurations.v1, {
      body: JSON.stringify({
        ...item,
        NavigationData: JSON.stringify(item.NavigationData)
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const result = await response.json();
      return result;
    }
    else throw new Error(`Unable to add page navigation list item. Details: HTTP ${response.status} ${response.statusText}`);
  }

  private _updatePageNavItem = async (updatedItem: PageNavItem): Promise<void> => {
    const apiPath = `/_api/lists/getbytitle('${PAGE_NAV_LIST_TITLE}')/items(${updatedItem.ItemId})`;
    let updatePayload = {
      ...updatedItem,
      NavigationData: JSON.stringify(updatedItem.NavigationData)
    };
    delete updatePayload.ItemId;
    const response = await this._context.spHttpClient.post(`${this._context.pageContext.web.absoluteUrl}${apiPath}`, SPHttpClient.configurations.v1, {
      body: JSON.stringify(updatePayload),
      headers: {
        'Content-Type': 'application/json',
        'X-HTTP-Method': 'MERGE',
        'If-Match': '*'
      }
    });
    if (!response.ok) throw new Error(`Unable to update page navigation list item. Details: HTTP ${response.status} ${response.statusText}`);
  }

  public ensureListItem = async (createIfMissing: boolean = false): Promise<PageNavItemResult> => {
    let result: PageNavItemResult = { type: 'ItemFound', item: null };
    try {
      const pageNavItem = await this._getPageNavItem();
      if (!pageNavItem) {
        if (createIfMissing) {
          await this._addPageNavItem(this._makeDefaultNavItem(this._serverRelativePageUrl));
          result.item = await this._getPageNavItem();
          result.type = 'ItemCreated';
        }
        else {
          result.type = "ItemMissing";
        }
      }
      else {
        result.item = pageNavItem;
      }
    }
    catch (error) {
      console.log(`Unable to ensure page navigation item.`, error);
      result.type = 'Error';
      result.errorMessage = error.message;
    }
    finally {
      return result;
    }
  }

  public updateListItem = async (updatedItem: PageNavItem): Promise<PageNavItemResult> => {
    let result: PageNavItemResult = { type: 'ItemUpdated', item: null };
    try {
      if (updatedItem && !updatedItem.ItemId) {
        throw new Error(`ItemId is required to update page navigation item`);
      }
      await this._updatePageNavItem(updatedItem);
      const pageNavItem = await this._getPageNavItem();
      result.item = pageNavItem;
    }
    catch (error) {
      console.log(`Unable to update page navigation item.`, error);
      result.type = 'Error';
      result.errorMessage = error.message;
    }
    finally {
      return result;
    }
  }
}
