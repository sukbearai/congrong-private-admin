/**
 * 解析后端返回的 SSE 文本流
 * 标准的 SSE 格式：data: {...}\n\n
 */
export default async function readStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (obj: any) => void,
  signal?: AbortSignal
) {
  const decoder = new TextDecoder();
  let buffer = '';
  let eventData = '';

  const processLine = (line: string) => {
    // 空行表示一个事件的结束
    if (line === '') {
      if (eventData) {
        try {
          // 解析事件数据
          const parsedData = JSON.parse(eventData);
          onChunk(parsedData);
        } catch (e) {
          // 静默处理解析错误
        }
        eventData = '';
      }
    }
    // 处理 data: 行
    else if (line.startsWith('data:')) {
      const data = line.slice(5).trim();
      if (data) {
        // 如果已经有数据，追加（处理多行 data）
        eventData += (eventData ? '' : '') + data;
      }
    }
    // 忽略其他 SSE 字段（event:, id:, retry:）
    else {
      // 可以选择处理其他字段，目前忽略
    }
  };

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按行分割处理
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

      lines.forEach(processLine);
    }

    // 处理缓冲区中剩余的数据（如果流没有以空行结束）
    if (eventData) {
      try {
        const parsedData = JSON.parse(eventData);
        onChunk(parsedData);
      } catch (e) {
        // 静默处理解析错误
      }
    }
  } finally {
    reader.releaseLock();
  }
}
