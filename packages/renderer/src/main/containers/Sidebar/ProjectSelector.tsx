import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  FolderOpenRegular,
} from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from './components/ProjectSelect';
import ProjectSelect from './components/ProjectSelect';

export default function ProjectSelector(props: {
  open: boolean;
  onSelected: (project: Project) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('common');
  if (!props.open) {
    return (
      <Button
        icon={<FolderOpenRegular />}
        onClick={() => props.onOpenChange(true)}
        appearance="subtle"
        shape="square"
        title={t('openDirectory')}
      />
    );
  }
  return (
    <Dialog
      open={props.open}
      onOpenChange={(e, { open: needOpen }) => props.onOpenChange(needOpen)}
    >
      <DialogTrigger>
        <Button
          icon={<FolderOpenRegular />}
          appearance="subtle"
          shape="square"
          title={t('openDirectory')}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label={t('close')}
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            {t('selectDirectory')}
          </DialogTitle>
          <DialogContent>
            <ProjectSelect onSelect={props.onSelected} />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
