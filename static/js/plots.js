const pca_view_opt = d3.select(".pca_option");
const dash_view_opt = d3.select(".dash_option");
const PCA = "PCA_ANALYSIS";
const DASHBOARD = "DASHBOARD"
var color = {}, stateNames = {}, violentCrime = {}, totalCrime = {};
const margin = {top: 30, right: 20, bottom: 30, left: 50};

function route(view) {
    if(view == PCA){
        $.post("pca", {'data': 'received'}, plot_scree_plot);
    }
    else if (view == DASHBOARD){
        $.post("", {'data': 'received'}, plot_dashboard);
    }
    else if(view == "PCA Scatter Stratified Sampled Data"){
        $.post("pca_scatter", {'data': 'stratified'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of Projection of Stratified Sampled Data on top 2 PCA Vectors");
        })
    }
    else if(view == "PCA Scatter Original Sampled Data"){
        $.post("pca_scatter", {'data': 'original'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of Projection of Original Sampled Data on top 2 PCA Vectors");
        })
    }
    else if(view == "MDS Euclidean Scatter Stratified Sampled Data"){
        $.post("mds_euclidean", {'data': 'stratified'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Euclidean on Stratified Sampled Data");
        })
    }
    else if(view == "MDS Euclidean Scatter Original Sampled Data"){
        $.post("mds_euclidean", {'data': 'original'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Euclidean on Original Sampled Data");
        })
    }
    else if(view == "MDS Euclidean Scatter Random Sampled Data"){
        $.post("mds_euclidean", {'data': 'random'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Euclidean on Random Sampled Data");
        })
    }
    else if(view == "MDS Correlation Scatter Stratified Sampled Data"){
        $.post("mds_correlation", {'data': 'stratified'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Correlation on Stratified Sampled Data");
        })
    }
    else if(view == "MDS Correlation Scatter Original Sampled Data"){
        $.post("mds_correlation", {'data': 'original'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Correlation on Original Sampled Data");
        })
    }
    else if(view == "MDS Correlation Scatter Random Sampled Data"){
        $.post("mds_correlation", {'data': 'random'}, function(data) {
            plot_scatter_plot(data,"2D Scatter Plot of MDS Correlation on Random Sampled Data");
        })
    }
    else if(view == "Scatter Matrix Plot Stratified Sampled Data"){
        $.post("scatter_matrix", {'data': 'stratified'}, function(data) {
            plot_scatter_matrix(data,"Scatter Matrix Plot of 3 highest PCA loaded attributes on Stratified Sampled Data");
        })
    }
    else if(view == "Scatter Matrix Plot Original Data"){
        $.post("scatter_matrix", {'data': 'original'}, function(data) {
            plot_scatter_matrix(data,"Scatter Matrix Plot of 3 highest PCA loaded attributes on Original Data");
        })
    }
    else if(view == "Scatter Matrix Plot Random Sampled Data"){
        $.post("scatter_matrix", {'data': 'random'}, function(data) {
            plot_scatter_matrix(data,"Scatter Matrix Plot of 3 highest PCA loaded attributes on Random Sampled Data");
        })
    }
}

function plot_dashboard(data){
	draw_all_crimes(data);
	create_pie(data);
}

function create_pie(data) {
    var first_box_boundary = d3.select("#pie1").node().getBoundingClientRect();
    data = JSON.parse(data.area_pie_data);
    data.forEach(function(d) {
        d.area = d['Area'];
        d.total_crime = d['Total Crimes'];
    });

    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    const radius = Math.min(width,height)/2;

    var svg = d3.select("#pie1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height +margin.top + margin.bottom);

    var groupedChart = svg.append("g")
        .attr("transform", "translate(" + ((margin.left) + (margin.right) + width)/2+ "," + ((margin.left) + (margin.right) + height)/2 + ")");

    var pie = d3.pie()
        .value(function (d) {
            return d.total_crime;
        });

    var arc = d3.arc()
        .outerRadius(radius-1)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius-10)
        .innerRadius(radius-40);

    var pieColors = d3.scaleOrdinal(['#fba55f', '#d13c4b', '#4288b5', '#4da3b1', '#65b5aa', '#83cca5', '#a2d9a3', '#bfe5a0', '#d8ef9f', '#ebf7a6', '#f7faaf', '#fdf5ac', '#fee89a', '#fed585', '#fdbf70', '#f78851', '#ef6d4a', '#d13c4b', '#000075', '#808080', '#ef6d4a', '#000000']);
    groupedChart.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .style("stroke","white")
        .style("fill",function(d,i){return  pieColors(i);})
        .attr("d",arc)
        .append("title")
        .text(function (d) {
            var x = Math.floor(((+d.data.total_crime)));
            var y = "";
            if (d.data.area === "NMC")
                y =  "Non Metropolitan County";
            else if (d.data.area === "MSA")
                y = "Metropolitan Statistical Area";
            else
                y = "Cities Outside Metropolitan Area";
            return y+" - "+x;
        });

}


function tooltipHtml(d){   /* function to create html content string in tooltip div. */
    //d is the id of the state.. get the row which has this id
    d.id = +d.id;
    return "<h4>"+stateNames[d.id]+"</h4><table>"+
        "<tr><td>Violent Crimes</td><td>"+(violentCrime[d.id])+"</td></tr>"+
        "<tr><td>Total Crimes</td><td>"+(totalCrime[d.id])+"</td></tr>"+
        // "<tr><td>High</td><td>"+(d.high)+"</td></tr>"+
        "</table>";
}

function draw_all_crimes(data) {
    d3.select(".chart-container").remove();
    data = JSON.parse(data.chart_data);
    console.log(data);
    d3.select(".container-fluid")
        .append("div")
        .attr("class","chart-container")
        .append("div")
        .attr("class","flex-container")
        .append("div")
        .attr("class","first-box")
        .attr("id", "usmap-box");

    d3.select(".flex-container")
        .append("div")
        .attr("class","first-box second-box");

    d3.select(".chart-container")
        .append("div")
        .attr("class","flex-container")
        .attr("id", "second-container")
        .append("div")
        .attr("class","first-box")
        .attr("id", "pie1");

    d3.select("#second-container")
        .append("div")
        .attr("class","first-box second-box");


    var first_box_boundary = d3.select("#usmap-box").node().getBoundingClientRect();

    var width = first_box_boundary.width - (margin.left) - (margin.right),
        height = first_box_boundary.height - (margin.top) - (margin.bottom);

    d3.json("https://d3js.org/us-10m.v1.json", function(error, unitedStates) {
        if (error) throw error;
        var us_map = topojson.feature(unitedStates, unitedStates.objects.states);

        var svg = d3.select("#usmap-box").append('div', "usmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height +margin.top + margin.bottom);

        var projection = d3.geoIdentity()
            .fitExtent([[margin.left,margin.right],[width,height]], us_map);

        var path = d3.geoPath().projection(projection);

        data.forEach(function (d, i) {
            stateNames[d.id] = d.State;
            d["Total Crimes"] = +d["Total Crimes"];
            d["Violent Crime"] = +d["Violent Crime"];
            violentCrime[d.id] = d['Violent Crime'];
            totalCrime[d.id] = d['Total Crimes'];
        });

        var pathSvg = svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(us_map.features)
            .enter()
            .append("path")
            .style("fill", "#40469c")
            .attr("d", path)
            .on("mouseover", function(d,i) {
                d3.select(this).style("fill","red");
                d3.select("#tooltip").html(tooltipHtml(d))
                    .style('color', 'black').style('font-size', '10.5px').style('text-align', 'center')
                    .style('display', 'block').style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px").style("opacity", 1);
            })
            .on('mousemove', function(d,i) {
                d3.select("#tooltip").style('left',(d3.event.layerX - 20)+'px').style('top',(d3.event.layerY + 15)+'px');
            })
            .on("mouseout", function() {
                d3.select(this).style("fill","#40469c");
                d3.select(this).transition().duration(400);
                d3.select("#tooltip").style('opacity',0).style('display', 'none');
            })
            .style("fill", function(d){ return {color:d3.interpolateRgb("#ffffcc", "#800026")(d["Total Crimes"]/10000)}});
        svg.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(unitedStates, unitedStates.objects.states, function (a, b) {
                return a !== b;
            })))

        //adding tooltip
    });
}

//plots scree plot
function  plot_scree_plot(data) {
    data = JSON.parse(data.chart_data);
    console.log(data);
    data.forEach(function(d) {
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
        .attr("class","chart-container")
        .append("div")
        .attr("class","flex-container1")
        .append("div")
        .attr("class","first-box");

    d3.select(".flex-container1")
        .append("div")
        .attr("class","first-box second-box");

    var first_box_boundary = d3.select(".first-box").node().getBoundingClientRect();
    console.log(first_box_boundary.height);

    var width = first_box_boundary.width - (2*margin.left) - (2*margin.right),
        height = first_box_boundary.height - (2*margin.top) - (2*margin.bottom);

    // Set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Define the axes
    var xAxis = d3.axisBottom(x).ticks(data.length);
    var yAxis = d3.axisLeft(y).ticks(10);

    // Define the line
    var value_line = d3.line()
        .x(function(d,i) {
            if (i == 2) {
                markIDX = x(d.pca_component);
                markIDY = y(d.eigen_values)
            }
            return x(d.pca_component); })
        .y(function(d) { return y(d.eigen_values); });


    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.pca_component-1; }));
    y.domain([0, d3.max(data, function(d) {
        return d.eigen_values;  })]);

    var svg_scree = d3.select(".first-box")
        .append("div")
        .attr("id","chart_scree")
        .attr("class","scree-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + 1.5*margin.top + 1.5*margin.bottom)
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
        .text("PCA Components");;

    // Add the Y Axis
    svg_scree.append("g")
        .attr("class", "yaxes")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .text("Eigen Values");

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
        .attr("class","marker")
        .attr("r", 9)
        .attr("cx", markIDX)
        .attr("cy", markIDY)
        .style("fill", "red");

    svg_scree.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("r", 3)
        .attr("cx", function(d, i) { return x(d.pca_component) })
        .attr("cy", function(d) { return y(d.eigen_values) });


}

pca_view_opt.on('click', function(){
    var event = d3.event;
    console.log("In PCA view");
    event.preventDefault();
    route(PCA);
});
dash_view_opt.on('click', function(){
    var event = d3.event;
    console.log("In Dashboard view");
    event.preventDefault();
    route(DASHBOARD);
});