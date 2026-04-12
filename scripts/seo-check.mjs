import { readFileSync, existsSync } from 'fs';

const files = [
  'z-ai-glm-5-1-acik-kaynak-754b-otonom-kodlama.mdx',
  'cohere-aleph-alpha-birlesmesi-avrupa-ai-stratejisi.mdx',
  'elevenlabs-on-premise-on-device-kurumsal-ses-ai.mdx',
  'coreweave-meta-21-milyar-anthropic-ozel-bulut-ai-altyapisi.mdx',
  'axios-tedarik-zinciri-saldirisi-openai-guvenlik-acigi.mdx',
  'langchain-deep-agents-deploy-acik-kaynak-agent.mdx',
  'minimax-m2-7-self-evolving-agent-swe-bench.mdx',
  'google-ai-edge-gallery-gemma-4-telefonda-yerel.mdx',
  'perplexity-plaid-entegrasyonu-vergi-asistani.mdx',
  'nousresearch-hermes-agent-github-trending.mdx'
];

const trChars = /[çğışöüÇĞİŞÖÜ]/;

for (const f of files) {
  const raw = readFileSync('content/haberler/' + f, 'utf8');
  const parts = raw.split('---');
  const fm = parts[1];
  const body = parts.slice(2).join('---');

  const getVal = (key) => {
    const m = fm.match(new RegExp(key + ':\\s*["\']([\\s\\S]*?)["\']\\s*\\n'));
    return m ? m[1] : null;
  };

  const title = getVal('title');
  const slugRaw = fm.match(/slug:\s*["']?([\w-]+)["']?/)?.[1];
  const desc = getVal('description');
  const imageAlt = getVal('imageAlt');

  const kwBlock = fm.match(/keywords:([\s\S]*?)(?=sources:|confidence:)/)?.[1] ?? '';
  const keywords = kwBlock.match(/- .+/g) ?? [];

  const hasEmDash = raw.includes('\u2014');
  const imageExists = existsSync('public/images/haberler/' + f.replace('.mdx', '.webp'));

  const issues = [];
  if (!title) issues.push('title YOK');
  else if (title.length > 70) issues.push(`title uzun (${title.length})`);

  if (!slugRaw) issues.push('slug YOK');
  else if (trChars.test(slugRaw)) issues.push('slug TR karakter var');

  if (!desc) issues.push('description YOK');
  else if (desc.length < 120) issues.push(`desc kısa (${desc.length})`);
  else if (desc.length > 160) issues.push(`desc uzun (${desc.length})`);

  if (!imageAlt) issues.push('imageAlt YOK');

  if (keywords.length !== 6) issues.push(`keyword sayısı: ${keywords.length}`);
  else if (!keywords[5].includes('yapay zeka haberleri')) issues.push('son keyword yanlış: ' + keywords[5]);

  if (hasEmDash) issues.push('EM-DASH var!');
  if (!imageExists) issues.push('GÖRSEL YOK');

  const label = f.replace('.mdx', '').substring(0, 40);
  if (issues.length === 0) {
    console.log(`OK     | ${label}`);
  } else {
    console.log(`SORUN  | ${label}`);
    for (const i of issues) console.log(`         -> ${i}`);
  }
}
