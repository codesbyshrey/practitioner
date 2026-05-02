class Node {
     constructor(data) {
       this.data = data;
       this.next = null;
     }
   }
   /**
    * Follows a LIFO (Last In First Out) order where new items are stacked on
    * top and removed items are removed from the top .
    */
   class Stack {
     /**
      * The constructor is executed when instantiating a new Stack() to construct
      * a new instance.
      * @returns {Stack} This new Stack instance is returned without having to
      *    explicitly write 'return' (implicit return).
      */
     constructor() {
       this.top = null;
     }
   
     /**
      * Adds a new given item to the top.
      * - Time: O(1) constant.
      * - Space: O(1) constant.
      * @param {any} item The new item to be added to the top.
      * @returns {number} The new length of this stack.
      */
     push(val) {
       let newNode = new Node(val);
       newNode.next = this.top;
       this.top = newNode;
       return this;
     }
   
     /**
      * Removes the top item (the top).
      * - Time: O(1) constant.
      * - Space: O(1).
      * @returns {any} The data of the top item of the stack.
      */
     pop() {
       let temp = this.top.data;
       this.top = this.top.next;
       return temp;
     }
   
     /**
      * Returns the top item of the stack without removing it.
      * - Time: O(1) constant.
      * - Space: O(1).
      * @returns {any} The top item.
      */
     peek() {
       return this.top;
     }
   
     /**
      * Determines if the stack is empty.
      * - Time: O(1) constant.
      * - Space: O(1).
      * @returns {boolean}
      */
     isEmpty() {
       return this.top == null;
     }
   
     /**
      * Gets the count of items in the stack.
      * - Time: O(n) linear, n = list length.
      * - Space: O(1).
      * @returns {number} The total number of items.
      */
     size() {
       let tempStack = new Stack();
       while (!this.isEmpty()){
         tempStack.push(this.pop());
       }
       let size = 0;
       while (!tempStack.isEmpty()){
         size ++;
         this.push(tempStack.pop());
       }
       return size;
     }
   
     // Time: O(n) linear, n = list length
     // Space: O(n)
     print() {
       let runner = this.top;
       let vals = "";
   
       while (runner) {
         vals += `${runner.data}${runner.next ? ", " : ""}`;
         runner = runner.next;
       }
       console.log(`Top: ${this.top.data}`)
       console.log(vals);
       return vals;
     }
   
   }
 
 
 /**
  * Class to represent a Queue but is implemented using two stacks to store the
  * queued items without using any other objects or arrays to store the items.
  * Retains the FIFO (First in First Out) ordering when adding / removing items.
  */
 class TwoStackQueue {
   constructor() {
     this.stack1 = new Stack();
     this.stack2 = new Stack();
   }
 
   /**
    * Adds a new item to the back of the queue.
    * - Time: O(?).
    * - Space: O(?).
    * @param {any} item To be added.
    * @returns {number} The new number of items in the queue.
    */
   enqueue(item) {}
 
   /**
    * Removes the next item in the line / queue.
    * - Time: O(?).
    * - Space: O(?).
    * @returns {any} The removed item.
    */
   dequeue() {}
 }