const semuaTombol = document.querySelectorAll(".btn-tambah");

let daftarPesanan = [];
let totalHarga = 0;

const listCheckout = document.getElementById("list-checkout");
const totalHargaText = document.getElementById("total-harga");
const btnCheckout = document.getElementById("btn-checkout");

// =================================
// TAMBAH PRODUK
// =================================

semuaTombol.forEach(function (tombol) {

    tombol.addEventListener("click", function () {

        // ambil data dari atribut button
        const namaProduk = tombol.dataset.nama;
        const harga = parseInt(tombol.dataset.harga);

        // simpan ke array
        daftarPesanan.push({
            nama: namaProduk,
            harga: harga
        });

        totalHarga += harga;

        tampilkanCheckout();

        tombol.textContent = "✅ ditambahkan";

        setTimeout(function () {
            tombol.textContent = "+ Tambah";
        }, 1500);

    });

});

// =================================
// TAMPILKAN CHECKOUT
// =================================

function tampilkanCheckout() {

    listCheckout.innerHTML = "";

    if (daftarPesanan.length === 0) {

        listCheckout.innerHTML =
            "<p>Belum ada produk dipilih.</p>";

    } else {

        daftarPesanan.forEach(function (item, index) {

            listCheckout.innerHTML += `
                <div class="item-checkout">

                    <div>
                        <strong>${item.nama}</strong><br>
                        Rp ${item.harga.toLocaleString("id-ID")}
                    </div>

                    <button onclick="hapusItem(${index})">
                        Hapus
                    </button>

                </div>
            `;

        });

    }

    totalHargaText.textContent =
        "Rp " + totalHarga.toLocaleString("id-ID");

}

// =================================
// HAPUS ITEM
// =================================

function hapusItem(index) {

    totalHarga -= daftarPesanan[index].harga;

    daftarPesanan.splice(index, 1);

    tampilkanCheckout();

}

// =================================
// CHECKOUT
// =================================

btnCheckout.addEventListener("click", function () {

    if (daftarPesanan.length === 0) {

        alert("Keranjang masih kosong!");
        return;

    }

    alert(
        "Checkout berhasil!\n\nTotal pembayaran: Rp " +
        totalHarga.toLocaleString("id-ID")
    );

    daftarPesanan = [];
    totalHarga = 0;

    tampilkanCheckout();

});

// =================================
// FEEDBACK FORM
// =================================

const formKontak = document.getElementById("form-kontak");
const pesanSukses = document.getElementById("pesan-sukses");

formKontak.addEventListener("submit", function (event){

    event.preventDefault();

    pesanSukses.style.display = "block";

    formKontak.reset();

    setTimeout(function () {
        pesanSukses.style.display = "none";
    }, 2000);

});

// =================================
// ANIMASI JUDUL
// =================================

const judul = document.querySelector(".hero-teks h1");

judul.style.opacity = "0";
judul.style.transform = "translateY(30px)";

setTimeout(function () {

    judul.style.transition = "all 1s ease";
    judul.style.opacity = "1";
    judul.style.transform = "translateY(0)";

}, 300);

let skala = 1;
let naik = true;

setInterval(function () {

    if (naik) {

        skala += 0.01;

        if (skala >= 1.05) {
            naik = false;
        }

    } else {

        skala -= 0.01;

        if (skala <= 1) {
            naik = true;
        }

    }

    judul.style.transform =
        "scale(" + skala + ")";

}, 50);

// =================================
// ANIMASI SCROLL FADE IN
// =================================

const semuaFade = document.querySelectorAll(".fade-scroll");

function tampilScroll() {

    semuaFade.forEach(function (item) {

        const posisi = item.getBoundingClientRect().top;
        const tinggiLayar = window.innerHeight;

        if (posisi < tinggiLayar - 100) {
            item.classList.add("show");
        }

    });

}

window.addEventListener("scroll", tampilScroll);

tampilScroll();