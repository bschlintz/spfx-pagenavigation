# Page Navigation Web Part

## Summary

SharePoint Framework custom web part which provides page-level navigation with the links stored in a SharePoint list that is provisioned during app installation. Supports up to 4 levels of link hierarchy.

![Page Navigation Overview Screenshot](./images/page-nav-overview.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.11-green.svg)

## Setup Instructions
### Pre-requisites
- App Catalog: Ensure the [App Catalog](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog) is setup in your SharePoint Online tenant.

### Tenant Installation
1. Download the latest SPFx package file from [releases](https://github.com/bschlintz/spfx-pagenavigation/releases/latest) or clone the repo and build the package yourself.
1. Upload sppkg file to the 'Apps for SharePoint' library in your Tenant App Catalog.
1. Click Deploy.

### Site Installation
1. Click 'Add an app' on your target site.
1. Click on the `Page Navigation` app to install it.
1. Navigate to a page on the site where you'd like to add the web part, click `Edit`.
1. Add the web part named `Page Navigation`.
1. Save page.
1. Click `Enable Page Navigation` to provision the SharePoint list item that will store the links for the current page.
1. Click `Edit` next to the Page Navigation heading to begin adding links.
1. Click `Save` when finished adding links.

## Features

- Up to 4 levels of hierarchical links.
- All data is stored in a SharePoint list titled `Page Navigation` which is provisioned during app installation.
- __One__ `Page Navigation` web part is supported per page.
- 1:1 relationship between pages and SharePoint list items in the `Page Navigation` list on the site.
  - Links are stored as JSON in the `NavigationData` field.
  - Relationship between list item and page is established through the `PageUrl` field containing the server-relative path.
  - List item `Title` field is displayed in the web part as the primary heading.
- `Edit` button on web part is security trimmed to users who have permission to edit items in the `Page Navigation` list.

## Version history

Version|Date|Comments
-------|----|--------
1.0|October 7, 2020|Initial release

## Disclaimer
Microsoft provides programming examples for illustration only, without warranty either expressed or implied, including, but not limited to, the implied warranties of merchantability and/or fitness for a particular purpose. We grant You a nonexclusive, royalty-free right to use and modify the Sample Code and to reproduce and distribute the object code form of the Sample Code, provided that You agree: (i) to not use Our name, logo, or trademarks to market Your software product in which the Sample Code is embedded; (ii) to include a valid copyright notice on Your software product in which the Sample Code is embedded; and (iii) to indemnify, hold harmless, and defend Us and Our suppliers from and against any claims or lawsuits, including attorneys' fees, that arise or result from the use or distribution of the Sample Code.

## References
- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
