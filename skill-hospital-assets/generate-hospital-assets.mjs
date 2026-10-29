/**
 * Hospital Game Assets Generator
 * Generates pixel art 2D isometric game assets for hospital environment
 */

import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const OUTPUT_DIR = process.env.OUTPUT_DIR || join(__dirname, 'hospital-assets');
const STYLE = process.env.STYLE || 'pixel art 2D, isometric view, game asset style';
const SIZE = process.env.SIZE || '1774x887';
const [WIDTH, HEIGHT] = SIZE.split('x').map(Number);

// Item prompts database
const PROMPTS = {
  // Beds
  'bed-single': {
    category: 'beds',
    name: 'Giường bệnh nhân đơn',
    prompt: `Create a pixel art 2D, isometric view, a single hospital patient bed, white metal frame, light blue mattress, white sheets, IV drip stand on the side, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style, clean lines, medical equipment aesthetic`
  },
  'bed-double': {
    category: 'beds',
    name: 'Giường bệnh nhân đôi',
    prompt: `Create a pixel art 2D, isometric view, two hospital patient beds side by side, white metal frames, blue mattresses, white sheets, with bedside tables between them, Vietnamese hospital ward setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'gurney': {
    category: 'beds',
    name: 'Xe đẩy bệnh nhân',
    prompt: `Create a pixel art 2D, isometric view, a hospital gurney stretcher with wheels, red cushion, metal frame, side rails, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Furniture
  'reception-desk': {
    category: 'furniture',
    name: 'Bàn tiếp tân',
    prompt: `Create a pixel art 2D, isometric view, a curved hospital reception desk, wooden surface, computer monitor, call button, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'waiting-chair': {
    category: 'furniture',
    name: 'Ghế chờ bệnh nhân',
    prompt: `Create a pixel art 2D, isometric view, a row of 3 hospital waiting chairs, metal frame, blue cushion, connected design, Vietnamese hospital waiting area, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'nurse-station': {
    category: 'furniture',
    name: 'Trạm y tá',
    prompt: `Create a pixel art 2D, isometric view, a nurse station desk with computer, phone, medical charts, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Medical Equipment
  'ultrasound': {
    category: 'medical-equipment',
    name: 'Máy siêu âm',
    prompt: `Create a pixel art 2D, isometric view, a portable ultrasound machine, screen display, control panel, probe connected by cable, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'xray': {
    category: 'medical-equipment',
    name: 'Máy X-quang',
    prompt: `Create a pixel art 2D, isometric view, a portable X-ray machine, vertical tube arm, control panel, on wheels, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'mri': {
    category: 'medical-equipment',
    name: 'Máy MRI',
    prompt: `Create a pixel art 2D, isometric view, an MRI scanner machine, large cylindrical tunnel, patient bed extending out, control console, Vietnamese hospital radiology department, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'iv-stand': {
    category: 'medical-equipment',
    name: 'Giá truyền dịch',
    prompt: `Create a pixel art 2D, isometric view, an IV drip stand, metal pole with wheels, IV bag hanging, drip chamber, Vietnamese hospital setting, soft lighting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Signs
  'sign-emergency': {
    category: 'signs',
    name: 'Biển cấp cứu',
    prompt: `Create a pixel art 2D, isometric view, a red hospital room sign, white cross icon, Vietnamese text "CẤP CỨU", illuminated border, wall-mounted, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'sign-internal': {
    category: 'signs',
    name: 'Biển nội khoa',
    prompt: `Create a pixel art 2D, isometric view, a blue hospital room sign, doctor icon, Vietnamese text "NỘI KHOA", wall-mounted, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'sign-hospital': {
    category: 'signs',
    name: 'Biển bệnh viện',
    prompt: `Create a pixel art 2D, isometric view, a large hospital entrance sign, red cross symbol, Vietnamese text "BỆNH VIỆN", modern design, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Vehicles
  'ambulance': {
    category: 'vehicles',
    name: 'Xe cứu thương',
    prompt: `Create a pixel art 2D, isometric view, a white ambulance van, red cross symbols, emergency lights on top, driver visible, Vietnamese ambulance design, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'excavator': {
    category: 'vehicles',
    name: 'Máy xúc',
    prompt: `Create a pixel art 2D, isometric view, a yellow construction excavator, articulated arm, bucket, tracks, Vietnamese construction site setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Construction
  'traffic-cone': {
    category: 'construction',
    name: 'Nón giao thông',
    prompt: `Create a pixel art 2D, isometric view, an orange traffic cone with white reflective stripes, base, Vietnamese construction site, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'barrier': {
    category: 'construction',
    name: 'Rào chắn',
    prompt: `Create a pixel art 2D, isometric view, a yellow and black striped construction barrier, Vietnamese construction site, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'hard-hat': {
    category: 'construction',
    name: 'Mũ bảo hiểm',
    prompt: `Create a pixel art 2D, isometric view, an orange construction hard hat, reflective stripe, Vietnamese construction site, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Outdoor
  'tree-small': {
    category: 'outdoor',
    name: 'Cây xanh nhỏ',
    prompt: `Create a pixel art 2D, isometric view, a small green tree in a square planter, lush leaves, brown trunk, Vietnamese hospital garden setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'tree-large': {
    category: 'outdoor',
    name: 'Cây xanh lớn',
    prompt: `Create a pixel art 2D, isometric view, a large mature green tree, full canopy, thick trunk, Vietnamese hospital garden setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'fountain': {
    category: 'outdoor',
    name: 'Bồn phun nước',
    prompt: `Create a pixel art 2D, isometric view, a circular water fountain, water spraying up, surrounding greenery, Vietnamese hospital garden, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'park-bench': {
    category: 'outdoor',
    name: 'Ghế đá công viên',
    prompt: `Create a pixel art 2D, isometric view, a park bench with curved backrest, metal frame, green color, Vietnamese hospital garden setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  // Props
  'kiosk': {
    category: 'props',
    name: 'Bảng thông tin',
    prompt: `Create a pixel art 2D, isometric view, a hospital information kiosk, touch screen display, "i" icon, metal stand, Vietnamese hospital lobby, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'oxygen-tank': {
    category: 'props',
    name: 'Bình oxy',
    prompt: `Create a pixel art 2D, isometric view, a medical oxygen tank, blue cylinder, pressure gauge, regulator valve, Vietnamese hospital setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  },
  'medical-basket': {
    category: 'props',
    name: 'Ca lanh dụng cụ',
    prompt: `Create a pixel art 2D, isometric view, a stainless steel medical basket, containing syringes, cotton pads, medical tools, Vietnamese hospital setting, sharp details, ${WIDTH}x${HEIGHT} resolution, transparent background, game asset style`
  }
};

// Generate placeholder using canvas
function generatePlaceholder(itemKey, outputPath) {
  const item = PROMPTS[itemKey];
  if (!item) return null;

  // Create an SVG placeholder
  const svgContent = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <rect x="10" y="10" width="${WIDTH-20}" height="${HEIGHT-20}" fill="none" stroke="#ccc" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle">${item.name}</text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">${itemKey}.png</text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#bbb" text-anchor="middle">Run with --ai flag to generate real image</text>
    </svg>
  `;

  // Save as SVG (can be converted to PNG later)
  const svgPath = outputPath.replace('.png', '.svg');
  writeFileSync(svgPath, svgContent);
  return svgPath;
}

// Call Together AI API
async function generateWithTogether(prompt, outputPath) {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.log('  ⚠️  TOGETHER_API_KEY not set, creating placeholder instead');
    return generatePlaceholder(outputPath.match(/[^/]+$/)[0], outputPath);
  }

  const model = process.env.IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';

  console.log(`  🎨 Generating with Together AI...`);
  console.log(`  Model: ${model}`);

  try {
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
      throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image data returned');
    }

    const { mkdirSync } = await import('fs');
    mkdirSync(dirname(outputPath), { recursive: true });
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, Buffer.from(base64Image, 'base64'));

    return outputPath;
  } catch (error) {
    console.log(`  ❌ Generation failed: ${error.message}`);
    console.log(`  Creating placeholder instead...`);
    return generatePlaceholder(itemKey, outputPath);
  }
}

// Generate a single asset
async function generateAsset(itemKey, useAI = false) {
  const item = PROMPTS[itemKey];
  if (!item) {
    console.error(`  ❌ Unknown item: ${itemKey}`);
    return null;
  }

  const categoryDir = join(OUTPUT_DIR, item.category);
  mkdirSync(categoryDir, { recursive: true });
  
  const outputPath = join(categoryDir, `${itemKey}.png`);
  const svgPath = join(categoryDir, `${itemKey}.svg`);
  
  console.log(`\n📦 Generating: ${item.name} (${itemKey})`);
  console.log(`   Category: ${item.category}`);
  console.log(`   Output: ${outputPath}`);
  
  let result;
  if (useAI) {
    result = await generateWithTogether(item.prompt, outputPath);
  } else {
    // Create SVG placeholder first
    result = generatePlaceholder(itemKey, svgPath);
    console.log(`   ✓ Created placeholder: ${result}`);
  }

  return result;
}

// Generate a category
async function generateCategory(category, useAI = false) {
  const items = Object.entries(PROMPTS)
    .filter(([key, item]) => item.category === category);

  console.log(`\n🎨 Generating category: ${category}`);
  console.log(`   Items: ${items.length}`);

  for (const [key] of items) {
    await generateAsset(key, useAI);
  }
}

// Main generation function
async function generateAll(useAI = false) {
  const categories = [...new Set(Object.values(PROMPTS).map(p => p.category))];

  console.log('\n🏥 Hospital Assets Generator');
  console.log(`Style: ${STYLE}`);
  console.log(`Size: ${SIZE}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`AI Generation: ${useAI ? 'ON' : 'OFF'}\n`);

  if (useAI) {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.log('⚠️  TOGETHER_API_KEY not set!');
      console.log('Setting it up: export TOGETHER_API_KEY="your-key-here"');
      console.log('Or generate placeholders only.\n');
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const category of categories) {
    await generateCategory(category, useAI);
  }

  console.log('\n✅ Generation complete!');
  console.log('\nNext steps:');
  if (useAI) {
    console.log('1. Review generated images in: ' + OUTPUT_DIR);
    console.log('2. Select best versions');
    console.log('3. Organize into your game project');
  } else {
    console.log('1. Run with --ai flag to generate real images');
    console.log('2. Set TOGETHER_API_KEY environment variable');
    console.log('3. Review and select best assets');
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const useAI = args.includes('--ai') || args.includes('--all');
  const category = args.find(a => a === '--category') ? args[args.indexOf('--category') + 1] : null;
  const item = args.find(a => !a.startsWith('--'));

  if (item && !category) {
    await generateAsset(item, useAI);
  } else if (category) {
    await generateCategory(category, useAI);
  } else {
    await generateAll(useAI);
  }
}

main().catch(console.error);
