# Vision Transformer Model Documentation

## Model Identifier
- **Repository**: [`varun1505/face-characteristics`](https://huggingface.co/varun1505/face-characteristics)
- **Architecture**: `google/vit-base-patch16-224` (Vision Transformer)
- **Framework**: PyTorch (`torch.nn.Module`) via Hugging Face `transformers.ViTForImageClassification`
- **Inference Hardware**: PyTorch CPU optimized (`device = "cpu"`)

## Classification Classes
| Index | Label | Dermatological Concern |
|---|---|---|
| 0 | Acne | Active blemishes, comedones, and acne lesions |
| 1 | Eyes Dark Circles | Periorbital hyperpigmentation and venous congestion |
| 2 | Puffy Eyes | Periorbital edema and fluid retention |
| 3 | Skin Pigmentation | Melasma, sun spots, post-inflammatory hyperpigmentation |
| 4 | Skin Redness | Erythema, flushing, and sensitive reactive barriers |
| 5 | Skin Texture | Uneven skin surface, enlarged pores, dullness |
| 6 | Wrinkled Face | Fine lines, rhytids, expression creases |

## Preprocessing Pipeline
1. **EXIF Orientation Normalization**: `PIL.ImageOps.exif_transpose` ensures user mobile uploads are right-side-up.
2. **RGB Mode Enforced**: Converts RGBA/Grayscale to standard 3-channel RGB.
3. **Resizing & Cropping**: Centered 224x224 bicubic interpolation.
4. **Standardization**: ViT ImageNet mean `[0.5, 0.5, 0.5]` and std `[0.5, 0.5, 0.5]`.