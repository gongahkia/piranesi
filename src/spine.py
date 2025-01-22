# ----- REQUIRED IMPORTS -----

import cv2
import numpy as np
from PIL import Image
import pytesseract
import os

# ----- HELPER FUNCTIONS -----

def preprocess_image_for_ocr(image_path):
    """
    preprocess an image for ocr
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Unable to read image at {image_path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    kernel = np.ones((1, 1), np.uint8)
    gray = cv2.dilate(gray, kernel, iterations=1)
    gray = cv2.erode(gray, kernel, iterations=1)
    cv2.imwrite("/tmp/preprocessed_image.png", gray)
    return gray

def extract_text_from_image(image_path):
    """
    extract text from an image using tesseract ocr
    """
    try:
        preprocessed_image = preprocess_image_for_ocr(image_path)
        psm_modes = [3, 4, 6, 11, 12]
        extracted_texts = []
        for psm_mode in psm_modes:
            custom_config = f'--oem 3 --psm {psm_mode} -l eng'
            text = pytesseract.image_to_string(preprocessed_image, config=custom_config)
            extracted_texts.append(f"PSM {psm_mode}: {text.strip()}")
        return "\n\n".join(extracted_texts)
    except Exception as e:
        return f"Error during OCR: {str(e)}"

def extraction_wrapper(image_path):
    if os.path.exists(image_path):
        extracted_text = extract_text_from_image(image_path)
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
            }
        } 
    else:
        print(f"Error: File not found at {image_path}")
        return None

# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    image_path = "./../corpus/raw/1-spine.jpg"
    print(extraction_wrapper(image_path))