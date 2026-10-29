# 🏥 Hospital Game Assets Generator

Tạo asset hình ảnh pixel art 2D isometric cho môi trường bệnh viện game.

## 📦 Cài đặt

### 1. Tạo API Key (Free)
```bash
# Together AI (khuyến nghị)
export TOGETHER_API_KEY="your-key-here"

# Hoặc Hugging Face (free tier)
export HF_API_TOKEN="your-token-here"
```

### 2. Chạy generator
```bash
# Tạo placeholders (không cần API)
node generate-hospital-assets.mjs

# Tạo với AI (cần API key)
node generate-hospital-assets.mjs --ai
```

## 📂 Cấu trúc output

```
hospital-assets/
├── beds/           # Giường bệnh, xe đẩy
├── furniture/      # Bàn ghế, quầy tiếp tân
├── medical-equipment/  # Máy móc y tế
├── signs/          # Biển phòng ban
├── vehicles/       # Xe cứu thương, máy xúc
├── construction/   # Vật tư xây dựng
├── outdoor/        # Cây cảnh, ghế đá
└── props/          # Phụ kiện nhỏ
```

## 🎨 Tùy chỉnh

```bash
# Đổi style
STYLE="minimalist pixel" node generate-hospital-assets.mjs --ai

# Đổi kích thước
SIZE="1024x512" node generate-hospital-assets.mjs --ai

# Chọn model
IMAGE_MODEL="black-forest-labs/FLUX.1-dev" node generate-hospital-assets.mjs --ai
```

## 📝 Chi tiết prompt

Mỗi item có prompt được tối ưu cho:
- Pixel art 2D
- Isometric view (3D nhìn từ trên xuống)
- Background trong suốt
- 1774x887 resolution
- Game asset style

## 🚀 Hướng dẫn sử dụng

1. Chạy generator để tạo placeholders
2. Review placeholders
3. Set API key và chạy với `--ai`
4. Chọn ảnh đẹp nhất từ kết quả
5. Import vào game engine (Unity, Phaser, Godot)

## 📄 Files

- `SKILL.md` - Documentation
- `generate-hospital-assets.mjs` - Generator script
- `hospital-assets/` - Output folder

## 🔗 Links

- [Together AI](https://together.ai) - Image generation API
- [Hugging Face](https://huggingface.co) - Free inference API
