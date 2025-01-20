# ----- REQUIRED IMPORTS -----

import os
from PIL import Image
import io

def compress_image(input_path, output_path, quality=85):
    """
    compress an image and save it to the specified output filepath
    """
    with Image.open(input_path) as img:
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(output_path, 'JPEG', quality=quality, optimize=True)

def decompress_image(input_path, output_path):
    """
    decompress and read an image and save it to the specified output filepath
    """
    with Image.open(input_path) as img:
        img.save(output_path)

def compress_images_in_folder(input_folder, output_folder, quality=85):
    """
    compress all images in a folder and save them to the output folder
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, f"compressed_{filename.split('.')[0]}.jpg")
            compress_image(input_path, output_path, quality)
            print(f"Compressed {filename}")

# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    input_folder = "./../corpus/raw"
    output_folder = "./../corpus/crush"
    compress_images_in_folder(input_folder, output_folder, quality=85) # FUA to test this
    decompress_image('path/to/compressed/image.jpg', 'path/to/decompressed/image.png') # FUA then to test this