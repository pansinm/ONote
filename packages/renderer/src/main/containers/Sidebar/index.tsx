import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import useDimensions from '../../../hooks/useDimensions';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Directory from './Directory';
import type { Project } from './components/ProjectSelect';
import { useLocalStorage } from 'react-use';
import fileService from '../../services/fileService';
import ProjectSelector from './ProjectSelector';
import SettingTrigger from '../Setting/SettingTrigger';

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
      stores.activationStore.openNoteBook(project.type, project.rootUri);
      fileService.setRootDirUri(project.rootUri);
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
        <SettingTrigger />
        <ProjectSelector
          open={open}
          onOpenChange={setOpen}
          onSelected={handleSelect}
        />
      </Flex>
    </div>
  );
});
