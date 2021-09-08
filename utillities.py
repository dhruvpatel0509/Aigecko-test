def custom_response(status, message, code, data=None):
    if not isinstance(data, type(None)):
        return {"status": status, "message": message, "data": data}, code
    else:
        return {"status": status, "message": message}, code


def get_extension(filename):
    allowed_extensions = ["png", "jpg", "jpeg"]

    try:
        if "https" in filename or "http" in filename:
            extension = filename.split(".")[-1]
        else:
            extension = filename.rsplit(".", 1)[1].lower()
        if "." in filename and extension in allowed_extensions:
            return extension
    except IndexError:
        return None
