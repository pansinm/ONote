import html2canvas from 'html2canvas';
import { base64Unicode } from './crypto';
import mainClient from '../rpc/mainRpcClient';

export function copyElementAsImage(ele: HTMLElement) {
  const newPre = ele.cloneNode(true) as HTMLPreElement;
  const style = newPre.style;
  style.width = 'fit-content';
  style.margin = '0px';
  const beforeY = window.scrollY;
  // 插入前面，如果插入文档末尾，容易导致错位
  document.body.prepend(newPre);
  const height = newPre.offsetHeight;
  // 防止看见一个闪烁的节点
  window.scrollTo(window.scrollX, beforeY + height);
  return html2canvas(newPre, {
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    scale: 2,
  })
    .then((canvas) => {
      return mainClient.copyImage(canvas.toDataURL('image/png'), 'dataURL');
    })
    .then(() => {
      newPre.remove();
      window.scrollTo(window.scrollX, beforeY);
    });
}

/**
 * 下载图片并复制到剪切板
 * @param imageUrl
 */
export async function copyUrlAsImage(imageUrl: string) {
  const res = await fetch(imageUrl);
  const contentType = res.headers.get('content-type') as string;
  if (!/image/.test(contentType)) {
    return;
  }
  if (/svg/.test(contentType)) {
    const svg = await res.text();
    return copySvgAsImage(svg);
  }
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return mainClient.copyImage(arrayBuffer, 'ArrayBuffer');
}

export function renderSvg(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const base64 = base64Unicode(svg.trim());
    const dataurl = 'data:image/svg+xml;base64,' + base64;
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    img.onload = (e) => {
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      console.log(err);
      reject(err);
    };
    img.src = dataurl;
  });
}

/**
 * 将svg字符串复制成图片
 * @param svg
 */
export async function copySvgAsImage(svg: string) {
  console.log(svg);
  const img = await renderSvg(svg);
  return mainClient.copyImage(img, 'dataURL');
}

// export async function readClipboard(type?: 'html' | 'img') {
//   if (type === 'html') {
//     return clipboard.readHTML('clipboard');
//   }
//   if (type === 'img') {
//     return clipboard.readImage('clipboard');
//   }
//   return clipboard.readText('clipboard');
// }
