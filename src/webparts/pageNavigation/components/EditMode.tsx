import * as React from 'react';
import { useState } from 'react';
import { PageNavLink } from '../../../models/PageNavLink';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import NavEditor from './NavEditor';
import styles from '../PageNavigation.module.scss';

export interface IEditPanelProps {
  navTitle: string;
  navLinks: PageNavLink[];
  onCancel: () => void;
  onSave: (newNavTitle: string, newNavLinks: PageNavLink[]) => void;
}

const EditMode: React.FC<IEditPanelProps> = ({ navTitle, navLinks, onSave, onCancel }) => {
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
    await onSave(localNavTitle, localNavLinks);
    setIsSaving(false);
  };

  React.useEffect(() => {
    setLocalNavTitle(navTitle);
    setLocalNavLinks(navLinks);
    () => {
      setLocalNavTitle("");
      setLocalNavLinks([]);
    }
  }, [ navTitle, navLinks ]);

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <TextField styles={{field: styles.navEditPageNavField}} placeholder="Page Navigation" value={localNavTitle} onChange={onNavTitleChange} />
      <NavEditor navLinks={localNavLinks} onNavLinksChange={onNavLinksChange}/>
      <Stack horizontal horizontalAlign="end" tokens={{childrenGap: 10 }}>
        <DefaultButton disabled={isSaving} onClick={onCancel}>Cancel</DefaultButton>
        <PrimaryButton disabled={!hasChanges || isSaving} onClick={onClickSave}>Save</PrimaryButton>
      </Stack>
    </Stack>
  )
}

export default EditMode;
