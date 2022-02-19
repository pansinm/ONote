import React from 'react';
import ReactModal from 'react-modal';

export interface ModalProps {
  onRequestClose?(): void;
  shouldCloseOnEsc?: boolean;
  style?: React.CSSProperties;
  title?: string;
  isOpen: boolean;
}

const Modal: React.FC<ModalProps> = (props) => {
  return (
    <ReactModal
      shouldCloseOnEsc={props.shouldCloseOnEsc}
      isOpen={props.isOpen}
      style={{
        content: {
          width: '600px',
          maxWidth: '80%',
          display: 'flex',
          position: 'initial',
          ...props.style,
        },
        overlay: {
          background: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
      onRequestClose={props.onRequestClose}
      appElement={document.getElementById('app')!}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <h3>{props.title}</h3>
        {props.children}
      </div>
    </ReactModal>
  );
};

export default Modal;
