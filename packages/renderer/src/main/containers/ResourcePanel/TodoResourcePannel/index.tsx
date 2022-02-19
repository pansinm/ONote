import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import React from 'react';
import Checkbox from '/@/components/Checkbox';
import Flex from '/@/components/Flex';
import stores from '../../../stores';
import * as monaco from 'monaco-editor';
import { uri2fsPath } from '/@/utils/uri';

interface TodoResourcePanelProps {
  uri: string;
}

function updateTodo(content: string, title: string, status: 'doing' | 'done') {
  const reg = `(\\s?[-+*]\\s+\\[)([ x])(\\] ${_.escapeRegExp(title)}(\\s|$))`;
  return content.replace(new RegExp(reg, 'g'), (str, p1, p2, p3) => {
    return [p1, status === 'done' ? 'x' : ' ', p3].join('');
  });
}

const TodoResourcePanel: FC<TodoResourcePanelProps> = observer(() => {
  return (
    <div className="fullfill" style={{ overflow: 'auto' }}>
      <h1>待办清单</h1>
      {_.orderBy(stores.todoStore.todos, 'status').map((todo) => (
        <Flex key={todo.id} alignItems="center">
          <Checkbox
            style={{ margin: 5 }}
            checked={todo.status === 'done'}
            onClick={async () => {
              const status = todo.status === 'done' ? 'doing' : 'done';
              if (todo.note) {
                const url = stores.noteStore.getNoteUrl({
                  ...todo.note,
                  type: 'markdown',
                } as any);
                const model = monaco.editor.getModel(monaco.Uri.parse(url));
                if (model) {
                  const val = model.getValue();
                  model.setValue(updateTodo(val, todo.title, status));
                } else {
                  try {
                    const fsPath = uri2fsPath(url);
                    const content = await window.simmer.readFile(fsPath);
                    await window.simmer.writeFile(
                      fsPath,
                      updateTodo(content, todo.title, status),
                    );
                  } catch (err) {
                    console.error(err);
                  }
                }
              }
              stores.updateTodo(todo.id, { status });
            }}
          />
          <span
            style={{
              textDecoration:
                todo.status === 'done' ? 'line-through' : undefined,
            }}
          >
            {todo.title}
          </span>
        </Flex>
      ))}
    </div>
  );
});

export default TodoResourcePanel;
