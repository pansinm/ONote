import React, { useState } from 'react';
import classNames from 'classnames';
import Icon from '/@/components/Icon';
import stores from '../../stores';
import { observer } from 'mobx-react-lite';
import { AddRegular } from '@fluentui/react-icons';
import {
  makeStyles,
  shorthands,
  Tag,
  TagGroup,
} from '@fluentui/react-components';
import { Drawer } from '/@/components';
import { withTheme } from '@rjsf/core';
import { Theme as FluentUIRCTheme } from '@rjsf/fluentui-rc';
import validator from '@rjsf/validator-ajv8';
import { Button } from '@fluentui/react-components';
import type { ITag } from '../../stores/TodoStore';
import { colorHash, createTagColorStyle } from '/@/common/utils/style';

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

const Form = withTheme(FluentUIRCTheme);

const useStyles = makeStyles({
  root: {
    // backgroundColor: 'whitesmoke',
    ...shorthands.padding('10px', '4px', '4px', '4px'),
    // box shadow on top
    boxShadow: '0 -2px 50px rgba(0, 0, 0, 0.1)',
  },
  timeList: {
    display: 'inline-flex',
  },
  timeItem: {
    ...shorthands.padding('5px'),
    ...shorthands.margin('3px', '3px'),
    cursor: 'default',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    ...shorthands.padding('2px', '4px'),
  },
  tagItem: {
    alignItems: 'center',
    cursor: 'default',
    ...shorthands.margin('4px', 0),
    '& span': {
      ...shorthands.padding('0'),
    },
  },
});

const uiSchema = {
  'ui:submitButtonOptions': {
    props: {
      disabled: false,
    },
    norender: false,
    submitText: '创建标签',
  },
  name: {
    'ui:autofocus': true,
    'ui:emptyValue': '',
    'ui:options': {
      placeholder: '请输入标签名称',
    },
  },
  color: {
    'ui:options': {
      placeholder: '请输入标签颜色',
      inputType: 'color',
    },
  },
};

const Tasks: React.FC<Props> = ({ style, className }) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    stores.todoStore.activate();
  };
  const removeTag = (name: string) => {
    const confirmed = window.confirm(`确定删除该标签【${name}】吗？`);
    if (confirmed) {
      stores.todoStore.removeTag(name);
    }
  };
  return (
    <div className={classNames(className, styles.root)} style={style}>
      <h4 style={{ color: '#666' }}>
        <Icon type="list-task" size={18}></Icon> 待办清单
      </h4>
      <div className={styles.timeList}>
        <div className={styles.timeItem} onClick={handleClick}>
          全部
        </div>
        {/* <div className={styles.TimeItem} onClick={handleClick}>
          今天
        </div>
        <div className={styles.TimeItem} onClick={handleClick}>
          本周
        </div>
        <div className={styles.TimeItem} onClick={handleClick}>
          本月
        </div> */}
      </div>
      <TagGroup
        className={styles.tagList}
        onDismiss={(e, { value }) => removeTag(value)}
      >
        {stores.todoStore.tags.map((tag) => (
          <Tag
            key={tag.name}
            value={tag.name}
            className={styles.tagItem}
            dismissible
            style={createTagColorStyle(tag.name, tag.color)}
            size="small"
            shape="rounded"
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              stores.todoStore.activate();
            }}
          >
            {tag.name}
          </Tag>
        ))}
        <Tag
          className={styles.tagItem}
          media={<AddRegular />}
          size="small"
          appearance="brand"
          shape="rounded"
          onClick={() => setOpen(true)}
        >
          标签
        </Tag>
      </TagGroup>
      <Drawer open={open} position="end" title="创建标签" setOpen={setOpen}>
        {open && (
          <Form
            schema={{
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: '标签名称',
                },
                color: {
                  type: 'string',
                  title: '颜色',
                  default: colorHash.hex(Math.random().toString()),
                },
              },
            }}
            uiSchema={uiSchema}
            onSubmit={(e) => {
              const { name, color } = e.formData;
              stores.todoStore.createTag(name, color);
              setOpen(false);
            }}
            validator={validator}
          ></Form>
        )}
      </Drawer>
    </div>
  );
};

export default observer(Tasks);