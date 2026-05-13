# ONote 自动化截图指南

通过 CDP（Chrome DevTools Protocol）连接 Electron 应用，远程控制页面并截图。

## 1. 启动 Electron（带调试端口）

```bash
# 先杀掉已有进程
kill -9 $(pgrep -f "Electron.*onote") 2>/dev/null

# 带 CDP 调试端口 + 允许外部连接启动
npx electron . '--remote-debugging-port=9222' '--remote-allow-origins=*' &>/dev/null &
sleep 5  # 等应用启动完成
```

**关键参数：**
- `--remote-debugging-port=9222` — 开放 CDP 端口
- `--remote-allow-origins=*` — 允许外部 WebSocket 连接（不加会被 403 拒绝）

**验证端口可用：**
```bash
curl -s http://127.0.0.1:9222/json/version | head -2
```

## 2. 前置依赖

```bash
pip3 install --break-system-packages websocket-client
```

## 3. 截图脚本

保存为 `scripts/screenshot.py`，然后 `python3 scripts/screenshot.py` 即可。

```python
#!/usr/bin/env python3
"""
ONote 自动化截图工具
通过 CDP 连接 Electron，支持打开目录/文件后截图，自动生成亮色+暗色截图。

用法：
  1. 确保 Electron 已带 --remote-debugging-port=9222 --remote-allow-origins=* 启动
  2. python3 scripts/screenshot.py
  3. 生成 /tmp/onote-light.png 和 /tmp/onote-dark.png

可选参数：
  --open-dir <path>    打开指定目录
  --open-file <path>   激活指定文件
  --output <dir>       输出目录（默认 /tmp）
"""
import json, base64, websocket, urllib.request, time, argparse

CDP_PORT = 9222
CDP_ORIGIN = "http://localhost:8080"


def get_page_ws():
    """获取主页面的 WebSocket Debugger URL"""
    resp = urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json')
    pages = json.loads(resp.read())
    for p in pages:
        if p['type'] == 'page' and ('file://' in p.get('url', '') or 'localhost' in p.get('url', '')):
            return p['webSocketDebuggerUrl']
    raise RuntimeError("No main page found")


def do_cdp(method, params=None, msg_id=1):
    """发送 CDP 命令并等待响应"""
    ws_url = get_page_ws()
    ws = websocket.create_connection(ws_url, timeout=20, header={"Origin": CDP_ORIGIN})
    cmd = {"id": msg_id, "method": method}
    if params:
        cmd["params"] = params
    ws.send(json.dumps(cmd))
    # 等待匹配的响应 id
    while True:
        result = json.loads(ws.recv())
        if result.get("id") == msg_id:
            ws.close()
            return result
    ws.close()
    return {}


def screenshot(path, label=""):
    """截取当前页面截图"""
    result = do_cdp("Page.captureScreenshot", {"format": "png"})
    if 'result' in result and 'data' in result['result']:
        with open(path, 'wb') as f:
            f.write(base64.b64decode(result['result']['data']))
        print(f"  {label} -> {path}")
    else:
        print(f"  {label} failed:", result)


def set_theme(theme):
    """切换主题（light / dark）"""
    do_cdp("Runtime.evaluate", {
        "expression": f"document.documentElement.setAttribute('data-theme', '{theme}')",
        "returnByValue": True
    })


def open_directory(dir_path):
    """通过 stores API 打开目录（需要 window.__stores__ 和 window.__fileService__ 暴露）"""
    do_cdp("Runtime.evaluate", {
        "expression": f"""
(async () => {{
  const {{ Uri }} = window.monaco;
  const stores = window.__stores__;
  const fileService = window.__fileService__;
  if (!stores || !fileService) return 'ERROR: stores not exposed';
  const rootUri = Uri.file('{dir_path}').toString();
  await fileService.connect('local', null);
  stores.activationStore.openNoteBook('local', rootUri);
  fileService.setRootDirUri(rootUri);
  return 'opened: ' + rootUri;
}})()
""",
        "returnByValue": True,
        "awaitPromise": True
    })


def activate_file(file_path):
    """激活指定文件"""
    do_cdp("Runtime.evaluate", {
        "expression": f"""
(() => {{
  const {{ Uri }} = window.monaco;
  const stores = window.__stores__;
  if (!stores) return 'ERROR: stores not exposed';
  const fileUri = Uri.file('{file_path}').toString();
  stores.activationStore.activeFile(fileUri);
  return 'activated: ' + fileUri;
}})()
""",
        "returnByValue": True,
        "awaitPromise": True
    })


def main():
    parser = argparse.ArgumentParser(description="ONote 截图工具")
    parser.add_argument("--open-dir", help="打开指定目录路径")
    parser.add_argument("--open-file", help="激活指定文件路径")
    parser.add_argument("--output", default="/tmp", help="输出目录（默认 /tmp）")
    parser.add_argument("--name", default="onote", help="文件名前缀（默认 onote）")
    args = parser.parse_args()

    out = args.output.rstrip('/')
    prefix = args.name

    print(f"WS: {get_page_ws()[:60]}...")

    # 打开目录（可选）
    if args.open_dir:
        print(f"Opening directory: {args.open_dir}")
        open_directory(args.open_dir)
        time.sleep(1.5)

    # 激活文件（可选）
    if args.open_file:
        print(f"Activating file: {args.open_file}")
        activate_file(args.open_file)
        time.sleep(2)

    # 亮色截图
    print("Capturing light theme...")
    screenshot(f'{out}/{prefix}-light.png', 'Light')

    # 暗色截图
    set_theme('dark')
    time.sleep(0.8)
    print("Capturing dark theme...")
    screenshot(f'{out}/{prefix}-dark.png', 'Dark')

    # 恢复亮色
    set_theme('light')
    print("Done!")


if __name__ == "__main__":
    main()
```

## 4. 使用方式

### 基础截图（空状态）
```bash
python3 scripts/screenshot.py
# -> /tmp/onote-light.png
# -> /tmp/onote-dark.png
```

### 打开目录后截图
需要先在 `stores/index.ts` 和 `services/fileService.ts` 中临时暴露到 window：

```typescript
// stores/index.ts — 临时加，截图后删掉
(window as any).__stores__ = stores;

// services/fileService.ts — 临时加，截图后删掉
const fileService = new FileService();
(window as any).__fileService__ = fileService;
export default fileService;
```

然后：
```bash
python3 scripts/screenshot.py --open-dir /path/to/project --open-file /path/to/file.md --name onote-active
# -> /tmp/onote-active-light.png
# -> /tmp/onote-active-dark.png
```

截图后记得还原代码（`git checkout -- .`）。

### 自定义输出
```bash
python3 scripts/screenshot.py --output ~/Desktop --name preview
```

## 5. 常见问题

### WebSocket 403 Forbidden
原因：缺少 `--remote-allow-origins=*` 参数。
解决：重启 Electron 时加上该参数。

### 连接超时
原因：之前的脚本异常退出，WS 连接未正确关闭。
解决：杀掉 Electron 进程重启。
```bash
kill -9 $(lsof -i :9222 -t)
```

### 页面找不到 stores
原因：`window.__stores__` 未暴露。
解决：临时在 stores/index.ts 中加一行暴露代码，构建后截图，然后还原。

### 端口被占用
```bash
# 查看占用 9222 的进程
lsof -i :9222 -P | grep LISTEN
# 杀掉
kill -9 <PID>
```
