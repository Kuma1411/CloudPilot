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
    const style = document.createElement('style');
    style.innerHTML = `
    .glow {
      /* width: 220px;
      height: 50px; */
      border: none;
      outline: none;
      /* color: #fff; */
      /* background: #111; */
      cursor: pointer;
      position: relative;
      z-index: 0;
      border-radius: 10px;
  }
  
  .glow:before {
      content: '';
      background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
      position: absolute;
      top: 0px;
      left: 0px;
      background-size: 400%;
      z-index: -1;
      filter: blur(5px);
      width: calc(100% + 1px);
      height: calc(100% + 1px);
      animation: glowing 8s linear infinite;
      opacity: 1
      border-radius: 10px;
  }
  
  .glow:after {
      z-index: -1;
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: #fff;
      left: 0;
      top: 0;
      border-radius: 10px;
  }
  
  @keyframes glowing {
    0% { background-position: 0 0; }
    50% { background-position: 400% 0; }
    100% { background-position: 0 0; }
  }`
    
    // Append the style to the head of the document
    document.head.appendChild(style);

    if (type === "steps") {
        if (body) {
          const element = document.querySelector(`[class="${body}"]`);
          if (element) {
            element.classList.add('glow');
          }
        }
    }

    if (type === "extractDOM") {
      response(extractDOM());  // Respond with the list of visible elements
    }

  });



})();
