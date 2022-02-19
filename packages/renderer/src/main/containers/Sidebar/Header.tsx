import type { FC } from 'react';
import React from 'react';
import styles from './Header.module.scss';
interface HeaderProps {
  title: React.ReactNode;
  prefix: React.ReactNode;
  suffix: React.ReactNode;
  onClick: () => void;
}

const Header: FC<HeaderProps> = (props) => {
  return (
    <div className={styles.Header}>
      <a href="#" className={styles.Title} onClick={props.onClick}>
        {props.prefix}
        {props.title}
      </a>
      {props.suffix}
    </div>
  );
};

export default Header;
