const scannerVideoPreview = document.getElementById("scannerVideoPreview");
scannerVideoPreview.poster = "camera-notfound.jpg";

const btnStartScanning = document.getElementById("btnStartScanning");
const btnStopScanning = document.getElementById("btnStopScanning");
const btnSwitchScanning = document.getElementById("btnSwitchCamera");
const scanMessage = document.getElementById("scanMessage");

const imgLoading = document.getElementById("imgLoading");
const imgSuccess = document.getElementById("imgSuccess");
const imgError = document.getElementById("imgError");
const imgWarning = document.getElementById("imgWarning");
const imgWaiting = document.getElementById("imgWaiting");

const blueColor = "rgba(0, 130, 255, 0.5)";
const greenColor = "rgba(0, 255, 0, 0.3)";
const redColor = "rgba(255, 0, 0, 0.3)";
const orangeColor = "rgba(255, 130, 0, 0.5)";
const yellowColor = "rgba(255, 255, 0, 0.5)";

const audio = new Audio();
const msgTimeout = 5 * 1000;

let scannerOpt = {
  // Whether to scan continuously for QR codes. If false, use scanner.scan() to manually scan.
  // If true, the scanner emits the "scan" event when a QR code is scanned. Default true.
  continuous: true,
  // The HTML element to use for the camera's video preview. Must be a <video> element.
  // When the camera is active, this element will have the "active" CSS class, otherwise,
  // it will have the "inactive" class. By default, an invisible element will be created to
  // host the video.
  video: scannerVideoPreview,
  // Whether to horizontally mirror the video preview. This is helpful when trying to
  // scan a QR code with a user-facing camera. Default true.
  mirror: true,
  // Whether to include the scanned image data as part of the scan result. See the "scan" event
  // for image format details. Default false.
  captureImage: true,
  // Only applies to continuous mode. Whether to actively scan when the tab is not active.
  // When false, this reduces CPU usage when the tab is not active. Default true.
  backgroundScan: true,
  // Only applies to continuous mode. The period, in milliseconds, before the same QR code
  // will be recognized in succession. Default 5000 (5 seconds).
  refractoryPeriod: 5000,
  // Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
  // increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
  scanPeriod: 1,
};
let scanner = new Instascan.Scanner(scannerOpt);
var selectedCamera = 0;
var loadedCameras;

scanner.addListener("scan", (content, image) => {
  if (!content) return;
  audio.src = "scanned-bip-sound.mp3";
  audio.play();
  sendCode(content);
});

scanner.addListener("active", () => {
  imgLoading.style.display = "block";
  btnStartScanning.disabled = true;
  btnStopScanning.disabled = false;
  audio.src = "scanner-started-sound.mp3";
  audio.play();
  scanMessage.innerHTML = "Scanner is active.";
  scannerVideoPreview.style.backgroundColor = blueColor;
  setTimeout(function () {
    imgLoading.style.display = "none";
  }, 750);
});

scanner.addListener("inactive", () => {
  imgLoading.style.display = "block";
  btnStopScanning.disabled = true;
  btnStartScanning.disabled = false;
  scannerVideoPreview.poster = "camera-off.jpg";
  audio.src = "scanner-stopped-sound.mp3";
  audio.play();
  scanMessage.innerHTML = "Scanner is inactive.";
  scannerVideoPreview.style.backgroundColor = redColor;
  imgLoading.style.display = "none";
});

Instascan.Camera.getCameras()
  .then((cameras) => {
    console.log(cameras);
    imgLoading.style.display = "block";
    if (cameras.length > 0) {
      loadedCameras = cameras;
      if (cameras.length > 1) btnSwitchScanning.disabled = false;
      else btnSwitchScanning.disabled = false;
      scanner.start(cameras[selectedCamera]);
    } else {
      alert("No cameras found");
    }
  })
  .catch((err) => {
    console.error(err);
    alert(err.message);
    scannerVideoPreview.style.backgroundColor = yellowColor;
  });

function startScanner() {
  scanner
    .start()
    .then(() => {
      console.log("Scanner started", new Date().toLocaleString());
      sendCode("3b1ab9695d3e873cce3ee3786cb7");
    })
    .catch((err) => {
      console.error(err);
      alert(err.message);
    });
  return false;
}

function stopScanner() {
  scanner
    .stop()
    .then(() => {
      console.log("Scanner stopped", new Date().toLocaleString());
    })
    .catch((err) => {
      console.error(err);
      alert(err.message);
    });
  return false;
}

function switchCamera() {
  if (scanner != null) {
    if (loadedCameras && loadedCameras.length > 0) {
      if (selectedCamera < loadedCameras.length) {
        selectedCamera++;
      } else selectedCamera = 0;
      scanner.start(loadedCameras[selectedCamera]);
    } else {
      alert("No cameras found");
    }
  }
  return false;
}

function sendCode(scanContent) {
  imgLoading.style.display = "block";
  imgSuccess.style.display = "block";
  audio.src = "scanner-success-sound.mp3";
  audio.play();
  scanMessage.innerHTML = `${scanContent}`;
  scannerVideoPreview.style.backgroundColor = greenColor;

  setTimeout(function () {
    scannerVideoPreview.style.backgroundColor = blueColor;
    scanMessage.innerHTML = "Last code scanned successfully: " + scanContent;
    imgSuccess.style.display = "none";
  }, msgTimeout);
}
