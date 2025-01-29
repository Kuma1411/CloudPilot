(() => {

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, className, id, textContent, href } = obj;

    if (className) {
        const element = document.querySelector(`[class="${className}"]`);
        if (element) {
            element.style.border = '2px solid red';
            element.style.borderRadius = '8px';
        }
      }
    
    if (id) {
    const elementById = document.getElementById(id);
    if (elementById) {
        elementById.style.border = '2px solid red';
        elementById.style.borderRadius = '8px';
    }
    }

  });


})();
