import * as React from 'react';
import { useMemo, useState } from 'react';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import styles from '../PageNavigation.module.scss';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import NavLinkModal from './NavLinkModal';
import { ActionButton, PrimaryButton } from '@fluentui/react/lib/Button';

const MAX_DEPTH = 4;

export interface INavEditorProps {
  navLinks: PageNavLink[];
  onNavLinksChange: (newNavLinks: PageNavLink[]) => void;
}

type NavIndex = {
  id: string;
  nextId?: string;
  prevId?: string;
  parentId?: string;
  depth?: number;
  isLast?: boolean;
  isFirst?: boolean;
}

const NavEditor: React.FC<INavEditorProps> = ({ navLinks, onNavLinksChange }) => {
  const [ isEditLinkOpen, setEditLinkOpen ] = useState<boolean>();
  const [ itemBeingEdited, setItemBeingEdited ] = useState<{
    index: NavIndex,
    link: PageNavLink,
    newLink: null | 'AddChild' | 'AddAbove' | 'AddBelow'
  }>(null);

  const { navIndexes, navIndexesList } = useMemo<{
    navIndexes: { [id: string]: NavIndex },
    navIndexesList: NavIndex[],
  }>(() => {
    let indexes: { [id: string]: NavIndex } = {};
    let indexesList: NavIndex[] = [];

    const buildNavIndex = (navLink: PageNavLink, index: number, maxIndex: number, depth: number, parentId?: string): void => {
      const parent = parentId ? `${parentId}_` : '';
      const currentId = `${parent}${index}`;
      let navIndex: NavIndex = {
        id: currentId,
        nextId: (index < maxIndex) ? `${parent}${index + 1}` : null,
        prevId: (index > 0) ? `${parent}${index - 1}` : null,
        parentId,
        depth,
        isFirst: false,
        isLast: false,
      };
      indexes[currentId] = navIndex;
      indexesList.push(navIndex);
      if (navLink && navLink.children) {
        navLink.children.map((childNavLink, childIndex) => {
          return buildNavIndex(childNavLink, childIndex, navLink.children.length - 1, depth + 1, currentId);
        });
      }
    };
    navLinks.map((navLink, index) => buildNavIndex(navLink, index, navLinks.length - 1, 1));
    if (indexesList.length > 0) {
      indexesList[0].isFirst = true;
      indexes[indexesList[0].id].isFirst = true;
      indexesList[indexesList.length - 1].isLast = true;
      indexes[indexesList[indexesList.length - 1].id].isLast = true;
    }
    return { navIndexes: indexes, navIndexesList: indexesList };
  }, [ navLinks ]);

  const cloneNavLinks = (): PageNavLink[] => cloneDeep(navLinks);

  const interpretId = (id: string): number[] => id.split('_').map(idx => Number.parseInt(idx));

  const lookup = (id: string, navLinks: PageNavLink[]): PageNavLink => {
    let parentList: PageNavLink[] = navLinks;
    let target: PageNavLink = null;
    interpretId(id).map((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        target = parentList[itemIndex];
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
    return target;
  }

  const replace = (id: string, replacement: PageNavLink, navLinks: PageNavLink[]): PageNavLink => {
    let parentList: PageNavLink[] = navLinks;
    let replacedLink = null;
    const idList = interpretId(id);
    idList.map((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        let replacementArr = replacement ? [ replacement ] : [];
        replacedLink = parentList.splice(itemIndex, 1, ...replacementArr)[0];
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
    flattenChildrenPastDepth(navLinks[idList[0]], navLinks, MAX_DEPTH);
    return replacedLink;
  };

  const insert = (navLink: PageNavLink, targetId: string, offset: number, navLinks: PageNavLink[]): void => {
    let parentList: PageNavLink[] = navLinks;
    const idList = interpretId(targetId);
    idList.map((itemIndex, depthIndex, itemIndexes) => {
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
    flattenChildrenPastDepth(navLinks[idList[0]], navLinks, MAX_DEPTH);
  };

  const insertChild = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[], insertAsFirstChild: boolean = false): void => {
    let parentList: PageNavLink[] = navLinks;
    const idList = interpretId(targetId);
    idList.map((itemIndex, depthIndex, itemIndexes) => {
      if (itemIndexes.length - 1 === depthIndex) {
        parentList[itemIndex].children = parentList[itemIndex].children || [];
        if (insertAsFirstChild) {
          parentList[itemIndex].children.splice(0, 0, navLink);
        }
        else {
          parentList[itemIndex].children.push(navLink);
        }
      }
      else {
        parentList = parentList[itemIndex].children;
      }
    });
    flattenChildrenPastDepth(navLinks[idList[0]], navLinks, MAX_DEPTH);
  };

  const flattenChildrenPastDepth = (navLink: PageNavLink, navLinks: PageNavLink[], maxDepth: number, currentDepth: number = 1): PageNavLink[] => {
    let flattenedChildren: PageNavLink[] = [];
    if (navLink && navLink.children) {
      navLink.children.map((childLink, childLinkIndex) => {
        if (currentDepth >= maxDepth - 1 && childLink.children) {
          navLink.children.splice(childLinkIndex + 1, 0, ...cloneDeep(childLink.children));
          delete childLink.children;
        }
        flattenChildrenPastDepth(childLink, navLinks, maxDepth, currentDepth + 1);
      });
    }
    return flattenedChildren;
  };

  const insertBefore = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[]): void => insert(navLink, targetId, 0, navLinks);

  const insertAfter = (navLink: PageNavLink, targetId: string, navLinks: PageNavLink[]): void => insert(navLink, targetId, 1, navLinks);

  const swap = (sourceId: string, destinationId: string, navLinks: PageNavLink[]): PageNavLink[] => {
    const sourceLink = lookup(sourceId, navLinks);
    const destinationLink = replace(destinationId, sourceLink, navLinks);
    replace(sourceId, destinationLink, navLinks);
    return navLinks;
  };

  const moveUp = (navIndex: NavIndex): void => {
    let newNavLinks = cloneNavLinks();
    const navIndexIndex = navIndexesList.findIndex(idx => idx.id === navIndex.id);
    const linearPrevNavIndex = navIndexesList[navIndexIndex - 1];

    if (linearPrevNavIndex) {
      // linear previous and sibling previous are same, swap
      if (linearPrevNavIndex.id === navIndex.prevId) {
        newNavLinks = swap(navIndex.id, navIndex.prevId, newNavLinks);
      }
      else {
        let navLink = replace(navIndex.id, null, newNavLinks);

        // linear previous and parent are same, insert before parent
        if (linearPrevNavIndex.id === navIndex.parentId) {
          insertBefore(navLink, navIndex.parentId, newNavLinks);
        }
        // insert after linear previous
        else {
          insertAfter(navLink, linearPrevNavIndex.id, newNavLinks);
        }
      }
      onNavLinksChange(newNavLinks);
    }
  };

  const moveDown = (navIndex: NavIndex): void => {
    let newNavLinks = cloneNavLinks();
    const navIndexIndex = navIndexesList.findIndex(idx => idx.id === navIndex.id);
    const linearNextNavIndex = navIndexesList[navIndexIndex + 1];

    if ((linearNextNavIndex && linearNextNavIndex.id === navIndex.nextId) || !navIndex.parentId) {
      newNavLinks = swap(navIndex.id, navIndex.nextId, newNavLinks);
    }
    else {
      let navLink = replace(navIndex.id, null, newNavLinks);

      // linear previous and parent are same, insert before parent
      if (linearNextNavIndex && linearNextNavIndex.id === navIndex.parentId) {
        insertBefore(navLink, linearNextNavIndex.id, newNavLinks);
      }
      else {
        insertAfter(navLink, navIndex.parentId, newNavLinks);
      }
    }
    onNavLinksChange(newNavLinks);
  };

  const promote = (navIndex: NavIndex, after: boolean = false): void => {
    let newNavLinks = cloneNavLinks();
    const currentItem = replace(navIndex.id, null, newNavLinks);
    if (after) {
      insertAfter(currentItem, navIndex.parentId, newNavLinks);
    }
    else {
      insertBefore(currentItem, navIndex.parentId, newNavLinks);
    }
    onNavLinksChange(newNavLinks);
  };

  const demote = (navIndex: NavIndex): void => {
    let newNavLinks = cloneNavLinks();
    const currentItem = replace(navIndex.id, null, newNavLinks);
    insertChild(currentItem, navIndex.prevId, newNavLinks);
    onNavLinksChange(newNavLinks);
  };

  const remove = (navIndex: NavIndex): void => {
    let newNavLinks = cloneNavLinks();
    replace(navIndex.id, null, newNavLinks);
    onNavLinksChange(newNavLinks);
  }

  const add = (navIndex: NavIndex): void => {
    setItemBeingEdited({
      link: { title: '', url: '' },
      index: navIndex,
      newLink: 'AddBelow'
    });
    setEditLinkOpen(true);
  };

  const addChild = (navIndex: NavIndex): void => {
    setItemBeingEdited({
      link: { title: '', url: '' },
      index: navIndex,
      newLink: 'AddChild'
    });
    setEditLinkOpen(true);
  };

  const edit = (navLink: PageNavLink, navIndex: NavIndex): void => {
    setItemBeingEdited({
      link: navLink,
      index: navIndex,
      newLink: null
    });
    setEditLinkOpen(true);
  };

  const onLinkModalCancel = () => {
    setEditLinkOpen(false);
    setItemBeingEdited(null);
  };

  const onLinkModalSave = (newOrUpdatedNavLink: PageNavLink) => {
    const newNavItems = cloneDeep(navLinks);

    if (!itemBeingEdited.index) {
      newNavItems.push(newOrUpdatedNavLink);
    }
    else {
      switch (itemBeingEdited.newLink) {
        case 'AddAbove': insertBefore(newOrUpdatedNavLink, itemBeingEdited.index.id, newNavItems); break;
        case 'AddBelow': insertAfter(newOrUpdatedNavLink, itemBeingEdited.index.id, newNavItems); break;
        case 'AddChild': insertChild(newOrUpdatedNavLink, itemBeingEdited.index.id, newNavItems, true); break;
        default: replace(itemBeingEdited.index.id, newOrUpdatedNavLink, newNavItems);
      }
    }

    onNavLinksChange(newNavItems);
    setEditLinkOpen(false);
  };

  const renderLink = (navLink: PageNavLink, id: string): JSX.Element => {
    const navIndex = navIndexes[id];

    let overflowItems: ICommandBarItemProps[] = [];
    if (navIndex.depth < MAX_DEPTH) {
      overflowItems.push({ key: 'addChild', text: 'Add sub link', iconProps: { iconName: 'Add' }, onClick: () => addChild(navIndex) });
    }
    overflowItems.push({ key: 'remove', text: 'Remove link', iconProps: { iconName: 'Delete' }, onClick: () => remove(navIndex) });
    if (navIndex.depth > 1) {
      overflowItems.push({ key: 'promote', text: 'Promote sub link', iconProps: { iconName: 'Back' }, onClick: () => promote(navIndex, true) });
    }
    if (navIndex.depth < MAX_DEPTH && navIndex.prevId) {
      overflowItems.push({ key: 'demote', text: 'Make sub link', iconProps: { iconName: 'Forward' }, onClick: () => demote(navIndex) });
    }

    return <>
      <Stack className={styles.navEditItemRow} horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 20 }}>
        <span className={styles.navEditItemText} title={navLink.title}>{navLink.title}</span>
        <CommandBar
          items={[
            { key: 'add', iconOnly: true, ariaLabel: 'Add Link', iconProps: { iconName: 'Add' }, onClick: () => add(navIndex) },
            { key: 'up', disabled: navIndex.isFirst, ariaLabel: 'Move Up', iconOnly: true, iconProps: { iconName: 'Up' }, onClick: () => moveUp(navIndex) },
            { key: 'down', disabled: navIndex.depth === 1 && navIndex.isLast, ariaLabel: 'Move Down', iconOnly: true, iconProps: { iconName: 'Down' }, onClick: () => moveDown(navIndex) },
            { key: 'edit', iconOnly: true, ariaLabel: 'Edit Link', iconProps: { iconName: 'Edit' }, onClick: () => edit(navLink, navIndex) },
          ]}
          overflowItems={overflowItems}
          styles={{
            root: styles.navEditCommandBarRoot
          }}
        />
      </Stack>
      <Stack className={styles.navEditLevel}>
        {navLink.children && navLink.children.map((subNavItem, childItemIndex) => renderLink(subNavItem, `${id}_${childItemIndex}`))}
      </Stack>
    </>;
  };

  return (
    <>
      <Stack className={styles.navEditInnerContainer}>
        {navLinks.map((topNavLink, index) => renderLink(topNavLink, `${index}`))}
        {navLinks.length === 0 && (
          <ActionButton iconProps={{iconName: 'Add'}} onClick={() => add(null)}>Add Link</ActionButton>
        )}
      </Stack>
      {itemBeingEdited &&
        <NavLinkModal
          isOpen={isEditLinkOpen}
          navLink={itemBeingEdited.link}
          isAdd={!!itemBeingEdited.newLink}
          onCancel={onLinkModalCancel}
          onSave={onLinkModalSave}
        />
      }
    </>
  );
}

export default NavEditor;
