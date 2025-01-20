# ----- REQUIRED IMPORTS -----

import cv2
import numpy as np
from PIL import Image, ImageFilter


def process_book_cover(image_path):
    """
    process the book cover image and return the enhanced image
    """
    try:
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)[1][2]  # reduce noise
        edges = cv2.Canny(blurred, 100, 200)
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )  # contour detection
        largest_contour = max(
            contours, key=cv2.contourArea
        )  # largest contour assumed to be book cover
        mask = np.zeros(gray.shape, np.uint8)  # generate mask
        cv2.drawContours(mask, [largest_contour], 0, 255, -1)
        result = cv2.bitwise_and(img, img, mask=mask)  # apply mask
        pil_image = Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
        enhanced_image = pil_image.filter(ImageFilter.EDGE_ENHANCE_MORE)
        return (True, enhanced_image)
    except Exception as e:
        print(e)
        return (False, None)


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    # FUA to test the below code
    processed_image = process_book_cover("./../corpus/raw/1-cover.jpg")[1]
    processed_image.save("here.jpg")
