import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { PageNavLink } from '../../../models/PageNavLink';
import PageNavService from '../../../services/PageNavService';
import styles from '../PageNavigation.module.scss';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
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
      {mode === Mode.Setup && (
        <SetupMode
          service={service}
          onClickEnable={onClickEnable}
        />
      )}
      {mode === Mode.View && (
        <ViewMode
          navTitle={navTitle}
          navLinks={navLinks}
          service={service}
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
      {mode === Mode.Loading && (
        <Stack tokens={{ childrenGap: 10 }}>
          <Shimmer shimmerElements={[
            { type: ShimmerElementType.line, width: '70%', height: 25 },
            { type: ShimmerElementType.gap, width: '31%' },
          ]} />
          {[1,2,3].map(_ => <>
            <Shimmer shimmerElements={[
              { type: ShimmerElementType.line, width: '60%', height: 20 },
              { type: ShimmerElementType.gap, width: '41%' },
            ]} />
            <Shimmer shimmerElements={[
              { type: ShimmerElementType.gap, width: '10%' },
              { type: ShimmerElementType.line, width: '70%' },
              { type: ShimmerElementType.gap, width: '21%' },
            ]} />
            <Shimmer shimmerElements={[
              { type: ShimmerElementType.gap, width: '20%' },
              { type: ShimmerElementType.line, width: '50%' },
              { type: ShimmerElementType.gap, width: '31%' },
            ]} />
            <Shimmer shimmerElements={[
              { type: ShimmerElementType.gap, width: '20%' },
              { type: ShimmerElementType.line, width: '30%' },
              { type: ShimmerElementType.gap, width: '52%' },
            ]} />
            <Shimmer shimmerElements={[
              { type: ShimmerElementType.gap, width: '30%' },
              { type: ShimmerElementType.line, width: '30%' },
              { type: ShimmerElementType.gap, width: '42%' },
            ]} />
          </>)}
        </Stack>
      )}
    </div>
  );
}

export default PageNavigation;
