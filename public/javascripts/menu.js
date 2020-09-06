let menuBar = document.getElementById("menubar");
let menu = document.querySelector(".menu");
let menutap = document.querySelector(".menutap");
let main1 = document.querySelector(".main1");
let mtop = document.querySelector(".top");

let mmenuBar = document.getElementById("mmenubar");
let mmenu = document.querySelector(".mmenu");
let mmenutap = document.querySelector(".mmenutap");

let proselectd = document.getElementById("proselectd");
let proselect = document.getElementById("proselect");
let originalPro = document.getElementById("originalPro");
let profilechange = document.getElementById("profilechange");
let closeselect = document.getElementById("closeselect");

let profileImg = document.querySelector(".profileImg");
let mprofileImg = document.querySelector(".mprofileImg");

let al = document.getElementById("al");
al.onmouseover = () => { al.style.color = "white"; }
al.onmousedown = () => { al.style.color = "white"; }
al.onmouseout = () => { al.style.color = "black"; }

let i = 0;
let toggle = false;
let mtoggle = false;
let setoggle = false;
let chattoggle = false;
let mchattoggle = false;

originalPro.onclick = () => {
    let tf = confirm("기본 프로필 사진으로 바꾸시겠습니까?");
    if(tf) { oPro(); }
}
closeselect.onclick = () => {
    setoggle = false;
    proselect.classList.remove("pso");
    proselect.classList.remove("psc");
    proselect.classList.add("psc");
    let dis = setTimeout(() => {
        proselectd.style.display = "none";
        clearTimeout(dis);
    }, 370);
}

profileImg.onclick = () => { toggle = false; shopro('c'); }
mprofileImg.onclick = () => { mtoggle = false; shopro('m'); }

function prochfilecheck(file) {
    let pathpoint = file.value.lastIndexOf('.');
    let filepoint = file.value.substring(pathpoint+1, file.length);
    let filetype = filepoint.toLowerCase();
    if(filetype == 'png' || filetype == 'jpg' || filetype == 'jpeg') {
        let psub = document.getElementById("psub");
        psub.click();
    } else {
        alert("이미지 파일만 선택 하실수 있습니다.");
        let parentObj = file.parentNode;
        parentObj.replaceChild(file.cloneNode(true),file);
    }
}

function gprofileSub(e, form) {
    e.preventDefault();

    let formData = new FormData(form);
    let foo;
    foo = formData;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/profileUpload/');
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            if(data.result == 'success') { location.replace(location.href); }
        }
    }
    xhr.send(foo);
}

function shopro(device) {
    if(device == 'c') {
        toggle = false;
        menu.classList.remove("menuo");
        main1.classList.remove("menuo1");
        menu.classList.remove("menuc");
        main1.classList.remove("menuc1");
        menu.classList.add("menuc");
        main1.classList.add("menuc1");
    } else if(device == 'm') {
        if(mtoggle) {
            mtoggle = false;
            mmenu.classList.remove("mmenuo");
            mmenu.classList.remove("mmenuc");
            mmenu.classList.add("mmenuc");
        }
    }
    if(!setoggle) {
        setoggle = true;
        proselectd.style.display = "flex";
        proselect.classList.remove("psc");
        proselect.classList.remove("pso");
        proselect.classList.add("pso");
    }
}

function oPro() {
    let Info = { apploval: true };

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/account/delPro/');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            if(data.result == 'success') { location.replace(location.href); }
        }
    }
    xhr.send(JSON.stringify(Info));
}

mmenuBar.onclick = () => {
    if(mtoggle) {
        mtoggle = false;
        mmenu.classList.remove("mmenuo");
        mmenu.classList.remove("mmenuc");
        mmenu.classList.add("mmenuc");
    } else {
        mtoggle = true;
        mmenu.classList.remove("mmenuc");
        mmenu.classList.remove("mmenuo");
        mmenu.classList.add("mmenuo");
    }
}


menuBar.onclick = () => {
    if(toggle) {
        toggle = false;
        menu.classList.remove("menuo");
        main1.classList.remove("menuo1");
        menu.classList.add("menuc");
        main1.classList.add("menuc1");
    } else {
        toggle = true;
        menu.classList.remove("menuc");
        main1.classList.remove("menuc1");
        menu.classList.add("menuo");
        main1.classList.add("menuo1");
    }
}

main1.onmouseup = () => {
    if(mtoggle) {
        mtoggle = false;
        mmenu.classList.remove("mmenuo");
        mmenu.classList.add("mmenuc");
    }
}

mtop.onmouseup = () => {
    if(mtoggle) {
        mtoggle = false;
        mmenu.classList.remove("mmenuo");
        mmenu.classList.add("mmenuc");
    }
}

function chatdown(menu55) {
    let asschat = document.querySelectorAll(".asschat");

    if(!chattoggle) {
        chattoggle = true;
        menu55.innerHTML = "판매자와 채팅 ▲";
        menu55.classList.remove('sel');
        for(let i=0; i<asschat.length; i++) {
            asschat[i].style.display = "flex";
        }
    } else {
        chattoggle = false;
        menu55.innerHTML = "판매자와 채팅 ▼";
        menu55.classList.add('sel');
        for(let i=0; i<asschat.length; i++) {
            asschat[i].style.display = "none";
        }
    }
}

function mchatdown(mmenu55) {
    let masschat = document.querySelectorAll(".masschat");

    if(!mchattoggle) {
        mchattoggle = true;
        mmenu55.innerHTML = "판매자와 채팅 ▲";
        mmenu55.classList.remove('sel');
        for(let i=0; i<masschat.length; i++) {
            masschat[i].style.display = "flex";
        }
    } else {
        mchattoggle = false;
        mmenu55.innerHTML = "판매자와 채팅 ▼";
        mmenu55.classList.add('sel');
        for(let i=0; i<masschat.length; i++) {
            masschat[i].style.display = "none";
        }
    }
}