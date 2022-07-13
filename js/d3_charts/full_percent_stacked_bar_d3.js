   function generatePercentStackedBar() {

       var width = 950;
       var height = 500;

       var svg = d3.select("#percent-stacked-bar-chart")
           .append("svg")
           .attr("viewBox", -60 + " -50 " + " " + width + " " + height);

       // Load external data
       Promise.all([d3.csv("data/ocr_private_condo.csv")]).then(data => {
           data[0].sort(function (a, b) {
               return b["Percent Sold 2015"] - a["Percent Sold 2015"];
           });
           //console.log(data[0]);
           // List of subgroups = header of the csv files = soil condition here
           const subgroups = ["Total Units Sold 2015", "Total Units Unsold in 2015"]

           // List of groups = species here = value of the first column called group -> I show them on the X axis
           const groups = data[0].map(d => d["Project"])

           //console.log(subgroups);
           //console.log(groups);

           // Add X axis
           const x = d3.scaleBand()
               .domain(groups)
               .range([0, width - 200])
               .padding([0.4])

           // Add Y axis
           const y = d3.scaleLinear()
               .domain([0, 100])
               .range([height - 100, 0]);

           svg.append("g").attr("transform", `translate(0, ${height-100})`)
               .call(d3.axisBottom(x).tickSizeOuter(0));

           svg.append("g")
               .call(d3.axisLeft(y))

           svg
               .append("text")
               .attr("transform", "translate(" + ((width / 2) - 260) + "," + (height - 55) + ")")
               .text("New launch private condos in 2015 (OCR)")
               .attr("text-align", "middle");

           svg
               .append("text")
               .attr("transform", "translate(-40, " + ((height / 2) - 15) + ") rotate(-90)")
               .text("Percentage")
               .attr("text-align", "middle");

           var color_stacked_percent = d3.scaleOrdinal()
               .domain(subgroups)
               .range([d3.schemeTableau10[4], d3.schemeTableau10[9]]);

           var legend_x = width - 200
           var legend_y = 15

           svg.append("g")
               .attr("class", "legend")
               .attr("transform", "translate(" + legend_x + "," + legend_y + ")");

           var legend = d3.legendColor()
               .labels(["Sold 2015", "Unsold in 2015"])
               .title("Legend")
               .scale(color_stacked_percent)

           svg.select(".legend")
               .call(legend);

           /* Initialize tooltip */
           var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {

               var totalUnits = d.data["Total Units"]
               var sold2015 = Math.round(d.data["Total Units Sold 2015"] / 100 * totalUnits);
               var unsold2015 = Math.round(d.data["Total Units Unsold in 2015"] / 100 * totalUnits);
               result = d.data;

               if (d[0] === 0) {
                   return "<b>Name:</b> <span >" + result["Project"] +
                       "</span><br><b>Total No. of Units:</b> <span >" + result["Total Units"] + "</span>" +
                       "</span><br><b>Units Sold in 2015:</b> <span >" + sold2015 + "</span>" +
                       "<br><b>Percent Sold in 2015:</b> <span >" + parseFloat(result["Total Units Sold 2015"]).toFixed(2) + "%</span>";
               } else {
                   return "<b>Name:</b> <span >" + result["Project"] +
                       "</span><br><b>Total No. of Units:</b> <span >" + result["Total Units"] + "</span>" +
                       "</span><br><b>Units Unsold in 2015:</b> <span >" + unsold2015 + "</span>" +
                       "<br><b>Percent Unsold in 2015:</b> <span >" + parseFloat(result["Total Units Unsold in 2015"]).toFixed(2) + "%</span>";
               }

           });
           svg.call(tip);


           // Normalize the data -> sum of each group must be 100!

           dataNormalized = []
           data[0].forEach(function (d) {
               // Compute the total
               tot = 0
               for (i in subgroups) {
                   name = subgroups[i];
                   tot += +d[name]
               }
               // Now normalize
               for (i in subgroups) {
                   name = subgroups[i];
                   d[name] = d[name] / tot * 100
               }
           })

           //stack the data? --> stack per subgroup
           const stackedData = d3.stack()
               .keys(subgroups)
               (data[0])

           // Show the bars
           svg.append("g")
               .selectAll("g")
               // Enter in the stack data = loop key per key = group per group
               .data(stackedData)
               .join("g")
               .attr("fill", d => color_stacked_percent(d.key))
               .selectAll("rect")
               // enter a second time = loop subgroup per subgroup to add all rectangles
               .data(d => d)
               .join("rect")
               .attr("x", d => x(d.data.Project))
               .attr("y", d => y(d[1]))
               .attr("height", d => y(d[0]) - y(d[1]))
               .attr("width", x.bandwidth())
               .attr("class", function (d) {
                   return "condo"
               })
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
                   .style("stroke", "black")
                   .style("font-weight", 500)
                   .attr("stroke-width", 2);
           }

           let mouseLeave = function (d) {

               d3.selectAll(".condo")
                   .transition()
                   .duration(200)
                   .style("opacity", 1.0)
                   .attr("stroke-width", 1.0);

               d3.select(this)
                   .transition()
                   .duration(200)
                   .style("stroke", "none")
                   .style("opacity", 1.0)
           }


       })
   }
