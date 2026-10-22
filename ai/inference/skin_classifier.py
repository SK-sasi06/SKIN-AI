import torch
from PIL import Image
from ai.model_loader import ModelManager
from ai.configuration.config import LABEL_MAPPING, CONFIDENCE_THRESHOLD

class SkinClassifier:
    def __init__(self):
        self.processor, self.model = ModelManager.get_instance().load_model()

    def analyze_skin(self, image: Image.Image):
        inputs = self.processor(images=image, return_tensors='pt')
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

        preds = []
        for idx, p in enumerate(probs):
            score = round(float(p.item()), 4)
            label = LABEL_MAPPING.get(idx, f'Trait_{idx}')
            preds.append({
                'id': idx,
                'label': label,
                'confidence': score,
                'percentage': round(score * 100, 2)
            })

        preds.sort(key=lambda x: x['confidence'], reverse=True)
        dominant = preds[0]
        secondaries = [p['label'] for p in preds[1:] if p['confidence'] >= CONFIDENCE_THRESHOLD]

        return {
            'dominant_concern': dominant['label'],
            'dominant_confidence': dominant['confidence'],
            'dominant_percentage': dominant['percentage'],
            'secondary_concerns': secondaries,
            'all_predictions': preds
        }
