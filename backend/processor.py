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
        # Convert to grayscale if it's color
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Convert back to BGR for consistency
        return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

    def normalize(self, img):
        """Normalize image to [0, 1]."""
        return img.astype('float32') / 255.0

    def denoise(self, img):
        """Apply Gaussian denoising."""
        # Standard denoising to preserve edges (Gaussian Blur)
        return cv2.GaussianBlur(img, (3, 3), 0)

    def make_gradcam_heatmap(self, img_array, model, last_conv_layer_name, classifier_layer_names):
        """Generate Grad-CAM heatmap."""
        # Reference: https://keras.io/examples/vision/grad_cam/
        
        # 1. Create a model that maps the input image to the activations of the last conv layer
        # as well as the output predictions
        
        # If the model is a Sequential model wrapping a Functional model (ResNet50)
        # We need to reach inside.
        
        # For our specific architecture: Sequential -> [ResNet50 (Functional), GAP, Dense, Dense, Dense]
        # We need a model from input to the last conv layer of ResNet50
        # AND a model from that last conv layer to the final output.
        
        resnet = model.layers[0] # The ResNet50 Functional model
        
        last_conv_layer = resnet.get_layer(last_conv_layer_name)
        last_conv_layer_model = keras.Model(resnet.inputs, last_conv_layer.output)

        # 2. Create a model that maps the activations of the last conv layer to the final predictions
        classifier_input = keras.Input(shape=last_conv_layer.output.shape[1:])
        x = classifier_input
        # Replay the rest of the Sequential model starting after the ResNet50
        for layer in model.layers[1:]:
            x = layer(x)
        classifier_model = keras.Model(classifier_input, x)

        # 3. Compute the gradient of the top predicted class for our input image 
        # with respect to the activations of the last conv layer
        with tf.GradientTape() as tape:
            last_conv_layer_output = last_conv_layer_model(img_array)
            tape.watch(last_conv_layer_output)
            preds = classifier_model(last_conv_layer_output)
            top_pred_index = tf.argmax(preds[0])
            top_class_channel = preds[:, top_pred_index]

        # This is the gradient of the top predicted class with regard to
        # the output feature map of the last conv layer
        grads = tape.gradient(top_class_channel, last_conv_layer_output)

        # 4. Pooling the gradients over all the axes
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # 5. Multiply each channel in the feature map array
        # by "how important this channel is" with regard to the top predicted class
        last_conv_layer_output = last_conv_layer_output.numpy()[0]
        pooled_grads = pooled_grads.numpy()
        for i in range(pooled_grads.shape[-1]):
            last_conv_layer_output[:, :, i] *= pooled_grads[i]

        # 6. Average the channels of the resulting feature map
        heatmap = np.mean(last_conv_layer_output, axis=-1)

        # 7. Normalize the heatmap between 0 & 1
        heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
        return heatmap

    def save_and_display_gradcam(self, img, heatmap, alpha=0.4):
        """Create overlay of heatmap on original image."""
        # Rescale heatmap to a range 0-255
        heatmap = np.uint8(255 * heatmap)

        # Use jet colormap to colorize heatmap
        jet = cm.get_cmap("jet")

        # Use RGB values of the colormap
        jet_colors = jet(np.arange(256))[:, :3]
        jet_heatmap = jet_colors[heatmap]

        # Create an image with RGB colorized heatmap
        jet_heatmap = keras.utils.array_to_img(jet_heatmap)
        jet_heatmap = jet_heatmap.resize((img.shape[1], img.shape[0]))
        jet_heatmap = keras.utils.img_to_array(jet_heatmap)

        # Superimpose the heatmap on original image
        superimposed_img = jet_heatmap * alpha + img
        superimposed_img = keras.utils.array_to_img(superimposed_img)
        superimposed_img = np.array(superimposed_img)

        return jet_heatmap, superimposed_img

    def run_pipeline(self, img_bytes, model):
        """Main pipeline: Preprocess -> Predict -> Grad-CAM."""
        # Load image
        nparr = np.frombuffer(img_bytes, np.uint8)
        original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if original_img is None:
            raise ValueError("Invalid image file")

        # 1. Original (Step 6.1)
        # Store as RGB for display
        original_rgb = cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB)
        steps = {"original": self.to_base64(original_rgb)}

        # 2. Resize (Step 6.2)
        resized_img = self.resize(original_img)
        resized_rgb = cv2.cvtColor(resized_img, cv2.COLOR_BGR2RGB)
        steps["resized"] = self.to_base64(resized_rgb)

        # 3. Contrast Enhancement (CLAHE) (Step 6.4)
        enhanced_img = self.enhance(resized_img)
        enhanced_rgb = cv2.cvtColor(enhanced_img, cv2.COLOR_BGR2RGB)
        steps["enhanced"] = self.to_base64(enhanced_rgb)

        # 4. Optional Denoising (Step 6.5)
        denoised_img = self.denoise(enhanced_img)
        denoised_rgb = cv2.cvtColor(denoised_img, cv2.COLOR_BGR2RGB)
        steps["denoised"] = self.to_base64(denoised_rgb)

        # 5. Normalization (Step 6.3)
        # We normalize the FINAL processed image for the model
        normalized_img = self.normalize(denoised_img)
        # Visualization for normalized (scaled back to 255 for display)
        steps["normalized"] = self.to_base64(denoised_rgb)

        # 6. Predict
        input_tensor = np.expand_dims(normalized_img, axis=0)
        preds = model.predict(input_tensor)
        
        class_idx = np.argmax(preds[0])
        confidence = float(np.max(preds[0]))
        label = "Tuberculosis" if class_idx == 1 else "Normal"

        # 7. Grad-CAM (Step 7 - implicitly required for production review)
        # For ResNet50, the last conv layer is usually 'conv5_block3_out'
        last_conv_layer_name = "conv5_block3_out"
        try:
            heatmap = self.make_gradcam_heatmap(input_tensor, model, last_conv_layer_name, [])
            jet_heatmap, overlay = self.save_and_display_gradcam(denoised_rgb, heatmap)
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
            "preprocessing_steps": steps,
            "grad_cam": grad_cam_b64,
            "overlay": overlay_b64
        }

processor = ImageProcessor()
