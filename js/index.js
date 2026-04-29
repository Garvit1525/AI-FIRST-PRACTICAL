// ========== PART 3 ==========
// ========== DATA STRUCTURE & GAME TREE ==========
// ========== WRITTEN BY MUSTAFA ==========

// Declare a constant variable for the human player to prevent spelling mistakes in the code.
const HUMAN = "human";
// Declare a constant variable for the computer player to ensure consistency across functions.
const COMPUTER = "computer";

// Define a function that creates and returns a single game state (a node in the game tree).
function newNode(numArray, humanPts, compPts, whoseTurn, currentDepth, pickedIndex, removedNum) {
    // Initialize an empty JavaScript object to hold the properties of this specific game state.
    let node = {};
    // Assign the passed array of numbers to the node's 'nums' property.
    node.nums = numArray;
    // Assign the passed human score to the node's 'humanPts' property.
    node.humanPts = humanPts;
    // Assign the passed computer score to the node's 'compPts' property.
    node.compPts = compPts;
    // Assign the current player's turn to the node's 'whoseTurn' property.
    node.whoseTurn = whoseTurn;
    // Assign the current tree depth level to the node's 'depth' property.
    node.depth = currentDepth;
    // Store the array index that was chosen to reach this state (useful for backtracking).
    node.howWeGotHere = pickedIndex;
    // Store the actual number (1, 2, or 3) that was removed to reach this state.
    node.removedNum = removedNum;
    // Initialize an empty array to store future child nodes (the branches of the tree).
    node.children = [];
    // Initialize evalValue as null; heuristic scores are calculated later, not cached here.
    node.evalValue = null;
    // Set 'terminal' to true if the array is empty (length is 0), meaning the game is over.
    node.terminal = (numArray.length === 0);
    // Return the fully constructed node object back to whatever function called it.
    return node;
}

// Define a function to create the very first root node of the game.
function makeStartNode(numArray, firstPlayer) {
    // Call newNode with the starting array, 50 points each, depth 0, and no previous moves (null, null).
    return newNode(numArray, 50, 50, firstPlayer, 0, null, null);
}

// Define a function to generate the initial random sequence of numbers.
function makeNumArray(len) {
    // Check if the requested length is outside the valid bounds of 15 to 25.
    if (len < 15 || len > 25) {
        // Print an error message to the console if the length is invalid.
        console.log("length must be between 15 and 25");
        // Return null to stop the game from generating an invalid board.
        return null;
    }
    // Initialize an empty array to hold the generated random numbers.
    let result = [];
    // Initialize a counter variable 'i' to 0 for the while loop.
    let i = 0;
    // Start a loop that will run exactly 'len' times.
    while (i < len) {
        // Generate a random number between 0 and 0.99, multiply by 3, round down, add 1, and push to array.
        result.push(Math.floor(Math.random() * 3) + 1);
        // Increment the counter 'i' by 1 to move to the next loop iteration.
        i++;
    }
    // Return the fully populated array of random 1s, 2s, and 3s.
    return result;
}

// Define a function to determine how many possible moves exist for a given node.
function getValidMoves(node) {
    // Initialize an empty array to store the valid indices.
    let moves = [];
    // Start a loop from 0 up to the current length of the numbers array.
    for (let i = 0; i < node.nums.length; i++) {
        // Push the current index 'i' into the moves array.
        moves.push(i);
    }
    // Return the array of indices, which represents the dynamic branching factor.
    return moves;
}

// Define a function to calculate the new scores after a number is removed.
function updateScores(humanPts, compPts, removedNum, whoseTurn) {
    // Create a local copy of the human's points to safely modify.
    let hPts = humanPts;
    // Create a local copy of the computer's points to safely modify.
    let cPts = compPts;

    // Check if the current move was made by the human player.
    if (whoseTurn === HUMAN) {
        // If the human removed a 1, subtract 1 from the human's local score.
        if (removedNum === 1) { hPts = hPts - 1; }
        // If the human removed a 2, subtract 1 from both the human and computer local scores.
        if (removedNum === 2) { hPts = hPts - 1; cPts = cPts - 1; }
        // If the human removed a 3, subtract 1 from the computer's local score.
        if (removedNum === 3) { cPts = cPts - 1; }
    }

    // Check if the current move was made by the computer player.
    if (whoseTurn === COMPUTER) {
        // If the computer removed a 1, subtract 1 from the computer's local score.
        if (removedNum === 1) { cPts -= 1; }
        // If the computer removed a 2, subtract 1 from both the computer and human local scores.
        if (removedNum === 2) { cPts -= 1; hPts -= 1; }
        // If the computer removed a 3, subtract 1 from the human's local score.
        if (removedNum === 3) { hPts -= 1; }
    }

    // Return an object containing the newly calculated human and computer points.
    return { hPts: hPts, cPts: cPts };
}

// Define a function to simulate a move without mutating the original game state.
function applyMove(node, pickedIndex) {
    // Initialize an empty array to serve as a deep copy of the remaining numbers.
    let newNums = [];
    // Start a loop to iterate through every number in the current node's array.
    for (let i = 0; i < node.nums.length; i++) {
        // If the current index 'i' does NOT match the index the player picked to remove...
        if (i !== pickedIndex) {
            // ...push that number into the new array, effectively keeping it in the game.
            newNums.push(node.nums[i]);
        }
    }

    // Retrieve the exact number value (1, 2, or 3) that was located at the picked index.
    let removedNum = node.nums[pickedIndex];
    // Call updateScores to calculate the new points based on the removed number.
    let updated = updateScores(node.humanPts, node.compPts, removedNum, node.whoseTurn);

    // Declare a variable to hold who plays next.
    let nextTurn;
    // If the current node's turn was HUMAN...
    if (node.whoseTurn === HUMAN) {
        // ...set the next turn to COMPUTER.
        nextTurn = COMPUTER;
    // Otherwise (if it was the COMPUTER's turn)...
    } else {
        // ...set the next turn to HUMAN.
        nextTurn = HUMAN;
    }

    // Construct and return a brand new node object representing the game after this move.
    return newNode(
        // Pass the newly created, shorter array of numbers.
        newNums,
        // Pass the updated human score.
        updated.hPts,
        // Pass the updated computer score.
        updated.cPts,
        // Pass the string determining who gets the next turn.
        nextTurn,
        // Increment the current depth by 1 to track how far down the tree we are.
        node.depth + 1,
        // Pass the index that was picked, so the node remembers how it was created.
        pickedIndex,
        // Pass the actual number value that was removed.
        removedNum
    );
}

// Define a function to generate all possible future states (children) from the current node.
function expandNode(node) {
    // Check if the node already has children (length > 0) to prevent generating duplicates.
    if (node.children.length > 0) {
        // If it does, exit the function immediately.
        return;
    }
    // Retrieve the array of valid indices we are allowed to pick from.
    let moves = getValidMoves(node);
    // Start a loop that runs once for every valid move available.
    for (let i = 0; i < moves.length; i++) {
        // Apply the move to generate a new node, and push that new node into the children array.
        node.children.push(applyMove(node, moves[i]));
    }
}

// Define a function to check who won the game based on the final scores.
function getWinner(node) {
    // If the terminal flag is false (the array is not empty), return null because the game is not over.
    if (!node.terminal) return null;
    // If the human score is strictly greater than the computer score, return the HUMAN constant.
    if (node.humanPts > node.compPts) return HUMAN;
    // If the computer score is strictly greater than the human score, return the COMPUTER constant.
    if (node.compPts > node.humanPts) return COMPUTER;
    // If neither is strictly greater, it must be a tie, so return the string "draw".
    return "draw";
}

// Define a function to print the contents of a node to the console for debugging purposes.
function printNode(node) {
    // Print the node's depth and whose turn it is.
    console.log("depth=" + node.depth + " turn=" + node.whoseTurn);
    // Print the array of numbers currently stored in this node.
    console.log("nums: [" + node.nums + "]");
    // Print the current scores for both players.
    console.log("human=" + node.humanPts + " comp=" + node.compPts);
    // Print whether the game is over and how many child nodes this state has generated.
    console.log("terminal=" + node.terminal + " children=" + node.children.length);
    // Check if this node was created by a specific move (is not the root node).
    if (node.howWeGotHere !== null) {
        // If so, print the index picked and the number removed to get here.
        console.log("last pick: index=" + node.howWeGotHere + " num=" + node.removedNum);
    }
    // Print a separator line for console readability.
    console.log("---");
}

// Define a recursive function to build the tree out to a specific depth limit for testing.
function buildTree(node, depthLimit, nodeCount) {
    // Increment the node counter object by 1 every time this function runs.
    nodeCount.val = nodeCount.val + 1;
    // Base case: if the node is terminal (game over), stop expanding this branch.
    if (node.terminal) return;
    // Base case: if the node's depth has reached the requested limit, stop expanding.
    if (node.depth >= depthLimit) return;

    // Call expandNode to generate the immediate children for the current node.
    expandNode(node);
    // Start a loop to iterate through every child node just created.
    for (let i = 0; i < node.children.length; i++) {
        // Recursively call buildTree on each child, passing the same depth limit and counter object.
        buildTree(node.children[i], depthLimit, nodeCount);
    }
}

// Define a function to run basic console tests to verify game physics and tree generation.
function testBasic() {
    // Generate a random array of 15 numbers and store it in 'arr'.
    let arr = makeNumArray(15);
    // Print the generated array to the console.
    console.log("arr: " + arr);

    // Create the root node using the generated array with the human playing first.
    let root = makeStartNode(arr, HUMAN);
    // Print the details of the root node.
    printNode(root);

    // Simulate the human picking the 0th index and store the resulting state in 'next'.
    let next = applyMove(root, 0);
    // Print a confirmation message showing which index and number were removed.
    console.log("removed index 0, was: " + root.nums[0]);
    // Print the new scores and the new turn owner from the 'next' node.
    console.log("human=" + next.humanPts + " comp=" + next.compPts + " turn=" + next.whoseTurn);

    // Print the root node's data again to prove that applyMove did not mutate the original root.
    console.log("root still has " + root.nums.length + " nums, pts=" + root.humanPts);

    // Call expandNode to generate all immediate children for the root node.
    expandNode(root);
    // Print the number of children generated (should equal the length of the array).
    console.log("children after expand: " + root.children.length);
    // Call expandNode a second time to test the guard clause.
    expandNode(root);
    // Print the number of children again to prove the guard prevented duplicate generation.
    console.log("children after 2nd expand: " + root.children.length);

    // Initialize an object to pass by reference to count the total nodes generated.
    let c1 = { val: 0 };
    // Build the tree from the root up to a depth of 3.
    buildTree(root, 3, c1);
    // Print the total number of nodes calculated in the tree up to depth 3.
    console.log("depth 3 nodes: " + c1.val);

    // Create a brand new root node where the computer plays first.
    let root2 = makeStartNode(makeNumArray(15), COMPUTER);
    // Initialize a second counter object.
    let c2 = { val: 0 };
    // Build the tree from the second root up to a depth of 4.
    buildTree(root2, 4, c2);
    // Print the total number of nodes calculated in the tree up to depth 4.
    console.log("depth 4 nodes: " + c2.val);

    // Create an artificial finished game state where the human has 47 points and computer 45.
    let finished = newNode([], 47, 45, HUMAN, 10, null, null);
    // Call getWinner on the finished state and print the result (should be HUMAN).
    console.log("winner: " + getWinner(finished));
    // Create an artificial draw state and call getWinner, printing the result (should be "draw").
    console.log("draw: " + getWinner(newNode([], 48, 48, HUMAN, 10, null, null)));
}

// REFERENCES
// 1- https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html
// 2- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
// 3- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object

// ========== PART 3 FINISH ==========
