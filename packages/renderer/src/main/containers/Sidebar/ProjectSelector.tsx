import {
  Dialog,
  DialogTrigger,
  Button,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
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
        style={{ flex: 1 }}
        onClick={() => props.onOpenChange(true)}
        appearance="primary"
        shape="square"
      >
        {t('openDirectory')}
      </Button>
    );
  }
  return (
    <Dialog
      open={props.open}
      onOpenChange={(e, { open: needOpen }) => props.onOpenChange(needOpen)}
    >
      <DialogTrigger>
        <Button style={{ flex: 1 }} appearance="primary" shape="square">
          {t('openDirectory')}
        </Button>
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
