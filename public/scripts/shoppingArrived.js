
let products = []; // {_id/gtin: 148394, newQuantity: 4} o si hay que agregarlo: {_id/gtin: 148394, name: "asd", brand: "adsda", quantity:Number, minQuantity:Number}
function onScanSuccess(decodedText, decodedResult) {
    // Qué hacer si se detecta qr
    const scannedAudio = new Audio('../audio/beep_sound.mp3');
    scannedAudio.play();
    const gtinScanned = {
        decodedText: decodedText
    };
    fetch('/editItemByQR', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gtinScanned)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {
            if (data.product !== undefined) { // Si el producto existe: 
                const newItemQuantityInput = document.querySelector("#newItemQuantity");
                const nextProductButton = document.querySelector("#nextProduct");
                const warningItemDoesntExist = document.querySelector("#warningItemDoesntExist");
                warningItemDoesntExist.setAttribute("hidden", "");
                newItemQuantityInput.removeAttribute("hidden");
                nextProductButton.removeAttribute("hidden");
                nextProductButton.addEventListener('click', () => { //Cuando hagan click en "siguiente producto"
                    const editedItem = {
                        _id: data.product._id,
                        newQuantity: Number(data.product.quantity) + Number(newItemQuantityInput.value)
                    }
                    const alreadyEditedItem = products.find((item) => item._id === editedItem._id);
                    if (alreadyEditedItem === undefined) {
                        products.push(editedItem);
                        newItemQuantityInput.setAttribute("hidden", "");
                        nextProductButton.setAttribute("hidden", "");
                    }
                });
            } else { // si el producto no existe
                const warningItemDoesntExist = document.querySelector("#warningItemDoesntExist");
                warningItemDoesntExist.removeAttribute("hidden");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    const finishedButton = document.querySelector("#finishScanning");
    finishedButton.addEventListener("mouseover", () => {
        const dataToSend = {
            products: products
        }
        console.log(dataToSend);
    });
    finishedButton.addEventListener("click", () => {
        const dataToSend = {
            products: products
        }
        fetch("/shoppingArrived", {
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
                if (data.statusCode === 200) {
                    window.location.href = "/";
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 20, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);