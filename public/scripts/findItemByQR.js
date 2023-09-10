function onScanSuccess(decodedText, decodedResult) {
    // Qué hacer si se detecta qr
    const scannedAudio = new Audio('../audio/beep_sound.mp3');
    scannedAudio.play();
    const dataToSend = {
        decodedText: decodedText,
        decodedResult: decodedResult
    };
    fetch('/findItemQR', {
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
            if (data.product !== undefined) {
                const htmlElements = {
                    name: document.querySelector("#productName"),
                    brand: document.querySelector("#productBrand"),
                    quantity: document.querySelector("#productQuantity"),
                    minQuantity: document.querySelector("#productMinQuantity"),
                    imgUrl: document.querySelector("#productImgURL"),
                    lastProductID: document.querySelector("#lastProductID")
                }
                htmlElements.name.value = data.product.name;
                htmlElements.brand.value = data.product.brand;
                htmlElements.quantity.value = data.product.quantity;
                htmlElements.minQuantity.value = data.product.minQuantity;
                htmlElements.imgUrl.value = data.product.imageName;
                htmlElements.lastProductID.value = data.lastProduct._id;
            } else {
                // TODO: Agregar cartel que diga "redirigir a agregar producto"
                console.log("No se encontro el producto");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);