
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    heroImage: image().optional(),
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    author: z.string().default('迷走客'),
  }),
});

export const collections = {
  'blog': blogCollection,
};
