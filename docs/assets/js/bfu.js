let bfuMap = d3.select("#bfuMap");
let bfuBar = d3.select("#bfuBar");
let religiousMap = d3.select("#religiousMap");
let toolTip = d3.selectAll(".toolTip");
let projection = d3.geoAlbersUsa();
let statelyValues; // BF Values grouped by state

// Projection of bfu map
projection.scale(1270, 1270);
projection.translate([480, 300]);

let path = d3.geoPath();
let dateFormatting = d3.timeFormat("%B %d, %Y");

let barClicked = null;


d3.json("data/us.json", function (error, us) {

    // BFU map ---

    bfuMap.selectAll(".state")
        .data(us.features)
        .enter().append("path")
        .attr("stroke", "#777")
        .attr("stroke-width", 0.5)
        .attr("class", "state")
        .attr("d", d3.geoPath().projection(projection));


    // Linking to the bfru geojson
    d3.json("data/bfru.geojson", function (error, bf) {
        if (error) throw error;

        // Filtering null coordinates and projeting with the current projection

        bf.features = bf.features
            .filter((f) => Object.keys(f.geometry.coordinates).length !== 0);

        //console.log(bf.features[0].geometry.coordinates);
        bf.features.forEach(element => {
            // Projeting lat-long to x-y
            element.geometry.coordinates = projection(element.geometry.coordinates);
            // Creating date
            element.properties.date = new Date(element.properties.timestamp);
            // console.log(element.geometry.coordinates);
        });

        bf.features = bf.features
            .filter((f) => typeof (f.geometry.coordinates) != 'undefined' && f.geometry.coordinates != null);

        // Using crossFilter ------------------
        let cf = crossfilter(bf.features);

        let all = cf.groupAll();

        let yearlyDimension = cf.dimension(function (d) {
            return d.properties.date.getFullYear();
        });

        let yearlyGroup = yearlyDimension.group();
        let yearlyValues = yearlyGroup.all();

        // Crossfiltering the bfs by state
        let statelyDimension = cf.dimension(function (d) {
            return d.properties.state;
        })

        let statelyGroup = statelyDimension.group();
        let statelyValues = statelyGroup.all();

        function refreshBFUMap() {
            // Creating bar chart -----
            let margin = 50,
                width = 960 - margin,
                height = 300 - margin

            let xScale = d3.scaleBand().range([0, width]).padding(0.4),
                yScale = d3.scaleLinear().range([height, 0]);

            let gBar = bfuBar.append("g");

            // Filtering values to show
            yearlyDimension.filterAll();
            if (barClicked != null) {
                yearlyDimension.filter(barClicked.key);
            }
            let valuesFiltered = yearlyDimension.top(Infinity);

            xScale.domain(yearlyValues.map(function (d) { return d.key; }));
            yScale.domain([0, d3.max(yearlyValues, function (d) { return d.value; })]);

            // Firtsly, removing every bars on refresh()
            gBar.selectAll(".bar")
                .remove();
            // Adding the new bars 
            gBar.selectAll(".bar")
                .data(yearlyValues)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return xScale(d.key); })
                .attr("y", function (d) { return yScale(d.value); })
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return height - yScale(d.value); })
                .attr("fill", function (d) {
                    if (barClicked != null) {
                        return d.key == barClicked.key ? "blue" : "#777";
                    }
                    return "#777";
                })
                .on("click", handleBarClick)
                .on("mousemove", function (bar, i) {
                    showTooltip(bar.value);
                })
                .on("mouseout", hideTooltip);

            gBar.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
            ;


            // Drawing circle -----------------
            bfuMap.selectAll("circle")
                .remove();
            bfuMap.selectAll("circle")
                .data(valuesFiltered).enter()
                .append("circle")
                .attr("cx", function (d) { return d.geometry.coordinates[0]; })
                .attr("cy", function (d) { return d.geometry.coordinates[1]; })
                .attr("r", "2px")
                .attr("stroke", "#AAA")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        }

        // ------------- Loading the religious map
        d3.csv("data/religious.csv", function (error, rel) {
            if (error) throw error;

            // Making an "hashmap" by state
            let byState = {};
            rel.forEach(function (d) {
                byState[d.STNAME] = d;
            });


            // RELIGIOUS MAP
            let ramp = d3.scaleLinear().domain([270, 800]).range(["#d5d8dc", "#566573"]);
            religiousMap.selectAll(".state")
                .data(us.features)
                .enter().append("path")
                .attr("stroke", "#777")
                .attr("stroke-width", 0.5)
                .attr("class", "state")
                .attr("fill", function (s) {
                    // Getting the value and chosing apropriated color
                    // The value is from 0 to 1000
                    let value = byState[s.properties.NAME];
                    return ramp(value.TOTRATE);
                })
                .attr("d", d3.geoPath().projection(projection));

            // ------------- Loading bars
            // Finding the center of each state
            let stateCenters = {};
            religiousMap.selectAll(".state")
                .each(function (s) {
                    let stateName = s.properties.NAME;

                    // Storing the center
                    stateCenters[stateName] = projection(path.centroid(s));
                });

            // Adding bars
            // Loading the population of each state to have relative number of BF seen
            d3.csv("data/population.csv", function (error, pop) {
                if (error) throw error;

                // Making a "Hashmap"
                let popMap = {};
                pop.forEach(function (p) {
                    popMap[p.STNAME] = p;
                });

                // console.log(popMap);

                // Adding relative number of BF seen by state
                // Relative: bf seen per milion of inhabitant
                let unitHeight = 2;
                statelyValues.forEach(function (s) {
                    s.relativeBFSeen = s.value / popMap[s.key].TOTPOP;
                    s.relativeSize = s.relativeBFSeen * unitHeight;
                    s.religiousRate = byState[s.key].TOTRATE;
                });

                // console.log(stateCenters);
                // console.log(statelyValues);
                religiousMap.selectAll(".bar")
                    .data(statelyValues)
                    .enter().append("rect")
                    .attr("x", s => stateCenters[s.key][0])
                    .attr("y", s => stateCenters[s.key][1] - s.relativeSize)
                    .attr("height", (s) => s.relativeSize)
                    .attr("width", 10)
                    .attr("fill", "#777")
                    .attr("fill-opacity", 0.7)
                    .attr("class", "bar")
                    .on("mousemove", function (s, i) {
                        showTooltip("# of Bigfoot seen: " + s.value + "<br/>" +
                                    "# of BF seen for 1 million inhabitant: " + s.relativeBFSeen + "<br/>" +
                                    "Religious rate for 1 million inhabitant: " + s.religiousRate);
                    })
                    .on("mouseout", function (s, i){
                        hideTooltip();
                    });
            });

        });

        function handleBarClick(b, i) {
            // We firstly have to unfilter everything
            bfuBar.selectAll(".bar")
                .attr("fill", "#777");

            if (barClicked == b) { // Have to unfilter
                barClicked = null;
            } else { // Filter
                barClicked = b;
            }

            refreshBFUMap();
        }

        refreshBFUMap();
    });


});

function handleMouseOver(d, i) {
    //console.log(d);
    // Use D3 to select element, change color and size
    d3.select(this)
        .attr("fill", "#AAA")
        .attr("r", "10px");

    // Setting the current information
    d3.select("#informationPlace")
        .text(dateFormatting(new Date(d.properties.timestamp)) + " - " + d.properties.state + ", " + d.properties.county);
    d3.select("#informationProperties")
        .text(d.properties.observed);
}

function handleMouseOut(d, i) {
    d3.select(this)
        .attr("fill", null)
        .attr("r", "3px");
}

function showTooltip(str) {
    toolTip
        .style("left", d3.event.pageX - 15 + "px")
        .style("top", d3.event.pageY - 80 + "px")
        .style("display", "inline-block")
        .html(str);
}
function hideTooltip(){
    toolTip.style("display", "none");
}