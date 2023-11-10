const videoElement = document.getElementById('videoElement');
const cameraCardBody = document.getElementById('cameraCardBody');

// Meminta izin akses kamera pengguna saat halaman dimuat
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        // Menetapkan stream kamera ke elemen video
        videoElement.srcObject = stream;
    })
    .catch(function (error) {
        console.error('Error accessing the camera: ', error);
    });

// // Mengatur tinggi card-body sesuai dengan tinggi video
// videoElement.onloadedmetadata = function () {
//     cameraCardBody.style.height = videoElement.clientHeight + 'px';
// };
