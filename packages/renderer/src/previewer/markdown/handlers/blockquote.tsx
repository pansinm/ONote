import React from 'react';
import type { Node } from 'unist';
import { createLineClass } from './util/position';
import type { Blockquote } from 'mdast';
import _ from 'lodash';
import type { Text } from 'mdast';
import classNames from 'classnames';
import type { IconType } from '/@/components/Icon';
import Icon from '/@/components/Icon';
import './blockquote.scss';
function getAlertTag(node: Blockquote) {
  const text = _.get(node, 'children[0].children[0]') as unknown as Text;
  if (text?.type !== 'text') {
    return null;
  }
  const results = /^\s*\[!(NOTE|TIP|IMPORT|WARNING|CAUTION)\]/.exec(text.value);
  if (results?.[1]) {
    return results?.[1];
  }
  return null;
}

function trimAlertTag(node: Blockquote) {
  const final = _.cloneDeep(node);
  const text = _.get(final, 'children[0].children[0]') as unknown as Text;
  if (text?.type !== 'text') {
    return;
  }
  text.value = text.value.replace(
    /^\s*\[!(NOTE|TIP|IMPORT|WARNING|CAUTION)\]\s*/,
    '',
  );
  return final;
}

export default function blockquote(
  node: Blockquote,
  ctx: { [key: string]: any },
) {
  const tag = getAlertTag(node);
  const alertClass = classNames(
    'markdown-alert',
    `markdown-alert-${tag?.toLowerCase()}`,
  );

  const iconTypes: Record<string, IconType> = {
    NOTE: 'info-circle',
    TIP: 'lightbulb',
    IMPORTANT: 'shield-exclamation',
    WARNING: 'exclamation-triangle',
    CAUTION: 'exclamation-octagon',
  };
  return (
    <blockquote
      className={classNames(createLineClass(node.position), {
        [alertClass]: tag,
      })}
    >
      {tag ? (
        <p className="markdown-alert-title">
          <Icon type={iconTypes[tag]} style={{ marginRight: 8 }} size={16} />
          {_.startCase(tag.toLocaleLowerCase())}
        </p>
      ) : null}
      {ctx.renderChildren(tag ? trimAlertTag(node) : node, ctx)}
    </blockquote>
  );
}
