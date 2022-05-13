import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'PageNavigationWebPartStrings';

import PageNavigation, { IPageNavigationContainerProps } from './components/PageNavigation';
import PageNavService from '../../services/PageNavService';
import { IPropertyPaneConfiguration, PropertyPaneToggle, PropertyPaneTextField } from '@microsoft/sp-property-pane';

export interface IPageNavigationWebPartProps {
  overrideEnabled: boolean;
  overridePageUrl?: string;
}

export default class PageNavigationWebPart extends BaseClientSideWebPart<IPageNavigationWebPartProps> {

  private _pageNavService: PageNavService;

  public async onInit(): Promise<void> {
    let serverRelativePageUrl: string = this.context.pageContext.legacyPageContext.serverRequestPath;
    if (this.properties.overrideEnabled && this.properties.overridePageUrl) {
      serverRelativePageUrl = this.properties.overridePageUrl;
    }
    this._pageNavService = new PageNavService(this.context, serverRelativePageUrl);
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle('overrideEnabled', {
                  label: strings.PropertyPaneOverrideEnabled,
                  checked: this.properties.overrideEnabled,
                }),
                PropertyPaneTextField('overridePageUrl', {
                  label: strings.PropertyPaneOverridePageUrl,
                  description: strings.PropertyPaneOverridePageUrlDescription,
                  value: this.properties.overrideEnabled ? this.properties.overridePageUrl : this.context.pageContext.legacyPageContext.serverRequestPath,
                  disabled: !this.properties.overrideEnabled,
                }),
              ]
            }
          ]
        }
      ]
    };
  }

  protected onPropertyPaneConfigurationComplete(): void {
    if (!this.properties.overrideEnabled) {
      this.properties.overridePageUrl = undefined;
    }
  }
}
