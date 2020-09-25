import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { Stack } from '@fluentui/react/lib/Stack';

export interface IEditPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const EditPanel: React.FC<IEditPanelProps> = ({isOpen, onDismiss}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      {isOpen && (
        <Stack tokens={{padding: 15}}>
          Hello Edit Panel
        </Stack>
      )}
    </Modal>
  )
}

export default EditPanel;
