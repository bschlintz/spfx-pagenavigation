import * as React from 'react';
import styles from '../PageNavigation.module.scss';
import { ActionButton, IButtonStyles } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';

export interface INavEditorProps {
  navLinks: PageNavLink[];
  onNavLinksChange: (newNavLinks: PageNavLink[]) => void;
}

const NavEditor: React.FC<INavEditorProps> = ({ navLinks, onNavLinksChange }) => {

  const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const moveUp = (navLink: PageNavLink, parentNavLink?: PageNavLink): void => {
    // const collection = parentNavLink ? parentNavLink.children : navLinks;
    // const navLinkIndex = collection.findIndex(cl => cl.id === navLink.id);
    // reorder(parentNavLink.children, navLinkIndex, navLinkIndex - 1);
    // onNavLinksChange(navLinks);
  };

  const moveDown = (navLink: PageNavLink, parentNavLink?: PageNavLink): void => {
    // const collection = parentNavLink ? parentNavLink.children : navLinks;
    // const navLinkIndex = collection.findIndex(cl => cl.id === navLink.id);
    // reorder(parentNavLink.children, navLinkIndex, navLinkIndex + 1);
    // onNavLinksChange(navLinks);
  };

  const edit = (pageNavLink: PageNavLink): void => {

  };

  const addBelow = (pageNavLink: PageNavLink): void => {

  };

  const renderNavItem = (navLink: PageNavLink, parentNavLink?: PageNavLink): JSX.Element => {
    return <>

    </>
  }

  const renderLevel = (navLink: PageNavLink, parentNavLink: PageNavLink, depth: number): JSX.Element => {
    const buttonStyles: IButtonStyles = { root: styles.navEditActionButton };

    return <>
      <Stack className={styles.navEditItemRow} horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 20 }}>
        <span>{navLink.title}</span>
        <Stack horizontal>
          <ActionButton styles={buttonStyles} onClick={() => moveUp(navLink, parentNavLink)} iconProps={{ iconName: 'Up' }} />
          <ActionButton styles={buttonStyles} onClick={() => moveDown(navLink, parentNavLink)} iconProps={{ iconName: 'Down' }} />
          <ActionButton styles={buttonStyles} iconProps={{ iconName: 'Edit' }} />
          <ActionButton styles={buttonStyles} iconProps={{ iconName: 'Add' }} />
        </Stack>
      </Stack>
      <Stack className={styles.navEditLevel}>
        {navLink.children && navLink.children.map(subNavLink => renderLevel(subNavLink, navLink, depth + 1))}
      </Stack>
    </>;
  };

  return (
    <Stack className={styles.navEditInnerContainer}>
      {navLinks.map(topNavLink => renderLevel(topNavLink, null, 1))}
    </Stack>
  );
}

export default NavEditor;
