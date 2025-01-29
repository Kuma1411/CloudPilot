(() => {

  
function extractDOM() {
  var elements = document.querySelectorAll('button, a, input, select, textarea');
  var visibleElements = [];

  elements.forEach(function(element) {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {  // Ensures the element is visible
          var type = element.tagName.toLowerCase();
          var id = element.id || '';
          var className = element.className || '';
          var textContent = element.textContent || element.value || '';
          var href = element.href || '';

          visibleElements.push({
              type: type,
              id: id,
              className: className,
              textContent: textContent.trim(),
              href: href
          });
      }
  });

  return visibleElements;
  }



  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, body } = obj;
    if (type === "steps") {
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
    }

    if (type === "extractDOM") {
      response(extractDOM());
    }

  });
})();




