// responsive design for scrolling and other elements

function scrollToElement(elementSelector, instance = 0){
     // Select all elements that match the given selector
     const elements = document.querySelectorAll(elementSelector);
     // Check if there are elements matching the selector and if the request instance exists

     if(elements.length > instance) {
          // Scroll to that specific element instance
          elements[instance].scrollIntoView({ behavior: 'smooth'});
     }
}

const link1 = document.getElementById('link1')
const link2 = document.getElementById('link2')
const link3 = document.getElementById('link3')

link1.addEventListener('click', ()=> {
     scrollToElement('.header');
})
link2.addEventListener('click', ()=> {
     // Scroll to second element that is header
     scrollToElement('.header', 1);
})
link3.addEventListener('click', ()=> {
     scrollToElement('.column');
})