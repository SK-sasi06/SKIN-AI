import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_ID = 'varun1505/face-characteristics'
PROCESSOR_ID = 'google/vit-base-patch16-224'
CACHE_DIR = os.path.join(BASE_DIR, 'ai', 'configuration', 'weights')

LABEL_MAPPING = {
    0: 'Acne',
    1: 'Eyes Dark Circles',
    2: 'Puffy Eyes',
    3: 'Skin Pigmentation',
    4: 'Skin Redness',
    5: 'Skin Texture',
    6: 'Wrinkled Face'
}

CONFIDENCE_THRESHOLD = 0.14
