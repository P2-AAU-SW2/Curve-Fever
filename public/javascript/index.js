let skinsInFocus = "<%- JSON.stringify(skinsInFocus) %>";
let container = document.querySelector(".main-container");

container.addEventListener("resize", resizeContainer);

function changeFocus(value) {
    if (skinsInFocus !== value) {
        setFocus();
        skinsInFocus = value;
        renderContent();
    }
}

function createMenuModal(type, item) {
    if (type === "create") {
        menuModal.input.placeholder = "Room name";
        menuModal.btn1.text = "Team";
        menuModal.btn1.color = "blue";
        menuModal.btn2.text = "FFA";
        menuModal.btn2.color = "green";
    } else if (type.includes("shop")) {
        if (type.includes("icon")) menuModal.icon.class = item;
        else menuModal.image.src = `/assets/images/${item}.svg`;
        menuModal.text = "Would you like to buy this item for 100 points?";
        menuModal.btn1.text = "Buy";
        menuModal.btn1.color = "blue";
    } else if (type === "join") {
        menuModal.input.placeholder = "Room name";
        menuModal.btn1.text = "Join room";
        menuModal.btn1.color = "red";
    }
    createModal();
}

function setFocus() {
    var skinsBtn = document.getElementById("skins-btn");
    var iconsBtn = document.getElementById("icons-btn");
    skinsBtn.classList.toggle("active");
    iconsBtn.classList.toggle("active");
}

function displayShop() {
    let shop = document.querySelector(".shop");
    shop.classList.toggle("show-mini-shop");
}

function renderContent() {
    const content = document.querySelector(".content");
    let html = "";
    for (let i = 0; i < 9; i++) {
        if (skinsInFocus) {
            html += `
        <div class="shop-item" onclick="createMenuModal('shop', 'line${
            i + 1
        }')">
        <img class="shop-item-img" src="/assets/images/line${
            i + 1
        }.svg" alt="skin-item">
        </div>
    `;
        } else {
            html += `
        <div onclick="createMenuModal('shop icon', 'fa-solid fa-rocket-launch icon-item')" class="shop-item" tabindex="0">
            <i class="icon-item fa-solid fa-rocket-launch"></i>
        </div>
    `;
        }
    }
    content.innerHTML = html;
}
