---
name: hospital-image-assets
description: Generate pixel art hospital asset images for game development. Use when the user wants to create images for the hospital environment (beds, furniture, medical equipment, signs, vehicles, construction items, outdoor elements). Creates individual prompts for each item, generates them, and saves to organized folders.
---

# Hospital Game Assets Generator

This skill generates pixel art 2D isometric game assets for a hospital environment game.

## Overview

Create individual image assets from a pre-defined list of prompts. Each asset is:
- Pixel art style, 2D
- Isometric view
- Transparent background
- 1774x887 resolution (matching the reference image)
- Saved to organized folders

## Installation

### Option 1: Use Together AI (Recommended)
```bash
# Set API key
export TOGETHER_API_KEY="your-together-api-key"

# Or install the skill
git clone https://github.com/thewh1teagle/hallmark-skills.git ~/.agents/skills/hallmark
```

### Option 2: Use Hugging Face Inference API (Free tier)
```bash
# Get free API key from https://huggingface.co/settings/tokens
export HF_API_TOKEN="your-huggingface-token"
```

### Option 3: Local Generation (No API needed)
Uses Python PIL to create simple placeholder icons + color blocks

## Usage

```bash
# Generate all assets
node generate-hospital-assets.mjs --all

# Generate specific category
node generate-hospital-assets.mjs --category beds
node generate-hospital-assets.mjs --category signs

# Generate single asset
node generate-hospital-assets.mjs --item bed-single

# With custom model
node generate-hospital-assets.mjs --all --model black-forest-labs/FLUX.1.1-schnell
```

## Available Categories

| Category | Items | Description |
|----------|-------|-------------|
| `beds` | bed-single, bed-double, gurney | Hospital beds and stretchers |
| `furniture` | reception-desk, waiting-chair, nurse-station | Office and waiting area furniture |
| `medical-equipment` | ultrasound, xray, mri, iv-stand | Medical devices and machines |
| `signs` | sign-emergency, sign-internal, sign-hospital | Room and directional signs |
| `vehicles` | ambulance, excavator | Vehicles and construction equipment |
| `construction` | traffic-cone, barrier, hard-hat | Construction safety items |
| `outdoor` | tree-small, tree-large, fountain, park-bench | Outdoor environment elements |
| `props` | kiosk, oxygen-tank, medical-basket | Small props and accessories |

## Prompt Templates

Each item has a standardized prompt template:

```
Create a pixel art 2D, isometric view, [item description], [style details], 
background transparent, sharp details, 1774x887 resolution, game asset style
```

## Output Structure

```
hospital-assets/
├── beds/
│   ├── bed-single.png
│   ├── bed-double.png
│   └── gurney.png
├── furniture/
│   ├── reception-desk.png
│   ├── waiting-chair.png
│   └── nurse-station.png
├── medical-equipment/
│   ├── ultrasound.png
│   ├── xray.png
│   ├── mri.png
│   └── iv-stand.png
├── signs/
│   ├── sign-emergency.png
│   ├── sign-internal.png
│   └── sign-hospital.png
├── vehicles/
│   ├── ambulance.png
│   └── excavator.png
├── construction/
│   ├── traffic-cone.png
│   ├── barrier.png
│   └── hard-hat.png
├── outdoor/
│   ├── tree-small.png
│   ├── tree-large.png
│   ├── fountain.png
│   └── park-bench.png
└── props/
    ├── kiosk.png
    ├── oxygen-tank.png
    └── medical-basket.png
```

## Workflow

1. Read this SKILL.md
2. Run the generate script with desired categories
3. Review generated images
4. Select best versions
5. Organize into game project

## Customization

### Change Style
Modify the `style` parameter in prompts:
- `pixel art anime` - Soft, anime-style pixel art
- `pixel art game` - Standard game asset style
- `minimalist pixel` - Clean, minimal style

### Change Resolution
Default: 1774x887
Options: 512x256, 1024x512, 1774x887, 2048x1024

### Add More Items
Edit `prompts.json` to add new items and their prompts.

