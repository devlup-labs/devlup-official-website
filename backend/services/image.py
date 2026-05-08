from config.cloudinary import *
import cloudinary.uploader


def upload_image(file):

    result = cloudinary.uploader.upload(file.file)

    return result["secure_url"]