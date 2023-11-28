const dashboardLink = document.querySelector(".aside-panel__links__dashboard");
const inventoryLink = document.querySelector(".aside-panel__links__inventory");
const addItemLink = document.querySelector(".aside-panel__links__addItem");
const editItemLink = document.querySelector(".aside-panel__links__editItem");
const makePurchasesLink = document.querySelector(".aside-panel__links__makePurchases");
const purchasesArrivedLink = document.querySelector(".aside-panel__links__purchasesArrived");
const logOutLink = document.querySelector(".aside-panel__links__logOut");
const collapsableAside = document.getElementById("collapsable-aside");
const asidePanel = document.getElementById("aside-panel");

function addHoverClassToElement(element, className) {
    element.addEventListener('mouseover', () => {
        element.classList.add(className); // Agrega la clase cuando el mouse entra
    });

    element.addEventListener('mouseout', () => {
        element.classList.remove(className); // Elimina la clase cuando el mouse sale
    });
}

collapsableAside.style.display = "none";
asidePanel.style.display = "block";

function applyStyles() {
    // Check the current screen width and apply styles accordingly
    if (window.matchMedia('(max-width: 1520px)').matches) {
        collapsableAside.style.display = "block";
        asidePanel.style.display = "none";
    } else {
        asidePanel.style.display = "block";
        collapsableAside.style.display = "none";
    }
}

// Initial application of styles
applyStyles();

// Update styles on window resize
window.addEventListener('resize', applyStyles);