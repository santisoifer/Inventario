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
                msgBox: document.querySelector("#msgBox p")
            }
            if (data.product !== undefined) {
                htmlElements.name.value = data.product.name;
                htmlElements.brand.value = data.product.brand;
                htmlElements.quantity.value = data.product.quantity;
                htmlElements.minQuantity.value = data.product.minQuantity;
                htmlElements.imgUrl.value = data.product.imageName;
                htmlElements.productIDInput.value = data.product._id;

                htmlElements.msgBox.textContent = "Elemento encontrado!"
                htmlElements.divMsgBox.style.display = "block";
                setTimeout(() => { htmlElements.divMsgBox.style.display = "none" }, 3500);

            } else {
                htmlElements.msgBox.innerHTML = `Elemento no encontrado! <a href="/addItem"><button type="button">Agregar nuevo producto</button></a>`
                htmlElements.divMsgBox.style.display = "block";

                setTimeout(() => {
                    htmlElements.divMsgBox.style.display = "none";
                }, 3500);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);