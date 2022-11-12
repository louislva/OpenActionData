const rrweb = require("rrweb");

(() => {
    const stopRecording = rrweb.record({
        emit(event: any) {
            chrome.runtime.sendMessage({type: "event", data: event});
        },
    });
})();
