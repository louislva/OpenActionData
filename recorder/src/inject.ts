const rrweb = require('rrweb');

console.log("Injected + imported", Object.keys(rrweb || {}));

rrweb.record({
    emit(event: any) {
        console.log(event);
    },
});