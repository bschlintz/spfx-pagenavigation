import * as React from 'react';
import { useState } from 'react';
import { PageNavLink } from '../../../models/PageNavLink';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Toggle } from '@fluentui/react/lib/Toggle';
import styles from '../PageNavigation.module.scss';

export interface INavLinkModalProps {
  navLink: PageNavLink;
  isOpen: boolean;
  onCancel: () => void;
  onSave: (newOrUpdatedNavLink: PageNavLink) => void;
}

const NavLinkModal: React.FC<INavLinkModalProps> = ({ navLink, isOpen, onSave, onCancel }) => {
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ localNavLink, setLocalNavLink ] = useState<PageNavLink>(navLink);

  const onTitleChange = (event: any, newValue: string) => {
    setLocalNavLink({
      ...localNavLink,
      title: newValue
    });
    setHasChanges(true);
  }

  const onUrlChange = (event: any, newValue: string) => {
    setLocalNavLink({
      ...localNavLink,
      url: newValue
    });
    setHasChanges(true);
  }

  const onNewTabChange = (event: any, newValue: boolean) => {
    setLocalNavLink({
      ...localNavLink,
      newTab: newValue
    });
    setHasChanges(true);
  }

  const onExpandChildrenChange = (event: any, newValue: boolean) => {
    setLocalNavLink({
      ...localNavLink,
      childrenExpanded: newValue
    });
    setHasChanges(true);
  }

  const onClickSave = async () => {
    onSave(localNavLink);
  };

  React.useEffect(() => {
    setLocalNavLink(navLink);
  }, [navLink]);

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.close,
        title: 'Edit Link'
      }}
      minWidth={400}
    >
      {localNavLink && <>
        <Stack tokens={{ padding: 15, childrenGap: 10 }}>
          <TextField label="Title" value={localNavLink.title} onChange={onTitleChange} />
          <TextField label="URL" value={localNavLink.url} onChange={onUrlChange} />
          <Toggle
            label="Open In New Tab"
            checked={typeof(localNavLink.newTab) === "undefined" ? false : localNavLink.newTab}
            onChange={onNewTabChange}
          />
          {localNavLink.children && (
            <Toggle
              label="Always Expand Children"
              checked={typeof(localNavLink.childrenExpanded) === "undefined" ? false : localNavLink.childrenExpanded}
              onChange={onExpandChildrenChange}
            />
          )}
        </Stack>
        <DialogFooter>
          <Stack horizontal horizontalAlign="end" tokens={{childrenGap: 10 }}>
            <DefaultButton onClick={onCancel}>Cancel</DefaultButton>
            <PrimaryButton disabled={!hasChanges || !localNavLink.title || !localNavLink.url} onClick={onClickSave}>Save</PrimaryButton>
          </Stack>
        </DialogFooter>
      </>}
    </Dialog>
  )
}

export default NavLinkModal;
