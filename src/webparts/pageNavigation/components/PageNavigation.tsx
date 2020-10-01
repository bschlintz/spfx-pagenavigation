import * as React from 'react';
import { useMemo} from 'react';
import { INavLink, INavLinkGroup, Nav } from '@fluentui/react/lib/Nav';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import styles from '../PageNavigation.module.scss';
import { ActionButton } from '@fluentui/react';

export interface IPageNavigationProps {
  navTitle: string;
  navLinks: PageNavLink[];
  isLoading: boolean;
  isEditable: boolean;
  onClickEdit: () => void;
}

const PageNavigation: React.FC<IPageNavigationProps> = ({ navTitle, navLinks, isLoading, isEditable, onClickEdit }) => {

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
        links: navLinks.map(mapLinks),
      }]
    }
    return groups;
  }, [ navLinks ]);

  return (
    <Stack>
      {isLoading
        ? <Spinner />
        : <>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
              <h2>{navTitle}</h2>
              {isEditable && (
                <ActionButton
                  onClick={onClickEdit}
                  iconProps={{ iconName: 'Edit' }}
                >Edit</ActionButton>
              )}
            </Stack>
            {fabricNavGroups.length > 0 && fabricNavGroups[0].links.length > 0
              ? <Nav
                  groups={fabricNavGroups}
                  styles={{
                    groupContent: styles.navGroupContent,
                    link: styles.navLink,
                    chevronButton: styles.navChevronButton,
                    chevronIcon: styles.navChevronIcon,
                  }}
                />
              : <span>No links to show.</span>
            }
          </>
      }
    </Stack>
  );
}

export default PageNavigation