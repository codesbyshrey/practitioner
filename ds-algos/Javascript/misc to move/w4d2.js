class QueueNode{
     constructor(data){
       this.data = data;
       this.next = null;
     }
   }
   
   /**
    * Class to represent a queue using an array to store the queued items.
    * Follows a FIFO (First In First Out) order where new items are added to the
    * back and items are removed from the front.
    */
   class Queue {
     
     constructor() {
       this.head = null;
     }
   
     /**
      * Adds a new given item to the back of this queue.
      * - Time: O(n) constant.
      * - Space: O(n) constant.
      * @param {any} item The new item to add to the back.
      * @returns {number} The new size of this queue.
      */
     enqueue(item) {}
   
     /**
      * Removes and returns the first item of this queue.
      * - Time: O(1) 
      * - Space: O(1) constant.
      * @returns {any} The first item or undefined if empty.
      */
     dequeue() {}
   
     /**
      * Retrieves the first item without removing it.
      * - Time: O(1) constant.
      * - Space: O(1) constant.
      * @returns {any} The first item or undefined if empty.
      */
     front() {}
   
     /**
      * Returns whether or not this queue is empty.
      * - Time: O(1) constant.
      * - Space: O(1) constant.
      * @returns {boolean}
      */
     isEmpty() {}
   
     /**
      * Retrieves the size of this queue.
      * - Time: O(n) constant.
      * - Space: O(n) constant.
      * @returns {number} The length.
      */
     size() {}
    
   }
   
   // uncomment after enqueue()
   // const newQueue = new Queue();
   // newQueue.enqueue(5);
   // newQueue.enqueue(4);
   // newQueue.enqueue(3);
   // newQueue.enqueue(2);
   // newQueue.enqueue(1);