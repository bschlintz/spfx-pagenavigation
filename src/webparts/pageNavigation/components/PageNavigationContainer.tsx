import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { INavLink, INavLinkGroup, Nav, Spinner } from '@fluentui/react';
import { PageNavLink } from '../../../models/PageNavLink';
import PageNavService from '../../../services/PageNavService';
import styles from '../PageNavigation.module.scss';

export interface IPageNavigationContainerProps {
  service: PageNavService;
}

const PageNavigationContainer: React.FC<IPageNavigationContainerProps> = ({ service }) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ pageNavLinks, setPageNavLinks ] = useState<PageNavLink[]>([]);
  const [ pageNavError, setPageNavError ] = useState<Error>(null);

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
        name: 'Page Navigation',
        links: pageNavLinks.map(mapLinks)
      }]
    }
    return groups;
  }, [ pageNavLinks ]);

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
          ? <Nav groups={navGroups} />
          : pageNavError
            ? <span>{pageNavError.message}</span>
            : null
        }
    </div>
  );
}

export default PageNavigationContainer;
