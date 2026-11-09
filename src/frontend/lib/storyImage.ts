// 1080×1920 PNG for an Instagram / Facebook story (#185). No web link opens Stories, so phones share this file.
export interface StoryText {
  title: string;
  dates: string;
  location: string;
  url: string;
}

const W = 1080;
const H = 1920;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  return line ? [...lines, line] : lines;
}

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

export async function storyImage({ title, dates, location, url }: StoryText, logoSrc: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.fillStyle = '#101a24';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(await loadImage(logoSrc), 390, 220, 300, 257);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2d65d';
  ctx.font = '800 44px system-ui, sans-serif';
  ctx.fillText('OPEN CLIMB · GUESTS WELCOME', W / 2, 640);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 112px system-ui, sans-serif';
  const lines = wrap(ctx, title, W - 160).slice(0, 4);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 800 + i * 124));
  const y = 800 + lines.length * 124 + 60;
  ctx.font = '700 56px system-ui, sans-serif';
  ctx.fillText(dates, W / 2, y);
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.font = '500 44px system-ui, sans-serif';
  wrap(ctx, location, W - 200).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, y + 80 + i * 56));
  ctx.fillStyle = '#f2d65d';
  ctx.font = '700 40px system-ui, sans-serif';
  ctx.fillText(url.replace(/^https?:\/\/(www\.)?/, ''), W / 2, H - 220);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No image'))), 'image/png'));
}
