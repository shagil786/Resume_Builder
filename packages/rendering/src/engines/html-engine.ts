import type { ResumeContent, ResumeSection } from '@resume-builder/domain';
import type { TemplateDefinition } from '../templates';

export class HtmlRenderEngine {
  render(content: ResumeContent, template: TemplateDefinition): string {
    const t = template;
    const header = content.header ? `
      <header class="resume-header">
        <h1>${this.escapeHtml(content.header.name)}</h1>
        ${content.header.headline ? `<div class="headline">${this.escapeHtml(content.header.headline)}</div>` : ''}
        ${content.header.contact.length > 0 ? `<div class="contact">${content.header.contact.map(this.escapeHtml).join(' <span class="contact-separator">|</span> ')}</div>` : ''}
      </header>` : '';
    const sections = content.sections
      .sort((a, b) => a.order - b.order)
      .map(s => this.renderSection(s, t))
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${this.styles(t)}
  </style>
</head>
  <body>
  <div class="resume">
    ${header}
    ${sections}
  </div>
</body>
</html>`;
  }

  private renderSection(section: ResumeSection, _t: TemplateDefinition): string {
    const itemsHtml = section.items.map(item => {
      if (item.bulletPoints && item.bulletPoints.length > 0) {
        const bullets = item.bulletPoints.map(b => `
          <li class="bullet">${this.escapeHtml(b.text)}</li>
        `).join('\n');

        return `
          <div class="item">
            <div class="item-header">
              <span class="item-primary">${this.escapeHtml(item.content)}</span>
              ${item.meta ? `<span class="item-meta">${this.escapeHtml(item.meta)}</span>` : ''}
            </div>
            ${item.subtitle ? `<div class="item-subtitle">${this.escapeHtml(item.subtitle)}</div>` : ''}
            <ul class="bullets">${bullets}</ul>
          </div>`;
      }

      return `
        <div class="item">
          <div class="item-header">
            <span class="item-primary">${this.escapeHtml(item.content)}</span>
            ${item.meta ? `<span class="item-meta">${this.escapeHtml(item.meta)}</span>` : ''}
          </div>
          ${item.subtitle ? `<div class="item-subtitle">${this.escapeHtml(item.subtitle)}</div>` : ''}
        </div>`;
    }).join('\n');

    return `
    <section class="section section-${section.type.toLowerCase()}">
      <h2 class="section-title">${this.escapeHtml(section.title)}</h2>
      <div class="section-content">${itemsHtml}</div>
    </section>`;
  }

  private styles(t: TemplateDefinition): string {
    const p = t.page;
    return `
      @page { size: Letter; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: ${p.width}px;
        min-height: ${p.height}px;
        font-family: ${t.typography.body.family};
        font-size: ${t.typography.body.size}px;
        color: ${t.typography.body.color};
        line-height: ${t.typography.body.lineHeight};
        padding: 38px 48px 42px;
        background: ${t.colors.background};
      }
      .resume { width: 100%; }
      .resume-header { text-align: center; margin-bottom: 18px; }
      .resume-header h1 {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 25px;
        line-height: 1.15;
        font-weight: 700;
        color: #111;
        margin-bottom: 5px;
      }
      .headline { font-size: 11px; font-weight: 600; color: #222; margin-bottom: 4px; }
      .contact { font-size: 9px; line-height: 1.5; color: #222; overflow-wrap: anywhere; }
      .contact-separator { color: #555; padding: 0 3px; }
      .section { margin-bottom: 13px; }
      .section-title {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #111;
        padding-bottom: 3px;
        margin-bottom: 7px;
        border-bottom: 1px solid #222;
      }
      .item { margin-bottom: 8px; page-break-inside: avoid; }
      .item-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10.5px;
        line-height: 1.25;
        color: #111;
        font-weight: 700;
      }
      .item-primary { min-width: 0; }
      .item-meta { text-align: right; white-space: nowrap; }
      .item-subtitle { font-size: 10.5px; font-style: italic; line-height: 1.25; color: #222; margin-top: 1px; }
      .item-content { font-size: 10px; color: #222; }
      .section-summary .item-content { line-height: 1.3; }
      .section-skills .item-content { line-height: 1.35; }
      .section-education .item { margin-bottom: 5px; }
      .section-project .item { margin-bottom: 7px; }
      .section-experience .item { margin-bottom: 9px; }
      .section-experience .item-subtitle { margin-bottom: 1px; }
      .section-experience .item-meta { font-weight: 700; }
      .section-content { width: 100%; }
      .section-content a { color: inherit; text-decoration: underline; }
      .section-content strong { font-weight: 700; }
      .section-content em { font-style: italic; }
      .item-content {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10px;
        line-height: 1.35;
      }
      .bullets {
        list-style: disc outside;
        padding-left: 16px;
        margin-top: 2px;
      }
      .bullet {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9.5px;
        color: #222;
        line-height: 1.28;
        margin-bottom: 2px;
      }
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
