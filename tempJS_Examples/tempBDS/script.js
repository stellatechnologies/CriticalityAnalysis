// Create a network
var container = document.getElementById('mynetwork');

// Define nodes and edges
var nodesDataset = new vis.DataSet([
    {id: 1, label: 'Main Mission', color: '#f00'},
    {id: 2, label: 'Sub-mission A', color: '#0f0'},
    {id: 3, label: 'Sub-mission B', color: '#00f'},
    {id: 4, label: 'Data 1', shape: 'box', color: '#ccc'},
    {id: 5, label: 'Data 2', shape: 'box', color: '#ccc'}
]);

var edgesDataset = new vis.DataSet([
    {from: 1, to: 2},
    {from: 1, to: 3},
    {from: 2, to: 4},
    {from: 3, to: 4},
    {from: 2, to: 5}
]);

// Create a network
var data = {
    nodes: nodesDataset,
    edges: edgesDataset
};

var options = {};

var network = new vis.Network(container, data, options);

// Depth and Breadth Analysis
function calculateDepth(nodeId, depth = 0) {
    var connectedNodes = network.getConnectedNodes(nodeId, 'from');
    if (connectedNodes.length === 0) return depth;
    var depths = connectedNodes.map(connectedId => calculateDepth(connectedId, depth + 1));
    return Math.max(...depths);
}

function calculateBreadth(nodeId) {
    return network.getConnectedNodes(nodeId, 'from').length;
}

var criticalityScores = {};

nodesDataset.get().forEach(node => {
    if (node.shape === 'box') { // only for data nodes
        var depth = calculateDepth(node.id);
        var breadth = calculateBreadth(node.id);
        criticalityScores[node.id] = breadth / depth;
    }
});

// Normalize the scores to a range of 1-4
var maxScore = Math.max(...Object.values(criticalityScores));
var minScore = Math.min(...Object.values(criticalityScores));
var normalizedScores = {};

for (var nodeId in criticalityScores) {
    var score = criticalityScores[nodeId];
    normalizedScores[nodeId] = 1 + 3 * (score - minScore) / (maxScore - minScore);
}

// Display the normalized scores
var resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "<h3>Criticality Scores:</h3><ul>";
for (var nodeId in normalizedScores) {
    var node = nodesDataset.get(nodeId);
    resultsDiv.innerHTML += `<li>${node.label}: ${normalizedScores[nodeId].toFixed(2)}</li>`;
}
resultsDiv.innerHTML += "</ul>";
