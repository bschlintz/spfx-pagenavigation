import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import PageNavService from '../../../services/PageNavService';
import styles from '../PageNavigation.module.scss';
import { PrimaryButton } from '@fluentui/react';
import EditPanel from './EditPanel';
import { PageNavItem } from '../../../models/PageNavItem';
import PageNavigation from './PageNavigation';

export interface IPageNavigationContainerProps {
  service: PageNavService;
}

const PageNavigationContainer: React.FC<IPageNavigationContainerProps> = ({ service }) => {
  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ pageNavItem, setPageNavItem ] = useState<PageNavItem>(null);
  const [ activeNavLinks, setActiveNavLinks ] = useState<PageNavLink[]>([]);
  const [ pageNavError, setPageNavError ] = useState<string>(null);
  const [ userCanEdit, setUserCanEdit ] = useState<boolean>(true);
  const [ showEditPanel, setShowEditPanel ] = useState<boolean>(false);
  const [ isItemMissing, setItemMissing ] = useState<boolean>(false);
  const navTitle = pageNavItem ? pageNavItem.Title : "";

  const load = async (ensureItem: boolean): Promise<void> => {
    try {
      setLoading(true);
      setPageNavError(null);
      setItemMissing(false);
      const ensureResult = await service.ensureListItem(ensureItem);
      switch (ensureResult.type)
      {
        case "ItemMissing": setItemMissing(true); break;
        case "Error": setPageNavError(ensureResult.errorMessage); break;
        default: {
          setPageNavItem(ensureResult.item);
          if (ensureResult.item) setActiveNavLinks(ensureResult.item.NavigationData);
        }
      }
    }
    catch (error) {
      console.log(`Unable to fetch page navigation links.`, error);
      setPageNavError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const save = async (newNavLinks: PageNavLink[]): Promise<void> => {
    try {
      setLoading(true);
      const updateResult = await service.updateListItem({
        ...pageNavItem,
        NavigationData: newNavLinks
      });
      if (updateResult.type === "Error") {
        setPageNavError(updateResult.errorMessage);
      }
      else if (updateResult.type === "ItemUpdated") {
        setPageNavItem(updateResult.item);
        if (updateResult.item) setActiveNavLinks(updateResult.item.NavigationData);
      }
      setLoading(false);
    }
    catch (error) {
      console.log(`Unable to update page navigation links.`, error);
      setPageNavError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const onClickEdit = () => {
    setShowEditPanel(true);
  }

  const onEditPanelSave = async (newNavLinks: PageNavLink[]): Promise<void> => {
    await save(newNavLinks);
    setShowEditPanel(false);
  }

  const onEditPanelCancel = () => {
    setShowEditPanel(false);
  }

  const onClickEnable = () => {
    load(true);
  }

  useEffect(() => {
    load(false);
  }, []);

  const renderItemMissing = (): JSX.Element => (
    <Stack className={styles.enableNavContainer} horizontalAlign="center" verticalAlign="start" tokens={{ childrenGap: 10, padding: 10 }}>
      {userCanEdit
        ? <>
            <PrimaryButton
              onClick={onClickEnable}
            >
              Enable Page Navigation
            </PrimaryButton>
            <span>Provision a list item in the 'Page Navigation' list for this page.</span>
          </>
        : <></>
      }
    </Stack>
  );

  return (
    <div className={ styles.pageNavigationContainer }>
      {pageNavError && (
        <Stack>
          <span>{pageNavError}</span>
        </Stack>
      )}
      {isItemMissing
        ? renderItemMissing()
        : <PageNavigation
            isEditable={userCanEdit}
            isLoading={isLoading}
            navLinks={activeNavLinks}
            navTitle={navTitle}
            onClickEdit={onClickEdit}
          />
      }
      <EditPanel
        navLinks={activeNavLinks}
        isOpen={showEditPanel}
        onSave={onEditPanelSave}
        onCancel={onEditPanelCancel}
      />
    </div>
  );
}

export default PageNavigationContainer;
