  function generateProfitLineChart() {

      var width = 1000;
      var height = 530;

      var svg = d3.select("#profit-bedroom-line-chart")
          .append("svg")
          .attr("viewBox", -60 + " -10 " + " " + width + " " + height);

      // Load external data
      Promise.all([d3.csv("data/profits_2019_to_2021.csv")]).then(data => {

          var allGroups = new Set(data[0].map(d => d["Property Name"]));

          yearGroup = new Set(data[0].map(d => d["Year"]).sort());
          bedroomGroup = Array.from(new Set(data[0].map(d => d["Bedroom"]).sort()));
          bedroomGroup.unshift("All");
          //console.log(bedroomGroup)

          d3.select("#profit-bedroom-select-button")
              .selectAll('myOptions')
              .data(bedroomGroup)
              .enter()
              .append('option')
              .text(function (d) {
                  return d;
              }) // text showed in the menu
              .attr("value", function (d) {
                  return d;
              }) // corresponding value returned by the button

          $('select').formSelect();

          var color_line_chart_profit =
              d3.scaleOrdinal()
              .domain(allGroups)
              .range([d3.schemeTableau10[1], d3.schemeTableau10[0], d3.schemeTableau10[4]]);


          svg
              .append("text")
              .attr("transform", "translate(" + ((width / 2) - 90) + "," + (height - 60) + ")")
              .text("Year of Sale")
              .attr("text-align", "middle");

          svg
              .append("text")
              .attr("transform", "translate(-40, " + ((height / 2) + 80) + ") rotate(-90)")
              .text("Avg Profit Price Per Square Foot (PSF)")
              .attr("text-align", "middle");


          /* Initialize tooltip */
          var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {

              return "<b>Year of Sale:</b> <span >" + d["Year"] +
                  "</span><br><b>Property:</b> <span >" + d["Property Name"] + "</span>" +
                  "</span><br><b>Bedroom Size:</b> <span >" + d["Bedroom"] + "</span>" +
                  "</span><br><b>Avg Profit:</b> <span >" + d["Profit"] + "</span>";
          });
          svg.call(tip);
          let mouseOver = function (d) {

              d3.selectAll(".profit_condo_circle")
                  .transition()
                  .duration(200)
                  .attr("r", 3)
                  .style("opacity", .5)

              d3.selectAll(".profit_condo_triangle")
                  .transition()
                  .duration(200)
                  .attr("d", d3.symbol().type(d3.symbolTriangle).size(20))
                  .style("opacity", .5)

              d3.selectAll(".profit_condo_line")
                  .transition()
                  .duration(200)
                  .style("opacity", .5)


              d3.select(this)
                  .transition()
                  .duration(200)
                  .style("opacity", 1)
                  .style("stroke", "black")
                  .attr("r", 15)
                  .attr("d", d3.symbol().type(d3.symbolTriangle).size(600))
                  .style("font-weight", 500)
                  .attr("stroke-width", 2)
                  .style("cursor", "pointer");
          }

          let mouseLeave = function (d) {

              d3.selectAll(".profit_condo_circle")
                  .transition()
                  .duration(200)
                  .attr("r", 3)
                  .style("opacity", 1.0)
                  .attr("stroke-width", 1.0);

              d3.selectAll(".profit_condo_triangle")
                  .transition()
                  .duration(200)
                  .attr("d", d3.symbol().type(d3.symbolTriangle).size(20))
                  .style("opacity", 1.0)
                  .attr("stroke-width", 1.0);

              d3.selectAll(".profit_condo_line")
                  .transition()
                  .duration(200)
                  .style("opacity", 1.0)
                  .attr("stroke-width", 1.0);

              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("r", 3)
                  .attr("d", d3.symbol().type(d3.symbolTriangle).size(20))
                  .style("stroke", "none")
                  .style("opacity", 1.0)
                  .style("cursor", "default");
          }

          update_selected_br_profit("All");

          // A function that update the chart
          function update_selected_br_profit(selectedBedroomSize) {

              //console.log(selectedBedroomSize)
              // Create new data with the select
              d3.selectAll('.profit_condo').remove();
              d3.selectAll(".profit_condo_legend").remove();
              d3.selectAll(".profit_condo_circle").remove();
              d3.selectAll(".profit_condo_triangle").remove();
              d3.selectAll(".legend_shape").remove();
              d3.selectAll(".profit_condo_line").remove();

              if (selectedBedroomSize == "All") {
                  filteredData = data[0].filter(function (d) {
                      return d["Bedroom"] == 1;
                  })
                  generateLegend(allGroups, color_line_chart_profit);
                  generateData(filteredData, "", "");

                  filteredData2 = data[0].filter(function (d) {
                      return d["Bedroom"] == 2;
                  })
                  generateData(filteredData2, "All", "");


              } else {
                  filteredData = data[0].filter(function (d) {
                      return d["Bedroom"] == selectedBedroomSize;
                  })

                  generateLegend(allGroups, color_line_chart_profit);
                  generateData(filteredData, "Individual", selectedBedroomSize);
              }

          }

          function generateLegend(typeOfGroups, colorSelection) {
              var legend_x = width - 200
              var legend_y = 15

              svg.append("g")
                  .attr("class", "profit_condo_legend")
                  .attr("transform", "translate(" + legend_x + "," + legend_y + ")");

              var legend = d3.legendColor()
                  .labels(typeOfGroups)
                  .title("Legend")
                  .scale(colorSelection)
                  .shape("line")
                  .shapePadding(15)

              svg.select(".profit_condo_legend")
                  .call(legend);
          }


          function generateData(filteredData, checkTag, bedroomSize) {

              var sumStat = d3.group(filteredData, d => d["Property Name"]);
              //console.log(yearGroup);
              var x, y;
              if (checkTag == "All") {


                  // Add X axis
                  x = d3.scaleBand()
                      .domain(yearGroup)
                      .range([0, width - 100])

                  // Add Y axis
                  y = d3.scaleLinear()
                      .domain([40, 310])
                      .range([height - 100, 0]);

                  // Add the triangle
                  var triangle = svg.selectAll(".profit_condo_triangle")
                      .data(filteredData)
                      .enter()
                      .append("path")
                      .attr("fill", function (d) {
                          //console.log(d["Property Name"]);
                          return color_line_chart_profit(d["Property Name"])
                      })
                      .attr("opacity", 0.8)
                      .attr("d", d3.symbol().type(d3.symbolTriangle).size(20))
                      .attr("transform", function (d) {
                          //console.log(x(d["Year"]));
                          //console.log(y(d["Profit"]));
                          return "translate(" + (x(d["Year"]) + 150) + "," + y(d["Profit"]) + ")";
                      })
                      .attr("class", function (d) {
                          return "profit_condo_triangle"
                      })
                      .on("mouseover", function (event, d) {
                          tip.show(event, d);
                          mouseOver.call(this);
                      })
                      .on("mouseleave", function (event, d) {
                          mouseLeave.call(this);
                          tip.hide(event, d)
                      })

                  svg.append("circle")
                      .attr("cx", width - 195)
                      .attr("cy", 100)
                      .attr("r", 4)
                      .style("fill", "#000000")
                      .attr("class", function (d) {
                          return "legend_shape"
                      })
                  svg.append("path")
                      .attr("d", d3.symbol().type(d3.symbolTriangle).size(50))
                      .attr("transform", function (d) {
                          return "translate(" + (width - 195) + "," + 120 + ")";
                      }).style("fill", "#000000")
                      .attr("class", function (d) {
                          return "legend_shape"
                      })
                  svg.append("text")
                      .attr("x", width - 185)
                      .attr("y", 100)
                      .text("Br 1")
                      .style("font-size", "10px")
                      .attr("alignment-baseline", "middle")
                      .attr("class", function (d) {
                          return "legend_shape"
                      })
                  svg.append("text")
                      .attr("x", width - 185)
                      .attr("y", 120)
                      .text("Br 2")
                      .style("font-size", "10px")
                      .attr("alignment-baseline", "middle")
                      .attr("class", function (d) {
                          return "legend_shape"
                      })


              } else if (checkTag == "Individual") {

                  // Add X axis --> it is a date format
                  x = d3.scaleBand()
                      .domain(yearGroup)
                      .range([0, width - 100])


                  // Add Y axis
                  yDomain = [
                            d3.min(filteredData, d => Math.min(d["Profit"]) - 20),
                            d3.max(filteredData, d => Math.ceil(Math.max(d["Profit"]) / 10) * 10)
                        ];

                  // Add Y axis
                  y = d3.scaleLinear()
                      .domain(yDomain)
                      .range([height - 100, 0]);

                  svg.append("g")
                      .attr("transform", `translate(0, ${height-100})`)
                      .call(d3.axisBottom(x)).attr("class", function (d) {
                          return "profit_condo"
                      })

                  svg.append("g")
                      .call(d3.axisLeft(y)).attr("class", function (d) {
                          return "profit_condo"
                      })

                  if (bedroomSize == "2") {
                      // Add the traungle
                      var triangle = svg.selectAll(".profit_condo_triangle")
                          .data(filteredData)
                          .enter()
                          .append("path")
                          .attr("fill", function (d) {
                              //console.log(d["Property Name"]);
                              return color_line_chart_profit(d["Property Name"])
                          })
                          .attr("opacity", 0.8)
                          .attr("d", d3.symbol().type(d3.symbolTriangle).size(20))
                          .attr("transform", function (d) {
                              //console.log(x(d["Year"]));
                              //console.log(y(d["Profit"]));
                              return "translate(" + (x(d["Year"]) + 150) + "," + y(d["Profit"]) + ")";
                          })
                          .attr("class", function (d) {
                              return "profit_condo_triangle"
                          })
                          .on("mouseover", function (event, d) {
                              tip.show(event, d);
                              mouseOver.call(this);
                          })
                          .on("mouseleave", function (event, d) {
                              mouseLeave.call(this);
                              tip.hide(event, d)
                          })
                  } else {
                      // Add the circle
                      var circles = svg.selectAll("myCircles")
                          .data(filteredData)
                          .join("circle")
                          .attr("fill", function (d) {
                              return color_line_chart_profit(d["Property Name"])
                          })
                          .attr("opacity", 0.8)
                          .attr("stroke", "none")
                          .attr("cx", function (d) {
                              return x(d["Year"]) + 150;
                          })
                          .attr("cy", function (d) {
                              return y(d["Profit"]);
                          })
                          .attr("class", function (d) {
                              return "profit_condo_circle"
                          })
                          .attr("r", 3).on("mouseover", function (event, d) {
                              tip.show(event, d);
                              mouseOver.call(this);
                          })
                          .on("mouseleave", function (event, d) {
                              mouseLeave.call(this);
                              tip.hide(event, d)
                          })
                  }




              } else {


                  x = d3.scaleBand()
                      .domain(yearGroup)
                      .range([0, width - 100])

                  // Add Y axis
                  y = d3.scaleLinear()
                      .domain([40, 310])
                      .range([height - 100, 0]);

                  svg.append("g")
                      .attr("transform", `translate(0, ${height-100})`)
                      .call(d3.axisBottom(x)).attr("class", function (d) {
                          return "profit_condo"
                      })

                  svg.append("g")
                      .call(d3.axisLeft(y)).attr("class", function (d) {
                          return "profit_condo"
                      })

                  // Add the circle
                  var circles = svg.selectAll("myCircles")
                      .data(filteredData)
                      .join("circle")
                      .attr("fill", function (d) {
                          return color_line_chart_profit(d["Property Name"])
                      })
                      .attr("opacity", 0.8)
                      .attr("stroke", "none")
                      .attr("cx", function (d) {
                          return x(d["Year"]) + 150;
                      })
                      .attr("cy", function (d) {
                          return y(d["Profit"]);
                      })
                      .attr("class", function (d) {
                          return "profit_condo_circle"
                      })
                      .attr("r", 3).on("mouseover", function (event, d) {
                          tip.show(event, d);
                          mouseOver.call(this);
                      })
                      .on("mouseleave", function (event, d) {
                          mouseLeave.call(this);
                          tip.hide(event, d)
                      })
              }

              // Show the lines
              var lines = svg.selectAll(".line")
                  .data(sumStat)
                  .join("path")
                  .attr("fill", "none")
                  .attr("stroke", function (d) {
                      return color_line_chart_profit(d[0])
                  })
                  .attr("stroke-width", 1)
                  .attr("d", function (d) {
                      return d3.line()
                          .x(function (d) {
                              return x(d["Year"]) + 150;
                          })
                          .y(function (d) {
                              return y(d["Profit"]);
                          })(d[1])
                  }).attr("class", function (d) {
                      return "profit_condo profit_condo_line"
                  })



          }

          // When the button is changed, run the updateChart function
          d3.select("#profit-bedroom-select-button").on("change", function (event, d) {
              // recover the option that has been chosen
              const selectedOption = d3.select(this).property("value")
              // run the updateChart function with this selected option
              update_selected_br_profit(selectedOption)
          })


      })
  }
