let menuBar = document.getElementById("menubar");
let menu = document.querySelector(".menu");
let menutap = document.querySelector(".menutap");
let main1 = document.querySelector(".main1");

let mmenuBar = document.getElementById("mmenubar");
let mmenu = document.querySelector(".mmenu");
let mmenutap = document.querySelector(".mmenutap");

let i = 0;
let toggle = false;
let mtoggle = false;

mmenuBar.onclick = () => {
    if(mtoggle) {
        mtoggle = false;
        let width = setInterval(() => {
            if(i <= 0) {
                mmenu.style.display = "none";
                menutap.style.display = "none";
                clearInterval(width);
            } else {
                mmenu.style.width = `${i}px`;
                i -= 10;
            }
        }, 1);
    } else {
        mtoggle = true;
        mmenu.style.display = "block";
        menutap.style.display = "block";
        let width = setInterval(() => {
            if(i >= 230) {
                clearInterval(width);
            } else {
                mmenu.style.width = `${i}px`;
                mmenu.style.boxShadow = "rgba(0,0,0,0.5) 0 0 0 9999px, rgba(0,0,0,0.5) 2px 2px 3px 3px";
                // mmenu.style.zIndex = "500";
                i += 10;
            }
        }, 1);
    }
}



menuBar.onclick = () => {
    if(toggle) {
        toggle = false;
        let width = setInterval(() => {
            if(i <= 0) {
                menu.style.display = "none";
                menutap.style.display = "none";
                clearInterval(width);
            } else {
                main1.style.width = `calc(100% - ${i}px)`;
                menu.style.width = `${i}px`;
                i -= 10;
            }
        }, 1);
    } else {
        toggle = true;
        menu.style.display = "block";
        menutap.style.display = "block";
        let width = setInterval(() => {
            if(i >= 280) {
                clearInterval(width);
            } else {
                main1.style.width = `calc(100% - ${i}px)`;
                menu.style.width = `${i}px`;
                i += 10;
            }
        }, 1);
    }
}

main1.onmouseup = () => {
    if(mtoggle) {
        mtoggle = false;
        let width = setInterval(() => {
            if(i <= 0) {
                mmenu.style.display = "none";
                menutap.style.display = "none";
                clearInterval(width);
            } else {
                mmenu.style.width = `${i}px`;
                i -= 10;
            }
        }, 1);
    }
}