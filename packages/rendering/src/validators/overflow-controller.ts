import type { ResumeContent } from '@resume-builder/domain';
import type { TemplateDefinition, OverflowResult } from '../templates';

export class OverflowController {
  estimateOverflow(content: ResumeContent, template: TemplateDefinition): OverflowResult {
    const pageContentHeight = template.page.height - template.page.margins.top - template.page.margins.bottom;
    const estimatedPixels = this.estimateTotalHeight(content, template);
    const maxPixels = pageContentHeight * template.constraints.maxPages;
    const overflowPixels = Math.max(0, estimatedPixels - maxPixels);

    const totalLines = content.sections.reduce(
      (sum, s) => sum + s.items.reduce((is, item) =>
        is + 1 + (item.bulletPoints?.length ?? 0), 0), 0
    );
    const linesPerPage = pageContentHeight / ((template.typography.body.lineHeight ?? 1.4) * template.typography.body.size);
    const estimatedPages = Math.ceil(totalLines / linesPerPage);

    return {
      fits: estimatedPixels <= maxPixels,
      estimatedPages,
      estimatedPixels: Math.round(estimatedPixels),
      overflowPixels: Math.round(overflowPixels),
      overflowSection: overflowPixels > 0 ? this.findOverflowSection(content, template) : undefined,
    };
  }

  createCompressionPlan(content: ResumeContent, _template: TemplateDefinition, overflowPixels: number): {
    actions: string[];
    compressed: ResumeContent;
  } {
    const actions: string[] = [];
    const compressed: ResumeContent = { ...content, sections: [...content.sections] };

    for (let si = compressed.sections.length - 1; si >= 0 && overflowPixels > 0; si--) {
      const section = compressed.sections[si];
      if (section.type === 'SUMMARY') continue;

      for (let ii = section.items.length - 1; ii >= 0 && overflowPixels > 0; ii--) {
        const item = section.items[ii];
        if (!item.bulletPoints || item.bulletPoints.length <= 1) continue;

        const removed = item.bulletPoints.pop();
        if (removed) {
          actions.push(`Removed bullet from ${section.title}: "${removed.text.slice(0, 60)}..."`);
          overflowPixels -= 18;
        }
      }
    }

    return { actions, compressed };
  }

  private estimateTotalHeight(content: ResumeContent, t: TemplateDefinition): number {
    let height = 0;
    for (const section of content.sections) {
      height += 24;
      height += t.typography.sectionTitle.size * (t.typography.sectionTitle.lineHeight ?? 1.4) + 12;
      for (const item of section.items) {
        height += t.typography.heading.size * (t.typography.heading.lineHeight ?? 1.4) + 4;
        for (const _bullet of item.bulletPoints ?? []) {
          height += t.typography.bullet.size * (t.typography.bullet.lineHeight ?? 1.4) + 4;
        }
        height += 8;
      }
    }
    return height;
  }

  private findOverflowSection(content: ResumeContent, _t: TemplateDefinition): string | undefined {
    const largest = content.sections.reduce((max, s) =>
      s.items.length > (max?.items.length ?? 0) ? s : max, content.sections[0]);
    return largest?.title;
  }
}
