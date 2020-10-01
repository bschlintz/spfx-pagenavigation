import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import styles from '../PageNavigation.module.scss';
import { PrimaryButton } from '@fluentui/react/lib/Button';

export interface IPageNavigationProps {
  isEditable: boolean;
  onClickEnable: () => void;
}

const SetupMode: React.FC<IPageNavigationProps> = ({ isEditable, onClickEnable }) => {
  return (
    <Stack className={styles.enableNavContainer} horizontalAlign="center" verticalAlign="start" tokens={{ childrenGap: 10, padding: 10 }}>
      {isEditable
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
}

export default SetupMode;
