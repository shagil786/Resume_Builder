import type { CoverLetterContent } from '@resume-builder/ai';

export class CoverLetterRenderEngine {
  render(content: CoverLetterContent, candidateName: string): string {
    const paragraphs = content.body.map(p => `<p>${this.escape(p)}</p>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; color: #222; line-height: 1.6; padding: 60px; max-width: 700px; margin: 0 auto; }
  h1 { font-size: 16pt; margin-bottom: 4px; }
  .date { color: #666; margin-bottom: 20px; }
  .salutation { margin-bottom: 16px; }
  p { margin-bottom: 12px; }
  .closing { margin-top: 20px; }
  .subject { font-weight: 600; margin-bottom: 16px; color: #444; }
</style></head>
<body>
  <h1>${this.escape(candidateName)}</h1>
  <div class="subject">${this.escape(content.subject)}</div>
  <div class="salutation">${this.escape(content.salutation)}</div>
  ${paragraphs}
  <div class="closing">${this.escape(content.closing)}</div>
</body>
</html>`;
  }

  private escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
