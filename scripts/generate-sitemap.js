import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_SITE_URL || 'https://anand-utsav.vercel.app';

const staticPages = [
  '',
  '/about',
  '/team',
  '/contact',
  '/report-fraud',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/blog',
  '/careers',
  '/investor-relations',
  '/corporate',
  '/security',
  '/piracy',
  '/cookie-policy',
  '/content-policies',
];

const categorySlugs = [
  'catering',
  'decorations',
  'photography',
  'videography',
  'beauty-makeup',
  'fashion-attire',
  'invitations',
  'venues',
  'entertainment',
  'music-bands',
  'djs',
  'travel',
  'transport',
  'event-planning',
  'florists',
  'production-sound-lights',
  'fireworks',
  'mehndi-artists',
  'gifting',
  'jewellery',
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Information Pages
  staticPages.filter(p => p !== '').forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // Category Pages
  categorySlugs.forEach(slug => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/category/${slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[Sitemap] Successfully generated sitemap.xml at ${sitemapPath}`);
}

generateSitemap();
