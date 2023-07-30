
function startDataViz() {
    document.getElementById("startButton").style.opacity = 0;
    setTimeout(() => showIntroText(), 500);
}

function showIntroText() {
    var centered = document.getElementById("centered");
    centered.innerHTML = "";
    var lines = ["They just don't make movies like they used to...", "...or do they?", "Have movies gotten better?", "Have they gotten longer?", "Let's find out."];
    lines.forEach((e, i) => {
        var span = document.createElement("span");
        console.log("created " + i);
        span.style.transition = "all .5s";
        span.style.transitionDelay = (1.5 * i) + "s";
        span.style.opacity = 0;
        span.textContent = e;
        centered.appendChild(span);
        setTimeout(function() {
            span.style.opacity = 1;
            // console.log(i + " is now becoming visible");
            if (i == lines.length - 1) {
                setTimeout(scene1StartButtonAppear, (1.5 * i + 1) * 1000);
            }
        }, 10);
    });
}

function scene1StartButtonAppear() {
    var centered = document.getElementById("centered");
    var scene1Button = document.createElement("button");
    scene1Button.style.transition = "all .5s";
    scene1Button.style.opacity = 0;
    scene1Button.innerHTML = "Press to continue...\u2192";
    scene1Button.className = "niceButton";
    scene1Button.onclick = () => { console.log('yay'); window.location.href = "ratings.html"; };
    centered.appendChild(document.createElement("br"));
    centered.appendChild(scene1Button);
    setTimeout(function() {
        scene1Button.style.opacity = 1;
    }, 10);
}
