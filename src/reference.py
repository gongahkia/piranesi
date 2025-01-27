"""
!NOTE

reference code that nichole sent me
"""

import cv2
import numpy as np

# import image
img = cv2.imread("test1.jpg")
img2 = img.copy()
# make gray
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# blur
gray = cv2.GaussianBlur(gray, (3, 3), 0)

cv2.imshow("pic", gray)
cv2.waitKey(0)

# edge detection
edges = cv2.Canny(gray, 10, 300)
cv2.imshow("edges", edges)
cv2.waitKey(0)

# create a structuring element (kernel)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (10, 10))
# close edges
closed_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
cv2.imshow("closed edges", closed_edges)
cv2.waitKey(0)

# find contours (outlines)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# draw contours on the original image
for c in contours:
    # approximate the contour
    peri = cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, 0.1 * peri, True)

    # if the approximated contour has four points, assume is rectangle/book
    if len(approx) == 4:
        cv2.drawContours(img2, [approx], -1, (179, 255, 0), 2)
        cv2.imshow("Contours", img2)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        # extract the region of interest
        pts = approx.reshape(4, 2)  # get corner points
        rect = np.zeros((4, 2), dtype="float32")

        # Order the points: top-left, top-right, bottom-right, bottom-left
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # Top-left
        rect[2] = pts[np.argmax(s)]  # Bottom-right

        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # Top-right
        rect[3] = pts[np.argmax(diff)]  # Bottom-left

        # Compute the width and height of the new image
        (tl, tr, br, bl) = rect
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        # Create the destination points for a top-down view
        dst = np.array(
            [
                [0, 0],
                [maxWidth - 1, 0],
                [maxWidth - 1, maxHeight - 1],
                [0, maxHeight - 1],
            ],
            dtype="float32",
        )

        # Compute the perspective transform matrix
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))

        # show the extracted book image
        cv2.imshow("Extracted Book", warped)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        # save the extracted book image
        cv2.imwrite("extracted_book.jpg", warped)
