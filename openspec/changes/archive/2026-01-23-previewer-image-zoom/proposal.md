# 预览器图片与图表放大功能

**变更 ID**: `previewer-image-zoom`

**创建日期**: 2026-01-17

**状态**: 草案

## 概述

为 ONote 预览器添加图片和图表的放大预览功能。用户双击图片或图表时，弹出全屏预览弹窗，支持滚轮缩放和拖拽移动。

## Why

当前预览器中的图片和图表仅能以固定尺寸显示，无法详细查看大图或复杂图表的细节。用户需要一种方式来放大查看这些视觉内容。

## 目标

- 支持图片（Markdown 图片）的放大预览
- 支持图表（Diagram、Mermaid、Typst）的放大预览
- 双击触发预览弹窗
- 支持滚轮缩放
- 支持拖拽移动
- 支持 ESC 键关闭预览

## 非目标

- 不实现图片编辑功能
- 不实现多图画廊模式（后续可扩展）

## 方案概述

1. 创建一个 `ImagePreviewModal` 组件，作为全屏预览弹窗
2. 使用 `react-draggable` 实现拖拽功能
3. 使用 CSS transform 实现缩放
4. 修改 `Image` 和 `Diagram` 组件，添加双击事件处理
5. 使用 React Portal 将预览组件渲染到 body 下

## 关键决策

- 使用现有 UI 库（React Modal）作为基础
- 使用 `react-draggable` 实现拖拽
- 预览内容使用 `<img>` 或 `<div>` + SVG 内联渲染

## 依赖

- `react-draggable`（已存在于项目中）
- `react-modal`（已存在于项目中）

## 变更范围

### 渲染进程

- 新增 `ImagePreviewModal` 组件
- 修改 `Image` 组件支持双击预览
- 修改 `Diagram` 组件支持双击预览
- 修改 `Typst` 组件支持双击预览

## 风险

- 拖拽与大图性能：使用 CSS transform 优化性能
- 多图预览：初期仅支持单图，后续可扩展
