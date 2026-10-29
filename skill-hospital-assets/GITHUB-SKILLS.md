# 🎨 GitHub Skills for Hospital Pixel Art Assets

## 🏆 Top Picks for Your Hospital Game

### 1. AI-Powered Image Generation (Best Quality)

| Skill | Stars | Language | Description | URL |
|-------|-------|----------|-------------|-----|
| **civitai-gen-skill** | 18 | JS | Generate images via Civitai API - supports many models | [GitHub](https://github.com/civitai/civitai-gen-skill) |
| **image-skill** | 0 | JS | Google Gemini Image API integration | [GitHub](https://github.com/Brusdeylins/image-skill) |
| **text-to-image-generator** | 0 | JS | Flux Schnell model implementation | [GitHub](https://github.com/PalwinderSinghPaali/text-to-image-generator) |

### 2. Pixel Art Generators (Procedural)

| Skill | Stars | Language | Description | URL |
|-------|-------|----------|-------------|-----|
| **SlopeCraft** | 772 | C++ | Minecraft pixel art map generator | [GitHub](https://github.com/SlopeCraft/SlopeCraft) |
| **pixelArt_Generator** | 181 | Python | NFT pixel art series generator | [GitHub](https://github.com/emirongrr/pixelArt_Generator) |
| **ZzSprite** | 168 | JS | Pixel Art Sprite Generator | [GitHub](https://github.com/KilledByAPixel/ZzSprite) |
| **spritebrew** | 70 | TS | AI-powered pixel art sprite sheet | [GitHub](https://github.com/GAlbanese09/spritebrew) |
| **pixel-character** | 67 | CSS | Under 10kb pixel character generator | [GitHub](https://github.com/KawaiiHannah/pixel-character) |
| **castle-generator** | 43 | C# | 2D pixel art castle generator | [GitHub](https://github.com/unsettledgames/castle-generator) |

### 3. Isometric/Building Assets

| Skill | Stars | Language | Description | URL |
|-------|-------|----------|-------------|-----|
| **Isocube** | 2 | - | Isometric pixel art block generator | [GitHub](https://github.com/Auoja/Isocube) |
| **egy-pixel-city-builder** | 1 | - | Egyptian isometric pixel city (AI) | [GitHub](https://github.com/Ahmed-Refaat/egy-pixel-city-builder) |

---

## 🚀 Recommended Workflow

### Option A: AI Generation (Best Quality)
```bash
# Install our generator
cd /c/Users/SK/Documents/Luật\ y\ tế/skill-hospital-assets

# Get Together AI key (free $25)
export TOGETHER_API_KEY="your-key"

# Generate assets
node generate-ai.mjs --all
```

### Option B: Local Stable Diffusion (Free, Offline)
```bash
# Install ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt

# Download SD models
# Use with our prompts for hospital assets
```

### Option C: Browser-Based (Easiest)
1. **Civitai.com** - Browse Vietnamese hospital assets
2. **Leonardo.ai** - Free tier, good quality
3. **Playground AI** - Free daily credits

---

## 📦 Our Hospital Asset Skill

Located at: `/c/Users/SK/Documents/Luật y tế/skill-hospital-assets/`

### Files:
- `SKILL.md` - Full documentation
- `generate-hospital-assets.mjs` - Generate placeholders
- `generate-ai.mjs` - Generate with AI (needs API key)
- `hospital-assets/` - Output folder (25 assets)
- `IMAGE-GENERATION-OPTIONS.md` - Comparison guide

### Categories (25 items):
| Category | Count | Items |
|----------|-------|-------|
| beds | 3 | bed-single, bed-double, gurney |
| furniture | 3 | reception-desk, waiting-chair, nurse-station |
| medical-equipment | 4 | ultrasound, xray, mri, iv-stand |
| signs | 3 | sign-emergency, sign-internal, sign-hospital |
| vehicles | 2 | ambulance, excavator |
| construction | 3 | traffic-cone, barrier, hard-hat |
| outdoor | 4 | tree-small, tree-large, fountain, park-bench |
| props | 3 | kiosk, oxygen-tank, medical-basket |

---

## 💡 Tips for Best Results

1. **Use medium quality voice** for natural sound
2. **Set speed to 0.9** for clearer enunciation
3. **Test with short text first** (under 100 chars)
4. **Use punctuation** for natural pauses
5. **Batch generate** using `--category` flag

---

## 🔗 Useful Links

- [Together AI](https://together.ai) - API key ($25 free)
- [Hugging Face](https://huggingface.co) - Free inference API
- [Civitai](https://civitai.com) - Model browsing
- [Leonardo.ai](https://leonardo.ai) - Free daily generations
