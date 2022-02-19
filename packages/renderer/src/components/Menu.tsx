import type { FC } from 'react';
import React from 'react';
import type { MenuProps as RMenuProps } from 'react-contexify';
import { Item, Menu as RMenu, Submenu } from 'react-contexify';

export interface MenuItem {
  id: string;
  title: React.ReactNode;
  data?: any;
  children?: MenuItem[];
}

export interface MenuProps {
  menuId: string;
  onClick(menu: MenuItem, props: RMenuProps): void;
  menus: MenuItem[];
}

const Menu: FC<MenuProps> = ({ menuId, menus, onClick }) => {
  const renderMenus = (menus: MenuItem[]) =>
    menus.map((menu) => {
      if (menu.children) {
        return (
          <Submenu label={menu.title}>{renderMenus(menu.children)}</Submenu>
        );
      }
      return (
        <Item
          key={menu.id}
          data={menu}
          onClick={({ data, props }) => {
            onClick(data, props);
          }}
        >
          {menu.title}
        </Item>
      );
    });
  return <RMenu id={menuId}>{renderMenus(menus)}</RMenu>;
};

export default Menu;
