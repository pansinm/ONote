#!/bin/bash
# ONote CLI post-install — 创建符号链接
#
# deb/rpm 安装后由 electron-builder 自动执行。
# AppImage 用户需手动添加 PATH。

set -e

ln -sf /opt/ONote/resources/bin/onote /usr/local/bin/onote
chmod +x /opt/ONote/resources/bin/onote-cli 2>/dev/null || true
