function onScanSuccess(decodedText, decodedResult) {
    // Qué hacer si se detecta qr
    const scannedAudio = new Audio('../audio/beep_sound.mp3');
    scannedAudio.play();
    const dataToSend = {
        decodedText: decodedText,
        decodedResult: decodedResult
    };
    fetch('/editItemByQR', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {
            const htmlElements = {
                name: document.querySelector("#productName"),
                brand: document.querySelector("#productBrand"),
                quantity: document.querySelector("#productQuantity"),
                minQuantity: document.querySelector("#productMinQuantity"),
                imgUrl: document.querySelector("#productImgURL"),
                productIDInput: document.querySelector("#productID"),
                divMsgBox: document.querySelector("#msgBox"),
                msgBoxText: document.querySelector("#msgBox__text")
            }
            htmlElements.name.removeAttribute("disabled");
            htmlElements.brand.removeAttribute("disabled");
            htmlElements.quantity.removeAttribute("disabled");
            htmlElements.minQuantity.removeAttribute("disabled");
            htmlElements.imgUrl.removeAttribute("disabled");
            if (data.product !== undefined) {
                htmlElements.name.value = data.product.name;
                htmlElements.brand.value = data.product.brand;
                htmlElements.quantity.value = data.product.quantity;
                htmlElements.minQuantity.value = data.product.minQuantity;
                htmlElements.imgUrl.value = data.product.imageName;
                htmlElements.productIDInput.value = data.product._id;
            } else {
                htmlElements.divMsgBox.style.display = "block";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);


const scanner = document.getElementById("reader");


function applyStyles() {
    // Check the current screen width and apply styles accordingly
    if (window.matchMedia('(max-width: 1024px)').matches) {
        scanner.style.width = "80%";
    } else if (window.matchMedia('(min-width: 1024px)').matches) {
        scanner.style.width = "50%";
    }
}

// Initial application of styles
applyStyles();

// Update styles on window resize
window.addEventListener('resize', applyStyles);