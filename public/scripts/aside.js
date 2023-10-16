const dashboardLink = document.querySelector(".aside-panel__links__dashboard");
const inventoryLink = document.querySelector(".aside-panel__links__inventory");
const addItemLink = document.querySelector(".aside-panel__links__addItem");
const editItemLink = document.querySelector(".aside-panel__links__editItem");
const makePurchasesLink = document.querySelector(".aside-panel__links__makePurchases");
const purchasesArrivedLink = document.querySelector(".aside-panel__links__purchasesArrived");
const logOutLink = document.querySelector(".aside-panel__links__logOut");

function addHoverClassToElement(element, className) {
    element.addEventListener('mouseover', () => {
        element.classList.add(className); // Agrega la clase cuando el mouse entra
    });

    element.addEventListener('mouseout', () => {
        element.classList.remove(className); // Elimina la clase cuando el mouse sale
    });
}