import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Tag,
  TagGroup,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import type Form from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import React, { useRef } from 'react';
import { Theme as FluentUIRCTheme } from '@rjsf/fluentui-rc';
import { colorHash, createTagColorStyle } from '/@/common/utils/style';
import stores from '../../stores';
import validator from '@rjsf/validator-ajv8';
import { Add20Regular, Dismiss12Regular } from '@fluentui/react-icons';

const FluentForm = withTheme(FluentUIRCTheme);

const uiSchema = {
  'ui:submitButtonOptions': {
    props: {
      disabled: false,
    },
    norender: true,
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

const useStyles = makeStyles({
  root: {
    ...shorthands.padding('4px', '0px'),
    // backgroundColor: 'whitesmoke',
    // box shadow on top
    boxShadow: '0 -2px 50px rgba(0, 0, 0, 0.1)',
  },

  title: {
    ...shorthands.padding('10px', '2px', '4px', '2px'),
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  },
  timeList: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  timeItem: {
    minWidth: '10px',
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
  form: {
    '& .fui-Flex': {
      rowGap: '0px',
    },
  },
});

const TagCreateForm = () => {
  const styles = useStyles();
  const ref = useRef<Form>(null);
  const removeTag = (name: string) => {
    const confirmed = window.confirm(`确定删除该标签【${name}】吗？`);
    if (confirmed) {
      stores.todoStore.removeTag(name);
    }
  };
  return (
    <Dialog modalType="alert">
      <DialogTrigger disableButtonEnhancement>
        <Button icon={<Add20Regular />}></Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>编辑标签</DialogTitle>
          <DialogContent>
            <TagGroup className={styles.tagList}>
              {stores.todoStore.tags.map((tag) => (
                <Tag
                  key={tag.name}
                  value={tag.name}
                  className={styles.tagItem}
                  dismissible
                  dismissIcon={
                    <Dismiss12Regular
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        removeTag(tag.name);
                      }}
                    />
                  }
                  style={createTagColorStyle(tag.name, tag.color)}
                  size="small"
                  shape="rounded"
                >
                  {tag.name}
                </Tag>
              ))}
            </TagGroup>
            <FluentForm
              ref={ref}
              className={styles.form}
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
                // setOpen(false);
              }}
              validator={validator}
            ></FluentForm>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">关闭</Button>
            </DialogTrigger>
            <Button onClick={() => ref.current?.submit()} appearance="primary">
              创建
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default TagCreateForm;
