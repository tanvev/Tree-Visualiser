class Node {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = x;
        this.y = y;
        this.balance = 0;
        this.highlight = false;
    }
}

let root = null;
let treeType = "bst";
let showBalances = true;
let traversalOrder = [];
let rotationMessage = "";
let traversalInterval = null;

const insertedNodes = [];
const deletedNodes = [];

const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

function updateTreeType() {
    treeType = document.getElementById("treeType").value.toLowerCase();
    root = null;
    insertedNodes.length = 0;
    deletedNodes.length = 0;
    rotationMessage = "";
    document.getElementById("cppCode").textContent = "";
    document.getElementById("traversalOutput").textContent = "";
    clearInterval(traversalInterval);
    drawTree();
}

document.getElementById("insertBtn").addEventListener("click", () => {
    rotationMessage = "";
    const val = parseInt(document.getElementById("nodeValue").value);
    if (isNaN(val)) {
        alert("Please enter a valid number");
        return;
    }
    if (treeType === "avl") {
        root = insertAVL(root, val);
    } else {
        root = insertBST(root, val);
    }
    insertedNodes.push(val);
    layoutTree(root, canvas.width / 2, 50, canvas.width / 4);
    drawTree();
    generateCppCode();
});

document.getElementById("deleteBtn").addEventListener("click", () => {
    rotationMessage = "";
    const val = parseInt(document.getElementById("nodeValue").value);
    if (isNaN(val)) {
        alert("Please enter a valid number");
        return;
    }
    if (treeType === "avl") {
        root = deleteAVL(root, val);
    } else {
        root = deleteBST(root, val);
    }
    deletedNodes.push(val);
    layoutTree(root, canvas.width / 2, 50, canvas.width / 4);
    drawTree();
    generateCppCode();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    root = null;
    insertedNodes.length = 0;
    deletedNodes.length = 0;
    rotationMessage = "";
    document.getElementById("cppCode").textContent = "";
    document.getElementById("traversalOutput").textContent = "";
    clearInterval(traversalInterval);
    traversalOrder = [];
    drawTree();
});

function toggleBalanceFactors() {
    showBalances = !showBalances;
    drawTree();
}

function startTraversal(type) {
    traversalOrder = [];
    resetHighlight(root);
    clearInterval(traversalInterval);

    if (type === "inorder") inorder(root);
    else if (type === "preorder") preorder(root);
    else if (type === "postorder") postorder(root);

    if (traversalOrder.length === 0) {
        document.getElementById("traversalOutput").textContent = "";
        return;
    }

    let idx = 0;
    traversalInterval = setInterval(() => {
        resetHighlight(root);
        if (idx < traversalOrder.length) {
            traversalOrder[idx].highlight = true;
            document.getElementById("traversalOutput").textContent = traversalOrder.slice(0, idx + 1).map(n => n.value).join(", ");
            drawTree();
            idx++;
        } else {
            clearInterval(traversalInterval);
            resetHighlight(root);
            drawTree();
        }
    }, 1000);
}

function resetHighlight(node) {
    if (!node) return;
    node.highlight = false;
    resetHighlight(node.left);
    resetHighlight(node.right);
}

function inorder(node) {
    if (!node) return;
    inorder(node.left);
    traversalOrder.push(node);
    inorder(node.right);
}

function preorder(node) {
    if (!node) return;
    traversalOrder.push(node);
    preorder(node.left);
    preorder(node.right);
}

function postorder(node) {
    if (!node) return;
    postorder(node.left);
    postorder(node.right);
    traversalOrder.push(node);
}

function height(node) {
    return node ? node.height : 0;
}

function updateHeightAndBalance(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
    node.balance = height(node.left) - height(node.right);
}

function rotateRight(y) {
    rotationMessage = `Right Rotation at node ${y.value}`;
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeightAndBalance(y);
    updateHeightAndBalance(x);
    return x;
}

function rotateLeft(x) {
    rotationMessage = `Left Rotation at node ${x.value}`;
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeightAndBalance(x);
    updateHeightAndBalance(y);
    return y;
}

function insertAVL(node, value) {
    if (!node) return new Node(value);

    if (value < node.value) node.left = insertAVL(node.left, value);
    else if (value > node.value) node.right = insertAVL(node.right, value);
    else return node; // No duplicates

    updateHeightAndBalance(node);

    if (node.balance > 1 && value < node.left.value) {
        return rotateRight(node);
    }
    if (node.balance < -1 && value > node.right.value) {
        return rotateLeft(node);
    }
    if (node.balance > 1 && value > node.left.value) {
        node.left = rotateLeft(node.left);
        rotationMessage = `Left-Right Rotation at node ${node.value}`;
        return rotateRight(node);
    }
    if (node.balance < -1 && value < node.right.value) {
        node.right = rotateRight(node.right);
        rotationMessage = `Right-Left Rotation at node ${node.value}`;
        return rotateLeft(node);
    }

    return node;
}

function minValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
}

function deleteAVL(node, value) {
    if (!node) return node;

    if (value < node.value) node.left = deleteAVL(node.left, value);
    else if (value > node.value) node.right = deleteAVL(node.right, value);
    else {
        if (!node.left || !node.right) {
            let temp = node.left ? node.left : node.right;
            if (!temp) {
                temp = node;
                node = null;
            } else node = temp;
        } else {
            const temp = minValueNode(node.right);
            node.value = temp.value;
            node.right = deleteAVL(node.right, temp.value);
        }
    }

    if (!node) return node;

    updateHeightAndBalance(node);

    if (node.balance > 1 && node.left.balance >= 0) {
        rotationMessage = `Right Rotation at node ${node.value}`;
        return rotateRight(node);
    }
    if (node.balance > 1 && node.left.balance < 0) {
        node.left = rotateLeft(node.left);
        rotationMessage = `Left-Right Rotation at node ${node.value}`;
        return rotateRight(node);
    }
    if (node.balance < -1 && node.right.balance <= 0) {
        rotationMessage = `Left Rotation at node ${node.value}`;
        return rotateLeft(node);
    }
    if (node.balance < -1 && node.right.balance > 0) {
        node.right = rotateRight(node.right);
        rotationMessage = `Right-Left Rotation at node ${node.value}`;
        return rotateLeft(node);
    }

    return node;
}

function insertBST(node, value) {
    if (!node) return new Node(value);

    if (value < node.value) node.left = insertBST(node.left, value);
    else if (value > node.value) node.right = insertBST(node.right, value);
    // duplicates ignored

    return node;
}

function deleteBST(node, value) {
    if (!node) return node;

    if (value < node.value) node.left = deleteBST(node.left, value);
    else if (value > node.value) node.right = deleteBST(node.right, value);
    else {
        if (!node.left) return node.right;
        else if (!node.right) return node.left;

        let temp = minValueNode(node.right);
        node.value = temp.value;
        node.right = deleteBST(node.right, temp.value);
    }
    return node;
}

function layoutTree(node, x, y, spread) {
    if (!node) return;
    node.x = x;
    node.y = y;
    layoutTree(node.left, x - spread, y + 70, spread / 2);
    layoutTree(node.right, x + spread, y + 70, spread / 2);
}

function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!root) return;
    drawEdges(root);
    drawNodes(root);
    document.getElementById("rotationMessage").textContent = rotationMessage;
}

function drawEdges(node) {
    if (!node) return;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    if (node.left) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.left.x, node.left.y);
        ctx.stroke();
        drawEdges(node.left);
    }
    if (node.right) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.right.x, node.right.y);
        ctx.stroke();
        drawEdges(node.right);
    }
}

function drawNodes(node) {
    if (!node) return;
    ctx.fillStyle = node.highlight ? "#ff6666" : "#66b3ff";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.value, node.x, node.y);

    if (showBalances && treeType === "avl") {
        ctx.fillStyle = "darkgreen";
        ctx.font = "14px Arial";
        ctx.fillText(node.balance, node.x, node.y - 30);
    }

    drawNodes(node.left);
    drawNodes(node.right);
}

function generateCppCode() {
    let code = "";
    code += "// Inserted Nodes:\n";
    code += insertedNodes.length ? insertedNodes.join(", ") : "None";
    code += "\n\n// Deleted Nodes:\n";
    code += deletedNodes.length ? deletedNodes.join(", ") : "None";

    code += "\n\n// BST/AVL Operations\n\n";

    if (treeType === "bst") {
        code += `// Insertion in BST\n`;
        insertedNodes.forEach((val) => {
            code += `root = insertBST(root, ${val});\n`;
        });
        deletedNodes.forEach((val) => {
            code += `root = deleteBST(root, ${val});\n`;
        });
        code += `\n// Traversals\n`;
        code += `inorder(root);\npreorder(root);\npostorder(root);\n`;
    } else {
        code += `// Insertion in AVL Tree\n`;
        insertedNodes.forEach((val) => {
            code += `root = insertAVL(root, ${val});\n`;
        });
        deletedNodes.forEach((val) => {
            code += `root = deleteAVL(root, ${val});\n`;
        });
        code += `\n// Traversals\n`;
        code += `inorder(root);\npreorder(root);\npostorder(root);\n`;
    }

    document.getElementById("cppCode").textContent = code;
}

layoutTree(root, canvas.width / 2, 50, canvas.width / 4);
drawTree();
