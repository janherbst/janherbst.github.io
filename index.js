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
        }else if (res == "GOTOOVERWRITTEN"){
            moveScene(Images.OVERWRITTEN);
        }else if (res == "GOTOMENU"){
            moveScene(Images.MENU);
        }
        stopQR();
    }
}
