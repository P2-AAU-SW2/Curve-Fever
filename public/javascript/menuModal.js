const modal = document.querySelector(".menu-modal");
const modalContainer = document.querySelector(".menu-modal-container");
const modalOverlay = document.querySelector(".menu-modal-overlay");

let menuModal = {
    btn1: {
        text: "",
        color: "blue",
        href: "",
    },
    btn2: {
        text: "",
        color: "green",
        href: "",
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

function closeModal() {
    modal.classList.add("inactive-modal");
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
                    <input type="text" id="modalInput" class="text-input" placeholder="${menuModal.input.placeholder}">
                    <i class="fa-solid fa-pen"></i>
                </div>`;
    }
    if (menuModal.btn1.text) {
        html += `<div class="menu-modal-btns">
                    <button onclick="${menuModal.btn1.onClick}" class="${menuModal.btn1.color}-btn">
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
