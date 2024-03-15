// Create a network
var container = document.getElementById('mynetwork');

// Define nodes and edges
var nodesDataset = new vis.DataSet([
    {id: 1, label: 'Main Mission', color: '#f00'},
    {id: 2, label: 'Sub-mission A', color: '#0f0'},
    {id: 3, label: 'Sub-mission B', color: '#0f0'},
    {id: 6, label: 'Sub-mission C', color: '#0f0'},
    {id: 4, label: 'Data 1', shape: 'box', color: '#ccc'},
    {id: 5, label: 'Data 2', shape: 'box', color: '#ccc'}
]);

var edgesDataset = new vis.DataSet([
    {from: 1, to: 2},
    {from: 1, to: 3},
    {from: 1, to: 6},
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

// PageRank logic
var damping = 0.85;
var N = nodesDataset.length;

// Initialize PageRank values
nodesDataset.forEach(node => {
    node.pageRank = 1 / N;
    nodesDataset.update(node);
});

// Iterative PageRank calculation (for simplicity, we run it for 10 iterations)
for (let i = 0; i < 10; i++) {
    var newPageRanks = {};

    nodesDataset.get().forEach(node => {
        newPageRanks[node.id] = (1 - damping) / N;
    });

    edgesDataset.get().forEach(edge => {
        var fromNode = nodesDataset.get(edge.from);
        var outgoingEdges = edgesDataset.get({
            filter: function(item) {
                return item.from === fromNode.id;
            }
        });
        var distributedPageRank = fromNode.pageRank * damping / outgoingEdges.length;
        newPageRanks[edge.to] += distributedPageRank;
    });

    nodesDataset.get().forEach(node => {
        node.pageRank = newPageRanks[node.id];
        nodesDataset.update(node);
    });
}

function adjustScoreForPathLength(score, pathLength) {
    return score / pathLength;
}

function findShortestPath(startId, endId) {
    var visited = {};
    var queue = [[startId]];
    
    while (queue.length > 0) {
        var path = queue.shift();
        var lastNode = path[path.length - 1];
        
        if (lastNode === endId) {
            return path;
        }
        
        visited[lastNode] = true;
        
        var neighbors = network.getConnectedNodes(lastNode, 'to');
        
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            if (!visited[neighbor]) {
                var newPath = [...path, neighbor];
                queue.push(newPath);
            }
        }
    }
    
    return [];
}


// ... [Previous Code for Setting Up Network and PageRank Calculation] ...

function getAllDependencies(nodeId) {
    var directDependencies = network.getConnectedNodes(nodeId, 'to');
    var allDependencies = [...directDependencies];

    directDependencies.forEach(depNodeId => {
        allDependencies = allDependencies.concat(getAllDependencies(depNodeId));
    });

    return allDependencies;
}

// Choose the mission of interest
var missionOfInterestId = 1; // e.g., Main Mission

// Calculate adjusted scores for data nodes in the dependencies
var dependencies = getAllDependencies(missionOfInterestId);
var uniqueDependencies = Array.from(new Set(dependencies)); // Remove duplicates

var adjustedScores = {};
var totalAdjustedScore = 0;

uniqueDependencies.forEach(nodeId => {
    var node = nodesDataset.get(nodeId);
    if (node.shape === 'box') { 
        var pathLength = findShortestPath(missionOfInterestId, nodeId).length;

        adjustedScores[nodeId] = adjustScoreForPathLength(node.pageRank, pathLength);
        totalAdjustedScore += adjustedScores[nodeId];
    }
});

// Normalize the adjusted scores to lie in [0,1]
for (var nodeId in adjustedScores) {
    adjustedScores[nodeId] /= totalAdjustedScore;
}

console.log(adjustedScores);

// Print the normalized importance scores for data types
var resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "<h3>Importance Scores for Main Mission:</h3><ul>";
for (var nodeId in adjustedScores) {
    var node = nodesDataset.get(nodeId);
    resultsDiv.innerHTML += `<li>${node.label}: ${adjustedScores[nodeId].toFixed(4)}</li>`;
}
resultsDiv.innerHTML += "</ul>";
