  function generateBedroomStackedBar() {

      var width = 850;
      var height = 550;

      var svg = d3.select("#bedroom-stacked-bar-chart")
          .append("svg")
          .attr("viewBox", -60 + " -20 " + " " + width + " " + height);

      // Load external data
      Promise.all([d3.csv("data/profitable_transaction_bedroom_2019-2021.csv")]).then(data => {
          data[0].sort(function (a, b) {
              return b["Total"] - a["Total"];
          });

          // List of subgroups = header of the csv files
          var subgroups = data[0].columns.slice(2, 7);

          // List of groups = species here = value of the first column called group -> I show them on the X axis
          var groups = data[0].map(d => d["Property Name"])

          yearGroup = new Set(data[0].map(d => d["Year"]).reverse())
          //console.log(yearGroup)

          d3.select("#bedroom-year-select-button")
              .selectAll('myOptions')
              .data(yearGroup)
              .enter()
              .append('option')
              .text(function (d) {
                  return d;
              }) // text showed in the menu
              .attr("value", function (d) {
                  return d;
              }) // corresponding value returned by the button

          $('select').formSelect();

          //console.log(subgroups);
          //console.log(groups);

          var color_stacked_bedroom = d3.scaleOrdinal()
              .domain(subgroups)
              .range([d3.schemeSet3[2], d3.schemeSet3[3], d3.schemeSet3[4], d3.schemeSet3[5], d3.schemeSet3[6]]);

          svg
              .append("text")
              .attr("transform", "translate(" + ((width / 2) - 200) + "," + (height - 60) + ")")
              .text("New launch private condos in 2015 (OCR)")
              .attr("text-align", "middle");

          svg
              .append("text")
              .attr("transform", "translate(-40, " + ((height / 2) + 50) + ") rotate(-90)")
              .text("Number of Profitable Transactions")
              .attr("text-align", "middle");


          /* Initialize tooltip */
          var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {

              selectedKey = 0;
              value = d[1] - d[0];
              //console.log(value);
              for (var key in d.data) {
                  if (d.data[key] == value) {
                      selectedKey = key;
                  }
              }
              //console.log(selectedKey);

              return "<b>Name:</b> <span >" + d.data["Property Name"] +
                  "</span><br><b>Bedroom Size:</b> <span >" + selectedKey + "</span>" +
                  "</span><br><b>Transaction:</b> <span >" + value + "</span>" +
                  "</span><br><b>Total:</b> <span >" + d.data["Total"] + "</span>";
          });
          svg.call(tip);
          let mouseOver = function (d) {

              d3.selectAll(".bedroom-size")
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

              d3.selectAll(".bedroom-size")
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

          updateBedroomStackedBar("All");

          // A function that update the chart
          function updateBedroomStackedBar(selectedYear) {

              //console.log(selectedYear)
              // Create new data with the select
              //svg.selectAll(".text-value-bar").remove();
              svg.selectAll(".bedroom-size").remove();

              filteredData = data[0].filter(function (d) {
                  return d["Year"] == selectedYear
              })
              // Add X axis
              x = d3.scaleBand()
                  .domain(groups)
                  .range([0, width - 100])
                  .padding([0.3])


              // Add Y axis
              yDomain = [
                        d3.min(filteredData, d => Math.min(d["Total"])),
                        d3.max(filteredData, d => Math.ceil(Math.max(d["Total"]) / 10) * 10)
                    ];

              // Add Y axis
              y = d3.scaleLinear()
                  .domain(yDomain)
                  .range([height - 100, 0]);

              svg.append("g").attr("transform", `translate(0, ${height-100})`)
                  .call(d3.axisBottom(x).tickSizeOuter(5)).attr("class", function (d) {
                      return "bedroom-size"
                  });

              svg.append("g")
                  .call(d3.axisLeft(y)).attr("class", function (d) {
                      return "bedroom-size"
                  })

              var legend_x = width - 200
              var legend_y = 15

              svg.append("g")
                  .attr("class", "bedroom-size-legend")
                  .attr("transform", "translate(" + legend_x + "," + legend_y + ")");

              var legend = d3.legendColor()
                  .labels(subgroups)
                  .title("Bedroom Size")
                  .scale(color_stacked_bedroom)

              svg.select(".bedroom-size-legend")
                  .call(legend);

              stackedData = d3.stack()
                  .keys(subgroups)
                  (data[0].filter(function (d) {
                      return d["Year"] == selectedYear
                  }))

              // Show the bars
              var bars = svg.append("g")
                  .selectAll("g")
                  // Enter in the stack data = loop key per key = group per group
                  .data(stackedData)
                  .join("g")
                  .attr("fill", d => color_stacked_bedroom(d.key))
                  .selectAll("rect")
                  // enter a second time = loop subgroup per subgroup to add all rectangles
                  .data(d => d)
                  .join("rect")
                  .attr("y", function (d) {
                      return y(0);
                  })
                  .attr("x", function (d) {
                      return x(d.data["Property Name"]);
                  })
                  .attr("width", x.bandwidth())
                  .attr("class", function (d) {
                      return "bedroom-size"
                  })

              bars
                  .transition()
                  .duration(1000)
                  .attr("x", d => x(d.data["Property Name"]))
                  .attr("y", d => y(d[1]))
                  .attr("height", d => y(d[0]) - y(d[1]))


              bars.on("mouseover", function (event, d) {
                      tip.show(event, d);
                      mouseOver.call(this);
                  })
                  .on("mouseleave", function (event, d) {

                      mouseLeave.call(this);
                      tip.hide(event, d)
                  })

          }

          // When the button is changed, run the updateChart function
          d3.select("#bedroom-year-select-button").on("change", function (event, d) {
              // recover the option that has been chosen
              const selectedOption = d3.select(this).property("value")
              // run the updateChart function with this selected option
              updateBedroomStackedBar(selectedOption);
          })


      })
  }
