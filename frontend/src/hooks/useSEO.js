import { useEffect } from 'react';

/**
 * Custom hook to update document title, meta tags, OpenGraph, Twitter cards, canonical link, and JSON-LD structured data.
 */
export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  schema
} = {}) {
  useEffect(() => {
    const defaultTitle = 'Grameena Bharatham | Authentic Andhra Pickles, Cold Pressed Oils & Snacks';
    const siteTitle = title ? `${title} | Grameena Bharatham` : defaultTitle;
    document.title = siteTitle;

    const defaultDesc = 'Authentic Andhra homemade delicacies from Grameena Bharatham. Shop traditional mango & gongura pickles, pure cold-pressed oils, traditional Andhra sweets, chekkalu, and aromatic podulu made with pure ingredients.';
    const metaDesc = description || defaultDesc;

    // Helper to set or create meta tag
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', metaDesc);
    if (keywords) setMeta('name', 'keywords', keywords);

    // OpenGraph
    setMeta('property', 'og:title', siteTitle);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', canonical || window.location.href);
    setMeta('property', 'og:image', ogImage || 'https://www.grameenabharatham.com/images/hero.jpg');

    // Twitter
    setMeta('name', 'twitter:title', siteTitle);
    setMeta('name', 'twitter:description', metaDesc);
    setMeta('name', 'twitter:image', ogImage || 'https://www.grameenabharatham.com/images/hero.jpg');

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical || window.location.href);

    // Schema.org script
    let schemaScript = document.getElementById('page-json-ld');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'page-json-ld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, canonical, ogType, ogImage, JSON.stringify(schema)]);
}

