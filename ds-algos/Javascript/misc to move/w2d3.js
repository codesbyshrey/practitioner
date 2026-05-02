/**
 * Class to represent a Node in a Binary Search Tree (BST).
 */
class BSTNode {
     /**
      * Constructs a new instance of a BST node.
      * @param {number} data The integer to store in the node.
      */
     constructor(data) {
       this.data = data;
       /**
        * These properties are how this node is connected to other nodes to form
        * the tree. Similar to .next in a SinglyLinkedList except a BST node can
        * be connected to two other nodes. To start, new nodes will not be
        * connected to any other nodes, these properties will be set after
        * the new node is instantiated.
        *
        * @type {BSTNode|null}
        */
       this.left = null;
       /** @type {BSTNode|null} */
       this.right = null;
     }
   }
   
   /**
    * Represents an ordered tree of nodes where the data of left nodes are <= to
    * their parent and the data of nodes to the right are > their parent's data.
    */
   class BinarySearchTree {
     constructor() {
       /**
        * Just like the head of a linked list, this is the start of our tree which
        * branches downward from here.
        *
        * @type {BSTNode|null}
        */
       this.root = null;
     }
   
     /**
      * Determines if this tree is empty.
      * - Time: O(?).
      * - Space: O(?).
      * @returns {boolean} Indicates if this tree is empty.
      */
     isEmpty() {
       return this.root === null ? true: false;
     }
   
   
   /**
    * Inserts a new node with the given newVal in the right place to preserver
    * the order of this tree.
    * - Time: O(?).
    * - Space: O(?).
    * @param {number} newVal The data to be added to a new node.
    * @returns {BinarySearchTree} This tree.
    */
   insert(newVal) {
     const newNode = new BSTNode(newVal);
     if(this.isEmpty()){
       this.root = newNode; 
       return this;
     }
     let current = this.root;
     while(current){
       if(current.data < newVal){
         if(current.right === null){
           current.right = newNode;
           return this;
         }
         current = current.right;
       }else{
         if(current.left === null){
           current.left = newNode;
           return this;
         }
         current = current.left;
       }
     }
   }
   
   /**
    * Inserts a new node with the given newVal in the right place to preserver
    * the order of this tree.
    * - Time: O(?).
    * - Space: O(?).
    * @param {number} newVal The data to be added to a new node.
    * @param {Node} curr The node that is currently accessed from the tree as
    *    the tree is being traversed.
    * @returns {BinarySearchTree} This tree.
    */
   insertRecursive(newVal, current = this.root) {
     const newNode = new BSTNode(newVal);
     if(this.isEmpty()){
       this.root = newNode;
       return this;
     }
    if(current.data < newVal){
       if(current.right === null){
         current.right = newNode;
         return this;
       }
       this.insertRecursive(newVal, current.right);
     }else{
       if(current.left === null){
         current.left = newNode;
         return this;
       }
       this.insertRecursive(newVal, current.left);
     }
   }
   
       min() {
       if(this.isEmpty()) return "list is empty";
       let runner = this.root;
       while (runner != null) {
         if (runner.left == null) {
           return runner.data;
         }
         runner = runner.left;
       }
       
     }
     max(current = this.root) {
       if (this.isEmpty()) {
         return null
       }
       while (current.right) {
         current = current.right
       }
       return current.data
     }
   
   
     /**
    * Calculates the range (max - min) from the given startNode.
    * - Time: O(?).
    * - Space: O(?).
    * @param {Node} startNode The node to start from to calculate the range.
    * @returns {number|null} The range of this tree or a sub tree depending on if the
    *    startNode is the root or not.
    */
   range(startNode = this.root) {
     if(this.isEmpty()){
       return 0;
     }
     while(startNode.left){
       startNode = startNode.left;
     }
     const smallest = startNode.data;
     startNode = this.root;
     while(startNode.right){
       startNode = startNode.right;
     }
     let answer = startNode.data - smallest
     return answer;
   }
   
   
     range2(){
       if(this.isEmpty()){
       return 0;
       }
       return this.max() - this.min()
     }
     
   /**
    * Determines if this tree contains the given searchVal.
    * - Time: O(?).
    * - Space: O(?).
    * @param {number} searchVal The number to search for in the node's data.
    * @returns {boolean} Indicates if the searchVal was found.
    */
   containsRecursive(searchVal, current = this.root) {
     console.log(current.data);
     if(this.isEmpty())return "list is empty";
     if(searchVal === current.data) {
         return true;
     } else if (searchVal < current.data) {
        return this.containsRecursive(searchVal, current.left);
     }else {
        return this.containsRecursive(searchVal, current.right);
     }
     return false;
   }
   
     // Logs this tree horizontally with the root on the left.
     print(node = this.root, spaceCnt = 0, spaceIncr = 10) {
       if (!node) {
         return;
       }
   
       spaceCnt += spaceIncr;
       this.print(node.right, spaceCnt);
   
       console.log(
         " ".repeat(spaceCnt < spaceIncr ? 0 : spaceCnt - spaceIncr) +
           `${node.data}`
       );
   
       this.print(node.left, spaceCnt);
     }
   }
   
   const emptyTree = new BinarySearchTree();
   const oneNodeTree = new BinarySearchTree();
   oneNodeTree.root = new BSTNode(10);
   
   /* twoLevelTree
           root
           10
         /   \
       5     15
   */
   const twoLevelTree = new BinarySearchTree();
   twoLevelTree.root = new BSTNode(10);
   twoLevelTree.root.left = new BSTNode(5);
   twoLevelTree.root.right = new BSTNode(15);
   
   /* threeLevelTree 
           root
           10
         /   \
       5     15
     / \    / \
   2   6  13  
   */
   const threeLevelTree = new BinarySearchTree();
   threeLevelTree.root = new BSTNode(10);
   threeLevelTree.root.left = new BSTNode(5);
   threeLevelTree.root.left.left = new BSTNode(2);
   threeLevelTree.root.left.right = new BSTNode(6);
   threeLevelTree.root.right = new BSTNode(15);
   threeLevelTree.root.right.left = new BSTNode(13);
   
   // threeLevelTree.print();
   
   // threeLevelTree.insert(27);
   
   threeLevelTree.insertRecursive(7)
   // threeLevelTree.print();
   // console.log(threeLevelTree.range2());
   
   console.log(threeLevelTree.containsRecursive(7))
   
   
   
   