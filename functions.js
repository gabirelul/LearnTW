const navToggle = document.querySelector('#hamburger-toggle');
const nav = document.querySelector('nav');
const ham = document.querySelector(".hamburger");

navToggle.addEventListener("click", () => {
    nav.classList.toggle('open');
    
    if (nav.classList.contains('open')) {
        ham.classList.toggle('active');
        console.log("CLICKED");
    } else {
        ham.classList.remove('active');
        console.log("UNCLICKED");
    }
});

window.addEventListener(
    "resize", () => {
        if (document.body.clientWidth > 768) {
            nav.classList.remove("open");
        }
    }
);