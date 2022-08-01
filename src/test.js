cc.log("Tien log o day");
setInterval(function () {
    // sendSpinRequest();
    sendTestRequest();
}, 1000);
setTimeout(() => {
    cc.log("Test");
}, 1000);
const sum = [1, 2, 3, 4, 5, 6].reduce((a, b) => a + b);
let included = [1, 2, 3, 4].includes(1);
