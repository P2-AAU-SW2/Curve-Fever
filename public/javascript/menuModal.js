const modal = document.querySelector(".menu-modal");
const modalContainer = document.querySelector(".menu-modal-container");
const modalOverlay = document.querySelector(".menu-modal-overlay");
const shopContainer = document.querySelector(".shop-modal-container");
const shopModal = document.querySelector(".shop-modal");
const shopOverlay = document.querySelector(".shop-modal-overlay");

let menuModal = {
    btn1: {
        text: "",
        color: "blue",
    },
    btn2: {
        text: "",
        color: "green",
    },
    input: {
        placeholder: "",
    },
    image: {
        src: "",
    },
    icon: {
        class: "",
    },
    text: "",
};

let menuModalCpy = JSON.parse(JSON.stringify(menuModal));

modalOverlay.addEventListener("click", () => closeModal());
shopOverlay.addEventListener("click", () => closeShopModal());


function closeModal() {
    modal.classList.add("inactive-modal");    
}
function closeShopModal() {
    shopModal.classList.add("inactive-modal");  
}
// eslint-disable-next-line no-unused-vars
function createModal() {
    let html = "";

    html += `<i class="fa-solid fa-xmark modal-cross" onclick="closeModal()" tabindex="0"></i>`;
    if (menuModal.image.src) {
        html += `<img class="shop-item modal-shop-item" src="${menuModal.image.src}" alt="skin-item">`;
    } else if (menuModal.icon.class) {
        html += `<i class="shop-item modal-shop-item ${menuModal.icon.class}" alt="icon-item"></i>`;
    }
    if (menuModal.text) {
        html += `<div class="menu-modal-text">
                        ${menuModal.text}
                    </div>`;
    }
    if (menuModal.input.placeholder) {
        html += `<div class="menu-modal-input-container">
                    <input type="text" class="text-input" placeholder="${menuModal.input.placeholder}">
                    <i class="fa-solid fa-pen"></i>
                </div>`;
    }
    if (menuModal.btn1.text) {
        html += `<div class="menu-modal-btns">
                    <button class="${menuModal.btn1.color}-btn">
                        ${menuModal.btn1.text}
                    </button>`;

        if (menuModal.btn2.text) {
            html += `<button class="${menuModal.btn2.color}-btn">
                        ${menuModal.btn2.text}
                    </button>`;
        }
        html += `</div>`;
    }

    modalContainer.innerHTML = html;
    modal.classList.remove("inactive-modal");
    menuModal = JSON.parse(JSON.stringify(menuModalCpy));
}

function toggleShop() {
    let html = "";
    html += `
        <div class="shopModal">
            <i class="fa-solid fa-xmark shopModal-cross" onclick="closeShopModal()" tabindex="0"></i>
            <div class="shop-btns">
                <button onclick="changeFocus(true)" id="skins-btn" class="shop-btn active">Skins</button>
                <button onclick="changeFocus(false)" id="icons-btn" class="shop-btn">Icons</button>
            </div>
            <div class="modalContent">`;
            for (let i = 0; i < 11; i++) { 
                if(skinsInFocus){
                html += `<button onclick="createMenuModal('shop', 'line${i + 1}')" class="shop-item">
                    <img class="shop-item-img" src="/assets/images/line${i + 1}.svg" alt="skin-item">
                </button>`;
                }else {
                    html += `<div onclick="createMenuModal('shop icon', 'fa-solid fa-poo icon-item')" class="shop-item" tabindex="0">
                    <i class="icon-item fa-solid fa-poo"></i>
                    </div>`;
                }
            }
            html += `</div>
        </div>`;

    shopContainer.innerHTML = html;
    shopModal.classList.remove("inactive-modal");
}