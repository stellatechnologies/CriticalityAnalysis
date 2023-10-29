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

// Function to print nodes and edges
function printData() {
    const formattedData = {
        Mission: missionData,
        OperationalData: operationalData,
        MissionHierarchy: missionHierarchy,
        Mission_OperationalData: missionOperationalData
    };
    document.getElementById('dataOutput').innerText = JSON.stringify(formattedData, null, 2);
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
        printData();
    }
});

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
        // If shift key is not pressed, clear the selection
        firstSelectedNode = null;
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
    if (event.key === 'Delete') {
        const selectedNodes = myNetwork.getSelectedNodes();
        const selectedEdges = myNetwork.getSelectedEdges();

        if (selectedNodes.length > 0) {
            // Remove nodes from data
            selectedNodes.forEach(nodeId => {
                const node = data.nodes.get(nodeId);
                if (node.group === 'Mission') {
                    const missionIndex = missionData.findIndex(m => m.UUID === nodeId);
                    if (missionIndex > -1) {
                        missionData.splice(missionIndex, 1);
                    }

                    // Remove associated Mission Hierarchy relationships
                    const associatedHierarchy = missionHierarchy.filter(mh => mh.ParentMission === nodeId || mh.ChildMission === nodeId);
                    associatedHierarchy.forEach(mh => {
                        const index = missionHierarchy.indexOf(mh);
                        if (index > -1) {
                            missionHierarchy.splice(index, 1);
                        }
                    });

                    // Remove associated Mission Operational Data relationships
                    const associatedOperational = missionOperationalData.filter(mo => mo.Mission === nodeId);
                    associatedOperational.forEach(mo => {
                        const index = missionOperationalData.indexOf(mo);
                        if (index > -1) {
                            missionOperationalData.splice(index, 1);
                        }
                    });
                } else if (node.group === 'OperationalData') {
                    const dataIndex = operationalData.findIndex(d => d.UUID === nodeId);
                    if (dataIndex > -1) {
                        operationalData.splice(dataIndex, 1);
                    }

                    // Remove associated Mission Operational Data relationships
                    const associatedOperational = missionOperationalData.filter(mo => mo.OperationalData === nodeId);
                    associatedOperational.forEach(mo => {
                        const index = missionOperationalData.indexOf(mo);
                        if (index > -1) {
                            missionOperationalData.splice(index, 1);
                        }
                    });
                }
            });

            data.nodes.remove(selectedNodes);
        }

        if (selectedEdges.length > 0) {
            // Remove edges from data and relationships
            selectedEdges.forEach(edgeId => {
                const edge = data.edges.get(edgeId);
                const missionHierarchyIndex = missionHierarchy.findIndex(mh => mh.ParentMission === edge.from && mh.ChildMission === edge.to);
                if (missionHierarchyIndex > -1) {
                    missionHierarchy.splice(missionHierarchyIndex, 1);
                }

                const missionOperationalDataIndex = missionOperationalData.findIndex(mo => mo.Mission === edge.from && mo.OperationalData === edge.to);
                if (missionOperationalDataIndex > -1) {
                    missionOperationalData.splice(missionOperationalDataIndex, 1);
                }
            });

            data.edges.remove(selectedEdges);
        }

        printData(); // Print updated data
    }
});
