import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/content/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/contact/`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms/`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy/`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
