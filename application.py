import fnmatch
import os
import urllib
import uuid
from http import HTTPStatus
from urllib.error import HTTPError

import werkzeug
from PIL import Image
from flask import Flask, request, make_response, render_template
from flask_restful import Api, Resource

from utillities import custom_response, get_extension

app = Flask(__name__, template_folder='templates', static_url_path='/static')

api = Api(app)


class INDEX(Resource):
    def get(self):
        headers = {'Content-Type': 'text/html'}
        return make_response(render_template('index.html'), 200, headers)


class UploadImage(Resource):
    def post(self):
        try:
            if "image" not in request.files:
                if "image" not in request.form:
                    return custom_response(status="error", message="Please send the valid image file or url.",
                                           code=HTTPStatus.NOT_FOUND)
                else:
                    image = request.form["image"]
            else:
                image = request.files["image"]

            if type(image) == werkzeug.datastructures.FileStorage:
                if not image.filename:
                    return custom_response(status="error", message="Please select the image.",
                                           code=HTTPStatus.NOT_FOUND)

                extension = get_extension(filename=image.filename)
                if image and extension:
                    file_name = uuid.uuid4().hex[:5]
                    image.save(f"static/img/uploaded_img/{file_name}.{extension}")
                    return custom_response(status="success", message="Image uploaded successfully.", code=HTTPStatus.OK,
                                           data=file_name)
                else:
                    return custom_response(status="error", message="Please select a valid image.",
                                           code=HTTPStatus.BAD_REQUEST)
            elif type(image) == str:
                extension = get_extension(image)
                file_name = uuid.uuid4().hex[:5]
                if extension:
                    urllib.request.urlretrieve(image, f"static/img/uploaded_img/{file_name}.{extension}")
                    return custom_response(status="success", message="Image uploaded successfully.", code=HTTPStatus.OK,
                                           data=file_name)
                else:
                    return custom_response(status="error", message="Please send the valid image file or url.",
                                           code=HTTPStatus.BAD_REQUEST)
        except HTTPError:
            return custom_response(status="error", message="Please provide another Url.", code=HTTPStatus.BAD_REQUEST)


class AnalyseImage(Resource):
    def post(self):
        if "image_id" not in request.form:
            return custom_response(status="error", message="Please enter an image id.", code=HTTPStatus.BAD_REQUEST)

        images_list = os.listdir(os.path.join("static", 'img/uploaded_img/'))
        image_id = request.form["image_id"]
        pattern = f'{image_id}.*'
        match = None
        for images in images_list:
            if fnmatch.fnmatch(images, pattern):
                match = images
                break

        if match:
            img_url = os.path.join("img/uploaded_img", match)
            pil_image = Image.open(os.path.join("static/img/uploaded_img", match))
            width, height = pil_image.size
            data = {
                "img_url": img_url,
                "height": height,
                "width": width
            }
            return custom_response(status="success", message="Analysis successful.", code=HTTPStatus.OK, data=data)
        else:
            return custom_response(status="error", message="No match found please enter another Image id.",
                                   code=HTTPStatus.BAD_REQUEST)


class ListImage(Resource):
    def get(self):
        try:
            images_list = os.listdir(os.path.join("static", 'img/uploaded_img/'))
            if not images_list:
                return custom_response(status="success", message="No Images. Please upload some images.",
                                       code=HTTPStatus.OK)
            data_list = []
            for image in images_list:
                sub_list = []
                img_url = os.path.join("img/uploaded_img", image)
                sub_list.append(image.split(".")[0])
                sub_list.append(img_url)
                data_list.append(sub_list)
            return custom_response(status="success", message="Image List", code=HTTPStatus.OK, data=data_list)
        except Exception as e:
            return custom_response(status="error", message="Something went wrong, Please Try Again",
                                   code=HTTPStatus.BAD_REQUEST)


api.add_resource(INDEX, '/')
api.add_resource(UploadImage, "/upload_image")
api.add_resource(AnalyseImage, "/analyse_image")
api.add_resource(ListImage, "/list_image")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
