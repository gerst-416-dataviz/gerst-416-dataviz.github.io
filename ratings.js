
window.addEventListener('load', function () {
  showGraph();
})

var ALL_DATA = 0;

var graphW = screen.width * 1200 / 1920;
var graphH = screen.height * 700 / 1080;
var m = {t: 20, b: 50, l: 75, r: 20};

var svg = 0;

var x = d3.scaleLinear()
    .domain([1910, 2024])
    .range([0, graphW]);

var y = d3.scaleLinear()
    .domain([0, 10])
    .range([graphH, 0]);
    
// Max votes was 2773389
var rad = d3.scaleLog()
    .domain([1000, 3000000])
    .range([1, 8]);

PHASE2_MIN_VOTES = 40000
var rad2 = d3.scaleLog()
    .domain([PHASE2_MIN_VOTES, 3000000])
    .range([1, 8]);

PHASE3_MIN_VOTES = 150000
var rad3 = d3.scaleLog()
    .domain([PHASE3_MIN_VOTES, 3000000])
    .range([1, 8]);

function showGraph() {
    svg = d3.select("#graph")
        .append("svg")
        .attr("width", graphW + m.l + m.r)
        .attr("height", graphH + m.t + m.b)
        .append("g")
        .attr("transform", "translate(" + m.l + "," + m.t + ")");

    svg.append("g")
        .attr("transform", "translate(0, " + graphH + ")")
        .call(d3.axisBottom(x).tickFormat((d, i) => d))
        .append("text")
        .attr("fill", "black")//set the fill here
        .attr("transform", "translate(" + graphW / 2 + ", 50)")
        .attr("font-size", "2em")
        .text("Release Year");

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "black") // set the fill here
        .attr("transform", "rotate(-90) translate(" + -(graphH / 2 - 100) + ", -40)")
        .attr("font-size", "2em")
        .text("Average User Rating");

    d3.selectAll(".tick > text").style("font-size", function(d) { return "1.5em"; });

    d3.tsv("https://gerst-416-dataviz.github.io/mergedData.tsv").then(data => {
        // Sort with most votes first
        data = data.toSorted((a, b) => b.numVotes - a.numVotes);
        ALL_DATA = data;
        //data = data.filter(d => d.numVotes >= 50000);

        console.log(data.length);
        
        const annotations = [
          {
            note: {
              title: "Peter Pan (1924)",
              label: "Average Rating: 7.1\tNumber of Ratings: 1,189\tRuntime: 105 minutes",
              align: "middle",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1924),
            y: y(7.1),
            dy: 250,
            dx: -20,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          },
          {
            note: {
              title: "Invasion of the Neptune Men (1961)",
              label: "Average Rating: 2.1\tNumber of Ratings: 2,813\tRuntime: 75 minutes",
              align: "right",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1961),
            y: y(2.1),
            dy: 30,
            dx: -160,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          }
        ];
        const makeAnnotations = d3.annotation().annotations(annotations);

        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .on("mouseover", (d, i) => {console.log(d, i)})
            .attr("cx", d => x(d.startYear))
            .attr("cy", d => y(d.averageRating))
            //.attr("r", d => rad(d.numVotes))
            .attr("r", 0)
            .style("stroke", "red")
            .style("fill", "none")
            //.style("opacity", 0)
            .transition()
            .duration(1000)
            //.style("opacity", 1);
            .attr("r", d => rad(d.numVotes))
        svg.append("g").call(makeAnnotations)
            .style("opacity", 0)
            .transition()
            .delay(2000)
            .duration(1000)
            .style("opacity", 1);
    });
}

function graphPhase2() {
    // Remove continue button
    var contButton = document.querySelector(".continueButton");
    var expBox = document.getElementById("explainBox1");
    expBox.removeChild(contButton);

    data = ALL_DATA.filter(d => parseInt(d.numVotes) >= PHASE2_MIN_VOTES);

    console.log(data.length);

    var newText = document.createElement("span");
    newText.innerHTML = "Now, we can filter the data down to include only movies with at least " + PHASE2_MIN_VOTES.toLocaleString()
        + " user ratings on IMDb, which leaves us with " + data.length.toLocaleString() + " entries remaining.<br><br>"
        + "After that, we resize the circles to take into account the new range and make it easier to read. It may still be a bit too much data to find any useful patterns.<br><br>"
        + "Unfortunately, we are beginning to see the start of a worrying trend in the dataset. Namely, the vast majority of movies with many user ratings are very recent.";

    newText.style.opacity = 0;
    contButton.style.opacity = 0;
    newText.style.transition = "1s all";
    contButton.style.transition = "1s all";
    expBox.childNodes.forEach(e => { try { e.style.transition = "0s all" ; e.style.opacity = .5 } catch {} });

    expBox.appendChild(newText);
    contButton.onclick = () => { graphPhase3() };
    expBox.appendChild(contButton);
    expBox.scrollTo(0, expBox.scrollHeight);

    setTimeout(function() {
        newText.style.opacity = 1;
        contButton.style.opacity = 1;
    }, 10);

    svg.select(".annotations")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    var join = svg.selectAll("g:nth-child(3) circle")
        .data(data)
    
    join.exit()
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    join.transition()
        .duration(2000)
        .delay(1000)
        .attr("r", d => rad2(d.numVotes))

    const annotations = [
          {
            note: {
              title: "Howard the Duck (1986)",
              label: "Average Rating: 4.7\tNumber of Ratings: 49,324\tRuntime: 110 minutes",
              align: "middle",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1986),
            y: y(4.7),
            dy: 150,
            dx: -120,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          },
          {
            note: {
              title: "It's a Wonderful Life (1946)",
              label: "Average Rating: 8.6\tNumber of Ratings: 475,678\tRuntime: 130 minutes",
              align: "middle",  // try right or left
              wrap: 250,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1946),
            y: y(8.6),
            dy: 150,
            dx: -80,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 10, radiusPadding: 0 },
          }
        ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations)
        .style("opacity", 0)
        .transition()
        .delay(2000)
        .duration(1000)
        .style("opacity", 1);
}

function graphPhase3() {
    // Remove continue button
    var contButton = document.querySelector(".continueButton");
    var expBox = document.getElementById("explainBox1");
    expBox.removeChild(contButton);

    data = ALL_DATA.filter(d => parseInt(d.numVotes) >= PHASE3_MIN_VOTES);

    console.log(data.length);

    var newText = document.createElement("span");
    newText.innerHTML = "Here, we've filtered to include only movies with at least " + PHASE3_MIN_VOTES.toLocaleString()
        + " ratings on IMDb, which now leaves us with " + data.length.toLocaleString() + " entries.<br><br>"
        + "The concerning trend we noted before is now even more visible. Why might this happen?<br><br>"
        + "Well, it makes sense intuitively. Older movies like <i>Peter Pan</i> (1924) came long before the age of IMDb, and are far older than almost any user of the website. The number of new viewers of such movies pales in comparison to the number watching new films. "
        + "This holds especially true for movies like <i>Invasion of the Neptune Men</i> (1961), with an average user rating of only 2.1/10.<br><br>"
        + "Notably, the old movies that have many reviews tend to be only classics like <i>It's a Wonderful Life</i> (1946) and <i>A Clockwork Orange</i> (1971), whereas movies from the past couple decades like <i>Fifty Shades of Grey</i> (2015) can receive more than 300,000 ratings despite abysmal scores.<br><br>"
        + "Sadly, it would seem that we've reached a dead end; IMDb has such a recency bias in terms of number of ratings that it makes it nearly impossible to draw meaningful comparisons across the years.<br><br>"
        + "What if we try looking at runtime instead of ratings?";

    newText.style.opacity = 0;
    contButton.style.opacity = 0;
    newText.style.transition = "1s all";
    contButton.style.transition = "1s all";
    expBox.childNodes.forEach(e => { try { e.style.transition = "0s all" ; e.style.opacity = .5 } catch {} });

    expBox.appendChild(newText);
    contButton.onclick = () => { window.location.href = "runtimes.html" };
    expBox.appendChild(contButton);
    expBox.scrollTo(0, expBox.scrollHeight);

    setTimeout(function() {
        newText.style.opacity = 1;
        contButton.style.opacity = 1;
    }, 10);

    svg.select(".annotations")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    var join = svg.selectAll("g:nth-child(3) circle")
        .data(data)
    
    join.exit()
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    join.transition()
        .duration(2000)
        .delay(1000)
        .attr("r", d => rad3(d.numVotes))

    const annotations = [
          {
            note: {
              title: "Fifty Shades of Grey (2015)",
              label: "Average Rating: 4.2\tNumber of Ratings: 327,754\tRuntime: 125 minutes",
              align: "middle",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(2015),
            y: y(4.2),
            dy: 150,
            dx: -120,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          },
          {
            note: {
              title: "A Clockwork Orange (1971)",
              label: "Average Rating: 8.3\tNumber of Ratings: 853,828\tRuntime: 136 minutes",
              align: "middle",  // try right or left
              wrap: 250,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1971),
            y: y(8.3),
            dy: 150,
            dx: -80,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 10, radiusPadding: 0 },
          }
        ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations)
        .style("opacity", 0)
        .transition()
        .delay(2000)
        .duration(1000)
        .style("opacity", 1);
}


