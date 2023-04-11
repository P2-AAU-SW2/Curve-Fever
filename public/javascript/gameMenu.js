/*const skinsBtn = document.querySelector('.skins-btn');
const iconsBtn = document.querySelector('.icons-btn');
const contentContainer = document.getElementById('content-container');

let skinsInFocus = true;

skinsBtn.addEventListener('click', () => {
    skinsInFocus = true;
    updateContentContainer();
});

iconsBtn.addEventListener('click', () => {
    skinsInFocus = false;
    updateContentContainer();
});

function updateContentContainer() {
    let html = '';
    for (let i = 0; i < 11; i++) {
        if (skinsInFocus) {
            html += '<div class="skin-item"><img src="/images/Mask group.png" alt="skin-item"></div>';
        } else {
            html += '<div class="icon-item"><img src="" alt="icon-item"><i class="fa-solid fa-poo"></i></div>';
        }
    }
    contentContainer.innerHTML = html;
}*/