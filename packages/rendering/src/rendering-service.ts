import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { ResumeContent } from '@resume-builder/domain';
import { HtmlRenderEngine } from './engines';
import { OverflowController } from './validators';
import { TEMPLATES } from './templates';
import type { TemplateDefinition, OverflowResult } from './templates';

export interface RenderResult {
  html: string;
  template: string;
  overflow: OverflowResult;
  compressed: boolean;
  iterations: number;
}

export interface RenderingServiceConfig {
  defaultTemplate?: string;
  maxCompressionIterations?: number;
}

export class RenderingService {
  private htmlEngine: HtmlRenderEngine;
  private overflowController: OverflowController;
  private logger: Logger;

  constructor(
    private config: RenderingServiceConfig = {},
    logger?: Logger
  ) {
    this.htmlEngine = new HtmlRenderEngine();
    this.overflowController = new OverflowController();
    this.logger = logger ?? new ConsoleLogger('rendering-service');
  }

  render(content: ResumeContent, templateId?: string): RenderResult {
    const template = this.resolveTemplate(templateId);
    this.logger.info('Rendering resume', { template: template.id });

    let currentContent = content;
    let currentOverflow = this.overflowController.estimateOverflow(currentContent, template);
    let iterations = 0;
    const maxIterations = this.config.maxCompressionIterations ?? 5;

    while (!currentOverflow.fits && iterations < maxIterations) {
      this.logger.info('Compressing resume', {
        iteration: iterations + 1,
        overflowPixels: currentOverflow.overflowPixels,
      });

      const plan = this.overflowController.createCompressionPlan(
        currentContent, template, currentOverflow.overflowPixels
      );
      currentContent = plan.compressed;
      currentOverflow = this.overflowController.estimateOverflow(currentContent, template);
      iterations++;
    }

    const html = this.htmlEngine.render(currentContent, template);

    const result: RenderResult = {
      html,
      template: template.id,
      overflow: currentOverflow,
      compressed: iterations > 0,
      iterations,
    };

    this.logger.info('Render complete', {
      template: template.id,
      fits: currentOverflow.fits,
      pages: currentOverflow.estimatedPages,
      compressed: result.compressed,
    });

    return result;
  }

  getTemplate(templateId: string): TemplateDefinition | undefined {
    return TEMPLATES[templateId];
  }

  listTemplates(): { id: string; name: string; description: string; category: string }[] {
    return Object.values(TEMPLATES).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
    }));
  }

  private resolveTemplate(templateId?: string): TemplateDefinition {
    const id = templateId ?? this.config.defaultTemplate ?? 'modern-professional';
    return TEMPLATES[id] ?? TEMPLATES['modern-professional'];
  }
}
