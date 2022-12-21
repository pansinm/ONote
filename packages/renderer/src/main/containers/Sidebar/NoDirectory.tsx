import { makeStyles } from '@fluentui/react-components';
import { AnimalCatRegular } from '@fluentui/react-icons';
import type { FC, ReactNode } from 'react';
import React from 'react';

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#adadad',
    paddingLeft: '12px',
  },
});

const NoDirectory: FC<{ children: string }> = (props) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div>
        <AnimalCatRegular
          fontSize={100}
          primaryFill="#adadad"
        ></AnimalCatRegular>
        <p className={styles.text}>{props.children}</p>
      </div>
    </div>
  );
};

export default NoDirectory;
