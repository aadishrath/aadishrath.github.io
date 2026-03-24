import { aboutMe, summary } from '../data/aboutMe';
import { mlProjects, feProjects } from '../data/projectsBuilt';
import { buckets } from '../data/langAndTools';

const ROUTE_LABELS = {
  '/': 'Home',
  '/projects': 'ML Projects',
  '/frontend': 'Frontend Projects',
  '/sentiment': 'Sentiment Demo',
  '/rag': 'RAG Demo',
};

export function getRouteLabel(pathname) {
  return ROUTE_LABELS[pathname] ?? pathname;
}

const CONTACT_DETAILS = {
  linkedin: 'https://www.linkedin.com/in/adirathore/',
  github: 'https://github.com/aadishrath',
  resume: '/AadishRathore.pdf',
};

const BASIC_WORLD_BLOCKLIST = [
  'latest',
  'today',
  'current',
  'news',
  'weather',
  'stock',
  'price',
  'breaking',
  'election',
  'president',
  'ceo',
  'exchange rate',
];

function normalizeMojibake(text) {
  return text
    .replaceAll('â€™', "'")
    .replaceAll('â€˜', "'")
    .replaceAll('â€œ', '"')
    .replaceAll('â€�', '"')
    .replaceAll('â€”', '-')
    .replaceAll('â€“', '-')
    .replaceAll('â€‘', '-')
    .replaceAll('ðŸš€', '')
    .replaceAll('ðŸ”', '')
    .replaceAll('ðŸ“¦', '')
    .replaceAll('ðŸ“¬', '')
    .replaceAll('ðŸ§ ', '')
    .replaceAll('ðŸ› ï¸', '')
    .replaceAll('ðŸ“Š', '')
    .replaceAll('ðŸ§¹', '')
    .replaceAll('ðŸ”—', '')
    .replaceAll('ðŸŒ', '')
    .replaceAll('ðŸ¡', '')
    .replaceAll('ðŸ˜€', '')
    .replaceAll('â”œâ”€â”€', '-')
    .replaceAll('â””â”€â”€', '-');
}

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ');
}

function compactWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeText(text) {
  return compactWhitespace(stripHtml(normalizeMojibake(text)));
}

function tokenize(text) {
  return normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter((token) => token.length > 1);
}

function createSnippet(text, maxLength = 260) {
  const normalized = normalizeText(text);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function buildKnowledgeDocuments() {
  const docs = [
    {
      id: 'profile-summary',
      category: 'profile',
      title: 'Profile Summary',
      path: '/',
      sourceLabel: 'Home summary',
      text: `${summary} ${aboutMe}`,
    },
    {
      id: 'contact',
      category: 'contact',
      title: 'Contact and Resume',
      path: '/',
      sourceLabel: 'Footer contact links',
      text: `I can be reached through LinkedIn at ${CONTACT_DETAILS.linkedin}, GitHub at ${CONTACT_DETAILS.github}, and resume download at ${CONTACT_DETAILS.resume}. The on-site contact form is a dummy UI component and the email is shared on the resume.`,
    },
    {
      id: 'navigation',
      category: 'navigation',
      title: 'Website Navigation',
      path: '/',
      sourceLabel: 'Navbar',
      text: 'The website has routes for Home, ML Projects, Frontend Projects, Sentiment Analysis, RAG, and Contact in the footer section.',
    },
    ...buckets.map((bucket) => ({
      id: `skill-${bucket.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      category: 'skills',
      title: bucket.title,
      path: '/',
      sourceLabel: 'Languages & Tools',
      text: `${bucket.title}: ${bucket.items.join(', ')}`,
    })),
    ...mlProjects.map((project) => ({
      id: `ml-${project.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      category: 'ml-project',
      title: project.title,
      path: '/projects',
      sourceLabel: 'ML projects',
      text: `${project.description} ${project.details}`,
      repo: project.repo,
    })),
    ...feProjects.map((project) => ({
      id: `fe-${project.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      category: 'fe-project',
      title: project.title,
      path: '/frontend',
      sourceLabel: 'Frontend projects',
      text: `${project.description} ${project.details}`,
      repo: project.repo,
      link: project.link,
    })),
    {
      id: 'rag-route',
      category: 'route',
      title: 'RAG Demo Page',
      path: '/rag',
      sourceLabel: 'RAG page',
      text: 'The RAG page lets visitors upload markdown, text, and PDF files, inspect corpus status, ask grounded questions, and see cited retrieval results. It also includes guidance on how to use the demo.',
    },
    {
      id: 'sentiment-route',
      category: 'route',
      title: 'Sentiment Demo Page',
      path: '/sentiment',
      sourceLabel: 'Sentiment page',
      text: 'The sentiment demo lets visitors submit text and receive sentiment predictions. It showcases the integrated ML experience within the portfolio.',
    },
  ];

  return docs.map((doc) => ({
    ...doc,
    normalizedText: normalizeText(doc.text),
    tokens: tokenize(doc.text),
  }));
}

const KNOWLEDGE_DOCUMENTS = buildKnowledgeDocuments();

function scoreDocument(queryTokens, queryLower, doc, pathname) {
  let score = 0;
  const uniqueTokens = new Set(queryTokens);

  uniqueTokens.forEach((token) => {
    if (doc.tokens.includes(token)) {
      score += 3;
    }

    if (doc.title.toLowerCase().includes(token)) {
      score += 4;
    }
  });

  if (doc.normalizedText.toLowerCase().includes(queryLower)) {
    score += 8;
  }

  if (pathname && doc.path === pathname) {
    score += 5;
  }

  if (pathname === '/rag' && /rag|retrieval|vector|embedding|pdf|corpus|upload/.test(queryLower)) {
    score += doc.id === 'rag-route' ? 5 : 0;
  }

  if (pathname === '/sentiment' && /sentiment|emotion|text|prediction/.test(queryLower)) {
    score += doc.id === 'sentiment-route' ? 5 : 0;
  }

  return score;
}

function getTopSiteMatches(query, pathname) {
  const queryTokens = tokenize(query);
  const queryLower = normalizeText(query).toLowerCase();

  return KNOWLEDGE_DOCUMENTS
    .map((doc) => ({
      ...doc,
      score: scoreDocument(queryTokens, queryLower, doc, pathname),
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildSkillsAnswer() {
  const bucketSummary = buckets
    .map((bucket) => `${bucket.title}: ${bucket.items.join(', ')}`)
    .join('\n');

  return `My skills are grouped into these areas:\n${bucketSummary}`;
}

function buildProjectsAnswer(projects, heading) {
  const lines = projects.map((project) => `- ${project.title}: ${project.description}`);
  return `${heading}\n${lines.join('\n')}`;
}

function buildNavigationAnswer() {
  return `You can browse these main sections: Home (${ROUTE_LABELS['/']}), ML Projects, Frontend Projects, Sentiment Analysis, and RAG. The Contact section lives in the footer, and the resume download is available there too.`;
}

function buildRouteAwareAnswer(pathname) {
  if (!pathname || !ROUTE_LABELS[pathname]) {
    return null;
  }

  return `You're currently on the ${ROUTE_LABELS[pathname]} screen. I can explain what this page does, point you to related projects, or help you navigate the rest of the site.`;
}

function isSiteQuestion(query) {
  return /portfolio|website|site|your|you|resume|contact|linkedin|github|project|projects|skill|skills|experience|background|home|frontend|sentiment|rag|upload|pdf|demo|route|page|navigate/.test(
    normalizeText(query).toLowerCase(),
  );
}

function isUnsafeGeneralTopic(query) {
  const lower = normalizeText(query).toLowerCase();
  return BASIC_WORLD_BLOCKLIST.some((term) => lower.includes(term));
}

function sanitizeWikipediaExtract(text) {
  return compactWhitespace(
    text
      .replaceAll(/<[^>]+>/g, ' ')
      .replaceAll('&quot;', '"')
      .replaceAll('&amp;', '&')
      .replaceAll('&#39;', "'"),
  );
}

async function fetchWikipediaAnswer(query) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query,
  )}&utf8=1&format=json&origin=*`;

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error('search-failed');
  }

  const searchPayload = await searchResponse.json();
  const bestMatch = searchPayload?.query?.search?.[0];

  if (!bestMatch?.title) {
    return null;
  }

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch.title)}`;
  const summaryResponse = await fetch(summaryUrl);

  if (summaryResponse.ok) {
    const summaryPayload = await summaryResponse.json();
    const extract = summaryPayload?.extract;

    if (extract) {
      return {
        text: extract,
        sourceLabel: `Wikipedia: ${bestMatch.title}`,
        sourceUrl: summaryPayload?.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatch.title.replaceAll(' ', '_'))}`,
      };
    }
  }

  if (bestMatch.snippet) {
    return {
      text: sanitizeWikipediaExtract(bestMatch.snippet),
      sourceLabel: `Wikipedia search: ${bestMatch.title}`,
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatch.title.replaceAll(' ', '_'))}`,
    };
  }

  return null;
}

export function getQuickPrompts(pathname) {
  const routePrompt = pathname === '/rag'
    ? 'What can I do on this RAG page?'
    : pathname === '/sentiment'
      ? 'How does the sentiment demo work?'
      : 'What kind of engineer am I?';

  return [
    routePrompt,
    'What projects should recruiters notice first?',
    'Where can I find the resume?',
    'Explain a basic world topic like photosynthesis.',
  ];
}

export async function resolveChatbotAnswer({ query, pathname }) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return {
      text: 'Ask me about this portfolio, the projects on it, or a basic stable topic like a science or geography concept.',
      sources: [],
    };
  }

  if (isUnsafeGeneralTopic(normalizedQuery)) {
    return {
      text: "I can answer this site's content directly, but for time-sensitive world topics I won't guess without a live trusted source. Try a stable topic or ask me something about the portfolio.",
      sources: [],
    };
  }

  const lower = normalizedQuery.toLowerCase();

  if (/current page|this page|where am i/.test(lower)) {
    return {
      text: buildRouteAwareAnswer(pathname) ?? buildNavigationAnswer(),
      sources: pathname && ROUTE_LABELS[pathname]
        ? [{ label: `${ROUTE_LABELS[pathname]} page`, type: 'route' }]
        : [],
    };
  }

  if (/contact|linkedin|github|resume|email/.test(lower)) {
    return {
      text: `You can reach me through LinkedIn (${CONTACT_DETAILS.linkedin}), GitHub (${CONTACT_DETAILS.github}), or download the resume from ${CONTACT_DETAILS.resume}. The on-page contact form is currently a placeholder UI.`,
      sources: [{ label: 'Footer contact links', type: 'site' }],
    };
  }

  if (/skills|tools|tech stack|technology|technologies/.test(lower)) {
    return {
      text: buildSkillsAnswer(),
      sources: [{ label: 'Languages & Tools', type: 'site' }],
    };
  }

  if (/ml projects|machine learning projects/.test(lower)) {
    return {
      text: buildProjectsAnswer(mlProjects, 'Here are the ML-focused projects highlighted on the site:'),
      sources: [{ label: 'ML projects', type: 'site' }],
    };
  }

  if (/frontend projects|fe projects|front end projects/.test(lower)) {
    return {
      text: buildProjectsAnswer(feProjects, 'Here are the frontend projects highlighted on the site:'),
      sources: [{ label: 'Frontend projects', type: 'site' }],
    };
  }

  if (/navigate|pages|routes|sections/.test(lower)) {
    return {
      text: buildNavigationAnswer(),
      sources: [{ label: 'Navbar', type: 'site' }],
    };
  }

  const siteMatches = getTopSiteMatches(normalizedQuery, pathname);
  const clearlySiteScoped = isSiteQuestion(normalizedQuery) || siteMatches.length > 0;

  if (clearlySiteScoped) {
    if (siteMatches.length === 0) {
      return {
        text: "I couldn't find a confident match in the site's content for that question. Try asking about my background, skills, projects, contact links, or the current page.",
        sources: [],
      };
    }

    const topSnippets = siteMatches.map((match) => `- ${match.title}: ${createSnippet(match.text)}`).join('\n');

    return {
      text: `Here's the closest information I found from the portfolio:\n${topSnippets}`,
      sources: siteMatches.map((match) => ({
        label: match.sourceLabel,
        type: 'site',
        href: match.repo ?? match.link ?? match.path,
      })),
    };
  }

  try {
    const wikipediaResult = await fetchWikipediaAnswer(normalizedQuery);
    if (wikipediaResult) {
      return {
        text: `${wikipediaResult.text}\n\nThis answer comes from a public encyclopedia source rather than the portfolio itself.`,
        sources: [
          {
            label: wikipediaResult.sourceLabel,
            type: 'external',
            href: wikipediaResult.sourceUrl,
          },
        ],
      };
    }
  } catch {
    return {
      text: "I couldn't reach an external knowledge source right now. I can still answer questions about this portfolio with high confidence.",
      sources: [],
    };
  }

  return {
    text: "I don't have a confident answer for that yet. Ask me about the portfolio, the demos, my skills, or a basic stable topic like a science concept.",
    sources: [],
  };
}
