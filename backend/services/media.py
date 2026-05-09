from config.cloudinary import *
import cloudinary.uploader

def upload_media(file):

    result = cloudinary.uploader.upload(
        file.file,
        resource_type="video"
    )

    return result["secure_url"]