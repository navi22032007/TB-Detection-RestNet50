import keras
import os

class ModelLoader:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_model(self, model_path: str):
        if self._model is None:
            # Check for fixed model first
            fixed_model_path = model_path.replace("OGbest_model.keras", "fixed_model.keras")
            if os.path.exists(fixed_model_path):
                model_path = fixed_model_path
                print(f"Using fixed model at {model_path}")

            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found at {model_path}")

            print(f"Loading model from {model_path} using Keras {keras.__version__}...")
            # Load with safe_mode=False to handle cross-version config fields
            self._model = keras.models.load_model(model_path, compile=False, safe_mode=False)
            print("Model loaded successfully.")
        return self._model

    def get_model(self):
        if self._model is None:
            raise Exception("Model not loaded. Call load_model first.")
        return self._model

# Singleton instance
model_loader = ModelLoader()
