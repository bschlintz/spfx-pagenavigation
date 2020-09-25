import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { INavLink, INavLinkGroup, IRenderGroupHeaderProps, Nav } from '@fluentui/react/lib/Nav';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import PageNavService from '../../../services/PageNavService';
import styles from '../PageNavigation.module.scss';
import { ActionButton } from '@fluentui/react';
import EditPanel from './EditPanel';

export interface IPageNavigationContainerProps {
  service: PageNavService;
  baseNavTitle: string;
}

const PageNavigationContainer: React.FC<IPageNavigationContainerProps> = ({ service, baseNavTitle }) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ pageNavLinks, setPageNavLinks ] = useState<PageNavLink[]>([]);
  const [ pageNavError, setPageNavError ] = useState<Error>(null);
  const [ userCanEdit, setUserCanEdit ] = useState<boolean>(true);
  const [ showEditPanel, setShowEditPanel ] = useState<boolean>(false);

  const mapLinks = (link: PageNavLink): INavLink => ({
    name: link.title,
    url: link.url,
    target: link.newTab ? '_blank' : '_self',
    isExpanded: typeof(link.childrenExpanded) === 'undefined' ? true : link.childrenExpanded,
    links: Array.isArray(link.children) ? link.children.map(mapLinks) : undefined
  })

  const navGroups = useMemo<INavLinkGroup[]>(() => {
    let groups: INavLinkGroup[] = [];
    if (pageNavLinks) {
      groups = [{
        links: pageNavLinks.map(mapLinks),
      }]
    }
    return groups;
  }, [ pageNavLinks ]);

  const onClickEdit = () => {
    setShowEditPanel(true);
  }

  const closeEditPanel = () => {
    setShowEditPanel(false);
  }

  const renderNav = (): JSX.Element => (
    <Stack>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <h2>{baseNavTitle}</h2>
        {userCanEdit && (
          <ActionButton
            onClick={onClickEdit}
            iconProps={{ iconName: 'Edit' }}
          >Edit</ActionButton>
        )}
      </Stack>
      <Nav
        groups={navGroups}
        styles={{
          groupContent: styles.navGroupContent,
          link: styles.navLink,
          chevronButton: styles.navChevronButton,
          chevronIcon: styles.navChevronIcon,
        }}
      />
    </Stack>
  )

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setPageNavError(null);
        const result = await service.getNavLinks();
        setPageNavLinks(result);
        setIsLoading(false);
      }
      catch (error) {
        console.log(`Unable to fetch page navigation links.`, error);
        setPageNavError(pageNavError);
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className={ styles.pageNavigationContainer }>
      {isLoading
        ? <Spinner />
        : navGroups
          ? renderNav()
          : pageNavError
            ? <span>{pageNavError.message}</span>
            : null
        }
      <EditPanel isOpen={showEditPanel} onDismiss={closeEditPanel} />
    </div>
  );
}

export default PageNavigationContainer;
