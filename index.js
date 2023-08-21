document.addEventListener("DOMContentLoaded", function () {
  //   URL
  const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

  const getData = (url) => {
    return fetch(url)
      .then((response) => response.json())
      .then((data) => data);
  };

  getData(url).then((data) => {
    const json = data;

    //     Parameters
    const w = 1100;
    const h = 650;
    const padding = 100;

    const title = "Monthly Global Land-Surface Temperature";
    const credit =
      "Created by <a href='https://github.com/odakris?tab=repositories' target='_blank' rel='noreferrer noopener'>Odakris</a>";

    const average = json.baseTemperature;
    // console.log("average", average);
    const variance = json.monthlyVariance;
    // console.log("variance", variance);

    const minYear = d3.min(variance, (d) => d.year);
    const maxYear = d3.max(variance, (d) => d.year);
    const minTemp = d3.min(variance, (d) => d.variance);
    const maxTemp = d3.max(variance, (d) => d.variance);

    variance.forEach((item) => (item.month -= 1));

    const colors = [
      "rgb(0, 0, 255)",
      "rgb(0, 60, 255)",
      "rgb(69, 117, 180)",
      "rgb(116, 173, 209)",
      "rgb(171, 217, 233)",
      "rgb(224, 243, 248)",
      "rgb(254, 224, 144)",
      "rgb(253, 174, 97)",
      "rgb(244, 109, 67)",
      "rgb(215, 48, 39)",
      "rgb(165, 0, 38)",
      "rgb(130, 10, 38)",
      "rgb(100, 0, 38)",
    ];

    const colorScale = d3
      .scaleQuantile()
      .domain([minTemp - 0.024, maxTemp + 0.772])
      .range(colors);

    //     BODY
    const body = d3.select("body").attr("class", "flex-center");

    //     Container
    const container = body
      .append("div")
      .attr("id", "container")
      .attr("class", "flex-center");

    //     Header
    const header = container
      .append("header")
      .attr("id", "header")
      .attr("class", "flex-center margin");

    //     Title
    header
      .append("h1")
      .attr("id", "title")
      .style("text-align", "center")
      .style("color", "linen")
      .html(title);

    //     subtitle
    header
      .append("h3")
      .attr("id", "description")
      .style("text-align", "center")
      .style("color", "linen")
      .html(
        minYear + " - " + maxYear + " : " + "base Temperature " + average + "°C"
      );

    //     Heat Map
    const svg = container
      .append("div")
      .attr("id", "heatmap")
      .append("svg")
      .attr("width", w)
      .attr("height", h - padding)
      .style("border", "2px solid linen")
      .style("border-radius", 10 + "px");

    //     Scale X
    const scaleX = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([padding, w - padding]);

    //     Plot X axis
    const xAxis = d3
      .axisBottom(scaleX)
      .tickFormat(d3.format("d"))
      .tickValues(d3.range(scaleX.domain()[0] + 7, scaleX.domain()[1], 10));

    svg
      .append("g")
      .attr("transform", "translate(0," + (h - 1.5 * padding) + ")")
      .attr("id", "x-axis")
      .call(xAxis);

    // Scale Y
    const scaleY = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .range([padding / 2, h - 1.5 * padding]);

    //     Plot Y axis
    const yAxis = d3.axisLeft(scaleY).tickFormat((d) => {
      const timeMonth = d3.timeFormat("%B");
      const month = timeMonth(new Date(1969, d - 1, 1));
      return month;
    });

    svg
      .append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .attr("id", "y-axis")
      .call(yAxis);

    //     Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0);

    // Legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendPadding = 20;
    const legendTitle = "Temperature Variation";

    //     Legend Axis
    const legendScale = d3
      .scaleLinear()
      .domain([0, colors.length])
      .range([legendPadding, legendWidth - legendPadding]);

    const legendAxis = d3.axisBottom(legendScale).tickFormat((d, i) => {
      const scaleLabel = d3.min(variance, (d) => d.variance) + i;
      return scaleLabel.toFixed(0) + "°C";
    });

    const legend = d3.select("#container").append("div").attr("id", "legend");

    legend
      .append("div")
      .attr("id", "legendTitle")
      .attr("class", "flex-center margin")
      .text(legendTitle)
      .style("color", "linen");

    const legendsvg = legend
      .append("svg")
      .attr("id", "legend-svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight + legendPadding);

    legendsvg
      .selectAll("#legenddata")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendScale(i))
      .attr("y", 0)
      .attr("width", legendWidth / colors.length)
      .attr("height", legendHeight)
      .style("fill", (d, i) => colors[i]);

    legendsvg
      .append("g")
      .call(legendAxis)
      .attr("transform", "translate(0," + legendHeight + ")")
      .attr("id", "legend-axis");

    //     Display Cells
    const cells = svg
      .selectAll("rect")
      .data(variance)
      .enter()
      .append("rect")
      .attr("x", (d) => scaleX(d.year))
      .attr("y", (d) => {
        return ((h - 2 * padding) / 12) * d.month + padding / 2;
      })
      .attr("width", (w - 2 * padding) / (maxYear - minYear))
      .attr("height", (h - 2 * padding) / 12)
      .attr("class", "cell")
      .attr("fill", (d) => colorScale(d.variance))
      .attr("data-month", (d) => d.month)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance);

    //     Display tooltip
    cells
      .on("mousemove", function (event, d) {
        tooltip
          .attr("data-year", d.year)
          .attr("data-month", d.month)
          .attr("data-variance", d.variance)
          .style("top", event.pageY - 100 + "px")
          .style("left", event.pageX - 100 + "px")
          .style("opacity", 1)
          .style("stroke", "black")
          .html(() => {
            const timeMonth = d3.timeFormat("%B");
            const month = timeMonth(new Date(d.year, d.month, 1));
            return (
              month +
              " " +
              d.year +
              "</br>" +
              "Land-Surface Temperature: " +
              (average + d.variance).toFixed(2) +
              "°C" +
              "</br>" +
              "Temperature Variation: " +
              d.variance.toFixed(2) +
              "°C"
            );
          });
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);
      });

    //     Credit
    container
      .append("div")
      .attr("id", "credit")
      .style("color", "linen")
      .attr("class", "margin")
      .html(credit);
  });
});
