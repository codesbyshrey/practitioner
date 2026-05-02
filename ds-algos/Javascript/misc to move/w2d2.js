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
    * Determines if this tree contains the given searchVal.
    * - Time: O(?).
    * - Space: O(?).
    * @param {number} searchVal The number to search for in the node's data.
    * @returns {boolean} Indicates if the searchVal was found.
    */
   contains(searchVal) {
       if(this.isEmpty())return "list is empty";
       let current = this.root;
       while(current) {
         if(searchVal === current.data) {
           return true;
       } else if (searchVal < current.data) {
           current = current.left;
       }else {
         current = current.right;
       }
     }
     return false;
   }
   
   
   /**
    * Calculates the range (max - min) from the given startNode.
    * - Time: O(?).
    * - Space: O(?).
    * @param {Node} startNode The node to start from to calculate the range.
    * @returns {number|null} The range of this tree or a sub tree depending on if the
    *    startNode is the root or not.
    */
   range(startNode = this.root) {}
   
     
   /**
    * Determines if this tree contains the given searchVal.
    * - Time: O(?).
    * - Space: O(?).
    * @param {number} searchVal The number to search for in the node's data.
    * @returns {boolean} Indicates if the searchVal was found.
    */
   containsRecursive(searchVal, current = this.root) {
   
     if(this.isEmpty())return "list is empty";
   
   
     if(searchVal === current.data) {
         return true;
     } else if (searchVal < current.data) {
         ;
     }else {
       current = current.right;
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
   
   /* fullTree
                       root
                   <-- 25 -->
                 /            \
               15             50
             /    \         /    \
           10     22      35     70
         /   \   /  \    /  \   /  \
       4    12  18  24  31  44 66  90
   */
   