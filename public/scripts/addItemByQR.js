// TODO: Hacer que se completen los datos si se encontro el gtin. Sino, mostrar cartel de que hay que agregarlo
function onScanSuccess(decodedText, decodedResult) {
    // Handle on success condition with the decoded text or result.
    // console.log(`Scan result: ${decodedText}`, decodedResult);
    const dataToSend = {
        decodedText: decodedText,
        decodedResult: decodedResult
    };

    console.log(dataToSend);
    // Configurar la solicitud POST
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
            // Manejar la respuesta del servidor si es necesario
            console.log('Respuesta del servidor:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);