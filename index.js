const webcamElement = document.getElementById('webcam');
let net;

document.getElementById('classify-webcam').addEventListener('click', async () => {
  await setupWebcam();
  while (true) {
    const result = await net.classify(webcamElement);

    document.getElementById('console').innerText = `
      prediction: ${result[0].className}\n
      probability: ${result[0].probability}
    `;

    await tf.nextFrame();
  }
});

const fileElement = document.getElementById('file-input');
document.getElementById('classify-image').addEventListener('click', () => {
  fileElement.click();
});
fileElement.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const fileType = file['type'];
  if (fileType.search('image') >= 0) {
    const imageReader = new FileReader();

    imageReader.addEventListener('load', (imageEvent) => {
      const image = new Image();
      image.src = imageEvent.target.result;
      image.onload = async () => {
        document.getElementById('preview-image').innerHTML
          = '<img id="thumbnail" src="' + image.src + '" />';
        document.getElementById('thumbnail').style.width = "250px";
        document.getElementById('thumbnail').style.height = "250px";

        const result = await net.classify(image);
        document.getElementById('result').innerHTML = '<p>' + 
          JSON.stringify(result.reduce((prev, current) => {
            return (prev.probability > current.probability) ? prev : current;
          })) + '</p>'
      };
    });

    imageReader.readAsDataURL(file);
  }
});

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  document.getElementById('loading').style.visibility = 'hidden';
  document.getElementById('classify-webcam').classList.remove('loading');
  document.getElementById('classify-image').classList.remove('loading');
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();