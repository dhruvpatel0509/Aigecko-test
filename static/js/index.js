const inputFile = document.querySelector('#input-file');
inputFile.addEventListener('change', (event) => {
    const inputFileName = document.querySelector('#input-file-name');
    inputFileName.textContent = `${event.target.files[0].name}`;
});


const analyseBtn = document.querySelector("#analyse_img")
analyseBtn.addEventListener('click', (event) => {
    const imageUploadSection = document.querySelector('#image-upload-section');
    imageUploadSection.style.display = "none"

    const analyseSection = document.querySelector('#analyse-section');
    analyseSection.style.display = "grid"

    const listImageSection = document.querySelector('#list-image-section');
    listImageSection.style.display = "none"
});

const uploadBtn = document.querySelector("#upload_img")
uploadBtn.addEventListener('click', (event) => {
    const imageUploadSection = document.querySelector('#image-upload-section');
    imageUploadSection.style.display = "grid"

    const analyseSection = document.querySelector('#analyse-section');
    analyseSection.style.display = "none"

    const listImageSection = document.querySelector('#list-image-section');
    listImageSection.style.display = "none"
});

const listImageBtn = document.querySelector("#list_img")
listImageBtn.addEventListener('click', (event) => {
    const imageUploadSection = document.querySelector('#image-upload-section');
    imageUploadSection.style.display = "none"

    const analyseSection = document.querySelector('#analyse-section');
    analyseSection.style.display = "none"

    const listImageSection = document.querySelector('#list-image-section');
    listImageSection.style.display = "grid"
});

function uploadImage() {
    let photo = document.getElementById("input-file").files[0];
    let url = document.getElementById("input-url");

    if (typeof (photo) === "object") {
        var formData = new FormData();
        formData.append("image", photo);
    } else {
        var formData = new FormData();
        formData.append("image", url.value);
    }

    $.ajax({
        type: 'POST',
        url: "/upload_image",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        statusCode: {
            500: function () {
                displayUploadError({"status": "error", "message": "Please send the image file or url."})
            }
        },
        success: function (data) {
            if (data.status === "success") {
                displayUploadDetails(data)
            }
        },
        error: function (data) {
            displayUploadError(data.responseJSON)
        }
    });
}

function displayUploadDetails(data) {
    const statusTextDiv = document.querySelector('.status-div');
    const statusTextSpan = document.querySelector('#upload-status-text');

    const detailTextDiv = document.querySelector('.detail-div');
    const detailTextSpan = document.querySelector('#upload-detail-text');

    const inputFile = document.querySelector('#input-file');
    const inputFileName = document.querySelector('#input-file-name');

    const url = document.getElementById("input-url");

    statusTextDiv.style.display = "flex"
    statusTextSpan.textContent = `${data.message}`;

    detailTextDiv.style.display = "flex"
    detailTextSpan.textContent = `Image ID: ${data.data}`;

    inputFile.value = ""
    inputFileName.textContent = ``;

    url.value = ""
}

function displayUploadError(data) {
    const statusTextDiv = document.querySelector('.status-div');
    const statusTextSpan = document.querySelector('#upload-status-text');

    const detailTextDiv = document.querySelector('.detail-div');

    statusTextDiv.style.display = "flex"
    statusTextSpan.textContent = `${data.message}`;

    detailTextDiv.style.display = "none"
}

function analyseImage() {
    let imageId = document.getElementById("input-image-id")

    if (typeof (imageId) === "object") {
        var formData = new FormData();
        formData.append("image_id", imageId.value)
    }
    $.ajax({
        type: 'POST',
        url: "/analyse_image",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        statusCode: {
            500: function () {
                displayAnalyseError({"status": "error", "message": "Please enter an Image id."})
            }
        },
        success: function (data) {
            if (data.status === "success") {
                displayAnalyseDetails(data)
            }
        },
        error: function (data) {
            displayAnalyseError(data.responseJSON)
        }
    });
}

function displayAnalyseError(data) {
    const statusTextDiv = document.querySelector('.inner-analyse-div .status-div');
    statusTextDiv.style.display = "flex"

    const statusTextSpan = document.querySelector('#analyse-status-text');
    statusTextSpan.textContent = `${data.message}`;

    const detailTextDiv = document.querySelector('.inner-analyse-div .detail-div');
    detailTextDiv.style.display = "none"
}

function displayAnalyseDetails(data) {
    const detailTextDiv = document.querySelector('.inner-analyse-div .detail-div');
    detailTextDiv.style.display = "flex"

    const detailTextWidthSpan = document.querySelector('#analyse-image-width');
    detailTextWidthSpan.textContent = `Image width: ${data.data.width}`

    const detailTextHeightSpan = document.querySelector('#analyse-image-height');
    detailTextHeightSpan.textContent = `Image height: ${data.data.height}`

    const statusTextDiv = document.querySelector('.inner-analyse-div .status-div');
    statusTextDiv.style.display = "flex"

    const statusTextSpan = document.querySelector('#analyse-status-text');
    statusTextSpan.textContent = `${data.message}`;

    const imageId = document.getElementById("input-image-id");
    imageId.value = ""

    const analyseImage = document.getElementById("analyse-image");
    analyseImage.innerHTML = `<img src="/static/${data.data.img_url}" alt="analyse image"/>`;
}

function listImage() {
    $.ajax({
        type: 'GET',
        url: "/list_image",
        cache: false,
        contentType: false,
        processData: false,
        statusCode: {
            500: function () {
                displayAnalyseError({"status": "error", "message": "Something went wrong, Please Try Again!"})
            }
        },
        success: function (data) {
            if (data.status === "success") {
                displayImages(data)
            }
        },
        error: function (data) {
            displayImageError(data.responseJSON)
        }
    });
}

function displayImages(data) {
    if (data.message === "No Images. Please upload some images.") {
        displayImageError(data)
    }
    const imageGridContainer = document.querySelector('#list-image-section .grid-container');
    imageGridContainer.innerHTML = ""
    for (let i = 0; i < data.data.length; i++) {
        var gridItemDiv = `<div class="grid-item">
                                <img src="/static/${data.data[i][1]}">
                                <span class="image-hover-text">Image id: ${data.data[i][0]}</span>
                            </div>`
        imageGridContainer.innerHTML += gridItemDiv
    }
}

function displayImageError(data) {
    const imageStatusSpan = document.querySelector('#list-status-text span');
    imageStatusSpan.textContent = `${data.message}`

    const imageStatusText = document.querySelector('#list-status-text');
    imageStatusText.style.display = "block"
}