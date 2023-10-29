const vis = require('vis-network/standalone/umd/vis-network.min.js');
const fs = require('fs');

// Simple UUID generator
function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const data = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};

const options = {
    edges: {
        color: 'black',
        arrows: {
            to: { enabled: true, scaleFactor: 1, type: 'arrow' }
        }
    }
};

const networkContainer = document.getElementById('network');
const myNetwork = new vis.Network(networkContainer, data, options);

let firstSelectedNode = null;

// Function to print nodes and edges
function printData() {
    document.getElementById('dataOutput').innerText = 'Nodes:\n' + JSON.stringify(data.nodes.get(), null, 2) +
                                                      '\n\nRelationships:\n' + JSON.stringify(data.edges.get(), null, 2);
}

// Adding nodes
document.getElementById('addMission').addEventListener('click', () => {
    const nodeName = document.getElementById('missionName').value;
    if (nodeName) {
        data.nodes.add({ id: generateUUID(), label: nodeName, color: '#a79aff' }); // Light purple color
        document.getElementById('missionName').value = '';
        printData(); // Print updated data
    }
});

document.getElementById('addData').addEventListener('click', () => {
    const nodeName = document.getElementById('dataName').value;
    if (nodeName) {
        data.nodes.add({ id: generateUUID(), label: nodeName, color: '#ffffa8' }); // Light yellow color
        document.getElementById('dataName').value = '';
        printData(); // Print updated data
    }
});

// Handle node selection for creating connections
myNetwork.on("selectNode", function (params) {
    if (firstSelectedNode === null) {
        firstSelectedNode = params.nodes[0];
    } else if (firstSelectedNode !== params.nodes[0]) {
        data.edges.add({ from: firstSelectedNode, to: params.nodes[0], arrows: 'to' });
        firstSelectedNode = null;
        printData(); // Print updated data
    }
});

// Clear selection when clicking on empty space
myNetwork.on("click", function (params) {
    if (params.nodes.length === 0) {
        firstSelectedNode = null;
    }
});

// Import JSON
document.getElementById('jsonInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const importedData = JSON.parse(e.target.result);
        data.nodes.clear();
        data.edges.clear();
        data.nodes.add(importedData.nodes);
        data.edges.add(importedData.edges);
        printData(); // Print updated data
    };
    reader.readAsText(file);
});

// Save JSON
document.getElementById('saveData').addEventListener('click', () => {
    const dataToSave = {
        nodes: data.nodes.get(),
        edges: data.edges.get()
    };
    fs.writeFileSync('networkData.json', JSON.stringify(dataToSave, null, 2));
});


document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete') {
        const selectedNodes = myNetwork.getSelectedNodes();
        const selectedEdges = myNetwork.getSelectedEdges();

        if (selectedNodes.length > 0) {
            data.nodes.remove(selectedNodes);
        }

        if (selectedEdges.length > 0) {
            data.edges.remove(selectedEdges);
        }

        printData(); // Print updated data 
    }
});