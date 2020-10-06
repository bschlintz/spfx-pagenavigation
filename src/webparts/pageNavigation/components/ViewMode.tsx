import * as React from 'react';
import { useMemo } from 'react';
import { INavLink, INavLinkGroup, Nav } from '@fluentui/react/lib/Nav';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import styles from '../PageNavigation.module.scss';
import { ActionButton } from '@fluentui/react/lib/Button';
import { SecurityTrimmedControl, PermissionLevel } from "@pnp/spfx-controls-react/lib/SecurityTrimmedControl";
import { SPPermission } from '@microsoft/sp-page-context';
import PageNavService from '../../../services/PageNavService';

export interface IPageNavigationProps {
  navTitle: string;
  navLinks: PageNavLink[];
  service: PageNavService;
  onClickEdit: () => void;
}

const ViewMode: React.FC<IPageNavigationProps> = ({ navTitle, navLinks, service, onClickEdit }) => {

  const mapLinks = (link: PageNavLink): INavLink => ({
    name: link.title,
    url: link.url,
    target: link.newTab ? '_blank' : '_self',
    isExpanded: typeof(link.childrenExpanded) === 'undefined' ? true : link.childrenExpanded,
    links: Array.isArray(link.children) ? link.children.map(mapLinks) : undefined
  })

  const fabricNavGroups = useMemo<INavLinkGroup[]>(() => {
    let groups: INavLinkGroup[] = [];
    if (navLinks && navLinks.length > 0) {
      groups = [{
        name: navTitle,
        links: navLinks.map(mapLinks),
      }]
    }
    return groups;
  }, [ navLinks ]);

  return (
    <Stack>
      <SecurityTrimmedControl
        context={service.context}
        level={PermissionLevel.remoteListOrLib}
        remoteSiteUrl={service.context.pageContext.web.absoluteUrl}
        relativeLibOrListUrl={`${service.context.pageContext.web.absoluteUrl}/lists/PageNavigation`}
        permissions={[SPPermission.editListItems]}
        className={styles.editButtonContainer}
      >
        <ActionButton
          onClick={onClickEdit}
          iconProps={{ iconName: 'Edit' }}
        >Edit</ActionButton>
      </SecurityTrimmedControl>
      {fabricNavGroups.length > 0 && fabricNavGroups[0].links.length > 0
        ? <Nav
            groups={fabricNavGroups}
            styles={{
              group: styles.navGroup,
              groupContent: styles.navGroupContent,
              link: styles.navLink,
              chevronButton: styles.navChevronButton,
              chevronIcon: styles.navChevronIcon,
            }}
          />
        : <span>No links to show.</span>
      }
    </Stack>
  );
}

export default ViewMode;
