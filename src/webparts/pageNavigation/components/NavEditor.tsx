import * as React from 'react';
import styles from '../PageNavigation.module.scss';
import { ActionButton, IButtonStyles } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import { useMemo, useState } from 'react';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import NavLinkModal from './NavLinkModal';

export interface INavEditorProps {
  navLinks: PageNavLink[];
  onNavLinksChange: (newNavLinks: PageNavLink[]) => void;
}

type NavItem = {
  item: PageNavLink;
  id: string;
  nextId: string;
  prevId: string;
  depth: number;
  children?: NavItem[];
}

const NavEditor: React.FC<INavEditorProps> = ({ navLinks, onNavLinksChange }) => {
  const [ isEditLinkOpen, setEditLinkOpen ] = useState<boolean>();
  const [ activeItem, setActiveItem ] = useState<NavItem>(null);

  const replace = (id: string, replacement: PageNavLink, navItems: PageNavLink[]): PageNavLink => {
    let parentList: PageNavLink[] = navItems;
    let replacedLink = null;
    id.split('_').map(indexStr => Number.parseInt(indexStr)).forEach((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        replacedLink = parentList.splice(itemIndex, 1, replacement)[0];
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
    return replacedLink;
  }

  const swap = (navLink: PageNavLink, sourceId: string, destinationId: string): PageNavLink[] => {
    const newNavItems = cloneDeep(navLinks);

    // Replace Destination
    const destinationLink = replace(destinationId, navLink, newNavItems);

    // Replace Source
    replace(sourceId, destinationLink, newNavItems);

    return newNavItems;
  };

  const moveUp = (navItem: NavItem): void => {
    const newNavItems = swap(navItem.item, navItem.id, navItem.prevId);
    console.log(`moveUp`, newNavItems);
    onNavLinksChange(newNavItems);
  };

  const moveDown = (navItem: NavItem): void => {
    const newNavItems = swap(navItem.item, navItem.id, navItem.nextId);
    console.log(`moveDown`, newNavItems);
    onNavLinksChange(newNavItems);
  };

  const edit = (navItem: NavItem): void => {
    setActiveItem(navItem);
    setEditLinkOpen(true);
  };

  const onEditCancel = () => {
    setEditLinkOpen(false);
    setActiveItem(null);
  }

  const onEditSave = (navLink: PageNavLink) => {
    const newNavItems = cloneDeep(navLinks);
    replace(activeItem.id, navLink, newNavItems);
    onNavLinksChange(newNavItems);
    setEditLinkOpen(false);
  }

  const addBelow = (pageNavLink: PageNavLink): void => {

  };


  const buildIndex = (navLink: PageNavLink, index: number, maxIndex: number, depth: number, parentId?: string): NavItem => {
    const parent = parentId ? `${parentId}_` : '';
    const current = `${parent}${index}`;

    return {
      item: navLink,
      id: current,
      nextId: (index < maxIndex) ? `${parent}${index + 1}` : null,
      prevId: (index > 0) ? `${parent}${index - 1}` : null,
      depth,
      children: !navLink.children ? undefined : navLink.children.map((childNavLink, childIndex) => {
        return buildIndex(childNavLink, childIndex, navLink.children.length - 1, depth + 1, current);
      })
    }
  };

  const navItems: NavItem[] = useMemo(() => {
    return cloneDeep(navLinks).map((topNavLink, index) => {
      return buildIndex(topNavLink, index, navLinks.length - 1, 1);
    })
  }, [ navLinks ]);


  const renderLevel = (navItem: NavItem): JSX.Element => {
    const buttonStyles: IButtonStyles = { root: styles.navEditActionButton };

    return <>
      <Stack className={styles.navEditItemRow} horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 20 }}>
        <span>{navItem.item.title}</span>
        <Stack horizontal>
          <Stack className={styles.navEditButtonWrapper}>
            {navItem.prevId && <ActionButton styles={buttonStyles} onClick={() => moveUp(navItem)} iconProps={{ iconName: 'Up' }} />}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            {navItem.nextId && <ActionButton styles={buttonStyles} onClick={() => moveDown(navItem)} iconProps={{ iconName: 'Down' }} />}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            <ActionButton styles={buttonStyles} onClick={() => edit(navItem)} iconProps={{ iconName: 'Edit' }} />
          </Stack>
          {/* <ActionButton styles={buttonStyles} iconProps={{ iconName: 'Add' }} /> */}
        </Stack>
      </Stack>
      <Stack className={styles.navEditLevel}>
        {navItem.children && navItem.children.map(subNavItem => renderLevel(subNavItem))}
      </Stack>
    </>;
  };


  return (
    <Stack className={styles.navEditInnerContainer}>
      {navItems.map(topNavLink => renderLevel(topNavLink))}
      <NavLinkModal
        isOpen={isEditLinkOpen}
        navLink={activeItem ? activeItem.item : null}
        onCancel={onEditCancel}
        onSave={onEditSave}
      />
    </Stack>
  );
}

export default NavEditor;
