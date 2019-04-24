var pieColors = d3.scaleOrdinal(['#fba55f', '#d13c4b', '#4288b5', '#4da3b1', '#65b5aa', '#83cca5', '#a2d9a3', '#bfe5a0', '#d8ef9f', '#ebf7a6', '#f7faaf', '#fdf5ac', '#fee89a', '#fed585', '#fdbf70', '#f78851', '#ef6d4a', '#d13c4b', '#000075', '#808080', '#ef6d4a', '#000000']);
const pca_view_opt = d3.select(".pca_option");
const dash_view_opt = d3.select(".dash_option");
const PCA = "PCA_ANALYSIS";
const DASHBOARD = "DASHBOARD"
const margin = {top: 30, right: 20, bottom: 30, left: 50};
$.post("", {'data': 'received'}, plot_dashboard);
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-20, 0])
    .html(function (d) {
        return "<strong>Count:</strong> <span style='color:red'>" + d + "</span>";
    });

function route(view) {
    if (view == PCA) {
        $.post("pca", {'data': 'received'}, plot_pca);
    } else if (view == DASHBOARD) {
        $.post("", {'data': 'received'}, plot_dashboard);
    } else if (view == "PCA Scatter Stratified Sampled Data") {
        $.post("pca_scatter", {'data': 'stratified'}, function (data) {
            plot_scatter_plot(data, "2D Scatter Plot of Projection of Stratified Sampled Data on top 2 PCA Vectors");
        })
    }
}

function plot_dashboard(data) {
    draw_all_crimes(data.chart_data);
    create_pie(data.area_pie_data);
    draw_bar_chart(data.crime_bar_data);
}

function plot_pca(data) {
    plot_scree_plot(data.chart_data);
    // plot_sum_squared_loadings(data.chart_data);
}

function draw_bar_chart(data) {
    const first_box_boundary = d3.select("#barchart_crime").node().getBoundingClientRect();
    data = JSON.parse(data);
    data.forEach(function (d) {
        d.Year = +d['Year'];
        d["Total Crimes"] = +d['Total Crimes'];
    });
    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    var chart_header = d3.select("#barchart_crime")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Violent Crimes Committed across USA")
        .style("padding", "5px");

    var svg = d3.select("#barchart_crime")
        .append("svg")
        .attr("width", width + 1.5 * margin.left + 1.5 * margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.call(tip);
    svg = svg.append("g").attr("transform",
        "translate(" + 100 + "," + 50 + ")");

    height = 250;
    xScale = d3.scaleBand().range([0, width]).padding(0.5);
    yScale = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    xScale.domain(data.map(d => d.Year));
    yScale.domain([0, d3.max(data, function (d) {
        return d["Total Crimes"];
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
            return xScale(d.Year);
        })
        .attr("y", function (d) {
            return yScale(d['Total Crimes']);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(d['Total Crimes']);
        })
        .on("mouseover", function (d, ind) {
            d3.select(this).style("fill", "#d13c4b").transition().duration(400)
                .attr("height", function (d) {
                    return height - yScale(d["Total Crimes"]) + 5;
                })
                .attr('width', xScale.bandwidth() - 5)
                .attr("y", function (d) {
                    return yScale(d["Total Crimes"]) - 5;
                })
            tip.show(d["Total Crimes"], ind);
        })
        .on("mouseout", function (d) {
            tip.hide(d["Total Crimes"]);
            d3.select(this).style("fill", "steelblue").transition().duration(400)
                .attr('width', xScale.bandwidth())
                .attr("y", function (d) {
                    return yScale(d["Total Crimes"]);
                })
                .attr("height", function (d) {
                    return height - yScale(d["Total Crimes"]);
                });
        });
}

function create_pie(data) {
    var first_box_boundary = d3.select("#pie1").node().getBoundingClientRect();
    data = JSON.parse(data);
    data.forEach(function (d) {
        d.area = d['Area'];
        d.total_crime = d['Total Crimes'];
    });
    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    const radius = Math.min(width, height) / 2;

    var chart_header = d3.select("#pie1")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Crimes Proportion Across Different Areas in State")
        .style("padding", "5px");

    var svg = d3.select("#pie1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var groupedChart = svg.append("g")
        .attr("transform", "translate(" + ((margin.left) + (margin.right) + width) / 2 + "," + ((margin.left) + (margin.right) + height) / 2 + ")");

    var pie = d3.pie().value(function (d) {
        return d.total_crime;
    });

    var arc = d3.arc().outerRadius(radius - 1).innerRadius(0);

    groupedChart.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .style("stroke", "white")
        .style("fill", function (d, i) {
            return pieColors(i);
        })
        .attr("d", arc)
        .on("mouseover", function (d, i) {
            arc = d3.arc().innerRadius(0).outerRadius(radius + 10)
            d3.select(this).transition().duration(400).attr("d", arc);
            d3.select("#tooltip").html(pieTooltipHtml(d))
                .style('color', 'black').style('font-size', '10.5px').style('text-align', 'center')
                .style('display', 'block').style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px").style("opacity", 1);
        })
        .on('mousemove', function (d, i) {
            d3.select("#tooltip").style('left', (d3.event.layerX - 20) + 'px').style('top', (d3.event.layerY + 15) + 'px');
        })
        .on("mouseout", function () {
            arc = d3.arc().innerRadius(0).outerRadius(radius)
            d3.select(this).transition().duration(400).attr("d", arc);
            d3.select("#tooltip").style('opacity', 0).style('display', 'none');
        });
    var legendG = svg.selectAll(".legend")
        .data(pie(data))
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(" + (width - 110) + "," + (i * 15 + 20) + ")";
        })
        .attr("class", "legend");
    legendG.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function (d, i) {
            return pieColors(i);
        });

    legendG.append("text")
        .text(function (d) {
            var y = "";
            if (d.data.area === "NMC")
                y = "Non Metropolitan County";
            else if (d.data.area === "MSA")
                y = "Metropolitan Statistical Area";
            else
                y = "Cities Outside Metropolitan Area";
            return y;
        })
        .style("font-size", 10)
        .attr("y", 10)
        .attr("x", 11);

}

function tooltipHtml(d, data) {   /* function to create html content string in tooltip div. */
    //d is the id of the state.. get the row which has this id
    var tuple = [];
    data.forEach(function (row) {
        d.id = +d.id;
        if (row.id === d.id) {
            tuple = row;
            return;
        }
    });
    return "<h4>" + tuple.State + "</h4><table>" +
        "<tr><td>Violent Crimes</td><td>" + (tuple['Violent Crime']) + "</td></tr>" +
        "<tr><td>Total Crimes</td><td>" + (tuple['Total Crimes']) + "</td></tr>" +
        "</table>";
}

function pieTooltipHtml(d) {   /* function to create html content string in tooltip div. */
    //d is the id of the state.. get the row which has this id
    var x = Math.floor(((+d.data.total_crime)));
    var y = "";
    if (d.data.area === "NMC")
        y = "Non Metropolitan County";
    else if (d.data.area === "MSA")
        y = "Metropolitan Statistical Area";
    else
        y = "Cities Outside Metropolitan Area";
    return y + " - " + x;
    return "<h4>" + x + " - " + "</h4>";
}

function draw_all_crimes(data) {
    d3.select(".chart-container").remove();
    d3.select(".container-fluid")
        .append("div")
        .attr("class", "chart-container")
        .append("div")
        .attr("class", "flex-container")
        .append("div")
        .attr("class", "first-box")
        .attr("id", "usmap-box");
    var chart_header = d3.select("#usmap-box")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Crimes Across States")
    //.style("padding", "5px");

    d3.select(".flex-container")
        .append("div")
        .attr("class", "first-box second-box")
        .attr("id", "barchart_crime");

    d3.select(".chart-container")
        .append("div")
        .attr("class", "flex-container")
        .attr("id", "second-container")
        .append("div")
        .attr("class", "first-box")
        .attr("id", "pie1");

    d3.select("#second-container")
        .append("div")
        .attr("class", "first-box second-box");

    var first_box_boundary = d3.select("#usmap-box").node().getBoundingClientRect();

    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    data = JSON.parse(data);
    d3.json("https://d3js.org/us-10m.v1.json", function (error, unitedStates) {
        if (error) throw error;
        const us_map = topojson.feature(unitedStates, unitedStates.objects.states);

        var svg = d3.select("#usmap-box").append('div', "usmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var projection = d3.geoIdentity()
            .fitExtent([[margin.left, margin.right], [width, height]], us_map);

        var path = d3.geoPath().projection(projection);

        data.forEach(function (d, i) {
            d["Total Crimes"] = +d["Total Crimes"];
            d["Violent Crime"] = +d["Violent Crime"];
        });
        var pathSvg = svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(us_map.features)
            .enter()
            .append("path")
            .style("fill", "#6d7fcc")
            .attr("d", path)
            .on("mouseover", function (d, i) {
                d3.select(this).style("fill", "red");
                d3.select("#tooltip").html(tooltipHtml(d, data))
                    .style('color', 'black').style('font-size', '10.5px').style('text-align', 'center')
                    .style('display', 'block').style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px").style("opacity", 1);
            })
            .on('mousemove', function (d, i) {
                d3.select("#tooltip").style('left', (d3.event.layerX - 20) + 'px').style('top', (d3.event.layerY + 15) + 'px');
            })
            .on("mouseout", function () {
                d3.select(this).style("fill", "#6d7fcc").transition().duration(400);
                d3.select("#tooltip").style('opacity', 0).style('display', 'none');
            })
            .style("fill", function (d) {
                return {color: d3.interpolateRgb("#ffffcc", "#800026")(d["Total Crimes"] / 10000)}
            });
        svg.append("path").attr("class", "state-borders")
            .attr("d", path(topojson.mesh(unitedStates, unitedStates.objects.states, function (a, b) {
                return a !== b;
            })))
    });
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
        .attr("class", "first-box");

    d3.select(".flex-container1")
        .append("div")
        .attr("class", "first-box second-box")
        .attr("id", "sum_squared_loadings")

    var first_box_boundary = d3.select(".first-box").node().getBoundingClientRect();
    console.log(first_box_boundary.height);

    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (2 * margin.top) - (2 * margin.bottom);

    // Set the ranges
    var x = d3.scaleBand().range([0, width]).padding(0.5);
    var y = d3.scaleLinear().range([height, 0]);

    // Define the axes
    var xAxis = d3.axisBottom(x).ticks(data.length);
    var yAxis = d3.axisLeft(y).ticks(10);

    // Define the line
    var value_line = d3.line()
        .x(function (d, i) {
            if (i == 2) {
                markIDX = x(d.pca_component) + x.bandwidth() / 2;
                markIDY = y(d.eigen_values)
            }
            return x(d.pca_component) + x.bandwidth() / 2;
        })
        .y(function (d) {
            return y(d.eigen_values);
        });
    x.domain(data.map(d => d.pca_component));
    y.domain([0, d3.max(data, function (d) {
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
            "translate(" + margin.left + "," + margin.top + ")");

    svg_scree.append("g")
        .attr("class", "xaxes")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "xaxisl")
        .attr("text-anchor", "middle")
        .attr("y", margin.left)
        .attr("x", (width / 2))
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
            return x(d.pca_component);
        })
        .attr("y", function (d) {
            return y(d.eigen_values);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.eigen_values);
        });
    svg_scree.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .style("text-decoration", "underline")
        .text("Scree Plot for Dataset");

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
            return x(d.pca_component) + x.bandwidth() / 2;
        })
        .attr("cy", function (d) {
            return y(d.eigen_values)
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

pca_view_opt.on('click', function () {
    var event = d3.event;
    console.log("In PCA view");
    event.preventDefault();
    route(PCA);
});
dash_view_opt.on('click', function () {
    var event = d3.event;
    console.log("In Dashboard view");
    event.preventDefault();
    route(DASHBOARD);
});