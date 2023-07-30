
genres = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'];

window.addEventListener('load', function() {
  baseGraph1();
  baseGraph2();
  makeGenresList();
  populateData();
  setTimeout(function() {
      alert("You now have the opportunity to explore the graphs freely!"
      + "\nHover over the points to view tooltips, and change the parameters on the right to filter by the genre or number of user ratings.")}, 1000);
});

function makeGenresList() {
    genres.forEach(e => {
        check = document.createElement("input");
        check.type = "checkbox";
        check.checked = true;
        check.id = "checkbox" + e;
        check.name = e;
        label = document.createElement("label");
        label.textContent = e;
        label.htmlFor = "checkbox" + e;
        document.getElementById("genreList").appendChild(check);
        document.getElementById("genreList").appendChild(label);
        document.getElementById("genreList").appendChild(document.createElement("br"));
    });
}

function getActiveGenres() {
    activeGenres = [];
    document.querySelectorAll("input[type='checkbox']").forEach(e => {
        if (e.checked) {
            activeGenres.push(e.name);
        }
    });
    return activeGenres;
}

var ALL_DATA = 0;

var graphW = screen.width * 600 / 1920;
var graphH = screen.height * 700 / 1080;
var m = {t: 20, b: 50, l: 80, r: 20};

var svg1 = 0;
var svg2 = 0;
var circleg1 = 0;
var circleg2 = 0;

// Runtime ranged from 18 to 776 mins for 1K votes,
//  45 to 566 mins for 5K votes,
//  45 to 467 mins for 10K votes

var x = d3.scaleLinear()
    .domain([1910, 2024])
    .range([0, graphW])

var y1 = d3.scaleLinear()
    .domain([0, 10])
    .range([graphH, 0]);

var y2 = d3.scaleLog()
    .domain([40, 600])
    .range([graphH, 0])
    
// Max votes was 2773389
var rad = 0

function baseGraph1() {
    svg1 = d3.select("#graph")
        .append("svg")
        .attr("width", graphW + m.l + m.r)
        .attr("height", graphH + m.t + m.b)
        .append("g")
        .attr("transform", "translate(" + m.l + "," + m.t + ")");

    svg1.append("g")
        .attr("transform", "translate(0, " + graphH + ")")
        .call(d3.axisBottom(x).tickFormat((d, i) => d))
        .append("text")
        .attr("fill", "black")//set the fill here
        .attr("transform", "translate(" + graphW / 2 + ", 50)")
        .attr("font-size", "2em")
        .text("Release Year");

    svg1.append("g")
        .call(d3.axisLeft(y1))
        .append("text")
        .attr("fill", "black") // set the fill here
        .attr("transform", "rotate(-90) translate(" + -(graphH / 2 - 100) + ", -40)")
        .attr("font-size", "2em")
        .text("Average User Rating");

    circleg1 = svg1.append("g");

    d3.selectAll("#graph .tick > text").style("font-size", function(d) { return "1.5em"; });
}

function baseGraph2() {
    svg2 = d3.select("#graph2")
        .append("svg")
        .attr("width", graphW + m.l + m.r)
        .attr("height", graphH + m.t + m.b)
        .append("g")
        .attr("transform", "translate(" + m.l + "," + m.t + ")");

    svg2.append("g")
        .attr("transform", "translate(0, " + graphH + ")")
        .call(d3.axisBottom(x).tickFormat((d, i) => d))
        .append("text")
        .attr("fill", "black")//set the fill here
        .attr("transform", "translate(" + graphW / 2 + ", 50)")
        .attr("font-size", "2em")
        .text("Release Year");

    svg2.append("g")
        .call(d3.axisLeft(y2).tickValues([60,80,100,120,150,180,240,300,360,420,480,540,600]))
        .append("text")
        .attr("fill", "black") // set the fill here
        .attr("transform", "rotate(-90) translate(" + -(graphH / 2 - 100) + ", -45)")
        .attr("font-size", "2em")
        .text("Runtime (minutes)");

    circleg2 = svg2.append("g");

    d3.selectAll("#graph2 .tick > text").style("font-size", function(d) { return "1.5em"; });
}

function populateData() {
    d3.tsv("https://gerst-416-dataviz.github.io/mergedData.tsv").then(data => {
        // Sort with most votes first
        data = data.toSorted((a, b) => b.numVotes - a.numVotes);
        ALL_DATA = data;
        renderGraphs();
    });
}

function makeTooltip(a, b) {
    console.log(a, b);
    tooltip = document.getElementById("tooltip");
    tooltip.style.display = "block";
    tooltip.style.left = (a.clientX + 15) + "px";
    tooltip.style.top = (a.clientY + 5) + "px";
    tt = document.getElementById("tooltipTitle");
    tc = document.getElementById("tooltipContents");
    tt.textContent = b.primaryTitle + " (" + b.startYear + ")";
    tc.innerHTML = "Average Rating: " + b.averageRating + "<br>"
        + "Number of Ratings: " + parseInt(b.numVotes).toLocaleString() + "<br>"
        + "Runtime: " + b.runtimeMinutes + " minutes" + "<br>"
        + "Genres: " + b.genres.split(",").join(", ");
}

function destroyTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

function renderGraphs() {
    MIN_VOTES = document.getElementById("minVotes").value;
    ACTIVE_GENRES = getActiveGenres();
    data = ALL_DATA.filter(d => parseInt(d.numVotes) >= MIN_VOTES && d.genres.split(",").filter(e => ACTIVE_GENRES.includes(e)).length > 0);
    minVotesFound = 3000000;
    maxVotesFound = 0;
    data.forEach(d => { minVotesFound = Math.min(minVotesFound, d.numVotes); maxVotesFound = Math.max(maxVotesFound, d.numVotes); });
    rad = d3.scaleLog()
        .domain([minVotesFound, maxVotesFound])
        .range([1, 8]);
    console.log(data);

    join1 = circleg1 .selectAll("circle")
        .data(data, d => d.tconst)
    
    join1.enter()
        .append("circle")
        .on("mousemove", (d, i) => {makeTooltip(d, i)})
        .on("mouseleave", (d, i) => {destroyTooltip()})
        .attr("cx", d => x(d.startYear))
        .attr("cy", d => y1(d.averageRating))
        //.attr("r", d => rad(d.numVotes))
        .attr("r", 0)
        .style("stroke", "red")
        .style("fill", "transparent")
        //.style("opacity", 0)
        .transition()
        .duration(1000)
        //.style("opacity", 1);
        .attr("r", d => rad(d.numVotes))

    join1
        .transition()
        .duration(1000)
        .attr("r", d => rad(d.numVotes))

    join1.exit()
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    join2 = circleg2 .selectAll("circle")
        .data(data, d => d.tconst)
    
    join2.enter()
        .append("circle")
        .on("mousemove", (d, i) => {makeTooltip(d, i)})
        .on("mouseleave", (d, i) => {destroyTooltip()})
        .attr("cx", d => x(d.startYear))
        .attr("cy", d => y2(d.runtimeMinutes))
        //.attr("r", d => rad(d.numVotes))
        .attr("r", 0)
        .style("stroke", "red")
        .style("fill", "transparent")
        //.style("opacity", 0)
        .transition()
        .duration(1000)
        //.style("opacity", 1);
        .attr("r", d => rad(d.numVotes))

    join2
        .transition()
        .duration(1000)
        .attr("r", d => rad(d.numVotes))

    join2.exit()
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
}
