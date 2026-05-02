const menu = document.getElementById("menu");

Array.from(document.getElementsByClassName("menu-item"))
     .forEach((item, index) => {
          item.onmouseover = () => {
               menu.dataset.activeIndex = index;
          }
     })


// double check video briefly, must've missed something
// super cool to have on hand though