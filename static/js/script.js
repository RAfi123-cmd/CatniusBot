document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const uploadedImage = document.getElementById('uploadedImage');
        uploadedImage.src = reader.result;
        uploadedImage.style.display = 'block';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}
// // Mengambil referensi tombol menggunakan ID
// var myButton = document.getElementById("detection");

// // Menambahkan event listener untuk menanggapi klik tombol
// myButton.addEventListener("click", function() {
//     // Mengarahkan pengguna ke halaman lain saat tombol diklik
//     window.location.href = "#detection";
// });