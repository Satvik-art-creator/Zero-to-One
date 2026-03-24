/**
 * PlaceBridge — Static Fallback Map
 * Used when Groq fails (timeout, error, invalid response).
 * Maps skill keywords and company types to resource IDs from the registry.
 */

const resourceFallbackMap = {
  // ──── By Skill ─────────────────────────────────────
  bySkill: {
    react: ['lc-arrays', 'yt-neetcode-150', 'glassdoor-interviews'],
    'system design': ['sdp-github', 'gfg-system-design', 'yt-techdummies-sd'],
    python: ['lc-top-150', 'yt-striver-a2z', 'gfg-ds'],
    node: ['gfg-dbms', 'lc-arrays', 'glassdoor-interviews'],
    'node.js': ['gfg-dbms', 'lc-arrays', 'glassdoor-interviews'],
    docker: ['sdp-github', 'gfg-system-design'],
    sql: ['gfg-dbms', 'lc-arrays'],
    java: ['lc-top-150', 'gfg-oop', 'yt-apna-college'],
    'c++': ['lc-top-150', 'gfg-oop', 'yt-striver-a2z'],
    javascript: ['lc-arrays', 'yt-neetcode-150', 'gfg-ds'],
    dsa: ['lc-top-150', 'yt-striver-a2z', 'yt-neetcode-150'],
    'data structures': ['gfg-ds', 'lc-arrays', 'yt-striver-a2z'],
    algorithms: ['lc-dp', 'lc-top-150', 'yt-neetcode-150'],
    'dynamic programming': ['lc-dp', 'yt-striver-a2z', 'lc-top-150'],
    mongodb: ['gfg-dbms', 'gfg-ds', 'glassdoor-interviews'],
    mysql: ['gfg-dbms', 'lc-arrays'],
    postgresql: ['gfg-dbms', 'lc-arrays'],
    linux: ['gfg-os', 'sdp-github'],
    networking: ['gfg-cn', 'sdp-github'],
    'computer networks': ['gfg-cn', 'gfg-os'],
    git: ['sdp-github', 'lc-arrays'],
    aws: ['sdp-github', 'gfg-system-design', 'yt-techdummies-sd'],
    kubernetes: ['sdp-github', 'gfg-system-design'],
    redis: ['sdp-github', 'gfg-system-design'],
    'machine learning': ['lc-dp', 'gfg-ds', 'yt-striver-a2z'],
    html: ['lc-arrays', 'gfg-ds', 'yt-apna-college'],
    css: ['lc-arrays', 'gfg-ds', 'yt-apna-college'],
    typescript: ['lc-arrays', 'yt-neetcode-150', 'gfg-ds'],
    express: ['gfg-dbms', 'lc-arrays', 'glassdoor-interviews'],
    'express.js': ['gfg-dbms', 'lc-arrays', 'glassdoor-interviews'],
    oop: ['gfg-oop', 'lc-top-150', 'yt-apna-college'],
    'object oriented programming': ['gfg-oop', 'lc-top-150'],
    dbms: ['gfg-dbms', 'gfg-os'],
    os: ['gfg-os', 'gfg-cn'],
    'operating systems': ['gfg-os', 'gfg-cn'],
  },

  // ──── By Company Type ──────────────────────────────
  byCompanyType: {
    Product: ['lc-top-150', 'sdp-github', 'yt-neetcode-150', 'glassdoor-interviews'],
    Service: ['gfg-os', 'gfg-cn', 'gfg-dbms', 'ambitionbox-reviews'],
    BFSI: ['lc-dp', 'gfg-dbms', 'glassdoor-interviews', 'unstop-challenges'],
    Startup: ['lc-arrays', 'sdp-github', 'yt-apna-college'],
    Consulting: ['gfg-oop', 'gfg-cn', 'ambitionbox-reviews'],
  },
};

module.exports = resourceFallbackMap;
