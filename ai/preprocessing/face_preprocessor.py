import io
from PIL import Image, ImageOps

class FacePreprocessor:
    @staticmethod
    def validate_and_preprocess(image_bytes: bytes, target_size=(224, 224)):
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError('Uploaded file is not a valid or readable image.') from e

        image = ImageOps.exif_transpose(image)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        width, height = image.size
        if width < 50 or height < 50:
            raise ValueError('Image resolution is too low for skin analysis.')

        min_dim = min(width, height)
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        cropped = image.crop((left, top, right, bottom))
        return cropped.resize(target_size, Image.Resampling.BILINEAR)

    @staticmethod
    def detect_facial_structure(image_bytes: bytes):
        try:
            import numpy as np
            image = Image.open(io.BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image).convert('RGB')
            w, h = image.size
            
            # Downsample for rapid robust contour & skin pixel detection
            thumb = image.resize((160, 160))
            arr = np.array(thumb)
            r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
            mask = (r > 60) & (g > 35) & (b > 20) & (r > g) & (g >= b) & (r - g > 10) & (r - g < 95)
            
            indices = np.argwhere(mask)
            if len(indices) > 80:
                y_coords = indices[:, 0]
                x_coords = indices[:, 1]
                y_min, y_max = np.percentile(y_coords, [10, 90]) / 160.0
                x_min, x_max = np.percentile(x_coords, [10, 90]) / 160.0
                
                cx = float((x_min + x_max) / 2.0)
                face_h = float(y_max - y_min)
                face_w = float(x_max - x_min)
                
                # Calibrate landmarks inside the detected face bounding region
                forehead_y = float(y_min + face_h * 0.14)
                eyes_y = float(y_min + face_h * 0.42)
                nose_y = float(y_min + face_h * 0.58)
                cheeks_y = float(y_min + face_h * 0.66)
                chin_y = float(y_min + face_h * 0.88)
                
                left_eye_x = float(max(0.15, cx - face_w * 0.26))
                right_eye_x = float(min(0.85, cx + face_w * 0.26))
                left_cheek_x = float(max(0.12, cx - face_w * 0.36))
                right_cheek_x = float(min(0.88, cx + face_w * 0.36))

                aspect_ratio = face_h / max(0.1, face_w)
                shape = 'Oval Balanced' if 1.15 <= aspect_ratio <= 1.45 else ('Square / Broad' if aspect_ratio < 1.15 else 'Oblong / Elongated')
                
                return {
                    'detected': True,
                    'face_shape': shape,
                    'symmetry_score': round(float(95.0 - abs(cx - 0.5) * 20.0), 1),
                    'dermal_zone_count': 6,
                    'landmarks': {
                        'forehead': {'x': f"{round(cx * 100, 1)}%", 'y': f"{round(forehead_y * 100, 1)}%"},
                        'undereye_left': {'x': f"{round(left_eye_x * 100, 1)}%", 'y': f"{round(eyes_y * 100, 1)}%"},
                        'undereye_right': {'x': f"{round(right_eye_x * 100, 1)}%", 'y': f"{round(eyes_y * 100, 1)}%"},
                        'nose': {'x': f"{round(cx * 100, 1)}%", 'y': f"{round(nose_y * 100, 1)}%"},
                        'cheek_left': {'x': f"{round(left_cheek_x * 100, 1)}%", 'y': f"{round(cheeks_y * 100, 1)}%"},
                        'cheek_right': {'x': f"{round(right_cheek_x * 100, 1)}%", 'y': f"{round(cheeks_y * 100, 1)}%"},
                        'chin': {'x': f"{round(cx * 100, 1)}%", 'y': f"{round(chin_y * 100, 1)}%"}
                    }
                }
        except Exception as e:
            print("[FacePreprocessor] Error calculating face structure:", e)

        # Standard ergonomic fallback if detection has low confidence
        return {
            'detected': False,
            'face_shape': 'Oval Classical',
            'symmetry_score': 93.4,
            'dermal_zone_count': 6,
            'landmarks': {
                'forehead': {'x': '50%', 'y': '44%'},
                'undereye_left': {'x': '36%', 'y': '54%'},
                'undereye_right': {'x': '64%', 'y': '54%'},
                'nose': {'x': '50%', 'y': '64%'},
                'cheek_left': {'x': '28%', 'y': '70%'},
                'cheek_right': {'x': '72%', 'y': '70%'},
                'chin': {'x': '50%', 'y': '85%'}
            }
        }

