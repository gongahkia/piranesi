# ----- REQUIRED IMPORTS -----

import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import cv2
import numpy as np

# ----- HELPER CLASS -----

class ImageCropper:
    def __init__(self, master):
        """
        initialize the image cropper
        """
        self.master = master
        self.master.title("Image Cropper")
        self.canvas = tk.Canvas(master, cursor="cross")
        self.canvas.pack(fill=tk.BOTH, expand=True)
        self.btn_load = tk.Button(master, text="Load Image", command=self.load_image)
        self.btn_load.pack(side=tk.LEFT)
        self.btn_crop = tk.Button(master, text="Crop Image", command=self.crop_image)
        self.btn_crop.pack(side=tk.LEFT)
        self.rect = None
        self.start_x = None
        self.start_y = None
        self.current_image = None
        self.canvas.bind("<ButtonPress-1>", self.on_press)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)

    def load_image(self):
        """
        load the image
        """
        file_path = filedialog.askopenfilename()
        if file_path:
            self.original_image = cv2.imread(file_path)
            self.original_image = cv2.cvtColor(self.original_image, cv2.COLOR_BGR2RGB)
            self.display_image()

    def display_image(self):
        """
        display the image
        """
        height, width, _ = self.original_image.shape
        ratio = min(800/width, 600/height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        self.display_image = cv2.resize(self.original_image, (new_width, new_height))
        self.current_image = ImageTk.PhotoImage(Image.fromarray(self.display_image))
        self.canvas.config(width=new_width, height=new_height)
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.current_image)

    def on_press(self, event):
        """
        press and drag the rectangle
        """
        self.start_x = self.canvas.canvasx(event.x)
        self.start_y = self.canvas.canvasy(event.y)
        if self.rect:
            self.canvas.delete(self.rect)
        self.rect = self.canvas.create_rectangle(self.start_x, self.start_y, self.start_x, self.start_y, outline='red')

    def on_drag(self, event):
        """
        drag the rectangle
        """
        cur_x = self.canvas.canvasx(event.x)
        cur_y = self.canvas.canvasy(event.y)
        self.canvas.coords(self.rect, self.start_x, self.start_y, cur_x, cur_y)

    def on_release(self, event):
        """
        release the rectangle
        """
        pass

    def crop_image(self):
        """
        crop the image based on the selected rectangle
        """
        if self.rect:
            bbox = self.canvas.bbox(self.rect)
            x1, y1, x2, y2 = bbox
            ratio = self.original_image.shape[1] / self.display_image.shape[1]
            x1, y1, x2, y2 = int(x1*ratio), int(y1*ratio), int(x2*ratio), int(y2*ratio)
            cropped_image = self.original_image[y1:y2, x1:x2]
            save_path = filedialog.asksaveasfilename(defaultextension=".png")
            # FUA consider editing these lines of code to allow for the updated filename to be auto saved
            if save_path:
                cv2.imwrite(save_path, cv2.cvtColor(cropped_image, cv2.COLOR_RGB2BGR))
                print(f"Success: Cropped image saved to {save_path}")

# ----- SAMPLE EXECUTION CODE -----

# FUA add code to automate the saving image process so it does not need to prompt users on which file directory to save the image to

if __name__ == "__main__":
    root = tk.Tk()
    app = ImageCropper(root)
    root.mainloop()