(() => {


  function extractDOM() {
    var elements = document.querySelectorAll('button, a, input, select, textarea');
    var visibleElements = [];

    elements.forEach(function(element) {
            var textContent = element.textContent || element.value;

            // If there's no direct textContent, check child elements
            if (!textContent && element.children.length > 0) {
                element.childNodes.forEach(function(child) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        textContent = child.textContent.trim();
                        visibleElements.push(textContent.trim());
                    }
                });
            }
            if (textContent && textContent.trim()) {
                visibleElements.push(textContent.trim());
            }
    });

    return visibleElements;
  }


  function findElementByTextInDOM(searchText) {
    var elements = document.querySelectorAll('button, a, input, select, textarea');
    searchText = searchText.trim().toLowerCase();  // Normalize the search text

    for (let element of elements) {
        var textContent = element.textContent || element.value;

        // If there's text content in the element, check it
        if (textContent) {
            textContent = textContent.trim().toLowerCase();

            // If the element's direct text content matches, return the element
            if (textContent.includes(searchText)) {
                return element;
            }
        }


        if (element.children.length > 0) {
            for (let child of element.childNodes) {
                if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().toLowerCase().includes(searchText)) {
                    return element;
                }
            }
        }
    }

    return null;  
  }


  function openHiddenNavIfNeeded(element) {
    const navElements = document.querySelectorAll('nav[aria-hidden="true"]');
    navElements.forEach(nav => {

      if (element && nav.contains(element)) {
        const navbar = document.querySelector('button[aria-label="Open navigation drawer"]');
        if(navbar){
          navbar.click();
        }
      }
    });
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

    document.head.appendChild(style);

    if (type === "navigate") {
        if (body) {
          const element = findElementByTextInDOM(body);
          console.log(element)
          if (element) {
            openHiddenNavIfNeeded(element);
            if (element.getBoundingClientRect().top >= window.innerHeight || element.getBoundingClientRect().bottom <= 0) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            element.classList.add('glow');
          }
        }
    }

    if (type === "extractDOM") {
      response(extractDOM()); 
    }

  });



})();
