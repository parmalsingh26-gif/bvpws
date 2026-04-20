import 'dotenv/config';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function main() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error('API error:', data?.error?.message || res.statusText);
      process.exit(1);
    }
    const models = (data?.models || [])
      .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => m.name)
      .filter(Boolean);

    const list = models.join('\n');
    fs.writeFileSync('supported_models.txt', list, 'utf8');
    console.log('Models that support generateContent:\n');
    console.log(list);
    console.log('\nSaved to supported_models.txt');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
