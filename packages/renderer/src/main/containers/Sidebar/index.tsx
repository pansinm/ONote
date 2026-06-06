import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Directory from './Directory';
import type { Project } from './components/ProjectSelect';
import { useLocalStorage } from 'react-use';
import fileService from '../../services/fileService';
import ProjectSelector from './ProjectSelector';
import SettingTrigger from '../Setting/SettingTrigger';
import { useTranslation } from 'react-i18next';
import Pop from '/@/utils/Pop';

export default observer(function Sidebar() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useLocalStorage<
    | {
        type: 'local' | 'ssh' | 'gitee';
        config: any;
        rootUri: string;
      }
    | undefined
  >('project');

  const { t } = useTranslation('common');

  const handleSelect = async (project: Project) => {
    try {
      await fileService.connect(project.type, project.config);
      stores.activationStore.openNoteBook(project.type, project.rootUri);
      fileService.setRootDirUri(project.rootUri);
      setProject(project);
      setOpen(false);
    } catch (err) {
      Pop.showToast({
        message: t('projectConnectFailed'),
        type: 'error',
      });
      console.error('Failed to connect project', err);
    }
  };

  useEffect(() => {
    if (project) {
      handleSelect(project);
    }
  }, []);

  return (
    <div className={styles.Sidebar}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        <Directory />
      </div>
      <Flex gap="4px">
        <ProjectSelector open={open} onOpenChange={setOpen} onSelected={handleSelect} />
        <SettingTrigger />
      </Flex>
    </div>
  );
});
