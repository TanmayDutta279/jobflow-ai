const axios = require('axios');

const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { expiresAt: 0, jobs: [] };

const JOB_SOURCES = {
  arbeitnow: 'Arbeitnow',
  remotive: 'Remotive',
  remoteok: 'Remote OK',
  jobicy: 'Jobicy',
};

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeArbeitnow(job) {
  return {
    id: `arbeitnow-${job.slug || job.id || Math.random()}`,
    title: job.title || 'Untitled role',
    company: job.company_name || 'Unknown company',
    description: stripHtml(job.description || ''),
    location: job.location || 'Not specified',
    type: job.job_types?.[0] || 'Not specified',
    postedAt: job.created_at || job.date || null,
    link: job.url || `https://www.arbeitnow.com/view/${job.slug || ''}`,
    source: JOB_SOURCES.arbeitnow,
    logo: job.company_logo || null,
    tags: Array.isArray(job.tags) ? job.tags : [],
  };
}

function normalizeRemotive(job) {
  return {
    id: `remotive-${job.id}`,
    title: job.title || 'Untitled role',
    company: job.company_name || 'Unknown company',
    description: stripHtml(job.description || ''),
    location: job.candidate_required_location || 'Worldwide',
    type: job.job_type || 'Not specified',
    postedAt: job.publication_date || null,
    link: job.url,
    source: JOB_SOURCES.remotive,
    logo: job.company_logo || null,
    tags: Array.isArray(job.tags) ? job.tags : [],
    salary: job.salary || null,
  };
}

function normalizeRemoteOk(job) {
  return {
    id: `remoteok-${job.id}`,
    title: job.position || 'Untitled role',
    company: job.company || 'Unknown company',
    description: stripHtml(job.description || ''),
    location: job.location || 'Remote',
    type: job.type || 'Not specified',
    postedAt: job.date || null,
    link: job.apply_url || job.url || `https://remoteok.com/remote-jobs/${job.slug || job.id}`,
    source: JOB_SOURCES.remoteok,
    logo: job.company_logo || job.logo || null,
    tags: Array.isArray(job.tags) ? job.tags : [],
    salary: job.salary || (job.salary_min || job.salary_max ? `${job.salary_min || ''}-${job.salary_max || ''}` : null),
  };
}

function normalizeJobicy(job) {
  return {
    id: `jobicy-${job.id}`,
    title: job.jobTitle || 'Untitled role',
    company: job.companyName || 'Unknown company',
    description: stripHtml(job.jobDescription || job.jobExcerpt || ''),
    location: job.jobGeo || 'Anywhere',
    type: Array.isArray(job.jobType) ? job.jobType.join(', ') : (job.jobType || 'Not specified'),
    postedAt: job.pubDate || null,
    link: job.url,
    source: JOB_SOURCES.jobicy,
    logo: job.companyLogo || null,
    tags: Array.isArray(job.jobIndustry) ? job.jobIndustry : [],
    salary: job.salaryMin || job.salaryMax ? `${job.salaryMin || ''}-${job.salaryMax || ''} ${job.salaryCurrency || ''}`.trim() : null,
  };
}

async function fetchSources() {
  const requests = [
    axios.get('https://www.arbeitnow.com/api/job-board-api', { timeout: 12000, headers: { Accept: 'application/json' } }),
    axios.get('https://remotive.com/api/remote-jobs?limit=50', { timeout: 12000, headers: { Accept: 'application/json' } }),
    axios.get('https://remoteok.com/api', { timeout: 12000, headers: { Accept: 'application/json', 'User-Agent': 'JobFlow-AI/1.0' } }),
    axios.get('https://jobicy.com/api/v2/remote-jobs?count=50', { timeout: 12000, headers: { Accept: 'application/json' } }),
  ];

  const [arbeitnow, remotive, remoteok, jobicy] = await Promise.allSettled(requests);
  const jobs = [];

  if (arbeitnow.status === 'fulfilled' && Array.isArray(arbeitnow.value.data?.data)) {
    jobs.push(...arbeitnow.value.data.data.map(normalizeArbeitnow));
  }
  if (remotive.status === 'fulfilled' && Array.isArray(remotive.value.data?.jobs)) {
    jobs.push(...remotive.value.data.jobs.map(normalizeRemotive));
  }
  if (remoteok.status === 'fulfilled' && Array.isArray(remoteok.value.data)) {
    jobs.push(...remoteok.value.data.slice(1).filter(job => job && job.position).map(normalizeRemoteOk));
  }
  if (jobicy.status === 'fulfilled' && Array.isArray(jobicy.value.data?.jobs)) {
    jobs.push(...jobicy.value.data.jobs.map(normalizeJobicy));
  }

  return jobs.filter(job => job.title && job.company && job.link);
}

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 2);
}

const SKILL_ALIASES = {
  javascript: ['javascript', 'js'],
  typescript: ['typescript', 'ts'],
  react: ['react', 'reactjs'],
  'node.js': ['node.js', 'nodejs', 'node js'],
  java: ['java'],
  python: ['python'],
  cplusplus: ['c++', 'cpp'],
  sql: ['sql', 'mysql', 'postgresql', 'postgres'],
  mongodb: ['mongodb', 'mongo'],
  express: ['express', 'expressjs'],
  html: ['html'],
  css: ['css'],
  tailwind: ['tailwind', 'tailwindcss'],
  git: ['git', 'github'],
  docker: ['docker'],
  aws: ['aws', 'amazon web services'],
  azure: ['azure'],
  gcp: ['gcp', 'google cloud'],
  firebase: ['firebase'],
  'rest api': ['rest api', 'restful api'],
  graphql: ['graphql'],
  'machine learning': ['machine learning', 'ml'],
  ai: ['artificial intelligence', 'ai'],
  llm: ['llm', 'llms', 'large language model'],
  spring: ['spring', 'spring boot'],
  'ruby on rails': ['ruby on rails', 'rails'],
  php: ['php'],
  kotlin: ['kotlin'],
  swift: ['swift'],
  flutter: ['flutter'],
  'data structures': ['data structures', 'dsa'],
  algorithms: ['algorithms'],
};

function containsTerm(text, term) {
  const haystack = String(text || '').toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function extractProfileSkills(resumeText = '', suppliedSkills = []) {
  const text = String(resumeText || '').toLowerCase();
  const skills = new Set((Array.isArray(suppliedSkills) ? suppliedSkills : []).map(s => String(s).trim().toLowerCase()).filter(Boolean));

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some(alias => containsTerm(text, alias))) skills.add(canonical);
  }
  return [...skills];
}

function scoreJobLocally(job, resumeText, profileSkills = []) {
  const resume = String(resumeText || '').toLowerCase();
  const haystack = `${job.title} ${job.description} ${(job.tags || []).join(' ')} ${job.location}`.toLowerCase();
  const title = String(job.title || '').toLowerCase();
  const skills = extractProfileSkills(resumeText, profileSkills);

  const matchedSkills = skills.filter(skill => {
    const aliases = SKILL_ALIASES[skill] || [skill];
    return aliases.some(alias => haystack.includes(alias.toLowerCase()));
  });

  const roleWords = tokenize(resume).filter(word => word.length >= 4);
  const titleHits = roleWords.filter(word => title.includes(word)).slice(0, 6);
  const genericWords = new Set(['experience', 'developer', 'engineer', 'software', 'project', 'skills', 'using', 'work', 'team', 'development', 'technology']);
  const usefulTitleHits = titleHits.filter(word => !genericWords.has(word));

  const skillScore = skills.length ? (matchedSkills.length / Math.min(skills.length, 10)) * 60 : 0;
  const titleScore = Math.min(usefulTitleHits.length * 8, 25);
  const tokenSet = new Set(tokenize(resume));
  const jobTokens = new Set(tokenize(`${job.title} ${(job.tags || []).join(' ')}`));
  let overlap = 0;
  for (const token of jobTokens) if (tokenSet.has(token)) overlap++;
  const overlapScore = Math.min(overlap * 3, 15);

  let score = Math.round(skillScore + titleScore + overlapScore);
  if (!skills.length) score = Math.min(50, score);
  score = Math.max(15, Math.min(98, score));

  const missingSkills = (job.tags || [])
    .map(tag => String(tag).trim())
    .filter(Boolean)
    .filter(tag => !skills.some(skill => (SKILL_ALIASES[skill] || [skill]).some(alias => tag.toLowerCase().includes(alias.toLowerCase()) || alias.toLowerCase().includes(tag.toLowerCase()))))
    .slice(0, 5);

  const strengths = matchedSkills.slice(0, 5);
  const matchReason = strengths.length
    ? `Strong overlap with ${strengths.slice(0, 3).join(', ')}${usefulTitleHits.length ? ` and the ${job.title} role.` : '.'}`
    : `This role has some overlap with your resume, but the skill match is limited.`;

  return {
    ...job,
    matchScore: score,
    matchedSkills: strengths,
    missingSkills,
    matchReason,
    analysisSource: 'ai-assisted-profile',
  };
}

async function getRecommendedJobs(resumeText = '', profileSkills = []) {
  const now = Date.now();
  if (cache.expiresAt < now || !cache.jobs.length) {
    const freshJobs = await fetchSources();
    if (freshJobs.length) cache = { expiresAt: now + CACHE_TTL_MS, jobs: freshJobs };
  }

  if (!cache.jobs.length) return [];

  const seen = new Set();
  const uniqueJobs = cache.jobs.filter(job => {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueJobs
    .map(job => scoreJobLocally(job, resumeText, profileSkills))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
}


function buildSearchQueryFallback(resumeText = '') {
  const text = String(resumeText || '').replace(/\s+/g, ' ').trim();
  const rolePatterns = [
    /(?:software|frontend|front-end|backend|back-end|full[- ]?stack|web|mobile|data|machine learning|ml|devops|cloud|qa|test|java|python|react|node(?:\.js)?)\s+(?:developer|engineer|analyst|scientist|intern|tester|administrator|architect)/gi,
    /(?:software|frontend|front-end|backend|back-end|full[- ]?stack|web|data|machine learning|ml|devops|cloud|qa|test|java|python|react|node(?:\.js)?)\s+(?:development|engineering|analytics|science)/gi,
  ];
  const roles = [];
  for (const pattern of rolePatterns) {
    for (const match of text.matchAll(pattern)) {
      const value = match[0].trim();
      if (!roles.some(role => role.toLowerCase() === value.toLowerCase())) roles.push(value);
      if (roles.length >= 2) break;
    }
    if (roles.length >= 2) break;
  }
  return roles.join(' ') || 'software developer';
}

function getExternalSearchLinks(query = 'software developer') {
  const safeQuery = String(query || 'software developer').replace(/\s+/g, ' ').trim();
  const encoded = encodeURIComponent(safeQuery);
  const slug = safeQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'software-developer';

  return [
    { name: 'Indeed', url: `https://www.indeed.com/jobs?q=${encoded}&l=India`, description: 'Search current Indeed listings for your AI-generated profile query.' },
    { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=India&f_TPR=r604800`, description: 'Search LinkedIn jobs posted within the last 7 days.' },
    { name: 'Naukri.com', url: `https://www.naukri.com/${slug}-jobs`, description: 'Search Naukri listings for the AI-selected role and skills.' },
    { name: 'Wellfound', url: `https://wellfound.com/jobs?query=${encoded}`, description: 'Search startup and technology roles on Wellfound.' },
  ];
}

module.exports = { getRecommendedJobs, JOB_SOURCES, getExternalSearchLinks, buildSearchQueryFallback };
