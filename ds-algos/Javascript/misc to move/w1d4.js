
class ListNode {
     constructor(data) {
       this.data = data;
       this.next = null;
     }
   }
   
   /**
    * This class keeps track of the start (head) of the list and to store all the
    * functionality (methods) that each list should have.
    */
   class SinglyLinkedList {
     constructor() {
       this.head = null;
     }
   
     isEmpty() {
       return this.head === null? true: false
     }
   
   
     insertAtBack(data) {
       const newElement = new ListNode(data);
       
       if (this.head == null) {
         this.head = newElement;
         return this;
       }
   
       let runner = this.head;
       while (runner.next != null) {
         runner = runner.next;
       }
       runner.next = newElement;
       return this;
     }
   
     insertAtFront(data) {
       const newHead = new ListNode(data);
       newHead.next = this.head;
       this.head = newHead;
       return this;
     }
   
     
   
     
     removeHead() {
       if (this.isEmpty()) {
         return null;
       }
   
       const oldHead = this.head;
       this.head = oldHead.next;
       return oldHead.data;
     }
     
     removeBack() {
       if (this.isEmpty()) {
         return null;
       }
   
       // Only 1 node.
       if (this.head.next === null) {
         return this.removeHead();
       }
   
       // More than 1 node.
       let runner = this.head;
   
       while (runner.next.next) {
         runner = runner.next;
       }
     }
   
     insertAtBackRecursive(data, runner = this.head) {
       
       if(this.isEmpty()){
         const newNode = new ListNode(data);
         this.head = newNode;
         return "list is empty";
       }
       if(runner.next == null){
         const newNode = new ListNode(data);
         runner.next = newNode;
         return this;
       }
       this.insertAtBackRecursive(data, runner.next);
     }
     
     secondToLast() {
       if(this.isEmpty()){
         return "list is empty";
       }
       let runner = this.head;
       while(runner.next.next){
         runner = runner.next;
       }
       return runner.data;
     }
   
     removeVal(val) {
       if(this.isEmpty()){
         return "nothing to remove";
       }
       if(this.head.data === val){
         this.removeHead();
       }
       let runner = this.head;
       while (runner.next.data != val) {
         runner = runner.next;
       }
       nodeToBeRemoved = runner.next;
       runner.next = runner.next.next
       nodeToBeRemoved.next = null;
       return nodeToBeRemoved.data;
     }
   
     prepend(newVal, targetVal) {
       if(this.isEmpty()){
         this.insertAtBack(newVal);
       }
       if(this.head.data === targetVal){
         this.insertAtFront(newVal);
       }
       let runner = this.head;
       while(runner.next.data != targetVal){
         runner = runner.next;
       }
       const newNode = new ListNode(newVal);
       newNode.next = runner.next;
       runner.next = newNode
     }
   
   
   
     insertAtBackMany(vals) {
       for (const item of vals) {
         this.insertAtBack(item);
       }
       return this;
     }
   
   
     toArr() {
       const arr = [];
       let runner = this.head;
   
       while (runner) {
         arr.push(runner.data);
         runner = runner.next;
       }
       return arr;
     }
   }
   
   /******************************************************************* 
   Multiple test lists already constructed to test your methods on.
   Below commented code depends on insertAtBack method to be completed,
   after completing it, uncomment the code.
   */
   const emptyList = new SinglyLinkedList();
   
   const singleNodeList = new SinglyLinkedList().insertAtBackMany([1]);
   const biNodeList = new SinglyLinkedList().insertAtBackMany([1, 2]);
   const firstThreeList = new SinglyLinkedList().insertAtBackMany([1, 2, 3]);
   const secondThreeList = new SinglyLinkedList().insertAtBackMany([4, 5, 6]);
   const unorderedList = new SinglyLinkedList().insertAtBackMany([
     -5, -10, 4, -3, 6, 1, -7, -2,
   ]);
   
   
   // Print your list like so:
   console.log(firstThreeList.toArr());
   
   firstThreeList.insertAtBackRecursive(5)
   
   console.log(firstThreeList.toArr());