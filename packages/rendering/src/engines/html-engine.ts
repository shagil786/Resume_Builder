import type { ResumeContent, ResumeSection } from '@resume-builder/domain';
import type { TemplateDefinition, OverflowResult } from '../templates';

export class HtmlRenderEngine {
  render(content: ResumeContent, template: TemplateDefinition): string {
    const t = template;
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
    ${sections}
  </div>
</body>
</html>`;
  }

  private renderSection(section: ResumeSection, t: TemplateDefinition): string {
    const itemsHtml = section.items.map(item => {
      if (item.bulletPoints && item.bulletPoints.length > 0) {
        const bullets = item.bulletPoints.map(b => `
          <li class="bullet">${this.escapeHtml(b.text)}</li>
        `).join('\n');

        return `
          <div class="item">
            <div class="item-header">${this.escapeHtml(item.content)}</div>
            <ul class="bullets">${bullets}</ul>
          </div>`;
      }

      return `
        <div class="item">
          <div class="item-content">${this.escapeHtml(item.content)}</div>
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
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: ${p.width}px;
        min-height: ${p.height}px;
        font-family: ${t.typography.body.family};
        font-size: ${t.typography.body.size}px;
        color: ${t.typography.body.color};
        line-height: ${t.typography.body.lineHeight};
        padding: ${p.margins.top}px ${p.margins.right}px ${p.margins.bottom}px ${p.margins.left}px;
        background: ${t.colors.background};
      }
      .resume { width: 100%; }
      .section { margin-bottom: 16px; }
      .section-title {
        font-family: ${t.typography.sectionTitle.family};
        font-size: ${t.typography.sectionTitle.size}px;
        font-weight: ${t.typography.sectionTitle.weight};
        color: ${t.typography.sectionTitle.color};
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-bottom: 4px;
        margin-bottom: 8px;
        border-bottom: 1px solid ${t.colors.divider};
      }
      .item { margin-bottom: 8px; }
      .item-header {
        font-family: ${t.typography.heading.family};
        font-size: ${t.typography.heading.size}px;
        font-weight: ${t.typography.heading.weight};
        color: ${t.typography.heading.color};
        margin-bottom: 2px;
      }
      .item-content {
        font-size: ${t.typography.body.size}px;
        color: ${t.typography.body.color};
      }
      .bullets {
        list-style: disc;
        padding-left: 18px;
        margin-top: 2px;
      }
      .bullet {
        font-size: ${t.typography.bullet.size}px;
        color: ${t.typography.bullet.color};
        line-height: ${t.typography.bullet.lineHeight};
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
