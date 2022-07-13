 function generatePackedBubblesProperty() {
     var margin = {
             top: 20,
             right: 10,
             bottom: 40,
             left: 100
         },

         width = 520
     height = 630;

     let svg = d3.select("#packed-bubbles-condo")
         .append("svg")
         .attr("viewBox", "0 0 " + width + " " + height)

     // Load external data
     Promise.all([d3.csv("data/ocr_private_condo.csv")]).then(data => {
         //console.log(data[0]);

         var labels_bubbles = ["D19", "D20", "D27", "D28"]

         var color_bubbles = d3.scaleOrdinal()
             .domain(labels_bubbles)
             .range([d3.schemePaired[0], d3.schemePaired[2], d3.schemePaired[6], d3.schemePaired[8]]);

         // Size scale for countries
         var size_bubbles = d3.scaleLinear()
             .domain([2000, 45000])
             .range([50, 80]) // circle will be between 20 and 55 px wide

         var node = svg.append("g")
             .attr("id", "nodes")
             .selectAll("g")
             .data(data[0])
             .enter()
             .append("g")
             .attr("class", function (d) {
                 return "nodes";
             })
             .on("mouseover", function (event, d) {
                 //console.log(d);
                 var selectedNode = document.getElementById(d["Project"]);
                 d3.select('#packed-bubble-p')

                     .html(function () {
                         //console.log(d["Description"]);
                         return "<b>Project: </b>" + d["Project"] +
                             "<br><b>District: </b>" + d["District"] +
                             "<br><b>Landsize (sqm): </b>" + d["Landsize (sqm)"] +
                             "<br><b>Total Units: </b>" + d["Total Units"] +
                             "<br><b>Description: </b>" + d["Description"];
                     })

                 d3.selectAll(".nodes")
                     .transition()
                     .duration(200)
                     .style("opacity", .5)

                 d3.select(selectedNode)
                     .transition()
                     .duration(200)
                     .style("stroke", "black")
                     .attr("font-weight", "800")
                     .style("opacity", 1.0)

                 d3.select(this)
                     .transition()
                     .duration(200)
                     .style("stroke", "black")
                     .style("opacity", 1.0)
                     .attr("stroke-width", 3);


             })
             .on("mouseleave", function (event, d) {
                 var selectedNode = document.getElementById(d["Project"]);
                 d3.select('#packed-bubble-div')
                     .html(function (d) {
                         return "";
                     })

                 d3.selectAll(".nodes")
                     .transition()
                     .duration(200)
                     .style("stroke", "black")
                     .style("opacity", 1.0)
                     .attr("stroke-width", 0);


                 d3.select(selectedNode)
                     .transition()
                     .duration(200)
                     .style("stroke", "black")
                     .attr("font-size", "10px")
                     .attr("font-weight", "0")
                     .style("opacity", 1.0)

                 d3.select(this)
                     .transition()
                     .duration(200)
                     .style("stroke", "black")
                     .style("opacity", 1.0)
                     .attr("stroke-width", 0);

             });

         var circles = node.append("circle")
             .attr("r", d => size_bubbles(d["Landsize (sqm)"]))
             .style("fill", d => color_bubbles(d["District"]))


         // Create a drag handler and append it to the node object instead
         var drag_handler = d3.drag()
             .on("start", dragstarted)
             .on("drag", dragged)
             .on("end", dragended);

         drag_handler(node);

         var labels = node.append('text')
             .attr('text-anchor', 'middle')
             .attr('dominant-baseline', 'central')
             .attr('font-family', 'Roboto')
             .attr('font-size', '10px')
             .style("stroke", "black")
             .style("stroke-width", "0")
             .style("opacity", 1.0)
             .text(d => d["Project"])
             .attr("id", d => d["Project"])

         var simulation = d3.forceSimulation();

         simulation
             .nodes(data[0])
             .force("x", d3.forceX().strength(0.02).x(width - margin.right / 2))
             .force("y", d3.forceY().strength(0.02).y(height - margin.top / 2))
             .force("charge", d3.forceManyBody().strength(-200))
             .force("center", d3.forceCenter(width / 2, height / 2))
             .force("collide", d3.forceCollide().strength(0.5).radius(20))
             .on("tick", d => {
                 node
                     .attr("transform", function (d) {
                         return "translate(" + d.x + "," + d.y + ")";
                     })
             });

         function dragstarted(event, d) {
             if (!event.active) simulation.alphaTarget(0.3).restart();
             d.fx = d.x;
             d.fy = d.y;

             //console.log(d);
         }

         function dragged(event, d) {
             d.fx = event.x;
             d.fy = event.y;
         }

         function dragended(event, d) {
             if (!event.active) simulation.alphaTarget(0);
             d.fx = null;
             d.fy = null;
         }

         var legend_x = 0
         var legend_y = 15

         svg.append("g")
             .attr("class", "legend")
             .attr("transform", "translate(" + legend_x + "," + legend_y + ")")
             .attr('font-size', '14px');

         var legend = d3.legendColor()
             .labels(labels_bubbles)
             .title("Districts")
             .scale(color_bubbles)

         svg.select(".legend")
             .call(legend);



     })

 }
