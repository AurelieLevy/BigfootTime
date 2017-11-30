var svg = d3.select("#bfuMap");
var projection = d3.geoAlbersUsa();
projection.scale(1270,1270);
projection.translate([480, 300]);
console.log(projection.center);

var path = d3.geoPath();

// The file loaded here is already projected with a d3.GeoAlbersUSA Projection
d3.json("https://unpkg.com/us-atlas@1/us/10m.json", function (error, us) {

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


        svg.selectAll("circle")
            .data(bf.features).enter()
            .append("circle")
            .attr("cx", function (d) { return d.geometry.coordinates[0]; })
            .attr("cy", function (d) { return d.geometry.coordinates[1]; })
            .attr("r", "1px")
            .attr("stroke", "#AAA");

    })
});
