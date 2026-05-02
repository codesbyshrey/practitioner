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
   
     // pre order = root,left,right
    logPreOrder(node = this.root){
      if(node){
        console.log(node.data);
        this.logPreOrder(node.left)
        this.logPreOrder(node.right)
      }
    }
     // in order = left,root,right
     logInOrder(node = this.root){
      if(node){
        this.logPreOrder(node.left)
        console.log(node.data);
        this.logPreOrder(node.right)
      }
    }
     // post order = left,right,root
     logPostOrder(node = this.root){
      if(node){
        this.logPreOrder(node.left)
        this.logPreOrder(node.right)
        console.log(node.data);
      }
    }
   
   /**
    * DFS Preorder: (CurrNode, Left, Right)
    * Converts this BST into an array following Depth First Search preorder.
    * Example on the fullTree var:
    * [25, 15, 10, 4, 12, 22, 18, 24, 50, 35, 31, 44, 70, 66, 90]
    * @param {Node} node The current node during the traversal of this tree.
    * @param {Array<number>} vals The data that has been visited so far.
    * @returns {Array<number>} The vals in DFS Preorder once all nodes visited.
    */
   toArrPreorder(node = this.root, vals = []) {
   
     if (node) {
   
     vals.push(node);
     this.toArrPreorder(node.left, vals);
     this.toArrPreorder(node.right, vals);
       
     }
   
     return vals;
     
   }
   
   /**
    * DFS Inorder: (Left, CurrNode, Right)
    * Converts this BST into an array following Depth First Search inorder.
    * See debugger call stack to help understand the recursion.
    * Example on the fullTree var:
    * [4, 10, 12, 15, 18, 22, 24, 25, 31, 35, 44, 50, 66, 70, 90]
    * @param {Node} node The current node during the traversal of this tree.
    * @param {Array<number>} vals The data that has been visited so far.
    * @returns {Array<number>} The vals in DFS Preorder once all nodes visited.
    */
   toArrInorder(node = this.root, vals = []) {}
   
   /**
    * DFS Postorder (Left, Right, CurrNode)
    * Converts this BST into an array following Depth First Search postorder.
    * Example on the fullTree var:
    * [4, 12, 10, 18, 24, 22, 15, 31, 44, 35, 66, 90, 70, 50, 25]
    * @param {Node} node The current node during the traversal of this tree.
    * @param {Array<number>} vals The data that has been visited so far.
    * @returns {Array<number>} The vals in DFS Preorder once all nodes visited.
    */
   toArrPostorder(node = this.root, vals = []) {}
   
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
   console.log(threeLevelTree);