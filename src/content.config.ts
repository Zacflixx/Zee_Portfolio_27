import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ pattern: '[!_]*.md', base: './src/content/case-studies' }), // files starting with _ (the template) are ignored
  schema: z.object({
    title: z.string(),
    project: z.string(), // id in src/data/projects.ts, used for the cover
    summary: z.string(), // one-line outcome shown on cards and in meta tags
    order: z.number(), // position in the "next case study" chain
    role: z.string(),
    timeline: z.string(),
    team: z.string(),
    platform: z.string(),
    tools: z.array(z.string()),
    status: z.enum(['draft', 'ready']).default('draft'),
  }),
});

export const collections = { 'case-studies': caseStudies };
