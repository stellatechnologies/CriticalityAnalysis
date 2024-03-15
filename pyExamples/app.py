from flask import Flask, request, jsonify
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns

app = Flask(__name__)

@app.route('/bottom_up_process', methods=['POST'])
def bottom_up_process():
    data = request.json

    # Parse missions and operational data
    missions = {m['UUID']: {'label': m['Name']} for m in data['Mission']}
    operational_data = {d['UUID']: {'label': d['Name'], 'shape': 'box'} for d in data['OperationalData']}

    # Combine mission and data nodes
    full_nodes = {**missions, **operational_data}

    # Parse mission hierarchy and mission-operational data relationships
    mission_hierarchy = [(rel['ChildMission'], rel['ParentMission']) for rel in data['MissionHierarchy']]
    mission_data_relations = [(rel['OperationalData'], rel['Mission']) for rel in data['Mission_OperationalData']]

    # Create matrix
    matrix = np.zeros((len(missions), len(operational_data)))

    # Create and populate graph
    G = nx.DiGraph()
    G.add_nodes_from(full_nodes.keys())
    G.add_edges_from(mission_hierarchy + mission_data_relations)

    # Create mission-only graph
    M = nx.DiGraph()
    M.add_nodes_from(missions.keys())
    M.add_edges_from(mission_hierarchy)

    # Function to find leaf mission nodes
    def find_leaf_mission_nodes(graph):
        return [n for n in graph.nodes() if graph.in_degree(n) == 0]

    # Determine traversal path
    try:
        traversal_path = list(nx.topological_sort(M))
        print("Traversal Path: ", traversal_path)
    except nx.NetworkXUnfeasible:
        print("Graph has a cycle, so a topological sort is not possible.")

    # Find leaf mission nodes
    leaf_mission_nodes = find_leaf_mission_nodes(M)

    # UUID to Index mappings
    mission_to_index = {uuid: i for i, uuid in enumerate(missions)}
    data_to_index = {uuid: i for i, uuid in enumerate(operational_data)}

    for m_uuid in traversal_path:
        m_index = mission_to_index[m_uuid]

        if m_uuid in leaf_mission_nodes:
            connected_data_nodes = [n for n in G.predecessors(m_uuid) if n in operational_data]
            for d_uuid in connected_data_nodes:
                matrix[m_index][data_to_index[d_uuid]] = 100
        else:
            children = [n for n in M.predecessors(m_uuid) if n in missions]
            
            children_rows = [matrix[mission_to_index[c]] for c in children]

            if children_rows:
                # Calculate the average manually for better debugging
                calculated_mean = np.sum(children_rows, axis=0) / len(children_rows)
                matrix[m_index] = calculated_mean
            else:
                matrix[m_index] = np.zeros(len(operational_data))
       
        
        
    # Pretty print matrix
    mission_labels = [missions[uuid]['label'] for uuid in missions]
    data_labels = [operational_data[uuid]['label'] for uuid in operational_data]

    # Create a heatmap for the matrix
    plt.figure(figsize=(10, 6))
    sns.heatmap(matrix, annot=True, fmt=".2f", cmap="YlGnBu", xticklabels=data_labels, yticklabels=mission_labels)
    plt.title("Percentage Use of Data for Each Mission")
    plt.xlabel("Data")
    plt.ylabel("Missions")
    plt.show()

    # For simplicity, the response is just a confirmation message.
    # You can modify this to return any result you need.
    return jsonify({"message": "Data processed successfully"})

if __name__ == '__main__':
    app.run(debug=False, port = 6868)
