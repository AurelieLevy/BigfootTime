let bfuMap = d3.select("#bfuMap");
let bfuBar = d3.select("#bfuBar");
let projection = d3.geoAlbersUsa();
projection.scale(1270, 1270);
projection.translate([480, 300]);

let path = d3.geoPath();
let dateFormatting = d3.timeFormat("%B %d, %Y");

let barClicked = null;


// The file loaded here is already projected with a d3.GeoAlbersUSA Projection
d3.json("data/us.json", function (error, us) {

    bfuMap.append("path")
        .attr("stroke", "#303635")
        .attr("stroke-width", 0.5)
        .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

    bfuMap.append("path")
        .attr("stroke", "#AAA")
        .attr("stroke-width", 0.5)
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));

    bfuMap.append("path")
        .attr("stroke", "#AAA")
        .attr("d", path(topojson.feature(us, us.objects.nation)));

    // Linking to geojson
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

        function refresh() {
            // Creating bar chart -----
            let margin = 0,
                width = bfuBar.node().getBoundingClientRect().width - margin,
                height = bfuBar.node().getBoundingClientRect().height - margin

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

            gBar.selectAll(".bar")
                .remove();
            gBar.selectAll(".bar")
                .data(yearlyValues)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return xScale(d.key); })
                .attr("y", function (d) { return yScale(d.value); })
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) { return height - yScale(d.value); })
                .attr("fill", function (d) {
                    if(barClicked != null){
                        return d.key == barClicked.key ? "blue" : "#777";
                    }
                    return "#777";
                })
                .on("click", handleBarClick);


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

        function handleBarClick(b, i) {
            // We firstly have to unfilter everything
            bfuBar.selectAll(".bar")
                .attr("fill", "#777");

            if (barClicked == b) { // Have to unfilter
                barClicked = null;

                refresh();
                d3.select(this)
                    .attr("fill", "#777");
            } else { // Filter
                barClicked = b;

                refresh();
                d3.select(this)
                    .attr("fill", "blue");
            }

        }

        refresh();
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

