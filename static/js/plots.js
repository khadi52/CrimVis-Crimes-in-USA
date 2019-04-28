var pieColors = ['#fba55f', '#d13c4b', '#4288b5', '#4da3b1', '#65b5aa', '#83cca5', '#a2d9a3', '#bfe5a0', '#d8ef9f', '#ebf7a6', '#f7faaf', '#fdf5ac', '#fee89a', '#fed585', '#fdbf70', '#f78851', '#ef6d4a', '#d13c4b', '#000075', '#808080', '#ef6d4a', '#000000'];
const pca_view_opt = d3.select(".pca_option");
const dash_view_opt = d3.select(".dash_option");
const rape_dropdown = d3.select("#rape_opt");
const murder_dropdown = d3.select("#murder_opt");
const robbery_dropdown = d3.select("#robbery_opt");
const burglary_dropdown = d3.select("#burglary_opt");
const mvt_dropdown = d3.select("#mvt_opt");
const larceny_dropdown = d3.select("#lt_opt");
const property_dropdown = d3.select("#pc_opt");
const aggravated_assault_dropdwon = d3.select("#aa_opt");

const PCA = "PCA_ANALYSIS";
const DASHBOARD = "DASHBOARD";
const RAPE = "Rape";
const MURDER = "Murder";
const ROBBERY = "Robbery";
const BURGLARY = "Burglary";
const ASSAULT = "Aggravated Assault";
const MVT = "Motor Vehicle Theft";
const PROPERTY = "Property Crime";
const LARCENY = "Larceny-theft";
const dispatch = d3.dispatch("change");

var is_dashboard_view = true;
var was_pca_view = true;

const margin = {top: 30, right: 20, bottom: 30, left: 50};
$.post("", {'data': 'received'}, plot_dashboard);
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-12, 0])
    .html(function (d) {
        return "<strong>Count:</strong> <span style='color:red'>" + d + "</span>";
    });

function route(view) {
    if (view == PCA) {
        $.post("pca", {'data': 'received'}, plot_pca);
    } else if (view == DASHBOARD) {
        $.post("", {'data': 'received'}, plot_dashboard);
    } else if (view == MURDER) {
        $.post("crime", {'data': MURDER}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == RAPE) {
        $.post("crime", {'data': RAPE}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == ROBBERY) {
        $.post("crime", {'data': ROBBERY}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == BURGLARY) {
        $.post("crime", {'data': BURGLARY}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);

        });
    } else if (view == ASSAULT) {
        $.post("crime", {'data': ASSAULT}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == MVT) {
        $.post("crime", {'data': MVT}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == PROPERTY) {
        $.post("crime", {'data': PROPERTY}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == LARCENY) {
        $.post("crime", {'data': LARCENY}, function (data) {
            plot_dashboard(data, view);
            map_tooltip_data_update(data);
        });
    } else if (view == "PCA Scatter Stratified Sampled Data") {
        $.post("pca_scatter", {'data': 'stratified'}, function (data) {
            plot_scatter_plot(data, "2D Scatter Plot of Projection of Stratified Sampled Data on top 2 PCA Vectors");
        })
    }
}

function map_tooltip_data_update(data) {
    data = JSON.parse(data.chart_data);
    var pathSvg = d3.select("#svg_map")
        .select(".states")
        .selectAll("path")
        .style("fill", "#6d7fcc")
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
        });
}

function plot_pca(data) {
    plot_scree_plot(data.chart_data);
    plot_sum_squared_loadings(data.chart_data);
}

function append_map_svg() {
    var box_boundary = d3.select("#usmap-box").node().getBoundingClientRect();
    var width = box_boundary.width - (margin.left) - (margin.right),
        height = box_boundary.height - (margin.top) - (margin.bottom);
    var svg = d3.select("#usmap-box").append('div', "usmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg_map");
}

function append_pie_svg() {
    var box_boundary = d3.select("#pie1").node().getBoundingClientRect();
    var width = box_boundary.width - (margin.left) - (margin.right),
        height = box_boundary.height - (margin.top) - (margin.bottom);
    var svg = d3.select("#pie1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + margin.top)
        .attr("id", "svg_pie");
    svg.append("g")
        .attr("transform", "translate(" + ((margin.left) + (margin.right) + width) / 2 + "," + (margin.bottom + 3 * margin.top + height) / 2 + ")");
}

function append_bar_svg() {
    const first_box_boundary = d3.select("#barchart-crime").node().getBoundingClientRect();
    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    // height = 250;
    var svg = d3.select("#barchart-crime")
        .append("svg")
        .attr("width", width + 2 * margin.left + 2 * margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg_bar");
    var groupedChart = svg.append("g").attr("transform", "translate(" + (margin.left) + "," + margin.top / 2 + ")");

    groupedChart.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (height) + ")")
        .append("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)")
        .text('Year');

    groupedChart.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin.left) + "," + 0.8 * margin.top + ")")
        .append("text")
        .attr("y", 6)
        .attr("dy", "-5.1em")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .text("Count");
}

function append_stacked_svg() {

    const first_box_boundary = d3.select("#stacked-chart").node().getBoundingClientRect();
    var width = first_box_boundary.width,
        height = first_box_boundary.height;

    var svg = d3.select("#stacked-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "stacked");

    var groupedChart = svg.append("g").attr("transform",
        "translate(" + 0 + "," + margin.top / 2 + ")");
    groupedChart.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(" + (margin.left) + "," + (height - 2.5 * margin.bottom) + ")")
    groupedChart.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")


}

function append_svgs() {
    append_map_svg();
    append_pie_svg();
    append_bar_svg();
    //append_stacked_svg();
}

function init_containers() {
    d3.select(".chart-container").remove();
    d3.select(".container-fluid")
        .append("div")
        .attr("class", "chart-container")
        .append("div")
        .attr("class", "flex-container")
        .append("div")
        .attr("class", "first-box")
        .attr("id", "usmap-box");
    d3.select("#usmap-box")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Crimes Across States")
        .style("padding", "5px");

    d3.select(".flex-container")
        .append("div")
        .attr("class", "first-box second-box")
        .attr("id", "barchart-crime");

    d3.select(".chart-container")
        .append("div")
        .attr("class", "flex-container")
        .attr("id", "second-container")
        .append("div")
        .attr("class", "first-box")
        .attr("id", "pie1");

    d3.select("#second-container")
        .append("div")
        .attr("class", "first-box second-box")
        .attr("id", "stacked-chart");

    d3.select("#pie1")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "pie1-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Crimes Proportion Across Different Areas in State")
        .style("padding", "5px");

    d3.select("#barchart-crime")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "bar-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Violent Crimes Committed across USA")
        .style("padding", "5px");


    append_svgs();
}

function dispatch_pie_update_evt(data, view) {
    if (view == MURDER) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == RAPE) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == ROBBERY) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == BURGLARY) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == ASSAULT) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == MVT) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == PROPERTY) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    } else if (view == LARCENY) {
        dispatch.change({detail: {myCustomObject: data.area_pie_data}});
    }
}

function plot_dashboard(data, view) {
    if (was_pca_view) {
        init_containers();
        create_pie(data);
        draw_all_crimes(data);
    }
    if (!was_pca_view)
        dispatch_pie_update_evt(data, view);
    was_pca_view = false;
    draw_bar_chart(data.crime_bar_data);
    // var first_box_boundary = d3.select("#stacked-chart").select("svg").node().getBoundingClientRect();

    //d3.select("#svg_pie")
    //  .style("height", first_box_boundary.height);

    stacked_bar_chart(data);
}

function draw_bar_chart(data) {
    console.log("drawing bar chart");
    const first_box_boundary = d3.select("#barchart-crime").node().getBoundingClientRect();
    data = JSON.parse(data);
    data.forEach(function (d) {
        d.Year = +d['Year'];
        d["Total Crimes"] = +d['Total Crimes'];
    });
    var width = first_box_boundary.width - (2 * margin.left) - (2 * margin.right),
        height = first_box_boundary.height - (2 * margin.top) - (2 * margin.bottom);
    var svg = d3.select("#svg_bar");
    var groupedChart = svg.select('g');

    svg.call(tip);

    const xScale = d3.scale.ordinal().rangeRoundBands([0, width], .5);
    const yScale = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

    xScale.domain(data.map(d => d.Year));
    yScale.domain([0, d3.max(data, function (d) {
        return d["Total Crimes"];
    })]);

    groupedChart.select(".xAxis")
        .transition()
        .call(xAxis);
    groupedChart.select(".yAxis")
        .transition()
        .duration(1000)
        .call(yAxis);
    var selectedBars = groupedChart.selectAll(".bar").data(data);

    selectedBars
        .exit()
        .transition()
        .duration(700)
        .attr('height', 0)
        .attr('y', height)
        .remove();

    selectedBars
        .enter().append("rect")
        .style("fill", "#6d7fcc")
        .attr("class", "bar")
        .attr("width", xScale.rangeBand())
        .attr("height", 0)
        .attr("y", height);
    selectedBars
        .transition()
        .duration(700)
        .attr("height", function (d) {
            return height - yScale(d['Total Crimes']);
        })
        .attr("width", xScale.rangeBand())
        .attr("x", function (d, i) {
            return xScale(d.Year);
        })
        .attr("transform", "translate(" + (margin.left) + "," + 0.8 * margin.top + ")")
        .attr("y", function (d) {
            return yScale(d['Total Crimes']);
        });

    selectedBars
        .on("mouseover", function (d, ind) {
            d3.select(this).style("fill", "#d13c4b").transition().duration(400)
                .attr("height", function (d) {
                    return height - yScale(d["Total Crimes"]) + 5;
                })
                .attr('width', xScale.rangeBand() - 5)
                .attr("y", function (d) {
                    return yScale(d["Total Crimes"]) - 5;
                })
            tip.show(d["Total Crimes"], ind);
        })
        .on("mouseout", function (d) {
            tip.hide(d["Total Crimes"]);
            d3.select(this).style("fill", "#6d7fcc").transition().duration(400)
                .attr('width', xScale.rangeBand())
                .attr("y", function (d) {
                    return yScale(d["Total Crimes"]);
                })
                .attr("height", function (d) {
                    return height - yScale(d["Total Crimes"]);
                });
        })
}

function create_pie(data) {
    var first_box_boundary = d3.select("#pie1").node().getBoundingClientRect();
    data = JSON.parse(data.area_pie_data);
    data.forEach(function (d) {
        d.area = d['Area'];
        d.total_crime = d['Total Crimes'];
    });
    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    const radius = Math.min(width / 1.1, height / 1.1) / 2;
    var svg = d3.select("#svg_pie");
    var groupedChart = svg.select("g");
    var pie = d3.layout.pie()
        .value(function (d) {
            return d.total_crime;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius - 1)
        .innerRadius(0);

    var path = groupedChart.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "arc")
        .style("stroke", "white")
        .style("fill", function (d, i) {
            return pieColors[i];
        })
        .attr("d", arc)
        .each(function (d) {
            this._current = d;
        }); // store the initial angles
    path.on("mouseover", function (d, i) {
        arc = d3.svg.arc().innerRadius(0).outerRadius(radius + 10)
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
            arc = d3.svg.arc().innerRadius(0).outerRadius(radius - 1)
            d3.select(this).transition().duration(400).attr("d", arc);
            d3.select("#tooltip").style('opacity', 0).style('display', 'none');
        });
    dispatch
        .on("change", function (d, i) {
            var myParams = d.detail;
            myParams = (myParams.myCustomObject);
            console.log(typeof myParams)
            console.log(myParams);
            myParams = JSON.parse(myParams);
            myParams.forEach(function (d) {
                d.area = d['Area'];
                d.total_crime = d['Total Crimes'];
            });
            console.log("Hello");
            redraw(myParams);
        });

    function redraw(data) {
        // join
        var arcs = groupedChart.selectAll(".arc")
            .data(pie(data), function (d) {
                return d.data.total_crime;
            });
        // update
        arcs
            .transition()
            .duration(1500)
            .attrTween("d", arcTween);
        // enter
        arcs.enter().append("path")
            .attr("class", "arc").style("stroke", "white")
            .style("fill", function (d, i) {
                return pieColors[i];
            })
            .attr("d", arc)
            .each(function (d) {
                this._current = d;
            });

        arcs.exit()
            .remove();
        groupedChart.selectAll("path").on("mouseover", function (d, i) {
            arc = d3.svg.arc().innerRadius(0).outerRadius(radius + 10)
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
                arc = d3.svg.arc().innerRadius(0).outerRadius(radius)
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
                return pieColors[i];
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

    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        console.log(this._current);
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return arc(i(t));
        };
    }

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
            return pieColors[i];
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
    data = JSON.parse(data.chart_data);
    var first_box_boundary = d3.select("#usmap-box").node().getBoundingClientRect();
    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    d3.json("https://d3js.org/us-10m.v1.json", function (error, unitedStates) {
        if (error) throw error;
        var us_map = topojson.feature(unitedStates, unitedStates.objects.states);

        var svg = d3.select("#svg_map");
        var projection = d3.geoIdentity().fitExtent([[margin.left, margin.right], [width, height]], us_map);

        var path = d3.geo.path().projection(projection);

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
                d3.select(this).style("fill", "rgb(209, 60, 75");
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

function stacked_bar_chart(data) {
    const first_box_boundary = d3.select("#stacked-chart").node().getBoundingClientRect();
    data = JSON.parse(data.victim_trend_data);
    data.forEach(function (d) {
        d.year = +d.Year;
        d.white = +d.White;
        d.black = +d.Black;
        d.hispanic = +d["Hispanic or Latino"];
        d.others = +d.Others;
        d.unknown = +d.Unknown;
    });
    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    var chart_header = d3.select("#stacked-chart")
        .append("div")
        .attr("class", "chart-header")
        .attr("id", "stacked-chart-header")
        .style("color", "#fff")
        .style("background-color", "#6d7fcc")
        .text("Murder Trend across USA: Race of the Victims")
        .style("padding", "5px");
    var svg = d3.select("#stacked-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom);


    svg = svg.append("g").attr("transform",
        "translate(" + (2 * margin.left) + "," + margin.top + ")");

    var parse = d3.time.format("%Y").parse;
    var dataset = d3.layout.stack()(["white", "black", "hispanic", "others", "unknown"].map(function (race) {
        return data.map(function (d) {
            const stack = {x: parse(d.Year), y: +d[race]};
            return stack;
        });
    }));
    console.log(dataset);
    width = 340;
    height = 300;
    // Set x, y and colors
    var x = d3.scale.ordinal()
        .domain(dataset[0].map(function (d) {
            return d.x;
        }))
        .rangeRoundBands([10, width], 0.3);

    var y = d3.scale.linear().rangeRound([height, 0]).domain([0, d3.max(dataset, function (d) {
        return d3.max(d, function (d) {
            return d.y0 + d.y;
        });
    })])
    var colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574", "#65b5aa"];

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat(function (d) {
            return d
        });

    var xAxis = d3.svg.axis().scale(x).orient("bottom")
        .tickFormat(d3.time.format("%Y"));
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //creating groups for each race, rects for each segment
    var groups = svg.selectAll("g.race")
        .data(dataset).enter().append("g").attr("class", "race")
        .style("fill", function (d, i) {
            return colors[i];
        });
    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 30)
        .attr("height", 20)
        // .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

    var rect = groups.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.x);
        })
        .attr("y", function (d) {
            return y(d.y0 + d.y);
        })
        .attr("height", function (d) {
            return y(d.y0) - y(d.y0 + d.y);
        })
        .attr("width", x.rangeBand())
        .on("mouseover", function () {
            tooltip.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.y);
        });

// Draw legend
    var legend = svg.selectAll(".legend")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(30," + i * 15 + ")";
        });

    legend.append("rect")
        .attr("x", width - 15)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function (d, i) {
            return colors.slice()[i];
        });

    legend.append("text")
        .attr("x", width + 5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d, i) {
            switch (i) {
                case 0:
                    return "White";
                case 1:
                    return "Black";
                case 2:
                    return "Hispanic/Latino";
                case 3:
                    return "Others";
                case 4:
                    return "Unknown";
            }
        });
}

pca_view_opt.on('click', function () {
    is_dashboard_view = false;
    was_pca_view = true;
    var event = d3.event;
    console.log("In PCA view");
    event.preventDefault();
    route(PCA);
});
dash_view_opt.on('click', function () {
    var event = d3.event;
    is_dashboard_view = true;
    event.preventDefault();
    route(DASHBOARD);
});
rape_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(RAPE);
});
murder_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(MURDER);
});
burglary_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(BURGLARY);
});
robbery_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(ROBBERY);
});
mvt_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(MVT);
});
larceny_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(LARCENY);
});
property_dropdown.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(PROPERTY);
});
aggravated_assault_dropdwon.on('click', function () {
    var event = d3.event;
    event.preventDefault();
    route(ASSAULT);
});