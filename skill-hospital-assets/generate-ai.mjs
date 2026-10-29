/**
 * Batch AI Image Generator for Hospital Assets
 * Uses Together AI API to generate real pixel art images
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.OUTPUT_DIR || join(__dirname, 'hospital-assets');

async function generateImage(prompt, outputPath, retries = 3) {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TOGETHER_API_KEY not set!');
    console.log('Get your key at: https://api.together.ai/settings/api-keys');
    console.log('Set it: export TOGETHER_API_KEY="your-key"');
    return null;
  }

  const model = process.env.IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';
  const [WIDTH, HEIGHT] = (process.env.SIZE || '1774x887').split('x').map(Number);

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`  🎨 Generating... (attempt ${i + 1}/${retries})`);
      
      const res = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          width: WIDTH,
          height: HEIGHT,
          steps: 4,
          n: 1
        }),
        signal: AbortSignal.timeout(120000)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error ${res.status}: ${err.slice(0, 300)}`);
      }

      const data = await res.json();
      const base64Image = data.data?.[0]?.b64_json;

      if (!base64Image) {
        throw new Error('No image data returned');
      }

      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, Buffer.from(base64Image, 'base64'));
      
      console.log(`  ✅ Saved: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.log(`  ⚠️  Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`  ⏳ Retrying in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  return null;
}

async function main() {
  // Import prompts from the main script
  const { PROMPTS } = await import('./generate-hospital-assets.mjs');
  
  const item = process.argv[2];
  const category = process.argv[3];
  
  if (item) {
    const prompt = PROMPTS[item];
    if (!prompt) {
      console.error(`Item not found: ${item}`);
      console.log('Available items:', Object.keys(PROMPTS).join(', '));
      process.exit(1);
    }
    
    const outputPath = join(OUTPUT_DIR, prompt.category, `${item}.png`);
    await generateImage(prompt.prompt, outputPath);
  } else if (category) {
    const items = Object.entries(PROMPTS)
      .filter(([key, p]) => p.category === category);
    
    console.log(`Generating ${items.length} assets for category: ${category}\n`);
    
    for (const [key, prompt] of items) {
      const outputPath = join(OUTPUT_DIR, category, `${key}.png`);
      await generateImage(prompt.prompt, outputPath);
      console.log('');
    }
  } else {
    console.log('Usage:');
    console.log('  node generate-ai.mjs <item-key>');
    console.log('  node generate-ai.mjs <category>');
    console.log('');
    console.log('Categories:', [...new Set(Object.values(PROMPTS).map(p => p.category))].join(', '));
    console.log('');
    console.log('Example:');
    console.log('  node generate-ai.mjs bed-single');
    console.log('  node generate-ai.mjs beds');
  }
}

main().catch(console.error);
