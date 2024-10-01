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
    },
    physics: {
        enabled: false
    }
};

const networkContainer = document.getElementById('network');
const myNetwork = new vis.Network(networkContainer, data, options);

let firstSelectedNode = null;

const missionData = [];
const operationalData = [];
const missionHierarchy = [];
const missionOperationalData = [];

// Toggle physics
let physicsEnabled = false;
document.getElementById('togglePhysics').addEventListener('click', () => {
    physicsEnabled = !physicsEnabled;
    myNetwork.setOptions({ physics: { enabled: physicsEnabled } });
});

// Adding missions to the network
document.getElementById('addMission').addEventListener('click', () => {
    const missionName = document.getElementById('missionName').value;
    if (missionName) {
        const uuid = generateUUID();
        missionData.push({ UUID: uuid, Name: missionName, Description: "" });
        data.nodes.add({ id: uuid, label: missionName, color: '#a79aff', group: 'Mission' });
        document.getElementById('missionName').value = '';
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
    } else {
        // Randomly generate a data name (random string of letters between 3 and 4 characters in length)
        const uuid = generateUUID();
        const dataName = Math.random().toString(36).substring(2, 6);
        operationalData.push({ UUID: uuid, Name: dataName, Description: "" });
        data.nodes.add({ id: uuid, label: dataName, color: '#ffffa8', group: 'OperationalData' });
        document.getElementById('dataName').value = '';
    }
});


// Handle node selection for creating connections
myNetwork.on("selectNode", function (params) {
    if (params.event.srcEvent.shiftKey) {  // Check if shift key is pressed
        if (firstSelectedNode === null) {
            firstSelectedNode = params.nodes[0];
        } else if (firstSelectedNode !== params.nodes[0]) { // Check if the same node is not selected twice
            const fromNode = data.nodes.get(firstSelectedNode);
            const toNode = data.nodes.get(params.nodes[0]);

            // Ensure relationships are either Mission to Mission or Operational Data to Mission
            if (fromNode.group === 'Mission' && toNode.group === 'Mission') {
                // Check for existing relationship
                const existingRelationship = missionHierarchy.find(mh => mh.ChildMission === fromNode.id && mh.ParentMission === toNode.id);
                if (!existingRelationship) {
                    missionHierarchy.push({ ParentMission: toNode.id, ChildMission: fromNode.id });
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
    // Display node details in the information viewer panel
    const nodeId = params.nodes[0];
    const node = data.nodes.get(nodeId);
    let nodeDetails = "";

    // Display node details based on the type of node
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
    // Clear selection
    if (params.nodes.length === 0) {
        firstSelectedNode = null;
    }
});


// Import JSON
document.getElementById('jsonInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    // Show loading overlay
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    reader.onload = function (e) {
        console.time('Total JSON processing');

        console.time('JSON parsing');
        const importedData = JSON.parse(e.target.result);
        console.timeEnd('JSON parsing');

        console.time('Clear current data');
        missionData.length = 0;
        operationalData.length = 0;
        missionHierarchy.length = 0;
        missionOperationalData.length = 0;
        data.nodes.clear();
        data.edges.clear();
        console.timeEnd('Clear current data');

        console.time('Load Missions and Operational Data');
        console.time('Load Missions and Operational Data');
        const newNodes = [];
        const newEdges = [];

        if (importedData.Mission) {
            missionData.push(...importedData.Mission);
            newNodes.push(...importedData.Mission.map(item => ({ 
                id: item.UUID, 
                label: item.Name, 
                color: '#a79aff', 
                group: 'Mission' 
            })));

            importedData.Mission.forEach(item => {
                // If the item Name is "Sensor Deployment"
                if (item.Name === "1") {
                    console.log(item);
                }
                if (item.Children) {

                    item.Children.forEach(child => {
                        // If the child Name is "Sensor Deployment"
                        if (item.Name === "1") {
                            console.log(child);
                        }
                        missionHierarchy.push({ ParentMission: item.UUID, ChildMission: child });
                        newEdges.push({ from: child, to: item.UUID, arrows: 'to' });
                    });
                }
            });
        }

        if (importedData.OperationalData) {
            operationalData.push(...importedData.OperationalData);
            newNodes.push(...importedData.OperationalData.map(item => ({ 
                id: item.UUID, 
                label: item.Name, 
                color: '#ffffa8', 
                group: 'OperationalData' 
            })));
        }

        data.nodes.add(newNodes);
        data.edges.add(newEdges);

        console.timeEnd('Load Missions and Operational Data');
        console.timeEnd('Load Mission Hierarchy');

        console.time('Load Mission Operational Data');
        if (importedData.MissionData) {
            const newEdges = [];
            const newMissionOperationalData = [];
            importedData.MissionData.forEach(item => {
                newMissionOperationalData.push(item);
                newEdges.push({ from: item.OperationalData_ID, to: item.Mission_ID, arrows: 'to' });
            });
            missionOperationalData.push(...newMissionOperationalData);
            data.edges.add(newEdges);
        }
        console.timeEnd('Load Mission Operational Data');

        console.timeEnd('Total JSON processing');
        
        // Hide loading overlay
        document.getElementById('loading-overlay').classList.add('hidden');
    };
    reader.readAsText(file);
});

// Save JSON
document.getElementById('saveData').addEventListener('click', () => {
    // Show loading overlay
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    const formattedData = {
        Mission: missionData,
        OperationalData: operationalData,
        MissionHierarchy: missionHierarchy,
        MissionData: missionOperationalData
    };

    // Save data to a JSON file
    fs.writeFile('networkData.json', JSON.stringify(formattedData, null, 2), (err) => {
        // Hide loading overlay
        document.getElementById('loading-overlay').classList.add('hidden');
        
        if (err) {
            console.error('Error saving file:', err);
        } else {
            console.log('File saved successfully');
        }
    });
});

// Send data to server for backend processing
function sendToServer(url) {
    // Show loading overlay
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    // Format data for sending to server
    const formattedData = {
        Mission: missionData,
        OperationalData: operationalData,
        MissionHierarchy: missionHierarchy,
        MissionData: missionOperationalData
    };

    // Format the request packages
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
    };

    // Hit the endpoint for the respective analysis
    fetch(url, options)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok ' + res.statusText);
            }
            return res.json();
        })
        .then(res => {
            console.log(res);
            // Hide loading overlay
            document.getElementById('loading-overlay').classList.add('hidden');
        })
        .catch(err => {
            console.error('error:' + err);
            // Hide loading overlay
            document.getElementById('loading-overlay').classList.add('hidden');
        });
}

// Attach event listeners to buttons and specify the respective endpoint URL
document.getElementById('bottomUpButton').addEventListener('click', () => sendToServer('http://127.0.0.1:6969/bottom_up_process'));
document.getElementById('bfsButton').addEventListener('click', () => sendToServer('http://127.0.0.1:6969/bfs_dfs_analysis'));
document.getElementById('pageRankButton').addEventListener('click', () => sendToServer('http://127.0.0.1:6969/pagerank_analysis'));
