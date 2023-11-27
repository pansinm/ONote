import React, { useEffect, useRef, useState } from 'react';
import type { Parent, Root } from 'mdast';
import footnoteDefinition from './footnote-definition';
import type { ICtx } from '../types';
import { Drawer } from '../../components/Drawer';
import { useClickAway, useLatest } from 'react-use';
import _ from 'lodash';
import editor from '../../ipc/editor';
import { positionToRange } from '../../editor/utils';
import { stringify as stringifyYaml } from 'yaml';
import { stringify as stringifyToml } from '@iarna/toml';
import { stringify, traverse } from '../parser';
import Icon from '/@/components/Icon';
import BatchApply from '../../editor/BatchApply';

function renderFootDefinitions(ctx: any) {
  if (!ctx.footnoteOrder.length) {
    return null;
  }
  return (
    <section className="footnotes">
      <ol>
        {ctx.footnoteOrder.map((footnote: string) => {
          return footnoteDefinition(
            ctx.footnoteById[footnote.toUpperCase()],
            ctx,
          );
        })}
      </ol>
    </section>
  );
}

interface Message {
  message: string;
  time: string;
}

function CommentItem({
  comment,
  onRemove,
}: {
  comment: Message;
  onRemove: () => void;
}) {
  return (
    <div
      className="onote-comment-item"
      style={{
        borderLeft: '3px solid #07a',
        margin: '5px 0',
        padding: 5,
      }}
    >
      <div>{comment.message}</div>
      <div style={{ color: '#999' }}>
        <small>{comment.time}</small>
      </div>
      <Icon
        className="onote-comment-item__close"
        onClick={onRemove}
        style={{ position: 'absolute', right: 5, top: 5 }}
        type="trash"
        title="删除"
        size={14}
        color="red"
      />
    </div>
  );
}

function generateEdit(
  fileUri: string,
  markId: string,
  frontmatter: any,
  messages: Message[],
) {
  const { node = {}, data = {} } = frontmatter;
  const position = _.get(node, 'position');
  const type = _.get(node, 'type') || 'yaml';
  const value = _.set(_.cloneDeep(data || {}), 'comments.' + markId, messages);
  if (!messages.length) {
    delete value['comments'][markId];
  }
  const md = stringify({
    type,
    value: type === 'yaml' ? stringifyYaml(value) : stringifyToml(value),
  } as any).trim();

  return {
    range: positionToRange(position),
    text: md + (_.get(node, 'value') ? '' : '\n'),
  };
}

const batchApply = new BatchApply();
function CommentDrawer({ ctx }: { ctx: ICtx }) {
  const [isOpen, setIsOpen] = useState(false);
  const [markId, setMarkId] = useState('');
  const [text, setText] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const messages: Message[] =
    _.get(ctx.frontmatter.data, 'comments.' + markId) || [];

  const handleSubmit = () => {
    const msg = text;
    setText('');
    const nextMessages = [
      ...messages,
      { message: msg, time: new Date().toLocaleString() },
    ];
    const edit = generateEdit(
      ctx.fileUri,
      markId,
      ctx.frontmatter,
      nextMessages,
    );
    batchApply.applyLater(ctx.fileUri, edit);
  };

  useEffect(() => {
    const handleOpen = (event: any) => {
      const id = _.get(event, 'detail.id');
      if (!id) {
        return;
      }
      setIsOpen(true);
      setMarkId(id);
    };
    document.addEventListener('open-comment-box', handleOpen);
    return () => {
      document.removeEventListener('open-comment-box', handleOpen);
    };
  }, []);

  useClickAway(ref, (event) => {
    console.log(event);
    if (isOpen) setIsOpen(false);
  });

  const handleRemoveItem = (index: number) => {
    const nextMessages = [...messages];
    nextMessages.splice(index, 1);
    const edit = generateEdit(
      ctx.fileUri,
      markId,
      ctx.frontmatter,
      nextMessages,
    );
    batchApply.applyLater(ctx.fileUri, edit);
  };

  const handleDelete = () => {
    traverse(ctx.getRootNode(), (node) => {
      if (/Directive$/.test(node.type)) {
        const edit = batchApply.createReplaceEdit(node, {
          type: 'root',
          children: (node as Parent).children,
        });
        batchApply.applyLater(ctx.fileUri, edit);
        return true;
      }
    });
    const edit = generateEdit(ctx.fileUri, markId, ctx.frontmatter, []);
    batchApply.applyLater(ctx.fileUri, edit);
  };

  return (
    <Drawer isOpen={isOpen}>
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
          padding: 5,
          boxShadow: '-5px 0px 5px 1px #aaa',
        }}
      >
        <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
          <h5 style={{ textAlign: 'center' }}>标注 #{markId}</h5>
          {messages.map((message, index) => (
            <CommentItem
              comment={message}
              key={index}
              onRemove={() => handleRemoveItem(index)}
            />
          ))}
        </div>
        <textarea
          value={text}
          rows={5}
          autoFocus
          style={{ padding: 5, fontSize: 14, border: '1px solid #999' }}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div style={{ display: 'flex' }}>
          <button style={{ flex: 1 }} onClick={handleSubmit}>
            保存
          </button>
          <button style={{ flex: 1 }} onClick={handleDelete}>
            <Icon type="trash" size={12} />
            删除
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export default function root(node: Root, ctx: any) {
  return (
    <article
      className={`markdown-body line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
    >
      {ctx.renderChildren(node, ctx)}
      {renderFootDefinitions(ctx)}
      <CommentDrawer ctx={ctx} />
    </article>
  );
}
