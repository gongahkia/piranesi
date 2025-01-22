# ----- REQUIRED IMPORTS -----

import cv2
import numpy as np
import random

# ----- HELPER FUNCTIONS -----


def detect_and_color_edges(image_path):
    """
    detect edges in an image and color them
    """
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    edge_mask = np.zeros(img.shape, dtype=np.uint8)
    rectangle_color = (0, 255, 0)
    for contour in contours:
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        cv2.drawContours(edge_mask, [contour], 0, color, 2)
        epsilon = 0.04 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) == 4:
            cv2.drawContours(edge_mask, [approx], 0, rectangle_color, 3)
    result = cv2.addWeighted(img, 0.7, edge_mask, 0.3, 0)
    return result


def get_rectangle_coordinates(image_path):
    """
    extract pixel coordinates of rectangular shapes in the image
    """
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    rectangles = []
    for contour in contours:
        epsilon = 0.04 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) == 4:
            x, y, w, h = cv2.boundingRect(approx)
            rectangles.append(((x, y), (x + w, y + h)))
    return rectangles


def create_colored_overlay(image_path, coordinates, color=(0, 255, 0), alpha=0.3):
    """
    create a colored overlay on the image based on given coordinates
    """
    img = cv2.imread(image_path)
    overlay = np.zeros(img.shape, dtype=np.uint8)
    for coord in coordinates:
        cv2.rectangle(overlay, coord[0], coord[1], color, -1)
    result = cv2.addWeighted(img, 1, overlay, alpha, 0)
    return result


def extract_bounded_areas(image_path, output_filepath, coordinates):
    """
    extract the content within the bounded areas defined by the coordinates
    """
    try:
        img = cv2.imread(image_path)
        extracted_images = []
        x1, y1 = coordinates[-1][0]
        x2, y2 = coordinates[-1][1]
        roi = img[y1:y2, x1:x2]
        cv2.imwrite(f"{output_filepath}_extracted.png", roi)
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    INPUT_FILEPATH = "./../corpus/raw/6-cover.jpg"
    OUTPUT_FILEPATH = "./../corpus/clean/6-cover.jpg"
    result = detect_and_color_edges(INPUT_FILEPATH)
    cv2.imwrite(f"{OUTPUT_FILEPATH}_edges.png", result)
    print("DONE")
    rectangles_array = get_rectangle_coordinates(INPUT_FILEPATH)
    print("DONE")
    for rect in rectangles_array:
        print(f"top-left: {rect[0]}, bottom-right: {rect[1]}")
    cv2.imwrite(
        f"{OUTPUT_FILEPATH}_overlay.png",
        create_colored_overlay(INPUT_FILEPATH, rectangles_array),
    )
    print("DONE")
    extracted_areas = extract_bounded_areas(
        INPUT_FILEPATH, OUTPUT_FILEPATH, rectangles_array
    )
    print("DONEE")
