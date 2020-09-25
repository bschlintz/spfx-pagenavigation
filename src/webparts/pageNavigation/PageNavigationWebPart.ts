import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'PageNavigationWebPartStrings';
import PageNavigationContainer, { IPageNavigationContainerProps } from './components/PageNavigationContainer';
import PageNavService from '../../services/PageNavService';

export interface IPageNavigationWebPartProps {
  baseNavTitle: string;
}

export default class PageNavigationWebPart extends BaseClientSideWebPart<IPageNavigationWebPartProps> {

  private _pageNavService: PageNavService;

  public async onInit(): Promise<void> {
    console.log(this.context.pageContext);
    this._pageNavService = new PageNavService(this.context, '');
  }

  public render(): void {
    const element: React.ReactElement<IPageNavigationContainerProps> = React.createElement(
      PageNavigationContainer,
      {
        service: this._pageNavService,
        baseNavTitle: this.properties.baseNavTitle
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(): void {
    this.render();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('baseNavTitle', {
                  label: strings.BaseNavTitleFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
