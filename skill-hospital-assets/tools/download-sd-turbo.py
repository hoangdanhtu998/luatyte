# Tải model SD-Turbo (fp16) về cache Hugging Face để sinh ảnh local, không cần API key.
from huggingface_hub import snapshot_download

path = snapshot_download(
    repo_id="stabilityai/sd-turbo",
    allow_patterns=[
        "model_index.json",
        "scheduler/*",
        "tokenizer/*",
        "text_encoder/config.json",
        "text_encoder/model.fp16.safetensors",
        "unet/config.json",
        "unet/diffusion_pytorch_model.fp16.safetensors",
        "vae/config.json",
        "vae/diffusion_pytorch_model.fp16.safetensors",
    ],
)
print("DONE", path)
