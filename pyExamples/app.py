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




@app.route('/bfs_dfs_analysis', methods=['POST'])
def bfs_dfs_analysis():
    data = request.json

    # Parse missions and operational data
    missions = {m['UUID']: {'label': m['Name']} for m in data['Mission']}
    operational_data = {d['UUID']: {'label': d['Name'], 'shape': 'box'} for d in data['OperationalData']}

    print(f'Missions: {missions}')

    # Combine mission and data nodes
    full_nodes = {**missions, **operational_data}

    # Parse mission hierarchy and mission-operational data relationships
    mission_hierarchy = [(rel['ChildMission'], rel['ParentMission']) for rel in data['MissionHierarchy']]
    mission_data_relations = [(rel['OperationalData'], rel['Mission']) for rel in data['Mission_OperationalData']]

    # # Create and populate graph
    # G = nx.DiGraph()
    # G.add_nodes_from(full_nodes.keys())
    # for edge in mission_hierarchy + mission_data_relations:
    #     G.add_edge(edge[1], edge[0])  # Note the order: (Parent, Child)

    # # Identify root missions (no incoming edges)
    # root_missions = [node for node in G.nodes if G.in_degree(node) == 0 and node in missions]

    # # Perform BFS and DFS for each root mission
    # bfs_paths = {}
    # dfs_paths = {}
    # for root in root_missions:
    #     bfs_paths[root] = list(nx.bfs_edges(G, root))
    #     dfs_paths[root] = list(nx.dfs_edges(G, root))

    # def get_node_label(node_id):
    #     # Check if the node is in missions, otherwise fall back to operational_data or use a default value
    #     return missions.get(node_id, operational_data.get(node_id, {'label': 'Unknown'}))['label']

    # # Use the get_node_label function to safely access node labels
    # bfs_labels = {get_node_label(root): [(get_node_label(u), get_node_label(v)) for u, v in bfs_paths[root]] for root in root_missions}
    # dfs_labels = {get_node_label(root): [(get_node_label(u), get_node_label(v)) for u, v in dfs_paths[root]] for root in root_missions}


    # response = {
    #     "message": "BFS and DFS analysis completed",
    #     "BFS": bfs_labels,
    #     "DFS": dfs_labels
    # }
    
    # print(response)

    # return jsonify(response)
    
    # Create and populate graph
    G = nx.DiGraph()
    G.add_nodes_from(full_nodes.keys())
    G.add_edges_from(mission_hierarchy + mission_data_relations)

    # Calculating Depth and Breadth
    def calculate_depth(graph, node_id, visited=set()):
        if node_id in visited:
            return 0
        visited.add(node_id)
        depths = [calculate_depth(graph, predecessor, visited) for predecessor in graph.predecessors(node_id)]
        return 1 + max(depths) if depths else 0

    def calculate_breadth(graph, node_id):
        return len(list(graph.successors(node_id)))

    criticality_scores = {}
    for node_id in operational_data:
        depth = calculate_depth(G, node_id)
        breadth = calculate_breadth(G, node_id)
        # Simple criticality score: higher values for more "leaf" nodes, adjusted by depth
        criticality_scores[node_id] = breadth + 1 / (depth + 1)  # Avoid division by zero

    # Normalize the criticality scores to a 1-4 range
    max_score = max(criticality_scores.values(), default=1)
    min_score = min(criticality_scores.values(), default=0)
    normalized_scores = {node_id: 1 + 3 * (score - min_score) / (max_score - min_score) if max_score > min_score else 1 for node_id, score in criticality_scores.items()}

    # Prepare scores with labels for response
    scores_with_labels = {operational_data[node_id]['label']: score for node_id, score in normalized_scores.items()}

    response = {
        "message": "Depth and Breadth analysis completed",
        "criticality_scores": scores_with_labels
    }
    
    print(response)

    return jsonify(response)

    


@app.route('/pagerank_analysis', methods=['POST'])
def pagerank_analysis():
    data = request.json

    # Parse missions and operational data
    missions = {m['UUID']: {'label': m['Name']} for m in data['Mission']}
    operational_data = {d['UUID']: {'label': d['Name'], 'shape': 'box'} for d in data['OperationalData']}

    # Combine mission and data nodes
    full_nodes = {**missions, **operational_data}

    # Parse mission hierarchy and mission-operational data relationships
    mission_hierarchy = [(rel['ChildMission'], rel['ParentMission']) for rel in data['MissionHierarchy']]
    mission_data_relations = [(rel['OperationalData'], rel['Mission']) for rel in data['Mission_OperationalData']]

    # Create and populate graph
    G = nx.DiGraph()
    G.add_nodes_from(full_nodes.keys())
    G.add_edges_from(mission_hierarchy + mission_data_relations)

    # Calculate PageRank
    page_rank = nx.pagerank(G, alpha=0.85)

    # Adjust PageRank scores for operational data based on path lengths
    adjusted_scores = {}
    for node_id in operational_data:
        # Assuming single root mission; adjust as needed for multiple roots
        root_mission_id = next(iter(missions.keys()), None)
        if root_mission_id:
            if nx.has_path(G, source=root_mission_id, target=node_id):
                path = nx.shortest_path(G, source=root_mission_id, target=node_id)
                path_length = len(path)
                adjusted_score = page_rank[node_id] / path_length if path_length > 0 else 0
                adjusted_scores[node_id] = adjusted_score
            else:
                # Handle the case where no path exists. 
                # For example, you can set the adjusted score to 0 or some other default value.
                adjusted_scores[node_id] = 0

    # Normalize the adjusted scores
    total_adjusted_score = sum(adjusted_scores.values())
    # Normalize the adjusted scores
    if total_adjusted_score > 0:
        normalized_scores = {node_id: score / total_adjusted_score for node_id, score in adjusted_scores.items()}
    else:
        # Handle the case where total_adjusted_score is 0
        # One approach could be to assign a uniform score to all nodes, or simply skip normalization
        normalized_scores = adjusted_scores  # Or any other default handling as per your needs

    # Prepare response with labels
    scores_with_labels = {operational_data[node_id]['label']: score for node_id, score in normalized_scores.items()}

    response = {
        "message": "PageRank analysis completed",
        "pagerank_scores": scores_with_labels
    }
    
    print(response)

    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True, port = 6868)
