export type Category = 'Strategy' | 'Design' | 'Development' | 'Growth';

export const SERVICE_ANCHORS: Record<string, { category: Category; anchor: string }> = {
  // Strategy
  'Brand Positioning & Messaging': { category: 'Strategy', anchor: 'brand-positioning-and-messaging' },
  'Content Strategy & Planning':   { category: 'Strategy', anchor: 'content-strategy-and-planning' },
  'Information Architecture':      { category: 'Strategy', anchor: 'information-architecture' },
  'Market Research & Analysis':    { category: 'Strategy', anchor: 'market-research-and-analysis' }, // reserved; add section before linking

  // Design
  'Brand & Identity Design':       { category: 'Design', anchor: 'brand-and-identity-design' },
  'User Interface Design':         { category: 'Design', anchor: 'user-interface-design' },
  'User Experience Design':        { category: 'Design', anchor: 'user-experience-design' },
  'Design Systems':                { category: 'Design', anchor: 'design-systems' }, // reserved
  'Prototyping & Usability Testing': { category: 'Design', anchor: 'prototyping-and-usability-testing' }, // reserved

  // Development
  'Custom Website Development':    { category: 'Development', anchor: 'custom-website-development' },
  'Webflow':                       { category: 'Development', anchor: 'webflow-implementations' },
  'Webflow Implementations':       { category: 'Development', anchor: 'webflow-implementations' },
  'WordPress (existing sites)':    { category: 'Development', anchor: 'wordpress-existing-sites' },
  'Shopify Builds':                { category: 'Development', anchor: 'shopify-builds' },
  'Performance & Core Web Vitals': { category: 'Development', anchor: 'performance-and-core-web-vitals' }, // reserved
  'Accessibility (Development)':   { category: 'Development', anchor: 'accessibility-development' }, // reserved
  'CMS & Content Modelling':       { category: 'Development', anchor: 'cms-and-content-modelling' }, // reserved

  // Growth
  'Maintenance & Support':         { category: 'Growth', anchor: 'maintenance-and-support' },
  'Conversion Rate Optimisation':  { category: 'Growth', anchor: 'conversion-rate-optimisation' },
  'Analytics & Measurement':       { category: 'Growth', anchor: 'analytics-and-measurement' },
  'Digital Strategy':              { category: 'Growth', anchor: 'digital-strategy' },
  'A/B Testing & Experimentation': { category: 'Growth', anchor: 'ab-testing-and-experimentation' }, // reserved
};
