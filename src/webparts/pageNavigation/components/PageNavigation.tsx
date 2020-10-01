import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import PageNavService from '../../../services/PageNavService';
import styles from '../PageNavigation.module.scss';
import { Spinner } from '@fluentui/react';
import { PageNavItem } from '../../../models/PageNavItem';
import EditMode from './EditMode';
import SetupMode from './SetupMode';
import ViewMode from './ViewMode';

export interface IPageNavigationContainerProps {
  service: PageNavService;
}

export enum Mode {
  Loading,
  View,
  Edit,
  Setup,
  Error
}

const PageNavigation: React.FC<IPageNavigationContainerProps> = ({ service }) => {
  const [ pageNavItem, setPageNavItem ] = useState<PageNavItem>(null);
  const [ errorMessage, setErrorMessage ] = useState<string>(null);
  const [ userCanEdit, setUserCanEdit ] = useState<boolean>(true);
  const [ mode, setMode ] = useState<Mode>(Mode.Loading);
  const navLinks = pageNavItem ? pageNavItem.NavigationData : [];
  const navTitle = pageNavItem ? pageNavItem.Title : "";

  const load = async (ensureItem: boolean): Promise<void> => {
    try {
      setErrorMessage(null);
      const ensureResult = await service.ensureListItem(ensureItem);
      switch (ensureResult.type)
      {
        case "ItemMissing": setMode(Mode.Setup); break;
        case "Error": {
          setErrorMessage(ensureResult.errorMessage);
          setMode(Mode.Error);
          break;
        }
        default: {
          setPageNavItem(ensureResult.item);
          setMode(Mode.View);
        }
      }
    }
    catch (error) {
      console.log(`Unable to fetch page navigation links.`, error);
      setErrorMessage(error.message);
      setMode(Mode.Error);
    }
  }

  const save = async (newNavTitle: string, newNavLinks: PageNavLink[]): Promise<void> => {
    try {
      setMode(Mode.Loading);
      setErrorMessage(null);
      const updateResult = await service.updateListItem({
        ...pageNavItem,
        Title: newNavTitle,
        NavigationData: newNavLinks
      });
      if (updateResult.type === "Error") {
        setErrorMessage(updateResult.errorMessage);
        setMode(Mode.Error);
      }
      else if (updateResult.type === "ItemUpdated") {
        setPageNavItem(updateResult.item);
        setMode(Mode.View);
      }
    }
    catch (error) {
      console.log(`Unable to update page navigation links.`, error);
      setErrorMessage(error.message);
      setMode(Mode.Error);
    }
  }

  const onClickEdit = () => {
    setMode(Mode.Edit);
  }

  const onEditPanelSave = async (newNavTitle: string, newNavLinks: PageNavLink[]): Promise<void> => {
    setMode(Mode.Loading);
    await save(newNavTitle, newNavLinks);
  }

  const onEditPanelCancel = () => {
    setMode(Mode.View);
  }

  const onClickEnable = () => {
    setMode(Mode.Loading);
    load(true);
  }

  useEffect(() => {
    setMode(Mode.Loading);
    load(false);
  }, []);

  return (
    <div className={ styles.pageNavigationContainer }>
      {errorMessage && (
        <Stack>
          <span>{errorMessage}</span>
        </Stack>
      )}
      {mode === Mode.Loading && (
        <Spinner />
      )}
      {mode === Mode.Setup && (
        <SetupMode
          isEditable={userCanEdit}
          onClickEnable={onClickEnable}
        />
      )}
      {mode === Mode.View && (
        <ViewMode
          navTitle={navTitle}
          navLinks={navLinks}
          isEditable={userCanEdit}
          onClickEdit={onClickEdit}
        />
      )}
      {mode === Mode.Edit && (
        <EditMode
          navTitle={navTitle}
          navLinks={navLinks}
          onSave={onEditPanelSave}
          onCancel={onEditPanelCancel}
        />
      )}
    </div>
  );
}

export default PageNavigation;
