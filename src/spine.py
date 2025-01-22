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


def deskew_image(image):
    """
    deskews the given image to correct any tilt or slant in the text
    """
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    if abs(angle) < 1:
        return image
    (h, w) = image.size
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    deskewed_image = cv2.warpAffine(
        np.array(image),
        M,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )
    return Image.fromarray(deskewed_image)


def deskew_image_hough(image):
    """
    deskews the image by hough transformations
    """
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
    if lines is not None:
        angles = []
        for rho, theta in lines[:, 0]:
            angle = np.rad2deg(theta) - 90
            angles.append(angle)
        median_angle = np.median(angles)
        (h, w) = image.size
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
        deskewed_image = cv2.warpAffine(
            np.array(image),
            M,
            (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )
        return Image.fromarray(deskewed_image)
    else:
        return image


def preprocess_image_for_ocr(image_path, output_path):
    """
    preprocess an image for ocr
    """
    image = cv2.imread(image_path)
    preprocessed_image = cv2.cvtColor(
        np.array(
            morph_transform(
                denoise_image(
                    apply_adaptive_threshold(
                        convert_to_grayscale(
                            Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                        )
                    )
                )
            )
        ),
        cv2.COLOR_RGB2BGR,
    )
    try:
        cv2.imwrite(output_path, preprocessed_image)
        print(f"Preprocessed image written to filepath {output_path}")
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
    IMAGE_PATH = "./../corpus/raw/1-spine.jpg"
    OUTPUT_PATH = "./../corpus/clean/1-spine.jpg"
    print(extraction_wrapper(IMAGE_PATH, OUTPUT_PATH))
