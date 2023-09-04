// TODO: Hacer que se completen los datos si se encontro el gtin. Sino, mostrar cartel de que hay que agregarlo
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
            if (data.foundedItem !== null) {
                // Si se encontró un item
            } else {
                // Si no se encontró ningun item (cartel y enviar gtin para agregar a db)
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);