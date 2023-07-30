
window.addEventListener('load', function () {
  showGraph();
})

var ALL_DATA = 0;

var graphW = screen.width * 1200 / 1920;
var graphH = screen.height * 700 / 1080;
var m = {t: 20, b: 50, l: 80, r: 20};

var svg = 0;

// Runtime ranged from 18 to 776 mins for 1K votes,
//  45 to 566 mins for 5K votes,
//  45 to 467 mins for 10K votes

var x = d3.scaleLinear()
    .domain([1910, 2024])
    .range([0, graphW])

var y = d3.scaleLog()
    .domain([40, 600])
    .range([graphH, 0])
    
// Max votes was 2773389
var rad = d3.scaleLog()
    .domain([5000, 3000000])
    .range([1, 8]);

PHASE2_MIN_VOTES = 60000
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
        .call(d3.axisLeft(y).tickValues([60,80,100,120,150,180,240,300,360,420,480,540,600]))
        .append("text")
        .attr("fill", "black") // set the fill here
        .attr("transform", "rotate(-90) translate(" + -(graphH / 2 - 100) + ", -45)")
        .attr("font-size", "2em")
        .text("Runtime (minutes)");

    d3.selectAll(".tick > text").style("font-size", function(d) { return "1.5em"; });

    d3.tsv("https://gerst-416-dataviz.github.io/mergedData.tsv").then(data => {
        // Sort with most votes first
        data = data.toSorted((a, b) => b.numVotes - a.numVotes);
        data = data.filter(d => parseInt(d.numVotes) >= 5000);
        ALL_DATA = data;

        console.log(data.length);
        
        const annotations = [
          {
            note: {
              title: "Shoah (1985)",
              label: "Average Rating: 8.7\tNumber of Ratings: 9,972\tRuntime: 566 minutes",
              align: "right",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1985),
            y: y(566),
            dy: 80,
            dx: -120,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          },
          {
            note: {
              title: "Sherlock Jr. (1924)",
              label: "Average Rating: 8.2\tNumber of Ratings: 53,294\tRuntime: 45 minutes",
              align: "left",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1924),
            y: y(45),
            dy: -450,
            dx: 60,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 8, radiusPadding: 0 },
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
            .attr("cy", d => y(d.runtimeMinutes))
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
    newText.innerHTML = "We can use the same filtering technique as before. Using our experience from the last chart, we choose to set the threshold to a minimum of " + PHASE2_MIN_VOTES.toLocaleString()
        + " user ratings, leaving us with " + data.length.toLocaleString() + " movies, and we rescale the circles to fit.<br><br>"
        + "Finally, we have something promising. There is a decent density of movies, both old and new, and we can see that for every year shown, the vast majority of movies tend to fit into a very narrow range of runtimes.<br><br>"
        + "We have a few outliers, like <i>5 Centimeters Per Second</i> (2007) and <i>Gangs of Wasseypur</i> (2012) at 63 and 321 minutes, respectively, but nearly every other movie shown falls somewhere between 80 and 180 minutes. "
        + "Within this range, the spread is fairly uniform over time, appearing neither to increase or decrease as the years progress.";

    newText.style.opacity = 0;
    contButton.style.opacity = 0;
    newText.style.transition = "1s all";
    contButton.style.transition = "1s all";

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
              title: "5 Centimeters Per Second (2007)",
              label: "Average Rating: 7.5\tNumber of Ratings: 61,244\tRuntime: 63 minutes",
              align: "right",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(2007),
            y: y(63),
            dy: 20,
            dx: -120,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
          },
          {
            note: {
              title: "Gangs of Wasseypur (2012)",
              label: "Average Rating: 8.2\tNumber of Ratings: 99,991\tRuntime: 321 minutes",
              align: "right",  // try right or left
              wrap: 250,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(2012),
            y: y(321),
            dy: -50,
            dx: -120,
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

    lines = svg.append("g")
    lines.append("line")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .attr("y1", y(180))
        .attr("y2", y(180))
        .style("stroke", "black")
        .style("stroke-dasharray", "0 25 0")
    lines.append("line")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .attr("y1", y(80))
        .attr("y2", y(80))
        .style("stroke", "black")
        .style("stroke-dasharray", "0 25 0")
    lines.style("opacity", 0)
        .transition()
        .delay(2000)
        .duration(1000)
        .style("opacity", .5);
}

function graphPhase3() {
    // Remove continue button
    var contButton = document.querySelector(".continueButton");
    var expBox = document.getElementById("explainBox1");
    expBox.removeChild(contButton);

    data = ALL_DATA.filter(d => parseInt(d.numVotes) >= PHASE3_MIN_VOTES);

    console.log(data.length);

    var newText = document.createElement("span");
    newText.innerHTML = "Let's check once again with a minimum threshold of " + PHASE3_MIN_VOTES.toLocaleString()
        + " ratings.<br><br>"
        + "When we filter the data like this, the observation we made before appears to hold!<br><br>"
        + "Once again, the movies in each decade are spread across the range of about 80 to 180 minutes, with only a select few falling outside of those bounds."
        + "In fact, we tend to have even fewer outliers as the minimum vote threshold increases, suggesting that movies in this range are more popular (among IMDb users, at least).<br><br>"
        + "Perhaps we could not reach a conclusion on whether movie quality (as measured by user ratings) has changed over time, but when it comes to runtime, we can say confidently that "
        + "runtimes of popular movies have not had any noticeable upward or downward trends over the decades!<br><br>"
        + "Let's move on to some more free-form exploration...";

    newText.style.opacity = 0;
    contButton.style.opacity = 0;
    newText.style.transition = "1s all";
    contButton.style.transition = "1s all";

    expBox.appendChild(newText);
    contButton.onclick = () => { window.location.href = "explore.html" };
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
              title: "Zack Snyder's Justice League (2021)",
              label: "Average Rating: 7.9\tNumber of Ratings: 419,340\tRuntime: 242 minutes",
              align: "right",  // try right or left
              wrap: 200,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(2021),
            y: y(242),
            dy: -80,
            dx: -120,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 8, radiusPadding: 0 },
          },
          {
            note: {
              title: "Cinderella (1950)",
              label: "Average Rating: 7.3\tNumber of Ratings: 167,896\tRuntime: 74 minutes",
              align: "right",  // try right or left
              wrap: 250,  // try something smaller to see text split in several lines
              padding: 10,   // More = text lower
              wrapSplitter: "\t"
            },
            color: ["navy"],
            x: x(1950),
            y: y(74),
            dy: 50,
            dx: -80,
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            subject: { radius: 5, radiusPadding: 0 },
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


