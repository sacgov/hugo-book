window.addEventListener("load", function () {
    
  var opacityTimeout;
  var contentTimeout;
  var transitionDurationMs = 100;

  var elemDiv = document.createElement("div");
  elemDiv.style.cssText = "opacity: 0; display: none;";
  elemDiv.setAttribute("id", "tooltip-wrapper");
  var contentDiv = document.createElement("div");
  contentDiv.setAttribute("id", "tooltip-content");
  elemDiv.appendChild(contentDiv);
  document.body.appendChild(elemDiv);

  iframeElem = document.createElement("iframe");
  iframeElem.style.cssText = "display: none; height: 0; width: 0;";
  iframeElem.setAttribute("id", "link-preview-iframe");
  document.body.appendChild(iframeElem);

  var iframe = document.getElementById("link-preview-iframe");
  var tooltipWrapper = document.getElementById("tooltip-wrapper");
  var tooltipContent = document.getElementById("tooltip-content");

  var linkHistories = {};

  function hideTooltip() {
    opacityTimeout = setTimeout(function () {
      tooltipWrapper.style.opacity = 0;
      contentTimeout = setTimeout(function () {
        tooltipContent.innerHTML = "";
        tooltipWrapper.style.display = "none";
      }, transitionDurationMs + 1);
    }, transitionDurationMs);
  }

  function showTooltip(event) {
    var elem = event.target;
    var elem_props = elem.getClientRects()[elem.getClientRects().length - 1];
    var top = window.scrollY || document.documentElement.scrollTop;
    var url = event.target.getAttribute("href");
    if (
      url.indexOf("http") === -1 ||
      url.indexOf(window.location.host) !== -1
    ) {
      console.log("entering here")
      let contentURL = url.split("#")[0];
      if (!linkHistories[contentURL]) {
        iframe.src = contentURL;
        iframe.onload = function () {


          let content = iframe.contentWindow.document.querySelector(".markdown");
          if (content.firstChild.nodeName == "H1") {
            content.removeChild(content.firstElementChild)
          }
          tooltipContentHtml = content.innerHTML;
          console.log(tooltipContentHtml.length,"length")
          tooltipContent.innerHTML = tooltipContentHtml;
          linkHistories[contentURL] = tooltipContentHtml;
          tooltipWrapper.style.display = "block";
          tooltipWrapper.scrollTop = 0;
          setTimeout(function () {
            tooltipWrapper.style.opacity = 1;
            if (url.indexOf("#") != -1) {
              let id = url.split("#")[1];
              const focus = tooltipWrapper.querySelector(`[id='${id}']`);
              focus.classList.add("referred");
              focus.scrollIntoView({ behavior: "smooth" }, true);
            } else {
              tooltipWrapper.scroll(0, 0);
            }
          }, 1);
        };
      } else {
        tooltipContent.innerHTML = linkHistories[contentURL];
        tooltipWrapper.style.display = "block";
        setTimeout(function () {
          tooltipWrapper.style.opacity = 1;
          if (url.indexOf("#") != -1) {
            let id = url.split("#")[1];
            const focus = tooltipWrapper.querySelector(`[id='${id}']`);
            focus.classList.add("referred");
            focus.scrollIntoView({ behavior: "smooth" }, true);
          } else {
            tooltipWrapper.scroll(0, 0);
          }
        }, 1);
      }

      function getInnerWidth(elem) {
        var style = window.getComputedStyle(elem);
        return (
          elem.offsetWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight) -
          parseFloat(style.borderLeft) -
          parseFloat(style.borderRight) -
          parseFloat(style.marginLeft) -
          parseFloat(style.marginRight)
        );
      }

      tooltipWrapper.style.left =
        elem_props.left -
        tooltipWrapper.offsetWidth / 2 +
        elem_props.width / 2 +
        "px";

      if (window.innerHeight - elem_props.top < tooltipWrapper.offsetHeight) {
        tooltipWrapper.style.top =
          elem_props.top + top - tooltipWrapper.offsetHeight - 10 + "px";
      } else if (
        window.innerHeight - elem_props.top >
        tooltipWrapper.offsetHeight
      ) {
        tooltipWrapper.style.top = elem_props.top + top + 35 + "px";
      }

      if (
        elem_props.left + elem_props.width / 2 <
        tooltipWrapper.offsetWidth / 2
      ) {
        tooltipWrapper.style.left = "10px";
      } else if (
        document.body.clientWidth - elem_props.left - elem_props.width / 2 <
        tooltipWrapper.offsetWidth / 2
      ) {
        tooltipWrapper.style.left =
          document.body.clientWidth - tooltipWrapper.offsetWidth - 20 + "px";
      }
    }
  }

  function setupListeners(linkElement) {
    
    linkElement.addEventListener("mouseleave", function (_event) {
      console.log("mouseLeave", linkElement)
      hideTooltip();
    });

    tooltipWrapper.addEventListener("mouseleave", function (_event) {
      hideTooltip();
    });

    linkElement.addEventListener("mouseenter", function (event) {
      clearTimeout(opacityTimeout);
      clearTimeout(contentTimeout);
      console.log("mouseEnter", linkElement)
      showTooltip(event);
    });

    tooltipWrapper.addEventListener("mouseenter", function () {
      clearTimeout(opacityTimeout);
      clearTimeout(contentTimeout);
    });
  }

  // function listInternalLinks
  document.querySelectorAll("a").forEach(function(link){
    const href = link.getAttribute("href")
    if(href.startsWith("#") || href.startsWith("/")) {
      // console.log(link)
      setupListeners(link)
    }
  });
});


