const rrweb = require("rrweb");

(() => {
  const createXPathFromElement = (elm: any): string | null => {
    var allNodes = document.getElementsByTagName("*");
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
      if (elm.hasAttribute("id")) {
        var uniqueIdCount = 0;
        for (var n = 0; n < allNodes.length; n++) {
          if (allNodes[n].hasAttribute("id") && allNodes[n].id == elm.id)
            uniqueIdCount++;
          if (uniqueIdCount > 1) break;
        }
        if (uniqueIdCount == 1) {
          segs.unshift('id("' + elm.getAttribute("id") + '")');
          return segs.join("/");
        } else {
          segs.unshift(
            elm.localName.toLowerCase() +
              '[@id="' +
              elm.getAttribute("id") +
              '"]'
          );
        }
      } else if (elm.hasAttribute("class")) {
        segs.unshift(
          elm.localName.toLowerCase() +
            '[@class="' +
            elm.getAttribute("class") +
            '"]'
        );
      } else {
        let i, sib;
        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
          if (sib.localName == elm.localName) i++;
        }
        segs.unshift(elm.localName.toLowerCase() + "[" + i + "]");
      }
    }
    return segs.length ? "/" + segs.join("/") : null;
  };
  const lookupElementByXPath = (path: string) => {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(
      path,
      document.documentElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  };
  const startRecordingClicks = (
    callback: (eventType: string, xpath: string) => void
  ) => {
    const eventTypes = ["click"];
    eventTypes.forEach((eventType) => {
      const onEvent = (e: any) => {
        console.log("ONEVENT");

        // Record the click
        const xpath = createXPathFromElement(e.target);
        if (xpath) callback(eventType, xpath);
      };
      document.addEventListener(eventType, onEvent);
    });
  };

  const stopRecording = rrweb.record({
    emit(event: any) {
      chrome.runtime.sendMessage({ type: "event", data: event });
    },
  });

  startRecordingClicks((eventType, xpath) => {
    console.log(eventType, xpath);
    chrome.runtime.sendMessage({
      type: "xpathEvent",
      data: {
        eventType,
        xpath,
        timestamp: Date.now(),
      },
    });
  });
})();
