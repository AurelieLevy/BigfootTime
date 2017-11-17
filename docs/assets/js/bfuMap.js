var svg = d3.select("#bfuMap");

var path = d3.geoPath();

d3.json("https://unpkg.com/us-atlas@1/us/10m.json", function (error, us) {
    if (error) throw error;

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
});
