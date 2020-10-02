import * as React from 'react';
import styles from '../PageNavigation.module.scss';
import { ActionButton, IButtonStyles } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import { useMemo, useState } from 'react';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import NavLinkModal from './NavLinkModal';

const MAX_DEPTH = 4;

export interface INavEditorProps {
  navLinks: PageNavLink[];
  onNavLinksChange: (newNavLinks: PageNavLink[]) => void;
}

type NavIndex = {
  id: string;
  nextId: string;
  prevId: string;
  parentId: string;
  depth: number;
}

const NavEditor: React.FC<INavEditorProps> = ({ navLinks, onNavLinksChange }) => {
  const [ isEditLinkOpen, setEditLinkOpen ] = useState<boolean>();
  const [ itemBeingEdited, setItemBeingEdited ] = useState<{
    index: NavIndex,
    link: PageNavLink
  }>(null);

  const navIndexes: NavIndex[] = useMemo(() => {
    let indexes: NavIndex[] = [];
    const buildNavIndex = (navLink: PageNavLink, index: number, maxIndex: number, depth: number, parentId?: string): void => {
      const parent = parentId ? `${parentId}_` : '';
      const currentId = `${parent}${index}`;
      indexes.push({
        id: currentId,
        nextId: (index < maxIndex) ? `${parent}${index + 1}` : null,
        prevId: (index > 0) ? `${parent}${index - 1}` : null,
        parentId,
        depth,
      });
      !(navLink && navLink.children) ? undefined : navLink.children.map((childNavLink, childIndex) => {
        return buildNavIndex(childNavLink, childIndex, navLink.children.length - 1, depth + 1, currentId);
      })
    };
    navLinks.map((navLink, index) => buildNavIndex(navLink, index, navLinks.length - 1, 1));

    return indexes;
  }, [ navLinks ]);

  const navIndexesMap: { [id: string]: NavIndex } = useMemo(() =>{
    return navIndexes.reduce((indexMap, index) => {
      indexMap[index.id] = index;
      return indexMap;
    }, {})
  }, [navIndexes]);

  console.log(`navIndexes`, navIndexes);

  const cloneNavLinks = (): PageNavLink[] => cloneDeep(navLinks);

  const replace = (id: string, replacement: PageNavLink, navLinks: PageNavLink[]): PageNavLink => {
    let parentList: PageNavLink[] = navLinks;
    let replacedLink = null;
    id.split('_').map(indexStr => Number.parseInt(indexStr)).forEach((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        let replacementArr = replacement ? [ replacement ] : [];
        replacedLink = parentList.splice(itemIndex, 1, ...replacementArr)[0];
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
    return replacedLink;
  }

  const insert = (navLink: PageNavLink, targetId: string, offset: number, navLinks: PageNavLink[]): void => {
    let parentList: PageNavLink[] = navLinks;
    targetId.split('_').map(indexStr => Number.parseInt(indexStr)).forEach((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        const itemsAfterInsert = parentList.slice(itemIndex + offset);
        parentList.splice(itemIndex + offset, itemsAfterInsert.length, ...[
          navLink,
          ...itemsAfterInsert
        ]);
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
  }

  const insertChild = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[]): void => {
    let parentList: PageNavLink[] = navLinks;
    targetId.split('_').map(indexStr => Number.parseInt(indexStr)).forEach((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        parentList[itemIndex].children = parentList[itemIndex].children || [];
        parentList[itemIndex].children.push(navLink);
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
  }

  const insertBefore = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[]): void => insert(navLink, targetId, 0, navLinks);

  const insertAfter = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[]): void => insert(navLink, targetId, 1, navLinks);

  const swap = (navLink: PageNavLink, sourceId: string, destinationId: string, navLinks: PageNavLink[]): PageNavLink[] => {
    const destinationLink = replace(destinationId, navLink, navLinks);
    replace(sourceId, destinationLink, navLinks);
    return navLinks;
  };

  const moveUp = (navLink: PageNavLink, navIndex: NavIndex): void => {
    if (navIndex.prevId) {
      let newNavLinks = cloneNavLinks();
      const newNavItems = swap(navLink, navIndex.id, navIndex.prevId, newNavLinks);
      onNavLinksChange(newNavItems);
    }
  };

  const moveDown = (navLink: PageNavLink, navIndex: NavIndex): void => {
    if (navIndex.nextId) {
      let newNavLinks = cloneNavLinks();
      swap(navLink, navIndex.id, navIndex.nextId, newNavLinks);
      onNavLinksChange(newNavLinks);
    }
  };

  const promote = (navLink: PageNavLink, navIndex: NavIndex): void => {
    let newNavLinks = cloneNavLinks();
    const currentItem = replace(navIndex.id, null, newNavLinks);
    insertAfter(currentItem, navIndex.parentId, newNavLinks);
    console.log(`promote`, newNavLinks);
    onNavLinksChange(newNavLinks);
  }

  const demote = (navLink: PageNavLink, navIndex: NavIndex): void => {
    console.log(`demote navIndex`, navIndex);
    let newNavLinks = cloneNavLinks();
    const currentItem = replace(navIndex.id, null, newNavLinks);
    insertChild(currentItem, navIndex.prevId, newNavLinks);
    console.log(`demote`, newNavLinks);
    onNavLinksChange(newNavLinks);
  }

  // const edit = (navItem: NavItem): void => {
  const edit = (link: PageNavLink, index: NavIndex): void => {
    setItemBeingEdited({ link, index });
    setEditLinkOpen(true);
  };

  const onEditCancel = () => {
    setEditLinkOpen(false);
    setItemBeingEdited(null);
  }

  const onEditSave = (navLink: PageNavLink) => {
    const newNavItems = cloneDeep(navLinks);
    replace(itemBeingEdited.index.id, navLink, newNavItems);
    onNavLinksChange(newNavItems);
    setEditLinkOpen(false);
  }

  const addBelow = (pageNavLink: PageNavLink): void => {

  };

  const renderLevel = (navLink: PageNavLink, itemIndex: string): JSX.Element => {
    const buttonStyles: IButtonStyles = { root: styles.navEditActionButton };
    const navIndex = navIndexesMap[itemIndex];

    return <>
      <Stack className={styles.navEditItemRow} horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 20 }}>
        <span title={itemIndex}>{navLink.title}</span>
        <Stack horizontal>
          <Stack className={styles.navEditButtonWrapper}>
            {(navIndex.depth > 1) && (
              <ActionButton styles={buttonStyles} onClick={() => promote(navLink, navIndex)} iconProps={{ iconName: 'Back' }} />
            )}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            {(navIndex.prevId) && (
              <ActionButton styles={buttonStyles} onClick={() => moveUp(navLink, navIndex)} iconProps={{ iconName: 'Up' }} />
            )}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            {(navIndex.nextId) && (
              <ActionButton styles={buttonStyles} onClick={() => moveDown(navLink, navIndex)} iconProps={{ iconName: 'Down' }} />
            )}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            {(navIndex.depth < MAX_DEPTH && navIndex.prevId) && (
              <ActionButton styles={buttonStyles} onClick={() => demote(navLink, navIndex)} iconProps={{ iconName: 'Forward' }} />
            )}
          </Stack>
          <Stack className={styles.navEditButtonWrapper}>
            <ActionButton styles={buttonStyles} onClick={() => edit(navLink, navIndex)} iconProps={{ iconName: 'Edit' }} />
          </Stack>
          {/* <ActionButton styles={buttonStyles} iconProps={{ iconName: 'Add' }} /> */}
        </Stack>
      </Stack>
      <Stack className={styles.navEditLevel}>
        {navLink.children && navLink.children.map((subNavItem, childItemIndex) => renderLevel(subNavItem, `${itemIndex}_${childItemIndex}`))}
      </Stack>
    </>;
  };


  return (
    <Stack className={styles.navEditInnerContainer}>
      {navLinks.map((topNavLink, index) => renderLevel(topNavLink, `${index}`))}
      <NavLinkModal
        isOpen={isEditLinkOpen}
        navLink={itemBeingEdited ? itemBeingEdited.link : null}
        onCancel={onEditCancel}
        onSave={onEditSave}
      />
    </Stack>
  );
}

export default NavEditor;
