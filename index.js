const Images = {
    INTERVENTION: 0,
    MENU: 1,
    OVERWRITTEN: 2,
    START: 3,
    VERIFIED: 4
}

const video = document.createElement("video");
const qrResult = document.getElementById("qr-result");
const outputData = document.getElementById("outputData");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const overlay = document.getElementById("canvas-overlay");

const audioVerification = new Audio("verification.mp3");
const audioApproval = new Audio("approval.mp3");
const audioWait = new Audio("wait.mp3");
const audioAction = new Audio("action.mp3");

var scanning=false;

function changeImage(newImage, newMap){
    document.getElementById("mainimage").src = newImage;
    document.getElementById("mainimage").setAttribute("usemap", newMap);
}

function tick(){
    canvasElement.height = 360;
    canvasElement.width = 480;
    canvas.translate(480, 0);
    canvas.scale(-1, 1);
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  
    scanning && requestAnimationFrame(tick);
}

function scan(){
    try{
        qrcode.decode();
    } catch (e) {
        setTimeout(scan, 300);
    }
}

function startQR(){
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(function(stream){
        scanning = true;
        video.setAttribute("playsinline", true);
        video.srcObject = stream;
        video.play();
        canvasElement.hidden = false;
        overlay.hidden = false;

        tick();
        scan();
    });
}

function stopQR(){
    scanning = false;
    canvasElement.hidden = true;
    video.srcObject.getTracks().forEach(track => {
        track.stop();
      });
      overlay.hidden = true;
}

function moveScene(i){
    if(i == Images.INTERVENTION){
        changeImage("intervention.png", "#intervention");
        startQR();
    }else if(i == Images.MENU){
        changeImage("menu.png", "#menu");
    }else if (i == Images.OVERWRITTEN){
        changeImage("overwritten.png", "#overwritten");
        setTimeout(function(){ moveScene(Images.START); } , 5000);
    }else if(i == Images.START){
        changeImage("start.png", "#lessons");
    }else if(i == Images.VERIFIED){
        changeImage("verified.png", "#verified");
        setTimeout(function(){ moveScene(Images.START); } , 5000);
    }
}

function onPayClick(event){
    moveScene(Images.INTERVENTION);
    audioWait.play();
    
   audioVerification.load();
   audioApproval.load();
   audioAction.load();
    
   // audioVerification.play();
   // audioVerification.volume = 0;
   // audioApproval.play();
   // audioApproval.volume = 0;
   // audioAction.play();
   // audioAction.volume = 0;
}

function onExitClick(event){
    moveScene(Images.START);
}

// "GOTOVERIFIED"
// "GOTOOVERWRITTEN"
// "GOTOMENU"
// What happens when you scan a QR code
qrcode.callback = (res) => {
    if(res){
        console.log("QR Found!")
        console.log(res)
        if(res == "GOTOVERIFIED"){
            moveScene(Images.VERIFIED);
            audioVerification.volume = 1;
            audioVerification.play();
        }else if (res == "GOTOOVERWRITTEN"){
            moveScene(Images.OVERWRITTEN);
            audioApproval.volume = 1;
            audioApproval.play();
        }else if (res == "GOTOMENU"){
            moveScene(Images.MENU);
            audioAction.volume = 1;
            audioAction.play();
        }
        stopQR();
    }
}
