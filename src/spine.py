"""
!NOTE

relies on opencv to perform preprocessing on user images and pytesseract to perform OCR on those images
"""

# ----- REQUIRED IMPORTS -----

import cv2
import numpy as np
from PIL import Image
import pytesseract
import os

# ----- HELPER FUNCTIONS -----


def convert_to_grayscale(image):
    """
    convert image to grayscale for a greater
    focus on text
    """
    return image.convert("L")


def apply_binary_threshold(image):
    """
    apply binary thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    _, thresholded = cv2.threshold(image_array, 128, 255, cv2.THRESH_BINARY)
    return Image.fromarray(thresholded)


def apply_adaptive_threshold(image):
    """
    apply adaptive thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    if len(image_array.shape) == 3:
        image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    thresholded = cv2.adaptiveThreshold(
        image_array, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return Image.fromarray(thresholded)


def apply_otsu_threshold(image):
    """
    apply otsu's thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    if len(image_array.shape) == 3:
        image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    _, thresholded = cv2.threshold(
        image_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    return Image.fromarray(thresholded)


def apply_triangle_threshold(image):
    """
    apply triangle thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    threshold_value, thresholded = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_TRIANGLE
    )
    return Image.fromarray(thresholded)


def apply_isodata_threshold(image):
    """
    apply isodata thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    mean = np.mean(gray)
    threshold = mean
    while True:
        lower_pixels = gray[gray < threshold]
        upper_pixels = gray[gray >= threshold]
        lower_mean = lower_pixels.mean() if len(lower_pixels) > 0 else 0
        upper_mean = upper_pixels.mean() if len(upper_pixels) > 0 else 0
        new_threshold = (lower_mean + upper_mean) / 2
        if abs(threshold - new_threshold) < 1:
            break
        threshold = new_threshold
    _, thresholded = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    return Image.fromarray(thresholded)


def apply_sauvola_threshold(image, window_size=15, k=0.5):
    """
    apply Sauvola thresholding to enhance contrast between
    image's text and background
    """
    image_array = np.array(image)
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    gray = gray.astype(np.float32)
    mean = cv2.boxFilter(gray, ddepth=cv2.CV_32F, ksize=(window_size, window_size))
    squared = gray**2
    mean_squared = cv2.boxFilter(
        squared, ddepth=cv2.CV_32F, ksize=(window_size, window_size)
    )
    stddev = cv2.sqrt(mean_squared - mean**2)
    threshold = mean * (1 + k * (stddev / 128 - 1))
    thresholded = (gray >= threshold).astype(np.uint8) * 255
    return Image.fromarray(thresholded)


def denoise_image(image):
    """
    reduces noise in images to improve text recognition with
    gaussian blur or median filtering as available options
    """
    image_array = np.array(image)
    denoised = cv2.medianBlur(image_array, 5)
    return Image.fromarray(denoised)


def morph_transform(image):
    """
    apply dilation and erosion operatios to
    enhance the text structure
    """
    image_array = np.array(image)
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(image_array, kernel, iterations=1)
    return Image.fromarray(dilated)


def preprocess_image_for_ocr(image_path, output_path):
    """
    preprocess an image for ocr
    """
    image = cv2.imread(image_path)
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    pil_image = convert_to_grayscale(pil_image)
    pil_image = apply_adaptive_threshold(pil_image)
    pil_image = denoise_image(pil_image)
    # pil_image = morph_transform(pil_image)
    preprocessed_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    try:
        cv2.imwrite(output_path, preprocessed_image)
        print(f"Preprocessed image written to {output_path}")
    except Exception as e:
        print(f"Error during writing image to filepath {output_path}: {str(e)}")
    finally:
        return preprocessed_image


def extract_text_from_image(image_path, output_path):
    """
    extract text from an image using tesseract ocr
    """
    try:
        preprocessed_image = preprocess_image_for_ocr(image_path, output_path)
        psm_modes = [3, 4, 6, 11, 12]
        extracted_texts = []
        for psm_mode in psm_modes:
            custom_config = f"--oem 3 --psm {psm_mode} -l eng"
            text = pytesseract.image_to_string(preprocessed_image, config=custom_config)
            extracted_texts.append(f"PSM {psm_mode}: {text.strip()}")
        return "\n\n".join(extracted_texts)
    except Exception as e:
        return f"Error during OCR: {str(e)}"


def extraction_wrapper(image_path, output_path):
    """
    wrapper function for extraction
    """
    if os.path.exists(image_path):
        extracted_text = extract_text_from_image(image_path, output_path)
        if not extracted_text:
            extracted_text = None
        return {
            "metadata": {
                "image_path": image_path,
                "image_format": Image.open(image_path).format,
                "image_size": Image.open(image_path).size,
                "image_mode": Image.open(image_path).mode,
                "tesseract_version": pytesseract.get_tesseract_version(),
                "tesseract_available_languages": pytesseract.get_languages(),
            },
            "results": {
                "extracted_text": extracted_text,
            },
        }
    else:
        print(f"Error: File not found at {image_path}")
        return None


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    IMAGE_PATH = "./../corpus/raw/10-spine.jpg"
    OUTPUT_PATH = "./../corpus/clean/10-spine.jpg"
    print(extraction_wrapper(IMAGE_PATH, OUTPUT_PATH))
