// Mengambil elemen tombol dengan id "deteksi"
var button = document.getElementById("deteksi");

// Menambahkan event listener untuk mendeteksi klik pada tombol
button.addEventListener("click", function() {
    // Mengarahkan pengguna ke elemen dengan id "detection"
    document.getElementById("detection").scrollIntoView({
        behavior: "smooth"
    });
});