function IProfile() {
    let toppro = document.getElementById("toppro");
    let deimg = document.getElementById("deimg");
    let delh4 = document.getElementById("delh4");

    let i = document.createElement("i");
    i.classList.add("far");
    i.classList.add("fa-user");
    i.style.fontSize = "35px";
    let h4 = document.createElement("h4");
    h4.innerHTML = "프로필";
    toppro.removeChild(deimg);
    toppro.removeChild(delh4);
    toppro.append(h4);
    toppro.append(i);
}