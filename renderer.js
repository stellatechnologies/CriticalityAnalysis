document.addEventListener('DOMContentLoaded', () => {
    const { DataSet, Network } = vis;

    const nodes = new DataSet([
        // Missions
        { id: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', label: '1', shape: 'circle' },
        { id: '490BB52E-22D7-4865-4C9C-80E04BE7C595', label: '1.1', shape: 'circle' },
        { id: '9101D522-9BBC-03A8-54D6-87AC68AE0202', label: '1.1.1', shape: 'circle' },
        { id: '88DB78D2-1FA5-6953-E526-16444F720862', label: '1.1.1.1', shape: 'circle' },
        { id: '647E649D-8CE2-D8A4-8315-C85D26B0E837', label: '1.2', shape: 'circle' },
        { id: '48397BAB-CD9E-9D9D-1EEA-606AC566143C', label: '1.1.2', shape: 'circle' },
        { id: '972F19A6-D477-F7AA-6062-A1E9D58EE213', label: '1.1.1.2', shape: 'circle' },
        { id: '791265B4-4C3E-7E0E-4C48-007561900FB1', label: '1.3', shape: 'circle' },
        { id: 'A808A985-F1EA-8B20-1964-8FBA8250482C', label: '1.2.1', shape: 'circle' },
        { id: 'EE36BCA9-49FA-1DEA-8B3E-98025DAE08E1', label: '1.1.1.3', shape: 'circle' },
        { id: 'B79E60E3-68D8-FC3F-2B07-143F4AF830D8', label: '1.4', shape: 'circle' },
        { id: 'BED5F1E8-D1BB-EC99-71AC-FDF30AB62918', label: '1.2.2', shape: 'circle' },
        { id: '44B24F21-7A6F-FCC2-59B8-8C2E289427E1', label: '1.2.1.1', shape: 'circle' },
        { id: '883DDB9A-4F66-A7B1-68CB-47098680D416', label: '1.2.2.1', shape: 'circle' },
        { id: '958C0B48-533C-008E-4DED-8872B816B07F', label: '1.3.1', shape: 'circle' },
        { id: '61444CB4-6A61-114F-3243-BA425F430F47', label: '1.2.1.2', shape: 'circle' }, 
        { id: '622452DB-7BCF-8E8B-89C2-AB92A74421FB', label: '1.2.2.2', shape: 'circle' },
        { id: '51A7951B-99DE-8565-FF5D-079B5220BFE9', label: '1.3.1.1', shape: 'circle' },
        { id: 'E4602007-E47B-B1D7-91CA-F3D19062A306', label: '1.3.1.2', shape: 'circle' },
        { id: '8543311B-A563-EF3A-EE7C-CBEF6D7991EC', label: '1.3.2.1', shape: 'circle' },
        { id: '36056E9C-5393-5602-6BF0-5690F5C3B2A3', label: '1.3.2.2', shape: 'circle' },
        { id: '062F1038-4487-FC6C-7908-7C426C590124', label: '1.3.3.1', shape: 'circle' },
        { id: '3F1AEDF1-70A7-792D-5CFA-E2DF03996F49', label: '1.3.3.2', shape: 'circle' },
        { id: 'D1484FF4-37DE-5525-175A-70821DA73F8E', label: '1.3.2', shape: 'circle' },
        { id: '07DC27D2-23AA-5F0F-CFF9-77A8ADD045E2', label: '1.3.3', shape: 'circle' },
        { id: '2EF8D6B2-5478-212C-6CF5-04B47D864C98', label: '1.3.2.2.1', shape: 'circle' },
        { id: '797CD747-1426-6723-2A42-F4B39AC2BFBA', label: '1.3.2.2.2', shape: 'circle' },
        { id: '069DBD61-16E0-4909-EE68-CFC836182A7D', label: '1.1.1.2.1', shape: 'circle' },
        { id: '3F56F93F-59C7-8989-983B-51B291E644FC', label: '1.1.1.2.2', shape: 'circle' },
        { id: '3947E170-7DA9-C264-89B6-BF3779FEF5DB', label: '1.1.1.2.3', shape: 'circle' },
        { id: '34cc8ab7-8e42-4b6b-883e-9fc727562adc', label: '1.1.1.2.3.1', shape: 'circle' },
        { id: '142ebb0c-1fff-4f78-8d4e-a9d95c583671', label: '1.1.1.2.3.2', shape: 'circle' },
        { id: '75cf36b0-4dda-4372-a995-d0e6147883ff', label: '1.1.1.2.3.3', shape: 'circle' },

        // Data Nodes
        { id: 4, label: 'Data A', shape: 'diamond', color: { background: 'orange' } },
    ]);

    const edges = new DataSet([
        // Connections from Data to Missions
        { from: '490BB52E-22D7-4865-4C9C-80E04BE7C595', to: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', arrows: 'to' },
        { from: '9101D522-9BBC-03A8-54D6-87AC68AE0202', to: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', arrows: 'to' },
        { from: '88DB78D2-1FA5-6953-E526-16444F720862', to: '9101D522-9BBC-03A8-54D6-87AC68AE0202', arrows: 'to' },
        { from: '647E649D-8CE2-D8A4-8315-C85D26B0E837', to: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', arrows: 'to' },
        { from: '48397BAB-CD9E-9D9D-1EEA-606AC566143C', to: '490BB52E-22D7-4865-4C9C-80E04BE7C595', arrows: 'to' },
        { from: '972F19A6-D477-F7AA-6062-A1E9D58EE213', to: '9101D522-9BBC-03A8-54D6-87AC68AE0202', arrows: 'to' },
        { from: '791265B4-4C3E-7E0E-4C48-007561900FB1', to: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', arrows: 'to' },
        { from: 'A808A985-F1EA-8B20-1964-8FBA8250482C', to: '647E649D-8CE2-D8A4-8315-C85D26B0E837', arrows: 'to' },
        { from: 'EE36BCA9-49FA-1DEA-8B3E-98025DAE08E1', to: '9101D522-9BBC-03A8-54D6-87AC68AE0202', arrows: 'to' },
        { from: 'B79E60E3-68D8-FC3F-2B07-143F4AF830D8', to: '3471972E-82A7-E545-47D0-ABC7D7C9A5FF', arrows: 'to' },
        { from: 'BED5F1E8-D1BB-EC99-71AC-FDF30AB62918', to: '647E649D-8CE2-D8A4-8315-C85D26B0E837', arrows: 'to' },
        { from: '44B24F21-7A6F-FCC2-59B8-8C2E289427E1', to: 'A808A985-F1EA-8B20-1964-8FBA8250482C', arrows: 'to' },
        { from: '883DDB9A-4F66-A7B1-68CB-47098680D416', to: 'BED5F1E8-D1BB-EC99-71AC-FDF30AB62918', arrows: 'to' },
        { from: '958C0B48-533C-008E-4DED-8872B816B07F', to: '791265B4-4C3E-7E0E-4C48-007561900FB1', arrows: 'to' },
        { from: '61444CB4-6A61-114F-3243-BA425F430F47', to: 'A808A985-F1EA-8B20-1964-8FBA8250482C', arrows: 'to' },
        { from: '622452DB-7BCF-8E8B-89C2-AB92A74421FB', to: 'BED5F1E8-D1BB-EC99-71AC-FDF30AB62918', arrows: 'to' },
        { from: '51A7951B-99DE-8565-FF5D-079B5220BFE9', to: '958C0B48-533C-008E-4DED-8872B816B07F', arrows: 'to' },
        { from: 'E4602007-E47B-B1D7-91CA-F3D19062A306', to: '958C0B48-533C-008E-4DED-8872B816B07F', arrows: 'to' },
        { from: '8543311B-A563-EF3A-EE7C-CBEF6D7991EC', to: 'D1484FF4-37DE-5525-175A-70821DA73F8E', arrows: 'to' },
        { from: '36056E9C-5393-5602-6BF0-5690F5C3B2A3', to: 'D1484FF4-37DE-5525-175A-70821DA73F8E', arrows: 'to' },
        { from: '062F1038-4487-FC6C-7908-7C426C590124', to: '07DC27D2-23AA-5F0F-CFF9-77A8ADD045E2', arrows: 'to' },
        { from: '3F1AEDF1-70A7-792D-5CFA-E2DF03996F49', to: '07DC27D2-23AA-5F0F-CFF9-77A8ADD045E2', arrows: 'to' },
        { from: 'D1484FF4-37DE-5525-175A-70821DA73F8E', to: '791265B4-4C3E-7E0E-4C48-007561900FB1', arrows: 'to' },
        { from: '07DC27D2-23AA-5F0F-CFF9-77A8ADD045E2', to: '791265B4-4C3E-7E0E-4C48-007561900FB1', arrows: 'to' },
        { from: '2EF8D6B2-5478-212C-6CF5-04B47D864C98', to: '36056E9C-5393-5602-6BF0-5690F5C3B2A3', arrows: 'to' },
        { from: '797CD747-1426-6723-2A42-F4B39AC2BFBA', to: '36056E9C-5393-5602-6BF0-5690F5C3B2A3', arrows: 'to' },
        { from: '069DBD61-16E0-4909-EE68-CFC836182A7D', to: '972F19A6-D477-F7AA-6062-A1E9D58EE213', arrows: 'to' },
        { from: '3F56F93F-59C7-8989-983B-51B291E644FC', to: '972F19A6-D477-F7AA-6062-A1E9D58EE213', arrows: 'to' },
        { from: '3947E170-7DA9-C264-89B6-BF3779FEF5DB', to: '972F19A6-D477-F7AA-6062-A1E9D58EE213', arrows: 'to' },
        { from: '34cc8ab7-8e42-4b6b-883e-9fc727562adc', to: '3947E170-7DA9-C264-89B6-BF3779FEF5DB', arrows: 'to' },
        { from: '142ebb0c-1fff-4f78-8d4e-a9d95c583671', to: '3947E170-7DA9-C264-89B6-BF3779FEF5DB', arrows: 'to' },
        { from: '75cf36b0-4dda-4372-a995-d0e6147883ff', to: '3947E170-7DA9-C264-89B6-BF3779FEF5DB', arrows: 'to' },
    ]);

    const container = document.querySelector('.vis-network');
    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        edges: {
            smooth: {
                type: 'continuous'
            }
        },
        nodes: {
            borderWidth: 2,
            font: {
                size: 14
            }
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            },
            solver: 'barnesHut'
        }
    };

    const network = new Network(container, data, options);

    // Function to recursively highlight feeding nodes and edges
    function highlightFeedingNodesAndEdges(nodeId) {
        // Reset all nodes and edges to default color
        nodes.forEach(node => {
            nodes.update({ id: node.id, color: undefined });
        });
        edges.forEach(edge => {
            edges.update({ id: edge.id, color: undefined });
        });

        // Recursive function to highlight nodes and edges
        function highlightNodeAndEdges(nodeId) {
            // Highlight the node
            nodes.update({ id: nodeId, color: { background: 'green' } });

            // Find and highlight all incoming edges
            edges.forEach(edge => {
                if (edge.to === nodeId) {
                    edges.update({ id: edge.id, color: 'green' });
                    highlightNodeAndEdges(edge.from); // Recursively highlight feeding nodes
                }
            });
        }

        // Start the recursive highlighting
        highlightNodeAndEdges(nodeId);
    }

    // Bind click event to nodes
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            highlightFeedingNodesAndEdges(nodeId);
        }
    });

    // Function to reset colors
    function resetColors() {
        nodes.forEach((node) => {
            nodes.update({ id: node.id, color: { background: 'white', border: 'black' } });
        });
        edges.forEach((edge) => {
            edges.update({ id: edge.id, color: 'black' });
        });
    }


    network.on("selectNode", function (params) {
        if (params.nodes.length === 1) {
            const selectedNode = params.nodes[0];
    
            // Reset all nodes and edges to their default color first
            nodes.forEach(node => {
                nodes.update([{ id: node.id, color: { background: 'white', border: 'black' } }]);
            });
            edges.forEach(edge => {
                edges.update([{ id: edge.id, color: 'black', arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow' } } }]);
            });
    
            // Get connected edges and nodes to the selected node
            const connectedEdges = network.getConnectedEdges(selectedNode);
    
            connectedEdges.forEach(edgeId => {
                const edge = edges.get(edgeId);
    
                // Check if the edge is incoming
                if (edge.to === selectedNode) {
                    // Update the color of the edge
                    edges.update([{ id: edgeId, color: 'green', arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow', color: 'green' } } }]);
    
                    // Update the color of the node from which the edge is coming
                    nodes.update([{ id: edge.from, color: { background: 'green', border: 'green' } }]);
    
                    // Get children of the node from which the edge is coming
                    const childrenOfIncomingNode = network.getConnectedNodes(edge.from);
    
                    // Color the children nodes and their connecting edges
                    childrenOfIncomingNode.forEach(childNodeId => {
                        if (childNodeId !== selectedNode) { // Avoid coloring the selected node
                            nodes.update([{ id: childNodeId, color: { background: 'green', border: 'green' } }]);
                            const edgesToChild = network.getConnectedEdges(childNodeId);
                            edgesToChild.forEach(childEdgeId => {
                                const childEdge = edges.get(childEdgeId);
                                if (childEdge.from === childNodeId) { // Ensure only outgoing edges from the child are colored
                                    edges.update([{ id: childEdgeId, color: 'green', arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow', color: 'green' } } }]);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    

    network.on("deselectNode", function (params) {
        // Reset colors when node is deselected
        nodes.forEach(node => {
            nodes.update([{ id: node.id, color: { background: '#D2E5FF', border: '#2B7CE9' } }]);
        });
        edges.forEach(edge => {
            edges.update([{ id: edge.id, color: '#848484', arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow', color: '#848484' } } }]);
        });
    });
});
