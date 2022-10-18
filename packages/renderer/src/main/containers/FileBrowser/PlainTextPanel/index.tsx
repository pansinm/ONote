import type { FC } from 'react';
import React, { useRef } from 'react';
import MonacoEditor from '../../MonacoEditor/MonacoEditor';

interface PlainTextPanelProps {
  uri: string;
}

const PlainTextPanel: FC<PlainTextPanelProps> = (props) => {
  const ref = useRef<React.ElementRef<typeof MonacoEditor>>(null);
  return <MonacoEditor ref={ref} uri={props.uri} needLoad />;
};

export default PlainTextPanel;
