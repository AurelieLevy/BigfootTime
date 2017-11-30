let svg = d3.select("#bfuMap");
let projection = d3.geoAlbersUsa();
projection.scale(1270, 1270);
projection.translate([480, 300]);

let path = d3.geoPath();
let dateFormatting = d3.timeFormat("%B %d, %Y");

// The file loaded here is already projected with a d3.GeoAlbersUSA Projection
d3.json("data/us.json", function (error, us) {

    svg.append("path")
        .attr("stroke", "#303635")
        .attr("stroke-width", 0.5)
        .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

    svg.append("path")
        .attr("stroke", "#AAA")
        .attr("stroke-width", 0.5)
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));

    svg.append("path")
        .attr("stroke", "#AAA")
        .attr("d", path(topojson.feature(us, us.objects.nation)));

    // Linking to geojson
    d3.json("data/bfru.geojson", function (error, bf) {
        if (error) throw error;

        // Filtering null coordinates and projeting with the current projection

        bf.features = bf.features
            .filter((f) => Object.keys(f.geometry.coordinates).length !== 0);

        console.log(bf.features[0].geometry.coordinates);
        bf.features.forEach(element => {
            element.geometry.coordinates = projection(element.geometry.coordinates);
            // console.log(element.geometry.coordinates);
        });

        bf.features = bf.features
            .filter((f) => typeof (f.geometry.coordinates) != 'undefined' && f.geometry.coordinates != null);

        // Drawing circle
        svg.selectAll("circle")
            .data(bf.features).enter()
            .append("circle")
            .attr("cx", function (d) { return d.geometry.coordinates[0]; })
            .attr("cy", function (d) { return d.geometry.coordinates[1]; })
            .attr("r", "2px")
            .attr("stroke", "#AAA")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
    });
});

function handleMouseOver(d, i) {
    console.log(d);
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