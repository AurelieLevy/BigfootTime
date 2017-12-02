if (window.addEventListener) {
    var kkeys = [], konamiCode = "38,38,40,40,37,39,37,39,66,65";
    window.addEventListener("keydown", function (e) {
        kkeys.push(e.keyCode);
        if (kkeys.toString().indexOf(konamiCode) >= 0) {
            alert('You were Konami roll ;)');
            document.location.href="resources/bigfootRoll.html";
        }
    }, true);
}