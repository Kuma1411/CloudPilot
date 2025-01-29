(() => {

  
function extractDOM() {
  var elements = document.querySelectorAll('button, a, input, select, textarea');
  var visibleElements = [];

  elements.forEach(function(element) {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {  // Ensures the element is visible
          var className = element.className || '';
          var textContent = element.textContent || element.value || '';
          visibleElements.push({
              className: className,
              textContent: textContent.trim(),
          });
      }
  });

  return visibleElements;
  }



  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, body } = obj;
    if (type === "steps") {
        if (body) {
          const element = document.querySelector(`[class="${body}"]`);
          if (element) {
              element.style.border = '2px solid red';
              element.style.borderRadius = '8px';
          }
        }
    }

    if (type === "extractDOM") {
      response(extractDOM());
    }

  });
})();




