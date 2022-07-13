function generateChoroplethMap() {
    // start for choropleth map
    let svg = d3.select("#choropleth-map")
        .append("svg")
        .attr("viewBox", "0 0 930 500")

    // Load external data
    Promise.all([d3.json("data/district.json"), d3.csv("data/market_segment.csv")]).then(data => {
        //console.log(data[0].features);

        var domain = ["CCR", "RCR", "OCR"];
        var labels = ["CCR", "RCR", "OCR"];
        var colorScale = d3.scaleOrdinal()
            .domain(domain)
            .range(["#fdaaaa", "#FAC898", "#D2E3F7"]);

        /* Initialize tooltip */
        var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {
            result = data[1].find(s => s["District"] == d.properties.id && s["Name"] == d.properties.name);
            //console.log(result);
            return "<b>Name:</b> <span >" + result.Name +
                "</span><br><b>District:</b> <span >" + result.District + "</span>" +
                "<br><b>Market Segment:</b> <span >" + result.MarketSegment + "</span>";
        });
        svg.call(tip);

        // Map and projection
        var projection = d3.geoMercator()
            .center([103.851959, 1.290270])
            .fitExtent([
                        [100, 20],
                        [980, 480]
                    ], data[0]);


        let geopath = d3.geoPath().projection(projection);

        let mouseOver = function (d) {

            d3.selectAll(".district")
                .transition()
                .duration(200)
                .style("opacity", .5)
                .attr("stroke-width", 1.0);


            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
                .style("font-weight", 500)
                .attr("stroke-width", 2);
        }

        let mouseLeave = function (d) {

            d3.selectAll(".district")
                .transition()
                .duration(200).style("stroke", "gray")
                .style("opacity", 1.0)
                .attr("stroke-width", 1.0);

            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "gray")
                .style("opacity", 1.0)
                .attr("stroke-width", 1.0);
        }

        const zoom = d3.zoom()
            .on('zoom', (event) => {
                map.attr('transform', event.transform);
                maptext.attr('transform', event.transform);
            })
            .scaleExtent([1, 40]);



        let map = svg.call(zoom).append("g")
            .attr("id", "districts")
            .selectAll("path")
            .data(data[0].features)
            .enter()
            .append("path")
            .attr("d", geopath)
            // set the color of each area
            .attr("fill", function (d) {
                result = data[1].find(s => s["District"] == d.properties.id && s["Name"] == d.properties.name);
                //console.log(result.MarketSegment);
                return colorScale(result.MarketSegment);

            })
            .style("stroke", "gray")
            .style("opacity", 1.0)
            .attr("stroke-width", 1.0)
            .attr("class", function (d) {
                return "district"
            })
            .on("mouseover", function (event, d) {
                tip.show(event, d);
                mouseOver.call(this);
            })
            .on("mouseleave", function (event, d) {

                mouseLeave.call(this);
                tip.hide(event, d)
            })

        let maptext = svg.call(zoom).append("g")
            .selectAll("text")
            .data(data[0].features)
            .enter()
            .append("text")
            .attr("fill", "black")
            .attr("class", "place-label")
            .attr("text-anchor", "middle")
            .attr("x", function (d) {
                return projection([d.properties.longitude, d.properties.latitude])[0]
            })
            .attr("y", function (d) {
                return projection([d.properties.longitude, d.properties.latitude])[1] + 3
            })
            .style("font-size", "8px")
            .text(function (d) {
                return d.properties.id;
            })


        var legend_x = 0
        var legend_y = 15

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + legend_x + "," + legend_y + ")");

        var legend = d3.legendColor()
            .labels(labels)
            .title("Market Segments")
            .scale(colorScale)

        svg.select(".legend")
            .call(legend);

        let button = d3.select('#choropleth-map-zoom')
        button.on('click', function () {
            svg.transition().duration(750)
                .call(zoom.transform, d3.zoomIdentity)
        })

    })
    // end for choropleth map
}
