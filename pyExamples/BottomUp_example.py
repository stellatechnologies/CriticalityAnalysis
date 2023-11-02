import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns

#######################################################
# Bottom up approach for calcualting the % use of each
# Data for every mission.
#
#
#######################################################


mission_nodes = {
    1: {'label': 'Main Mission'},
    2: {'label': 'Sub-mission A'},
    3: {'label': 'Sub-mission B'},
    4: {'label': 'Sub-mission Aa'},
    5: {'label': 'Sub-mission Ab'},
    6: {'label': 'Sub-mission Ba'},
    7: {'label': 'Sub-mission Bb'},
}


data_nodes = {
    8: {'label': 'Data 1', 'shape': 'box'},
    9: {'label': 'Data 2', 'shape': 'box'},
    10: {'label': 'Data 3', 'shape': 'box'},
    11: {'label': 'Data 4', 'shape': 'box'},
    12: {'label': 'Data 5', 'shape': 'box'}
}


full_nodes = {**mission_nodes, **data_nodes}

edges = [
    (2, 1),
    (3, 1),
    (4, 2),
    (5, 2),
    (6, 3),
    (7, 3),
    (8, 4),
    (9, 4),
    (9, 5),
    (10, 5),
    (10, 6),
    (11, 6),
    (11, 7),
    (12, 7),
    (8, 7)
]

# Create matrix where each row is a mission and each column is a data start with 0
matrix = np.zeros((len(mission_nodes), len(data_nodes)))


# Create graph
G = nx.DiGraph()
G.add_nodes_from(full_nodes.keys())
G.add_edges_from(edges)


# Create Mission only graph
M = nx.DiGraph()
M.add_nodes_from(mission_nodes.keys())
M.add_edges_from([e for e in edges if e[1] in mission_nodes.keys() and e[0] in mission_nodes.keys()])


# Determine path of mission nodes starting from outermost missions and working inwards to main mission's where every mission is visited only once and
# All dependencies are visited before the mission itself.
try:
    traversal_path = list(nx.topological_sort(M))
    print("Traversal Path: ", traversal_path)
except nx.NetworkXUnfeasible:
    print("Graph has a cycle, so a topological sort is not possible.")


# Get list of all leaf (edge) mission nodes that do not have any children
leaf_mission_nodes = [n for n in M.nodes() if M.out_degree(n) == 1 and M.in_degree(n) == 0]

print("Leaf Mission Nodes: ", leaf_mission_nodes)


# Traverse the graph and calculate the % use of each data for every mission
for m_node in traversal_path:
    # If current mission node is a leaf node, then the % use of each data is 100% for its connected data nodes
    if m_node in leaf_mission_nodes:
        connected_data_nodes = [n for n in G.predecessors(m_node) if n in data_nodes.keys()]
        for d_node in connected_data_nodes:
            matrix[m_node-1][d_node-8] = 100
    else:
        # Get all the children of the current mission node
        children = [n for n in M.predecessors(m_node)]
        
        print(f'Children of {m_node}: ', children)
        
        # Get Matrix rows of all children
        children_rows = [matrix[c-1] for c in children]
        
        # Calculate the % use of each data for the current mission node by averaging the % use of each data across all children
        matrix[m_node-1] = np.mean(children_rows, axis=0)



# Pretty print matrix
mission_labels = [mission_nodes[i]['label'] for i in mission_nodes]
data_labels = [data_nodes[i]['label'] for i in data_nodes]

# print("\nPercentage Use Matrix:")
# print("Rows: Missions, Columns: Data")
# print(" ", *data_labels, sep='\t')
# for i, row in enumerate(matrix):
#     formatted_row = '\t'.join(f'{value:.2f}' for value in row)
#     print(f'{mission_labels[i]}\t{formatted_row}')

# Create a heatmap for the matrix
plt.figure(figsize=(10, 6))
sns.heatmap(matrix, annot=True, fmt=".2f", cmap="YlGnBu", xticklabels=data_labels, yticklabels=mission_labels)
plt.title("Percentage Use of Data for Each Mission")
plt.xlabel("Data")
plt.ylabel("Missions")
plt.show()

# Define colors for mission nodes and data nodes
mission_node_color = 'skyblue'
data_node_color = 'lightgreen'

# Plot Full graph
pos = nx.spring_layout(G)

nx.draw_networkx_nodes(G, pos, nodelist=mission_nodes.keys(), node_color=mission_node_color, node_size=500)
nx.draw_networkx_nodes(G, pos, nodelist=data_nodes.keys(), node_color=data_node_color, node_size=500)

nx.draw_networkx_labels(G, pos)
nx.draw_networkx_edges(G, pos, arrows=True)

# Show the plot
plt.title("Mission and Data Dependency Graph")
plt.show()

# # Explanation of the results
# print("\nExplanation of Results:")
# print("The heatmap above shows the percentage use of each data node for every mission.")
# print("The colors indicate the level of usage: darker colors represent higher usage.")
# print("In the graph, mission nodes are colored in sky blue and data nodes in light green.")
# print("Edges represent dependencies, showing how each mission depends on certain data.")
