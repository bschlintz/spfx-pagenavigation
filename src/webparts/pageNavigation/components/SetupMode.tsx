import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import styles from '../PageNavigation.module.scss';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { SecurityTrimmedControl, PermissionLevel } from "@pnp/spfx-controls-react/lib/SecurityTrimmedControl";
import { SPPermission } from '@microsoft/sp-page-context';
import PageNavService from '../../../services/PageNavService';

export interface IPageNavigationProps {
  service: PageNavService;
  onClickEnable: () => void;
}

const SetupMode: React.FC<IPageNavigationProps> = ({ service, onClickEnable }) => {
  return (
    <SecurityTrimmedControl
      context={service.context}
      level={PermissionLevel.remoteListOrLib}
      remoteSiteUrl={service.context.pageContext.web.absoluteUrl}
      relativeLibOrListUrl={`${service.context.pageContext.web.absoluteUrl}/lists/PageNavigation`}
      permissions={[SPPermission.editListItems]}
    >
      <Stack className={styles.enableNavContainer} horizontalAlign="center" verticalAlign="start" tokens={{ childrenGap: 20, padding: "25px 10px" }}>
        <span>To begin using the <b>Page Navigation</b> web part, please click the button below.</span>
        <PrimaryButton
          onClick={onClickEnable}
        >
          Enable Page Navigation
        </PrimaryButton>
      </Stack>
    </SecurityTrimmedControl>
  );
};

export default SetupMode;
