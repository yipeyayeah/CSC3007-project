 function generateArcDiagramDistance() {
     var width = 700
     var height = 500;

     let svg = d3.select("#arc-diagram-distance")
         .append("svg")
         .attr("viewBox", "0 0 " + width + " " + height)

     // Load external data
     Promise.all([d3.json("data/property_distance_hawker.json")]).then(data => {
         //console.log(data[0]);

         var allGroups = data[0].nodes.map(d => d.name)
         allGroups = [...new Set(allGroups)]

         var color_arc_diagram = d3.scaleOrdinal()
             .domain(allGroups.filter((group, idx) => idx > 0))
             .range([d3.schemeTableau10[0], d3.schemeTableau10[1],
                        d3.schemeTableau10[4], d3.schemeTableau10[2], d3.schemeTableau10[5],
                        d3.schemeTableau10[7], d3.schemeTableau10[8]
                    ]);

         var legend_x = 0
         var legend_y = 35

         svg.append("g")
             .attr("class", "legend")
             .attr("transform", "translate(" + legend_x + "," + legend_y + ")")
             .attr("font-size", "10px");

         //console.log(allGroups.filter((group, idx) => idx > 0));
         var legend = d3.legendColor()
             .labels(allGroups.filter((group, idx) => idx > 0))
             .title("Private Condos")
             .scale(color_arc_diagram)

         svg.select(".legend")
             .call(legend);

         /* Initialize tooltip */
         var tip = d3.tip().attr('class', 'd3-tip').html(function (EVENT, d) {
             return "<b>Name:</b> <span >" + d.name +
                 "</span><br><b>District:</b> <span >" + d.grp + "</span>" +
                 "<br><b>Distance Away:</b> <span >" + d.distance + " m</span>";
         });
         svg.call(tip);

         // List of node names
         const allNodes = data[0].nodes.map(d => d.name)

         // A linear scale for node size
         const size = d3.scaleLinear()
             .domain([1, 6])
             .range([0.5, 8]);

         // A linear scale to position the nodes on the X axis
         const x = d3.scalePoint()
             .range([0, width])
             .domain(allNodes)

         // In my input data, links are provided between nodes -id-, NOT between node names.
         // So I have to do a link between this id and the name
         const idToNode = {};
         data[0].nodes.forEach(function (n) {
             idToNode[n.id] = n;
         });

         // Add the links
         const links = svg
             .selectAll('mylinks')
             .data(data[0].links)
             .join('path')
             .attr('d', d => {
                 start = x(idToNode[d.target].name) + 100 // X position of start node on the X axis
                 end = idToNode[d.source].distance * 0.4 + 100 // X position of end node
                 return ['M', start, height - 100, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                                'A', // This means we're gonna build an elliptical arc
                                (start - end) / 2, ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                                (start - end) / 2, 0, 0, ',',
                                start < end ? 1 : 0, end, ',', height - 100
                            ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                     .join(' ');
             })
             .style("fill", "none")
             .attr("stroke", "grey")
             .style("stroke-width", 0.7)


         // Add the circle for the nodes
         const nodes = svg
             .selectAll("mynodes")
             .data(data[0].nodes)
             .join("circle")
             .attr("cx", d => (d.distance * 0.4) + 100)
             .attr("cy", height - 100)
             .attr("x", 100)
             .attr("y", 100)
             .attr("r", d => size(d.n))
             .style("fill", function (d) {
                 if (d.name === "MRT") {
                     return "#000000";
                 } else {
                     return color_arc_diagram(d.name);
                 }
             })
             .attr("stroke", "white")
             .attr("id", d => d.id)
             .style('opacity', 0.8)

         // And give them a label
         const labels = svg
             .selectAll("mylabels")
             .data(data[0].nodes)
             .join("text")
             .attr("x", 0)
             .attr("y", 0)
             .text(function (d) {
                 if (d.name === "MRT") {
                     return "MRT/LRT Station"
                 } else {
                     return "";
                 }
             }).style("text-anchor", "end")
             .attr("transform", d => `translate(${x(d.name)/2 + 145},${height-80})`)
             .style("font-size", 12)

         svg.append("svg:defs").append("svg:marker")
             .attr("id", "arrow")
             .attr("viewBox", "0 -5 20 20")
             .attr('refX', -280) //so that it comes towards the center.
             .attr('refY', 6)
             .attr("markerWidth", 40)
             .attr("markerHeight", 40)
             .attr("orient", "auto")
             .append("svg:path")
             .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2");

         var distance_line = svg.append("line")
             .attr("x1", 50)
             .attr("y1", 430)
             .attr("x2", 622)
             .attr("y2", 430)
             .attr('marker-start', (d) => "url(#arrow)") //attach the arrow from defs
             .style("stroke", "black")

         var distance_text = svg.append("text")
             .attr("y", 450) //magic number here
             .attr("x", 330)
             .attr('text-anchor', 'middle')
             .attr("class", "myLabel") //easy to style with CSS
             .text("Distance From the Nearest MRT/LRT Station to the Private Condo (Meters)")
             .style("font-size", 12);

         // Add the highlighting functionality
         nodes.on('mouseover', function (event, d) {
                 if (d.id != "MRT") {
                     tip.show(event, d);
                     nodes.style('opacity', .2)
                     d3.select(this).style('opacity', 1)
                     d3.select("#MRT").style('opacity', 1)

                     // Highlight the connections
                     links
                         .style('stroke', a => a.source === d.id || a.target === d.id ? color_arc_diagram(d.name) : '#b8b8b8')
                         .style('stroke-opacity', a => a.source === d.id || a.target === d.id ? 1 : .2)
                         .style('stroke-width', a => a.source === d.id || a.target === d.id ? 3 : 1)
                 }

             })
             .on('mouseout', function (event, d) {
                 tip.hide(event, d)
                 nodes.style('opacity', 0.8)
                 links
                     .style('stroke', 'grey')
                     .style('stroke-opacity', .8)
                     .style('stroke-width', '1')
             })
     })

 }
