// Create a network
var container = document.getElementById('mynetwork');

// Define nodes and edges
var nodesDataset = new vis.DataSet([
    {id: 1, label: 'Main Mission', color: '#f00'},
    {id: 2, label: 'Sub-mission A', color: '#0f0'},
    {id: 3, label: 'Sub-mission B', color: '#ADD8E6'},
    {id: 4, label: 'Sub-mission Aa', color: '#0f0'},
    {id: 5, label: 'Sub-mission Ab', color: '#0f0'},
    {id: 6, label: 'Sub-mission Ba', color: '#ADD8E6'},
    {id: 7, label: 'Sub-mission Bb', color: '#ADD8E6'},
    {id: 8, label: 'Data 1', shape: 'box', color: '#ccc'},
    {id: 9, label: 'Data 2', shape: 'box', color: '#ccc'},
    {id: 10, label: 'Data 3', shape: 'box', color: '#ccc'},
    {id: 11, label: 'Data 4', shape: 'box', color: '#ccc'},
    {id: 12, label: 'Data 5', shape: 'box', color: '#ccc'},

]);

var edgesDataset = new vis.DataSet([
    {from: 1, to: 2},
    {from: 1, to: 3},
    {from: 2, to: 4},
    {from: 2, to: 5},
    {from: 3, to: 6},
    {from: 3, to: 7},
    {from: 4, to: 8},
    {from: 4, to: 9},
    {from: 5, to: 9},
    {from: 5, to: 10},
    {from: 6, to: 10},
    {from: 6, to: 11},
    {from: 7, to: 11},
    {from: 7, to: 12},
    {from: 7, to: 8},
    
]);

// Create a network
var data = {
    nodes: nodesDataset,
    edges: edgesDataset
};

var options = {};
var network = new vis.Network(container, data, options);

// Function to calculate criticality
function calculateCriticality(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) {
        return 0; // Prevent circular dependencies
    }
    visited.add(nodeId);

    let connectedNodes = network.getConnectedNodes(nodeId, 'to');
    if (connectedNodes.length === 0) {
        return 1; // Assuming leaf nodes have a criticality of 1
    }
    let totalCriticality = 0;
    connectedNodes.forEach(childId => {
        let childConnectedNodes = network.getConnectedNodes(childId, 'from');
        let contributionFactor = childConnectedNodes.includes(nodeId) ? 1 / childConnectedNodes.length : 0;
        totalCriticality += calculateCriticality(childId, new Set(visited)) * contributionFactor;
    });
    return totalCriticality;
}

// Calculate criticality for each data node
var criticalityValues = {};
nodesDataset.forEach(node => {
    if (node.shape === 'box') { // Only for data nodes
        criticalityValues[node.id] = calculateCriticality(node.id);
    }
});

// Normalize the criticality values to a range of 1-4
var maxCriticality = Math.max(...Object.values(criticalityValues));
var normalizedCriticality = {};

for (var nodeId in criticalityValues) {
    var criticality = criticalityValues[nodeId];
    normalizedCriticality[nodeId] = 1 + 3 * (criticality / maxCriticality);
}

// Display the normalized criticality values
var resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "<h3>Criticality Values:</h3><ul>";
for (var nodeId in normalizedCriticality) {
    var node = nodesDataset.get(nodeId);
    resultsDiv.innerHTML += `<li>${node.label}: ${normalizedCriticality[nodeId].toFixed(2)}</li>`;
}
resultsDiv.innerHTML += "</ul>";
