import filePanelManager from '../filePanelManager';


it('getFilePanel能够取到注册的panel', () => {
    filePanelManager.registerFilePanel({
        extensions: ['.md'],
        editable: true,
    });
    expect(filePanelManager.getPanel('file:///a/a.md')?.editable).toBe(true);
});

it('更长的后缀优先匹配', () => {
    filePanelManager.registerFilePanel({
        extensions: ['.md'],
        editable: true,
    });
    filePanelManager.registerFilePanel({
        extensions: ['.todo.md'],
        editable: false,
    });
    expect(filePanelManager.getPanel('file:///a/a.todo.md')?.editable).toBe(false);
});