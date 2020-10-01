import * as React from 'react';
import { useState } from 'react';
import { PageNavLink } from '../../../models/PageNavLink';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { generate as makeShortId } from 'short-uuid';
import NavEditor from './NavEditor';
import styles from '../PageNavigation.module.scss';

export interface IEditPanelProps {
  navTitle: string;
  navLinks: PageNavLink[];
  isOpen: boolean;
  onCancel: () => void;
  onSave: (newNavTitle: string, newNavLinks: PageNavLink[]) => void;
}

const EditPanel: React.FC<IEditPanelProps> = ({ navTitle, navLinks, isOpen, onSave, onCancel }) => {
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ localNavTitle, setLocalNavTitle ] = useState<string>("");
  const [ localNavLinks, setLocalNavLinks ] = useState<PageNavLink[]>(navLinks);
  const [ isSaving, setIsSaving ] = useState<boolean>(false);

  const onNavTitleChange = (event: any, newValue: string) => {
    setLocalNavTitle(newValue);
    setHasChanges(true);
  }

  const onNavLinksChange = (navLinks: PageNavLink[]) => {
    setLocalNavLinks(navLinks);
    setHasChanges(true);
  }

  const onClickSave = async () => {
    setIsSaving(true);
    await onSave(localNavTitle, mapRemoveIds(localNavLinks));
    setIsSaving(false);
  };

  const mapAddIds = (links: PageNavLink[]): PageNavLink[] => {
    return links.map<PageNavLink>((link: PageNavLink) => ({
      ...link,
      id: makeShortId(),
      children: link.children ? mapAddIds(link.children) : undefined
    }));
  };

  const mapRemoveIds = (links: PageNavLink[]): PageNavLink[] => {
    return links.map<PageNavLink>((link: PageNavLink) => ({
      ...link,
      id: undefined,
      children: link.children ? mapAddIds(link.children) : undefined
    }));
  };

  React.useEffect(() => {
    setLocalNavTitle(navTitle);
    setLocalNavLinks(mapAddIds(navLinks));
  }, [ navTitle, navLinks, isOpen ]);

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onCancel}
      isBlocking={true}
      styles={{
        main: styles.navEditPanel
      }}
      dialogContentProps={{
        type: DialogType.close,
        title: 'Edit Page Navigation'
      }}
    >
      {isOpen && <>
        <Stack tokens={{ padding: 15, childrenGap: 10 }}>
          <TextField label="Navigation Title" value={localNavTitle} onChange={onNavTitleChange} />
          <NavEditor navLinks={localNavLinks} onNavLinksChange={onNavLinksChange}/>
        </Stack>
        <DialogFooter>
          <Stack horizontal horizontalAlign="end" tokens={{childrenGap: 10 }}>
            <DefaultButton disabled={isSaving} onClick={onCancel}>Cancel</DefaultButton>
            <PrimaryButton disabled={!hasChanges || isSaving} onClick={onClickSave}>Save</PrimaryButton>
          </Stack>
        </DialogFooter>
      </>}
    </Dialog>
  )
}

export default EditPanel;
