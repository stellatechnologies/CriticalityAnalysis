const vis = require('vis-network/standalone/umd/vis-network.min.js');
const fs = require('fs');

// Simple UUID generator
function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
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

const missionData = [];
const operationalData = [];
const missionHierarchy = [];
const missionOperationalData = [];


// Function to find all leaf mission nodes starting from a given node
function listLeafMissionNodes(nodeId) {
    const leafNodes = [];
    const missionNodeIds = missionHierarchy.map(mh => mh.ParentMission);

    const traverse = (currentNodeId) => {
        const childMissions = missionHierarchy.filter(mh => mh.ChildMission === currentNodeId).map(mh => mh.ParentMission);

        if (!childMissions.some(childId => missionNodeIds.includes(childId))) {
            leafNodes.push(currentNodeId);
        } else {
            childMissions.forEach(traverse);
        }
    };

    traverse(nodeId);

    // console.log('Leaf Nodes:', leafNodes); 

    const leafNodeDetails = leafNodes.map(nodeId => {
        const missionDetail = missionData.find(m => m.UUID === nodeId);
        return missionDetail ? missionDetail.Name : "";
    });

    

    // Get the Operational Data connected to the leaf nodes
    const leafOperationalData = [];
    leafNodes.forEach(nodeId => {
        const operationalDataForMission = missionOperationalData.filter(mo => mo.Mission === nodeId).map(mo => mo.OperationalData);
        leafOperationalData.push(...operationalDataForMission);
    });

    // Get the Operational Data details
    const leafOperationalDataDetails = leafOperationalData.map(nodeId => {
        const operationalDetail = operationalData.find(d => d.UUID === nodeId);
        return operationalDetail ? operationalDetail.Name : "";
    });

    // Get the percentage for each operational data for the number of leaf nodes
    let opDataPercentages = {};
    leafOperationalData.forEach(nodeId => {
        if (opDataPercentages[nodeId]) {
            opDataPercentages[nodeId] += 1;
        } else {
            opDataPercentages[nodeId] = 1;
        }
    }
    );

    console.log(opDataPercentages);



    // Calculate the percentage of operational data for the number of leaf nodes  opDataPercentages[nodeId] / leafNodes.length
    const leafOperationalDataPercentage = Object.keys(opDataPercentages).map(key => {
        return { [key]: (opDataPercentages[key] / leafNodes.length) * 100 };
    });

    // console.log(leafOperationalDataPercentage);


    // Replace the operational data UUIDs with the operational data names
    const leafOperationalDataPercentageDetails = leafOperationalDataPercentage.map(item => {
        const key = Object.keys(item)[0];
        const operationalDetail = operationalData.find(d => d.UUID === key);
        return operationalDetail ? { [operationalDetail.Name]: item[key] } : "";
    });

    console.log(leafOperationalDataPercentageDetails);




    // Show the leaf node details in the node details section
    document.getElementById('nodeDetails').innerHTML = `<p>Leaf Missions: ${leafNodes.length}</p>
                                                            <p>Operational Data: ${leafOperationalData.length}</p>`;

    // Print the Operational Data percentages in the node details section in a pretty format
    let opDataPercentagesPretty = "";
    leafOperationalDataPercentageDetails.forEach(item => {
        const key = Object.keys(item)[0];
        opDataPercentagesPretty += `<p>${key}: ${item[key].toFixed(2)}%</p>`;
    });

    document.getElementById('nodeDetails').innerHTML += opDataPercentagesPretty;
    

}

// Function to print nodes and edges 
function printData() {
    const formattedData = {
        Mission: missionData,
        OperationalData: operationalData,
        MissionHierarchy: missionHierarchy,
        Mission_OperationalData: missionOperationalData
    };
    // document.getElementById('dataOutput').innerText = JSON.stringify(formattedData, null, 2);
}

// Adding missions
document.getElementById('addMission').addEventListener('click', () => {
    const missionName = document.getElementById('missionName').value;
    if (missionName) {
        const uuid = generateUUID();
        missionData.push({ UUID: uuid, Name: missionName, Description: "" });
        data.nodes.add({ id: uuid, label: missionName, color: '#a79aff', group: 'Mission' });
        document.getElementById('missionName').value = '';
        printData();
    } else {
        // Randomly generate a mission name (random number between 100 and 999) as string
        const uuid = generateUUID();
        const missionName = Math.floor(Math.random() * (999 - 100 + 1) + 100).toString();
        missionData.push({ UUID: uuid, Name: missionName, Description: "" });
        data.nodes.add({ id: uuid, label: missionName, color: '#a79aff', group: 'Mission' });
        document.getElementById('missionName').value = '';
    }
});

// Adding operational data
document.getElementById('addData').addEventListener('click', () => {
    const dataName = document.getElementById('dataName').value;
    if (dataName) {
        const uuid = generateUUID();
        operationalData.push({ UUID: uuid, Name: dataName, Description: "" });
        data.nodes.add({ id: uuid, label: dataName, color: '#ffffa8', group: 'OperationalData' });
        document.getElementById('dataName').value = '';
        // printData();
    } else {
        // Randomly generate a data name (random string of letters between 3 and 4 characters in length)
        const uuid = generateUUID();
        const dataName = Math.random().toString(36).substring(2, 6);
        operationalData.push({ UUID: uuid, Name: dataName, Description: "" });
        data.nodes.add({ id: uuid, label: dataName, color: '#ffffa8', group: 'OperationalData' });

        document.getElementById('dataName').value = '';

    }
});



function highlightConnectedNodes(nodeId, colorMission, colorOperationalData) {
    // Use a Set to keep track of nodes that have already been processed
    const processed = new Set();
    // Use a stack for iterative processing
    const stack = [nodeId];

    while (stack.length > 0) {
        const currentNode = stack.pop();

        // Skip if the node has already been processed
        if (processed.has(currentNode)) {
            continue;
        }

        // Mark the node as processed
        processed.add(currentNode);

        // Find parent missions connected to the current node
        const parentMissions = missionHierarchy.filter(mh => mh.ChildMission === currentNode);
        // Add parent missions to the stack for processing
        parentMissions.forEach(mh => {
            stack.push(mh.ParentMission);
        });

        // Find operational data connected to the current node
        const operationalToMission = missionOperationalData.filter(mo => mo.Mission === currentNode);
        // Add operational data to the stack for processing
        operationalToMission.forEach(mo => {
            stack.push(mo.OperationalData);
        });
    }

    // Batch update: highlight all processed nodes at once
    const updates = Array.from(processed).map(node => {
        // Check if the node belongs to OperationalData or Mission
        const color = operationalData.some(od => od.UUID === node) ? colorOperationalData : colorMission;
        return { id: node, color: color };
    });
    data.nodes.update(updates);
}







// Handle node selection for creating connections
myNetwork.on("selectNode", function (params) {
    if (params.event.srcEvent.shiftKey) {  // Check if shift key is pressed
        if (firstSelectedNode === null) {
            firstSelectedNode = params.nodes[0];
        } else if (firstSelectedNode !== params.nodes[0]) {
            const fromNode = data.nodes.get(firstSelectedNode);
            const toNode = data.nodes.get(params.nodes[0]);

            // Ensure relationships are either Mission to Mission or Operational Data to Mission
            if (fromNode.group === 'Mission' && toNode.group === 'Mission') {
                // Check for existing relationship
                const existingRelationship = missionHierarchy.find(mh => mh.ParentMission === fromNode.id && mh.ChildMission === toNode.id);
                if (!existingRelationship) {
                    missionHierarchy.push({ ParentMission: fromNode.id, ChildMission: toNode.id });
                    data.edges.add({ from: firstSelectedNode, to: params.nodes[0], arrows: 'to' });
                }
            } else if (fromNode.group === 'OperationalData' && toNode.group === 'Mission') {
                // Check for existing relationship
                const existingRelationship = missionOperationalData.find(mo => mo.OperationalData === fromNode.id && mo.Mission === toNode.id);
                if (!existingRelationship) {
                    missionOperationalData.push({ OperationalData: fromNode.id, Mission: toNode.id });
                    data.edges.add({ from: firstSelectedNode, to: params.nodes[0], arrows: 'to' });
                }
            }

            firstSelectedNode = null;
            printData();
        }
    } else {
        // If neither shift nor 'i' key is pressed, clear the selection and reset colors
        firstSelectedNode = null;
        // Reset colors of all nodes to their original colors
        data.nodes.forEach(node => {
            let originalColor = '#a79aff'; // Default color for missions
            if (node.group === 'OperationalData') {
                originalColor = '#ffffa8'; // Default color for operational data
            }
            data.nodes.update({ id: node.id, color: originalColor });
        });
    }
});




// Display node details in the information viewer panel
myNetwork.on("selectNode", function (params) {
    const nodeId = params.nodes[0];
    const node = data.nodes.get(nodeId);
    let nodeDetails = "";

    if (node.group === 'Mission') {
        const missionDetail = missionData.find(m => m.UUID === nodeId);
        nodeDetails = `<p><strong>Name:</strong> ${missionDetail.Name}</p>
                       <p><strong>Description:</strong> ${missionDetail.Description}</p>`;
    } else if (node.group === 'OperationalData') {
        const operationalDetail = operationalData.find(d => d.UUID === nodeId);
        nodeDetails = `<p><strong>Name:</strong> ${operationalDetail.Name}</p>
                       <p><strong>Description:</strong> ${operationalDetail.Description}</p>`;
    }

    document.getElementById('nodeDetails').innerHTML = nodeDetails;
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

        // Clear current data
        missionData.length = 0;
        operationalData.length = 0;
        missionHierarchy.length = 0;
        missionOperationalData.length = 0;
        data.nodes.clear();
        data.edges.clear();

        // Load Missions and Operational Data
        if (importedData.Mission) {
            importedData.Mission.forEach(item => {
                missionData.push(item);
                data.nodes.add({ id: item.UUID, label: item.Name, color: '#a79aff', group: 'Mission' });
            });
        }
        if (importedData.OperationalData) {
            importedData.OperationalData.forEach(item => {
                operationalData.push(item);
                data.nodes.add({ id: item.UUID, label: item.Name, color: '#ffffa8', group: 'OperationalData' });
            });
        }

        // Load Mission Hierarchy
        if (importedData.MissionHierarchy) {
            importedData.MissionHierarchy.forEach(item => {
                missionHierarchy.push(item);
                data.edges.add({ from: item.ParentMission, to: item.ChildMission, arrows: 'to' });
            });
        }

        // Load Mission Operational Data
        if (importedData.Mission_OperationalData) {
            importedData.Mission_OperationalData.forEach(item => {
                missionOperationalData.push(item);
                data.edges.add({ from: item.OperationalData, to: item.Mission, arrows: 'to' });
            });
        }

        printData(); // Print updated data
    };
    reader.readAsText(file);
});

// Save JSON
document.getElementById('saveData').addEventListener('click', () => {
    const formattedData = {
        Mission: missionData,
        OperationalData: operationalData,
        MissionHierarchy: missionHierarchy,
        Mission_OperationalData: missionOperationalData
    };
    fs.writeFileSync('networkData.json', JSON.stringify(formattedData, null, 2));
});


document.addEventListener('keydown', function (event) {
    if (event.key === 'i' || event.key === 'I') {
        const selectedNodes = myNetwork.getSelectedNodes();
        if (selectedNodes.length > 0) {
            const selectedNode = data.nodes.get(selectedNodes[0]);
            if (selectedNode.group === 'Mission') {
                listLeafMissionNodes(selectedNode.id);
            }
        }
    } else if (event.key === 'h' || event.key === 'H') { // Use 'h' key for highlighting
        const selectedNodes = myNetwork.getSelectedNodes();
        if (selectedNodes.length > 0) {
            const selectedNode = data.nodes.get(selectedNodes[0]);
            if (selectedNode.group === 'Mission') {
                highlightConnectedNodes(selectedNode.id, '#ffcc99', '#ccffcc');
            }
        }
    }
    // Rest of the keydown event handling...
});
