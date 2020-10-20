import * as React from 'react';
import { useState } from 'react';
import { PageNavLink } from '../../../models/PageNavLink';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Toggle } from '@fluentui/react/lib/Toggle';
import styles from '../PageNavigation.module.scss';

export interface INavLinkModalProps {
  navLink: PageNavLink;
  isOpen: boolean;
  isAdd: boolean;
  onCancel: () => void;
  onSave: (newOrUpdatedNavLink: PageNavLink) => void;
}
const INVALID_URL_MESSAGE = "Invalid: URL must start with /, http://, or https://";

const NavLinkModal: React.FC<INavLinkModalProps> = ({ navLink, isOpen, isAdd, onSave, onCancel }) => {
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ localNavLink, setLocalNavLink ] = useState<PageNavLink>(navLink);
  const [ urlValidationError, setUrlValidationError ] = useState<string>(null);

  const isValidUrl = (url: string): boolean => {
    try {
      if (url.startsWith('/')) return true;
      if (url.startsWith('https://')) return true;
      if (url.startsWith('http://')) return true;
    }
    catch {
      return false;
    }
  };

  const onTitleChange = (event: any, newValue: string) => {
    setLocalNavLink({
      ...localNavLink,
      title: newValue
    });
    setHasChanges(true);
  };

  const onUrlChange = (event: any, newValue: string) => {
    setLocalNavLink({
      ...localNavLink,
      url: newValue
    });
    setUrlValidationError(isValidUrl(newValue) ? null: INVALID_URL_MESSAGE);
    setHasChanges(true);
  };

  const onNewTabChange = (event: any, newValue: boolean) => {
    setLocalNavLink({
      ...localNavLink,
      newTab: newValue
    });
    setHasChanges(true);
  };

  const onExpandChildrenChange = (event: any, newValue: boolean) => {
    setLocalNavLink({
      ...localNavLink,
      childrenExpanded: newValue
    });
    setHasChanges(true);
  };

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
        title: `${isAdd ? 'Add' : 'Edit'} Link`
      }}
      minWidth={400}
    >
      {localNavLink && <>
        <Stack tokens={{ childrenGap: 10 }}>
          <TextField label="Title" value={localNavLink.title} onChange={onTitleChange} />
          <TextField label="URL" value={localNavLink.url} onChange={onUrlChange} errorMessage={urlValidationError} />
          <Toggle
            label="Open In New Tab"
            checked={typeof(localNavLink.newTab) === "undefined" ? false : localNavLink.newTab}
            onChange={onNewTabChange}
          />
          {localNavLink.children && (
            <Toggle
              label="Always Expand Children"
              checked={typeof(localNavLink.childrenExpanded) === "undefined" ? true : localNavLink.childrenExpanded}
              onChange={onExpandChildrenChange}
            />
          )}
          <Stack horizontal horizontalAlign="end" tokens={{ padding: '10px 0 0 0', childrenGap: 10 }}>
            <DefaultButton onClick={onCancel}>Cancel</DefaultButton>
            {/* Can save when
              1) there are changes
              2) the title and url fields are not blank
              3) the url field is a valid http URL
            */}
            <PrimaryButton disabled={!hasChanges || !localNavLink.title || !localNavLink.url || !!urlValidationError} onClick={onClickSave}>Save</PrimaryButton>
          </Stack>
        </Stack>
      </>}
    </Dialog>
  );
};

export default NavLinkModal;
