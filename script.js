var currentFoot = 1;

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
    var footButton = document.getElementById("footnote-button");

    var mainImage = document.getElementById("main-image");
    var issueNumber;
    var headline;
    var issueNumberField = document.getElementById("issue-number");
    issueNumberField.addEventListener("change", (e) => {
        document.title = "Flyer "+e.target.value;
        issueNumberField.defaultValue = e.target.value;
    });

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
        grid = document.getElementById("grid");
        showHide.classList.toggle("hide");
        if (showHide.classList.contains("hide")) {
            grid.style.display = "none";
            showHide.innerHTML = "Show";
        } else {
            grid.style.display = "block";
            showHide.innerHTML = "Hide";
        }
    });
    // imageSelect.addEventListener("change", (e) => {
    //     var img = imageSelect.files[0];
    //     mainImage.style.backgroundImage = 'url("'+URL.createObjectURL(img)+'")';
    // });
    imageSize.addEventListener("change", (e) => {
        mainImage = document.getElementById("main-image");
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
        issueNumberField = document.getElementById("issue-number");
        issueNumber = issueNumberField.value;
        headline = document.getElementById("headline").innerHTML;
        headline = headline.replace(/[^a-z0-9\s-]/ig,'')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();

        issueNumberField.removeAttribute("id");

        var page = document.getElementById("page");
        html2pdf(page, {
          margin:       0,
          filename:     'flyer-'+issueNumber+"-"+headline+'.pdf',
          image:        { type: 'jpg', quality: 0.95 },
          html2canvas:  { scale: 3.125, dpi: 300, letterRendering: true, useCORS: true },
          jsPDF:        { unit: 'in', format: 'tabloid', orientation: 'portrait' }
        }).then(() => {
        // Once PDF generation is complete, add the ID back
        issueNumberField.setAttribute("id", "issue-number");
    });
    });
    qrButton.addEventListener("click", (e) => {
        makeQR();
    });
    footButton.addEventListener("click", (e) => {
        makeFoot();
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

// Footnotes

function makeFoot() {
    if (window.getSelection) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const node = range.startContainer.parentNode;
        const parent = document.getElementById("main-text");
        const childNodes = parent.childNodes;

        let index = -1; // Default to -1 if not found
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i] === node) {
                index = i;
                break;
            }
        }

        var position = getPositionInDocument(range);

        var footnotes = document.getElementsByClassName('footnote-number');
        var footnoteNumber = footnotes.length;

        // Create a new <sup> element
        const supElement = document.createElement('sup');
        supElement.classList.add('footnote-number');
        supElement.textContent = footnoteNumber+1; // You can insert text here if needed

        // Insert the <sup> element at the cursor position
        range.insertNode(supElement);

        reorderFootnotes();

        //Create new footnote
        var footnoteList = document.getElementById('footnote-list');
        if(!footnoteList){
            footnoteList = document.createElement('ol');
            footnoteList.id = "footnote-list"
            var smallHeader = document.getElementById('small-header');
            if(!smallHeader){
                smallHeader = document.createElement('h2');
                smallHeader.classList.add("small-header");
                smallHeader.id = "small-header";
                smallHeader.innerHTML = "Small Header";
                var qrCodeBox = document.getElementById("qr-codes");
                if(!qrCodeBox) {
                    qrCodeBox = document.createElement("div");
                    qrCodeBox.id = "qr-codes";
                    var mainText = document.getElementById("main-text");
                    mainText.append(qrCodeBox);
                }
                qrCodeBox.before(smallHeader);
            }
            smallHeader.before(footnoteList);
        }
        var footnote = document.createElement('li');
        footnote.classList.add('footnote');
        footnote.dataset.position = position;
        footnoteList.append(footnote);

        sortFootnotes();

        // Move the cursor after the new <sup> element
        range.setStart(footnote, 0); // Set the range to the start of the new <li>
        range.collapse(true); // Collapse the range so that it’s at the start
        selection.removeAllRanges();
        selection.addRange(range);
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
              var qrCodeBox = document.getElementById("qr-codes");
              if(!qrCodeBox){
                qrCodeBox = document.createElement("div");
                qrCodeBox.id = "qr-codes";
                var mainText = document.getElementById("main-text");
                mainText.append(qrCodeBox);
              }
              qrCodeBox.append(qrContainer);
            } else {
              alert("The string is not a valid URL.");
            }

            range.setStart(qrCaption, 0); // Set the range to the start of the new <li>
            range.collapse(true); // Collapse the range so that it’s at the start
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

function reorderFootnotes() {
    var tempfootnotes = document.getElementsByClassName('footnote-number');
    tempfootnotes.forEach((e, i) => {
        e.innerHTML = i+1;
    });
}

function sortFootnotes() {
    const ol = document.getElementById('footnote-list');
    const tempfootnotes = Array.from(ol.querySelectorAll('li.footnote'));

    // Sort footnotes based on data-position
    tempfootnotes.sort((a, b) => {
        const posA = parseInt(a.getAttribute('data-position'), 10);
        const posB = parseInt(b.getAttribute('data-position'), 10);
        return posA - posB; // Ascending order
    });

    // Remove existing footnotes and re-add them in sorted order
    ol.innerHTML = ''; // Clear existing items
    tempfootnotes.forEach(footnote => {
        ol.appendChild(footnote); // Append sorted footnotes back to the list
    });
}

function getPositionInDocument(range) {
    let position = 0;
    const iterator = document.createNodeIterator(
        document.body, 
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );

    let currentNode;

    while ((currentNode = iterator.nextNode())) {
        // If the current node is the range's start container
        if (currentNode === range.startContainer) {
            // Add the length of the text before the selection
            position += range.startOffset;
            break;
        } else {
            // Add the length of the current node's text
            position += currentNode.nodeType === Node.TEXT_NODE
                ? currentNode.length
                : currentNode.textContent.length;
        }
    }

    return position;
}

function fullLoad(event) {
    loadContent(event).then(function(e) {
        issueNumberField = document.getElementById("issue-number");
        fixImage();
    });
}

function saveContent() {
    const content = document.getElementById('page-content').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    issueNumber = document.getElementById("issue-number").value;
    var head = document.getElementById("headline").innerHTML;
    head = head.replace(/[^a-z0-9\s-]/ig,'')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
    link.download = 'Flyer-'+issueNumber+'-'+head+'.html';
    link.click();
    URL.revokeObjectURL(link.href); // Clean up
}

// Function to load content from a file into the div
function loadContent(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;

        // Set the inner HTML of the page content
        document.getElementById('page-content').innerHTML = '';
        document.getElementById('page-content').innerHTML = content;

        fixImage();
        issueNumberField = document.getElementById("issue-number");
        issueNumberField.addEventListener("change", (e) => {
            document.title = "Flyer "+e.target.value;
            issueNumberField.defaultValue = e.target.value;
        });

        const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        document.title = fileNameWithoutExtension;
    };
    reader.readAsText(file);
}

function addBackgroundImage(event) {
    const imgFile = event.target.files[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;  // Store the base64 string

        // Store the base64 data in the `data-base64` attribute
        document.getElementById('main-image').setAttribute('data-base64', base64Image);

        // Create a temporary object URL for the image to display in the browser
        const imgURL = URL.createObjectURL(imgFile);
        document.getElementById('main-image').style.backgroundImage = `url('${imgURL}')`;
    };
    reader.readAsDataURL(imgFile);  // Read the file as Base64
}

function base64ToURL(base64) {
    try {
        // Log the incoming base64 string
        console.log("Base64 String: ", base64);

        // Decode Base64 data
        const byteString = atob(base64.split(',')[1]);
        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

        console.log("Decoded Byte String: ", byteString);
        console.log("MIME Type: ", mimeString);

        // Create an ArrayBuffer from the byte string
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        console.log("ArrayBuffer created: ", ab);

        // Create a Blob from the ArrayBuffer
        const blob = new Blob([ab], { type: mimeString });
        console.log("Blob created: ", blob);

        // Create and return an Object URL
        const url = URL.createObjectURL(blob);
        console.log("Object URL created: ", url);

        return url;
    } catch (error) {
        console.error("Error during Base64 to URL conversion: ", error);
        return null;
    }
}

function fixImage() {
    var main = document.getElementById("main-image");
    var base64 = main.dataset.base64;
    if(base64) {
        var imgURL = base64ToURL(base64);
        main.style.backgroundImage = `url('${imgURL}')`;
    }
}