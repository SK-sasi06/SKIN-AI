import torch
from transformers import ViTImageProcessor, ViTForImageClassification
from ai.configuration.config import MODEL_ID, PROCESSOR_ID, CACHE_DIR

class ModelManager:
    _instance = None
    _model = None
    _processor = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        if self._model is None:
            print(f'[ModelManager] Loading Vision Transformer: {MODEL_ID}')
            self._processor = ViTImageProcessor.from_pretrained(PROCESSOR_ID, cache_dir=CACHE_DIR)
            self._model = ViTForImageClassification.from_pretrained(MODEL_ID, cache_dir=CACHE_DIR)
            self._model.eval()
            print('[ModelManager] Model ready for inference.')
        return self._processor, self._model
