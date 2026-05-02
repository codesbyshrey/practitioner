class Node {
     constructor(data) {
       this.data = data;
       this.next = null;
     }
   }
 
 class Queue {
   
     constructor() {
       this.head = null;
     }
   
     enqueue(item) {
       const addNode = new Node(item)
   
       if(this.isEmpty()) {
         this.head = addNode
         return 1
       }
   
       let runner = this.head
       
       while(runner.next) {
         runner = runner.next
       }
   
       runner.next = addNode
   
       return this.size()
     }
 
 
   
     dequeue() {
       if(this.isEmpty()) {
         return null
       }
       
       const oldHead = this.head
       this.head = this.head.next
       return oldHead.data
     }
   
     front() {
       if(this.isEmpty()) {
         return this.head
       }
   
       return this.head.data
     }
   
     isEmpty() {
       if(this.head === null) {
         return true
       } else {
         return false
       }
     }
   
     size() {
       let runner = this.head
       let count = 1
       while (runner.next) {
         runner = runner.next
         count++
       }
       return count
     }
 
     // Print
     print() {
       let runner = this.head;
       let vals = "";
   
       while (runner) {
         vals += `${runner.data}${runner.next ? ", " : ""}`;
         runner = runner.next;
       }
       console.log(`Head: ${this.head.data}`)
       console.log(vals);
       return vals;
     }
   
     arrToQueue(arr){
       for(const item of arr){
         this.enqueue(item);
       }
     }
     
   }
     
 
   
   
   const test1 = new Queue();
   test1.arrToQueue(['a','b','c','d','e'])
   const test2 = new Queue();
   test2.arrToQueue(['a','b','c','d','e'])
   const test3 = new Queue();
   test3.arrToQueue(['a','b','c','e','d'])
   const test4 = new Queue();
   test4.arrToQueue(['a','b','c'])
 
 
 
 
 
 
   const ptest1 = new Queue();
   ptest1.arrToQueue(['a','b','c','d','e'])
 
   const ptest2 = new Queue();
   ptest2.arrToQueue(['a','b','c','b','a'])
 
 
   // ptest1.print();
   // ptest2.print();