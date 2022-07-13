function generateTotalTransactionLine() {

    var width = 560;
    var height = 500;

    var svg = d3.select("#total-transactions-line-chart")
        .append("svg")
        .attr("viewBox", -60 + " -20 " + " " + width + " " + height);

    // Load external data
    Promise.all([d3.csv("data/profitable_transaction_2015.csv")]).then(data => {
        // Data preprocessing
        data[0].forEach(e => {
            e.year = d3.timeFormat("%Y")(d3.timeParse("%d/%m/%Y")(e["Date of Sale"]))
            e.date = d3.timeParse("%d/%m/%Y")(e["Date of Sale"]);
            e.value = 1;
        });

        var dataDict = [{
                "year": 2016,
                "total": 0
                    },
            {
                "year": 2017,
                "total": 0
                    },
            {
                "year": 2018,
                "total": 0
                    },
            {
                "year": 2019,
                "total": 0
                    },
            {
                "year": 2020,
                "total": 0
                    },
            {
                "year": 2021,
                "total": 0
                    }
                ];
        for (var i = 0; i < data[0].length; i++) {
            year = data[0][i].year;

            result = dataDict.find(s => s.year == year);
            result.total = result.total + 1
        }

        //console.log(dataDict);
        /* Initialize tooltip */
        var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {

            // Percent increase = [(new value - original value)/original value] * 100
            // Percent decrease = [(original value - new value)/original value] * 100
            tagAttribute = "</span><br><b>Change by:</b> NA</span>";
            if (d.year != dataDict[0].year) {
                prevYearTransaction = dataDict.find(t => t.year == (d.year - 1))
                if (prevYearTransaction.total != 0) {
                    difference =
                        parseFloat(((d.total - prevYearTransaction.total) / prevYearTransaction.total) * 100).toFixed(2);

                    if (difference > 0) {
                        tagAttribute =
                            "</span><br><b>Change by:</b><span style = 'color: green'> +" + difference + "%</span></span>"
                    } else if (difference < 0) {
                        tagAttribute = "</span><br><b>Change by:</b><span style = 'color: red'> " + difference + "%</span></span>"
                    } else {
                        tagAttribute = "</span><br><b>Change by:</b> " + difference + "%</span>"
                    }
                }

            }
            return "<b>Year:</b> <span>" + d.year +
                "</span><br><b>Transactions:</b> " + d.total + "</span>" +
                tagAttribute;


        });
        svg.call(tip);

        // Add X axis --> it is a date format
        const x = d3.scaleSequential()
            .domain(d3.extent(dataDict, function (d) {
                return d.year;
            }))
            .range([0, width - 130]);

        svg.append("g")
            .attr("transform", `translate(0, ${height-100})`)
            .call(d3.axisBottom(x).tickSizeOuter(0).ticks(5).tickFormat(d3.format("d")));

        var yDomain = [
                    d3.min(dataDict, d => Math.min(d.total)),
                    d3.max(dataDict, d => Math.max(d.total) + (220 - Math.max(d.total)))
                ];

        // Add Y axis
        const y = d3.scalePow()
            .exponent(0.8)
            .domain(yDomain)
            .range([height - 100, 0]);

        svg.append("g")
            .call(d3.axisLeft(y))

        svg
            .append("text")
            .attr("transform", "translate(" + ((width / 2) - 105) + "," + (height - 60) + ")")
            .text("Year of Sale")
            .attr("text-align", "middle");

        svg
            .append("text")
            .attr("transform", "translate(-40, " + ((height / 2) + 80) + ") rotate(-90)")
            .text("Total Number of Profitable Transaction(s)")
            .attr("text-align", "middle");

        // Add the line
        svg.append("path")
            .datum(dataDict)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("opacity", 1.0)
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.total))
            )



        // Add the circle
        var circles = svg.selectAll("myCircles")
            .data(dataDict)
            .join("circle")
            .attr("fill", "#026AA6")
            .attr("opacity", 0.8)
            .attr("stroke", "none")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.total))
            .attr("class", function (d) {
                return "condo"
            })
            .attr("r", 8)
            .on("mouseover", function (event, d) {
                tip.show(event, d);
                mouseOver.call(this);
            })
            .on("mouseleave", function (event, d) {

                mouseLeave.call(this);
                tip.hide(event, d)
            })


        let mouseOver = function (d) {

            d3.selectAll(".condo")
                .transition()
                .duration(200)
                .style("opacity", .5)

            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .attr("r", 20)
                .style("stroke", "black")
                .style("font-weight", 500)
                .attr("stroke-width", 2);
        }

        let mouseLeave = function (d) {


            d3.selectAll(".condo")
                .transition()
                .duration(200)
                .style("opacity", 0.8)
                .attr("stroke-width", 1.0);

            d3.select(this)
                .transition()
                .attr("r", 8)
                .duration(200)
                .style("stroke", "none")
                .style("opacity", 0.8)

            d3.select(".circleText")
                .transition()
                .duration(200)
                .style("fill", "black")
                .style("opacity", 1.0)

        }


    })

}
