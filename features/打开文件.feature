# language: zh-CN
功能: 打开文件

背景:
  假定打开目录

场景: 打开支持的文件
  当打开文件"empty.md"
  那么打开的页面是编辑页面

场景: 打开不支持的文件
  当打开文件"slide.ppt"
  那么页面提示使用系统应用打开
