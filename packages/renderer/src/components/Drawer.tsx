import * as React from 'react';
import type { DrawerProps } from '@fluentui/react-components';
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Button,
  OverlayDrawer,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

type DrawerSeparatorExampleProps = {
  open: boolean;
  type?: 'inline' | 'overlay';
  title?: string;
  setOpen: (open: boolean) => void;
  position: DrawerProps['position'];
  className?: string;
  children?: React.ReactNode;
};

export const Drawer: React.FC<DrawerSeparatorExampleProps> = ({
  open,
  setOpen,
  type,
  position,
  children,
  title,
}) => {
  const DrawerComponent = type === 'inline' ? InlineDrawer : OverlayDrawer;
  return (
    <DrawerComponent
      separator
      position={position}
      open={open}
      onOpenChange={(_, { open }) => setOpen(open)}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              autoFocus={false}
              tabIndex={-1}
              icon={<Dismiss24Regular />}
              onClick={() => setOpen(false)}
            />
          }
        >
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>{children}</DrawerBody>
    </DrawerComponent>
  );
};
