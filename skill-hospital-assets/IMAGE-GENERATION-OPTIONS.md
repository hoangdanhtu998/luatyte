# 🎨 Image Generation Options Comparison

## Option 1: Together AI (Recommended)
| | Details |
|---|---|
| **Cost** | Free $25 credit, then pay-per-use |
| **Speed** | Fast (FLUX.1-schnell: ~5s/image) |
| **Quality** | Excellent (FLUX model) |
| **Setup** | Sign up → API key |
| **Best for** | Production use, high quality |

```bash
export TOGETHER_API_KEY="your-key-here"
node generate-ai.mjs bed-single
```

## Option 2: Hugging Face Inference API (Free)
| | Details |
|---|---|
| **Cost** | Completely free (limited) |
| **Speed** | Medium (~10-30s/image) |
| **Quality** | Good |
| **Setup** | Hugging Face token |
| **Best for** | Testing, small projects |

```bash
export HF_API_TOKEN="your-token-here"
# Use huggingface_hub Python package
```

## Option 3: Local Generation (No API)
| | Details |
|---|---|
| **Cost** | Free |
| **Speed** | Instant |
| **Quality** | Placeholder only |
| **Setup** | None |
| **Best for** | Prototyping, structure |

```bash
node generate-hospital-assets.mjs
# Creates SVG placeholders
```

## Option 4: ComfyUI / Stable Diffusion (Advanced)
| | Details |
|---|---|
| **Cost** | Free (requires GPU) |
| **Speed** | Slow (~1-2min/image) |
| **Quality** | Excellent (with fine-tuning) |
| **Setup** | Install ComfyUI + models |
| **Best for** | Custom styles, batch generation |

## Recommendation

For hospital game assets:

1. **Start with Option 3** (placeholders) - get structure ready
2. **Try Option 1** (Together AI) - best quality/speed balance
3. **Use Option 4** if you need custom styles

## Quick Start

```bash
# 1. Generate placeholders
cd "/c/Users/SK/Documents/Luật y tế/skill-hospital-assets"
node generate-hospital-assets.mjs

# 2. Get Together AI key
# Visit: https://api.together.ai

# 3. Generate real images
export TOGETHER_API_KEY="your-key"
node generate-ai.mjs beds
```
