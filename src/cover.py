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


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    INPUT_FILEPATH = "./../corpus/raw/6-cover.jpg"
    OUTPUT_FILEPATH = "./../corpus/clean/6-cover.jpg"
    result = detect_and_color_edges(INPUT_FILEPATH)
    cv2.imwrite(OUTPUT_FILEPATH, result)
    print("DONE")
    rectangles = get_rectangle_coordinates(INPUT_FILEPATH)
    print("DONE")
    for rect in rectangles:
        print(f"top-left: {rect[0]}, bottom-right: {rect[1]}")
