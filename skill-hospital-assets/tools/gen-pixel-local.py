# Sinh ảnh pixel art bằng SD-Turbo chạy local (CPU), không cần API key.
# Dùng: python gen-pixel-local.py <tên-file> "<prompt>"
# Ảnh xuất ra ../hospital-assets/ai/<tên-file>.png (512px, đã ép về lưới pixel 64px rồi phóng lại).
import sys, os, torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

name, prompt = sys.argv[1], sys.argv[2]
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hospital-assets", "ai")
os.makedirs(out_dir, exist_ok=True)

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sd-turbo", torch_dtype=torch.float32, variant="fp16"
)
pipe = pipe.to("cpu")

full_prompt = f"{prompt}, pixel art, flat colors, white background, centered, game asset, sprite, no text"
img = pipe(prompt=full_prompt, num_inference_steps=4, guidance_scale=0.0, width=512, height=512).images[0]

# Ép về lưới 64x64 để ra đúng kiểu pixel art, rồi phóng nearest-neighbor lên 512.
small = img.resize((64, 64), Image.NEAREST)
small = small.quantize(colors=16, method=Image.Quantize.MEDIANCUT).convert("RGB")
pixel = small.resize((512, 512), Image.NEAREST)
path = os.path.join(out_dir, f"{name}.png")
pixel.save(path)
print("saved", os.path.abspath(path))
