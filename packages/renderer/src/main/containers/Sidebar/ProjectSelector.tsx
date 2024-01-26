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
import type { Project } from './components/ProjectSelect';
import ProjectSelect from './components/ProjectSelect';

export default function ProjectSelector(props: {
  open: boolean;
  onSelected: (project: Project) => void;
  onOpenChange: (open: boolean) => void;
}) {
  if (!props.open) {
    return (
      <Button
        style={{ flex: 1 }}
        onClick={() => props.onOpenChange(true)}
        appearance="primary"
        shape="square"
      >
        打开目录
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
          打开目录
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            选择目录
          </DialogTitle>
          <DialogContent>
            <ProjectSelect onSelect={props.onSelected} />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
