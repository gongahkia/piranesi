# ----- REQUIRED IMPORTS -----

import io
import os
import tarfile
from PIL import Image

# ----- HELPER FUNCTIONS -----


def compress_image(input_path, output_path, quality=85):
    """
    compress an image and save it to the specified output filepath
    """
    with Image.open(input_path) as img:
        if img.mode == "RGBA":
            img = img.convert("RGB")
        img.save(output_path, "JPEG", quality=quality, optimize=True)


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
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp")):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(
                output_folder, f"compressed_{filename.split('.')[0]}.jpg"
            )
            compress_image(input_path, output_path, quality)
            print(f"Compressed {filename}")


def create_targz(source_dir, output_filename):
    """
    create a tar.gz archive of all images in a folder
    """
    with tarfile.open(output_filename, "w:gz") as tar:
        for file in os.listdir(source_dir):
            if file.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                tar.add(os.path.join(source_dir, file), arcname=file)


def extract_targz(archive_filename, extract_path):
    """
    extract all images from a tar.gz archive
    """
    with tarfile.open(archive_filename, "r:gz") as tar:
        tar.extractall(path=extract_path)
