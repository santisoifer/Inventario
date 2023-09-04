// TODO: Hacer que se completen los datos si se encontro el gtin. Sino, mostrar cartel de que hay que agregarlo
function onScanSuccess(decodedText, decodedResult) {
    // Handle on success condition with the decoded text or result.
    console.log(`Scan result: ${decodedText}`, decodedResult);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);