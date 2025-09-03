// 验证流式功能是否正常工作的工具函数
export const verifyStreamingSupport = () => {
  // 检查必要的API支持
  const supports = {
    fetch: typeof fetch === 'function',
    readableStream: typeof ReadableStream === 'function',
    textDecoder: typeof TextDecoder === 'function',
  };

  console.log('流式功能支持检查:');
  console.log('✅ Fetch API:', supports.fetch);
  console.log('✅ ReadableStream:', supports.readableStream);
  console.log('✅ TextDecoder:', supports.textDecoder);

  if (supports.fetch && supports.readableStream && supports.textDecoder) {
    console.log('🎉 环境支持流式调用!');
    return true;
  } else {
    console.log('❌ 环境不支持流式调用');
    return false;
  }
};

// 模拟流式响应用于测试
export const simulateStreamingResponse = async (
  onChunk: (chunk: string) => void,
  onComplete: () => void,
) => {
  const responseText =
    '这是一个流式响应的测试消息。消息会逐字显示，模拟真实的AI响应过程。';

  for (let i = 0; i < responseText.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    onChunk(responseText[i]);
  }

  onComplete();
};
