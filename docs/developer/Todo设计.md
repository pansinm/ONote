## 目录结构
```
.note/
  todo/
    tags.json
    tasks-{timestamp}.json
```

## Tag

```
name: string;
color: string;
todos: [string];
```

## Task
```
id: string;
tags: [Tag];
done: boolean;
title: string;
remark: string;
filename: string;
ref: string;
doneAt: number;
createdAt: number;
```