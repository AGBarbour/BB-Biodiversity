function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  var url = `/metadata/${sample}`
  d3.json(url).then(function(response) {

    var metadata = response;
    console.log(metadata)

    var result = Object.keys(metadata).map(function(key) {
      return [key, metadata[key]];
    });
    console.log(result)

    d3.select("#sample-metadata")
      .html("")
      .append("ul")
      .selectAll("li")
      .data(result)
      .enter()
      .append("li")
      .text(function(d, i) {
        return `${d[0]}: ${d[1]}` 
      })

    // Build the Gauge Chart
    buildGauge(metadata.WFREQ);
  });
};

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`
  d3.json(url).then(function(response) {

    var data = response;

    // Reformat data to be sortable
    var arr = [];
    var len = data.otu_ids.length

    for (var i = 0; i < len ; i++) {
      arr.push({
        otu_ids: data.otu_ids[i],
        otu_labels: data.otu_labels[i],
        sample_values: data.sample_values[i]
      });
    }
    
    arr.sort(function(a, b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    });

    arr = arr.slice(0, 10);

    console.log(data);
    console.log(arr);

    // Build a Pie Chart
    var trace1 = [{
      values: arr.map(row => row.sample_values),
      labels: arr.map(row => row.otu_ids),
      type: "pie",
      hovertext: arr.map(row => row.otu_labels),
      hoverinfo: "hovertext"

    }]

    var layoutPie = {
        title: "Top 10 Microbe Counts"
    }
    
    console.log(arr.map(row => row.otu_ids))

    Plotly.plot("pie", trace1, layoutPie)

    //Build a Bubble Chart using the sample data
    var trace2 = [{
      x: data.otu_ids,
      y: data.sample_values,
      mode: "markers",
      marker: {
        size: data.sample_values,
        color: data.otu_ids,
        autocolorscale: false
      },
      text: data.otu_labels,
      backgroundColor: data.otu_ids
    }]
    
    
    var layoutBubble = {
      title: "Sample",
      xaxis: {
        title: "OTU ID"
      },
      yaxis: {
        title:"Microbe Count"
      }
    };
    
    Plotly.newPlot("bubble", trace2, layoutBubble);

  });
    
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
