document.getElementById('cart-icon').addEventListener('click', function() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
});

document.getElementById('close-cart').addEventListener('click', function() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('cart-sidebar').classList.remove('active');
    this.classList.remove('active');
});

// Add to cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        alert('Product added to cart!');
    });
});