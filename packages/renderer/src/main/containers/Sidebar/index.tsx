import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import useDimensions from '../../../hooks/useDimensions';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import Directory from './Directory';
import type { Project } from '../../components/ProjectSelect';
import ProjectSelect from '../../components/ProjectSelect';
import { useLocalStorage } from 'react-use';
import fileService from '../../services/fileService';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Button,
  DialogBody,
  DialogContent,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

export default observer(function ActivityBar() {
  const [ref] = useDimensions();
  const [open, setOpen] = useState(false);
  const [project, setProject] = useLocalStorage<
    | {
        type: 'local' | 'ssh';
        config: any;
        rootUri: string;
      }
    | undefined
  >('project');

  const handleSelect = async (project: Project) => {
    try {
      await fileService.connect(project.type, project.config);
      stores.activationStore.setRootUri(project.rootUri);
      setProject(project);
      setOpen(false);
    } catch (err) {
      //ignore {
    }
  };

  useEffect(() => {
    if (project) {
      handleSelect(project);
    }
  }, []);

  return (
    <div className={styles.Sidebar} ref={ref}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Directory />
      </div>
      <Flex justifyContent={'space-between'}>
        <Dialog
          open={open}
          onOpenChange={(e, { open: needOpen }) => setOpen(needOpen)}
        >
          <DialogTrigger>
            <Button
              style={{ flex: 1 }}
              appearance="primary"
              shape="square"
              onClick={async () => {
                setOpen(true);
              }}
            >
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
                <ProjectSelect onSelect={handleSelect} />
              </DialogContent>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        <Icon
          type="chevron-double-right"
          color="white"
          style={{ background: 'orange' }}
          onClick={() => {
            stores.activationStore.toggleSidebar();
          }}
        />
      </Flex>
    </div>
  );
});
