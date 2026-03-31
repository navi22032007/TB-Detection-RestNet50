import cv2
import numpy as np
import tensorflow as tf
import keras
from PIL import Image
import io
import base64
import matplotlib.cm as cm

class ImageProcessor:
    def __init__(self, target_size=(256, 256)):
        self.target_size = target_size

    def to_base64(self, img_array):
        """Convert numpy array (0-255) to base64 string."""
        img = Image.fromarray(img_array.astype('uint8'))
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def resize(self, img):
        """Resize image to target size."""
        return cv2.resize(img, self.target_size)

    def enhance(self, img):
        """Apply CLAHE enhancement."""
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

    def normalize(self, img):
        """Normalize image to [0, 1]."""
        return img.astype('float32') / 255.0

    def denoise(self, img):
        """Apply Gaussian denoising."""
        return cv2.GaussianBlur(img, (3, 3), 0)

    def make_gradcam_heatmap(self, img_array, model, last_conv_layer_name):
        """Generate Grad-CAM heatmap using the model architecture."""
        resnet_base = model.layers[0]
        
        try:
            last_conv_layer = resnet_base.get_layer(last_conv_layer_name)
        except ValueError:
            last_conv_layer = resnet_base.get_layer("conv5_block3_out")

        # Create a model that maps the input to the activations of the last conv layer
        # AND the final output of the WHOLE model
        grad_model = keras.Model(
            model.inputs, [last_conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            last_conv_layer_output, preds = grad_model(img_array)
            top_pred_index = tf.argmax(preds[0])
            top_class_channel = preds[:, top_pred_index]

        grads = tape.gradient(top_class_channel, last_conv_layer_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        last_conv_layer_output = last_conv_layer_output[0]
        heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap).numpy()

        heatmap = np.maximum(heatmap, 0) / (np.max(heatmap) + 1e-10)
        return heatmap

    def save_and_display_gradcam(self, img, heatmap, alpha=0.4):
        """Overlay heatmap on the enhanced visuals."""
        heatmap = np.uint8(255 * heatmap)
        jet = cm.get_cmap("jet")
        jet_colors = jet(np.arange(256))[:, :3]
        jet_heatmap = jet_colors[heatmap]

        jet_heatmap = keras.utils.array_to_img(jet_heatmap)
        jet_heatmap = jet_heatmap.resize((img.shape[1], img.shape[0]))
        jet_heatmap = keras.utils.img_to_array(jet_heatmap)

        superimposed_img = jet_heatmap * alpha + img
        superimposed_img = np.clip(superimposed_img, 0, 255).astype('uint8')

        return jet_heatmap.astype('uint8'), superimposed_img

    def run_pipeline(self, img_bytes, model):
        """
        Kaggle-Aligned Pipeline: 
        1. Model Path (Inference): Receives strictly RAW original pixels (resized via TF) to match training.
        2. Visual Path (Clinician): Receives ENHANCED (CLAHE/Denoised) pixels for clinical review.
        NOTE: The preprocessed visual image is strictly for the frontend and is NEVER sent to the model for inference.
        """
        # --- INITIAL DECODING ---
        nparr = np.frombuffer(img_bytes, np.uint8)
        bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr_img is None:
            raise ValueError("Invalid image file")
        
        # Original RGB for consistent representation and model input base
        rgb_original = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)

        # --- PATH 1: MODEL INFERENCE (RAW PIXELS) ---
        # This path matches the Kaggle training distribution precisely: [0, 255] range + Bilinear Resize.
        tf_img = tf.convert_to_tensor(rgb_original, dtype=tf.float32)
        tf_raw_resized = tf.image.resize(tf_img, self.target_size, method='bilinear')
        input_tensor = tf.expand_dims(tf_raw_resized, axis=0)

        # --- PATH 2: VISUAL ENHANCEMENT (FRONTEND DISPLAY) ---
        resized_visual = cv2.resize(bgr_img, self.target_size)
        enhanced_visual = self.enhance(resized_visual)
        denoised_visual = self.denoise(enhanced_visual)
        visual_output_rgb = cv2.cvtColor(denoised_visual, cv2.COLOR_BGR2RGB)

        # --- PREDICTION ---
        # Inference is performed using ONLY the raw tensor (input_tensor).
        preds = model.predict(input_tensor)
        class_idx = np.argmax(preds[0])
        confidence = float(np.max(preds[0]))
        label = "Tuberculosis" if class_idx == 1 else "Normal"

        # --- DIAGNOSTIC OVERLAY (GRAD-CAM) ---
        # Heatmap is generated from the raw inference input (matching the model's logic)
        # then overlayed on the enhanced visual (matching the clinician's perspective).
        last_conv_layer_name = "conv5_block3_out"
        try:
            heatmap = self.make_gradcam_heatmap(input_tensor, model, last_conv_layer_name)
            jet_heatmap, overlay = self.save_and_display_gradcam(visual_output_rgb, heatmap)
            grad_cam_b64 = self.to_base64(jet_heatmap)
            overlay_b64 = self.to_base64(overlay)
        except Exception as e:
            print(f"Grad-CAM error: {e}")
            grad_cam_b64 = None
            overlay_b64 = None

        return {
            "prediction": label,
            "confidence": confidence,
            "class_index": int(class_idx),
            "preprocessing_steps": {
                "original": self.to_base64(rgb_original),
                "enhanced": self.to_base64(visual_output_rgb),
                "model_input": self.to_base64(tf_raw_resized.numpy())
            },
            "grad_cam": grad_cam_b64,
            "overlay": overlay_b64
        }

processor = ImageProcessor()
