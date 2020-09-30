import * as React from 'react';
import { useState } from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { Stack } from '@fluentui/react/lib/Stack';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { PageNavLink } from '../../../models/PageNavLink';

export interface IEditPanelProps {
  navLinks: PageNavLink[];
  isOpen: boolean;
  onCancel: () => void;
  onSave: (newNavLinks: PageNavLink[]) => void;
}

const EditPanel: React.FC<IEditPanelProps> = ({ navLinks, isOpen, onSave, onCancel }) => {
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ localNavLinks, setLocalNavLinks ] = useState<PageNavLink[]>(navLinks);
  const [ isSaving, setIsSaving ] = useState<boolean>(false);

  React.useEffect(() => {
    setLocalNavLinks(navLinks);
  }, [ navLinks, isOpen ])

  const onClickSave = async () => {
    setIsSaving(true);
    await onSave(localNavLinks);
    setIsSaving(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onCancel}
    >
      {isOpen && (
        <Stack tokens={{padding: 15, childrenGap: 10}}>
          <textarea disabled={isSaving} value={JSON.stringify(localNavLinks)} onChange={(evt) => {
            setHasChanges(true);
            setLocalNavLinks(JSON.parse(evt.target.value));
          }} rows={16}/>
          <Stack horizontal horizontalAlign="end" tokens={{childrenGap: 10 }}>
            <DefaultButton disabled={isSaving} onClick={onCancel}>Cancel</DefaultButton>
            <PrimaryButton disabled={!hasChanges || isSaving} onClick={onClickSave}>Save</PrimaryButton>
          </Stack>
        </Stack>
      )}
    </Modal>
  )
}

export default EditPanel;
