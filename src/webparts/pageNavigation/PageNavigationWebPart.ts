import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import PageNavigation, { IPageNavigationContainerProps } from './components/PageNavigation';
import PageNavService from '../../services/PageNavService';

export interface IPageNavigationWebPartProps {
}

export default class PageNavigationWebPart extends BaseClientSideWebPart<IPageNavigationWebPartProps> {

  private _pageNavService: PageNavService;

  public async onInit(): Promise<void> {
    this._pageNavService = new PageNavService(this.context, this.context.pageContext.legacyPageContext.serverRequestPath);
  }

  public render(): void {
    const element: React.ReactElement<IPageNavigationContainerProps> = React.createElement(
      PageNavigation,
      {
        service: this._pageNavService,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected onPropertyPaneFieldChanged(): void {
    this.render();
  }
}
