function onScanSuccess(decodedText, decodedResult) {
    // Qué hacer si se detecta qr
    const dataToSend = {
        decodedText: decodedText,
        decodedResult: decodedResult
    };
    fetch('/addItemGTIN', {
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
                name: document.getElementById("productName"),
                brand: document.getElementById("productBrand"),
                divMessage: document.querySelector("#message"),
                message: document.querySelector("#message p"),
                gtinInput: document.querySelector("#productGTIN")
            }
            if (data.foundedItem !== null) {
                htmlElements.name.value = data.foundedItem.name;
                htmlElements.brand.value = data.foundedItem.brand;

                htmlElements.message.textContent = "Elemento encontrado!"
                htmlElements.divMessage.style.display = "block";

                setTimeout(() => {
                    htmlElements.divMessage.style.display = "none";
                }, 3500);
            } else {
                // Si no se encontró ningun item (cartel y enviar gtin para agregar a db)
                htmlElements.message.textContent = "Elemento no encontrado! Al agregarlo, se añadira a la base de datos."
                htmlElements.divMessage.style.display = "block";
                htmlElements.gtinInput.value = dataToSend.decodedText;

                setTimeout(() => {
                    htmlElements.divMessage.style.display = "none";
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