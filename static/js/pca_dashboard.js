function plot_pca(data) {
    plot_scree_plot(data.chart_data);
    // plot_sum_squared_loadings(data.chart_data);
}
//plots scree plot
function plot_scree_plot(data) {
    data = JSON.parse(data);
    console.log(data);
    data.forEach(function (d) {
        d.eigen_values = d.eigen_values;
        d.pca_component = d.pca_component;
        d.sum_sqaured_loadings = d.sum_sqaured_loadings;
        d.features_name = d.features_name;
    });
    d3.select(".chart-container").remove();
    // Set the dimensions of the canvas / graph
    var markIDX = 0;
    var markIDY = 0;
    d3.select(".container-fluid")
        .append("div")
        .attr("class", "chart-container")
        .append("div")
        .attr("class", "flex-container1")
        .append("div")
        .attr("class", "first-box")
        .attr("id", "scree_plot");

    var chart_header = d3.select("#scree_plot")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Scree Plot for Dataset")
        .style("padding", "5px");

    d3.select(".flex-container1")
        .append("div")
        .attr("class", "first-box second-box")
        .attr("id", "sum_squared_loadings")

    var first_box_boundary = d3.select("#scree_plot").node().getBoundingClientRect();
    console.log(first_box_boundary.height);

    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (2 * margin.top) - (2 * margin.bottom);

    // Set the ranges
    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .2);
    var yScale = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(data.length);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    // Define the line
    var value_line = d3.svg.line()
        .x(function (d, i) {
            if (i == 2) {
                markIDX = xScale(d.pca_component) + xScale.rangeBand() / 2;
                markIDY = yScale(d.eigen_values)
            }
            return xScale(d.pca_component) + xScale.rangeBand() / 2;
        })
        .y(function (d) {
            return yScale(d.eigen_values);
        });
    xScale.domain(data.map(d => d.pca_component));
    yScale.domain([0, d3.max(data, function (d) {
        return d.eigen_values;
    })]);

    var svg_scree = d3.select(".first-box")
        .append("div")
        .attr("id", "chart_scree")
        .attr("class", "scree-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + 1.5 * margin.top + 1.5 * margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + (2*margin.left) + "," + (1.5*margin.top) + ")");

    svg_scree.append("g")
        .attr("class", "xaxes")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", margin.left)
        .attr("x", (width / 2))
        .attr("dy", "1em")
        .text("PCA Components");
    ;
    // Add the Y Axis
    svg_scree.append("g")
        .attr("class", "yaxes")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .text("Eigen Values");

    svg_scree.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "#fba55f")
        //==.attr("fill-opacity",0.8)
        .attr("x", function (d, i) {
            return xScale(d.pca_component);
        })
        .attr("y", function (d) {
            return yScale(d.eigen_values);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function (d) {
            return height - yScale(d.eigen_values);
        });

    // Add the valueline path.
    svg_scree.append("path")
        .attr("class", "line")
        .attr("d", value_line(data));

    svg_scree.append("circle")
        .attr("class", "marker")
        .attr("r", 9)
        .attr("cx", markIDX)
        .attr("cy", markIDY)
        .style("fill", "red");

    svg_scree.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("r", 3)
        .attr("cx", function (d, i) {
            return xScale(d.pca_component) + xScale.rangeBand() / 2;
        })
        .attr("cy", function (d) {
            return yScale(d.eigen_values)
        });
}

function plot_sum_squared_loadings(data) {
    const first_box_boundary = d3.select("#sum_squared_loadings").node().getBoundingClientRect();
    data = JSON.parse(data);
    console.log(data);
    data.forEach(function (d) {
        d.eigen_values = +d.eigen_values;
        d.pca_component = +d.pca_component;
        d.sum_sqaured_loadings = +d.sum_sqaured_loadings;
        d.features_name = d.features_name;
    });

    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    var chart_header = d3.select("#sum_squared_loadings")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Violent Crimes Committed across USA")
        .style("padding", "5px");

    var svg = d3.select("#sum_squared_loadings")
        .append("svg")
        .attr("width", width + 1.5 * margin.left + 1.5 * margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.call(tip);
    svg = svg.append("g").attr("transform",
        "translate(" + 100 + "," + 50 + ")");

    //height = 250;
    xScale = d3.scaleBand().range([0, width]).padding(0.1);
    yScale = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    xScale.domain(data.map(d => d.features_name));
    yScale.domain([0, d3.max(data, function (d) {
        return d.eigen_values;
    })]);

    var rectg = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");
    svg.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        .append("text")
        .attr("y", 6)
        .attr("dy", "-5.1em")
        .attr("transform", "rotate(-90)")
        .attr("stroke", "black")
        .attr("text-anchor", "end")
        .text("Count");
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "steelblue")
        .attr("class", "bar")
        .attr("x", function (d, i) {
            return xScale(d.features_name);
        })
        .attr("y", function (d) {
            return yScale(d.eigen_values);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(d.eigen_values);
        })
        .on("mouseover", function (d, ind) {
            d3.select(this).style("fill", "#d13c4b").transition().duration(400)
                .attr("height", function (d) {
                    return height - yScale(d.eigen_values) + 5;
                })
                .attr('width', xScale.bandwidth() - 5)
                .attr("y", function (d) {
                    return yScale(d.eigen_values) - 5;
                })
            tip.show(d.eigen_values, ind);
        })
        .on("mouseout", function (d) {
            tip.hide(d.sum_sqaured_loadings);
            d3.select(this).style("fill", "steelblue").transition().duration(400)
                .attr('width', xScale.bandwidth())
                .attr("y", function (d) {
                    return yScale(d.eigen_values);
                })
                .attr("height", function (d) {
                    return height - yScale(d.eigen_values);
                });
        });
}