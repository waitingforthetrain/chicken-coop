document.addEventListener('DOMContentLoaded', function() {
    var page = document.getElementById("page");
    var pageWrapper = document.getElementById("page-wrapper");
    var grid = document.getElementById("grid");
    var resizeRatio = (window.innerHeight / page.offsetHeight)*0.999;
    pageWrapper.style.transform = "scale("+resizeRatio+")";

    var marginInput = document.getElementById("margins");
    var gridInput = document.getElementById("basegrid");
    var zoomInput = document.getElementById("zoom");
    var showHide = document.getElementById("hidegrid");
    var imageSelect = document.getElementById("image-select");
    var imageSize = document.getElementById("image-size");
    // var imageContrast = document.getElementById("image-contrast");
    // var imageBrightness = document.getElementById("image-brightness");
    var headerButton = document.getElementById("convert-header");
    var pdfButton = document.getElementById("pdf");
    var qrButton = document.getElementById("qr-button");


    var mainImage = document.getElementById("main-image");

    zoomInput.value = Math.round(resizeRatio*100);

    reMargin(page, marginInput.value);
    gridSize(grid, gridInput.value);
    imgHeight(mainImage, imageSize.value, gridInput.value);

    marginInput.addEventListener("change", (e) => {
        reMargin(page, e.target.value);
    });

    gridInput.addEventListener("change", (e) => {
        gridSize(grid, e.target.value);
    });

    zoomInput.addEventListener("change", (e) => {
        reZoom(pageWrapper, e.target.value);
    });
    showHide.addEventListener("click", (e) => {
        showHide.classList.toggle("hide");
        if (showHide.classList.contains("hide")) {
            grid.style.display = "none";
            showHide.innerHTML = "Show";
        } else {
            grid.style.display = "block";
            showHide.innerHTML = "Hide";
        }
    });
    imageSelect.addEventListener("change", (e) => {
        var img = imageSelect.files[0];
        mainImage.style.backgroundImage = 'url("'+URL.createObjectURL(img)+'")';
    });
    imageSize.addEventListener("change", (e) => {
        imgHeight(mainImage, e.target.value, gridInput.value);
    });
    // imageBrightness.addEventListener("change", (e) => {
    //     mainImage.style.filter = "grayscale(100%) "+"contrast("+imageContrast.value+") "+"brightness("+imageBrightness.value+")"
    // });
    // imageContrast.addEventListener("change", (e) => {
    //     mainImage.style.filter = "grayscale(100%) "+"contrast("+imageContrast.value+") "+"brightness("+imageBrightness.value+")"
    // });
    headerButton.addEventListener("click", (e) => {
        var newH = document.createElement("h2");
        newH.classList.add("small-header");
        surroundSelection(newH);
    });
    pdfButton.addEventListener("click", (e) => {
        var page = document.getElementById("page");
        html2pdf(page, {
          margin:       0,
          filename:     'flyer.pdf',
          image:        { type: 'jpg', quality: 0.95 },
          html2canvas:  { scale: 3.125, dpi: 300, letterRendering: true, useCORS: true },
          jsPDF:        { unit: 'in', format: 'tabloid', orientation: 'portrait' }
        });
    });
    qrButton.addEventListener("click", (e) => {
        makeQR();
    });

}, false);

function reMargin(element, margin) {
    element.style.padding = margin+"in";
}

function gridSize(element, size){
    element.style.backgroundSize = "100% "+size+"pt";
}

function reZoom(element, amount){
    element.style.transform = "scale("+(amount/100)+")";
}
function imgHeight(element, mHeight, unit){
    element.style.maxHeight = (mHeight * unit) +"pt";
}

// Convert Text to Header 2

function surroundSelection(element) {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0).cloneRange();
            var contents = range.cloneContents();
            if(contents.querySelectorAll('h2').length > 0) {
                contents.querySelectorAll('h2').forEach(e => {
                    var newP = document.createElement("p");
                    newP.innerHTML = range.toString();
                    range.deleteContents();
                    range.insertNode(newP);
                });
            } else {
                range.surroundContents(element);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

// Convert to QR Code

const isValidUrl = (url) => {
  const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
  return regex.test(url);
};

function makeQR() {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0).cloneRange();
            var string = range.toString();
            if (isValidUrl(string)) {
              var qrContainer = document.createElement('div');
              qrContainer.classList.add("qr-container");
              var qrCaption = document.createElement('div');
              qrCaption.classList.add("qr-caption");
              qrCaption.innerHTML = "QR Code Caption";
              var qrcode = new QRCode(qrContainer, {
                  text: string,
                  width: 128,
                  height: 128,
                  colorDark : '#000',
                  colorLight : '#fff',
                  correctLevel : QRCode.CorrectLevel.H
                });
              qrContainer.insertBefore(qrCaption, qrContainer.firstChild);
              range.deleteContents();
              var mainText = document.getElementById("qr-codes");
              mainText.append(qrContainer);
            } else {
              alert("The string is not a valid URL.");
            }
        }
    }
}