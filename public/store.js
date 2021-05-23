if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

function ready() {
    // let removeCartItemButtons = document.getElementsByClassName("btn-danger");
    // for( let i = 0; i < removeCartItemButtons.length; i++) {
    //     let button = removeCartItemButtons[i];
    //     button.addEventListener("click", removeCartItem);
    // }

    // let quantityInputs = document.getElementsByClassName("cart-quantity-input");
    // for (let i = 0; i < quantityInputs.length; i++) {
    //     let quantityInput = quantityInputs[i];
    //     quantityInput.addEventListener("change", quantityChanged);
    // }

    let addToCartButtons = document.getElementsByClassName("shop-item-btn");
    for (let i = 0; i < addToCartButtons.length; i++) {
        let addToCartButton = addToCartButtons[i];
        addToCartButton.addEventListener("click", addToCartClicked);
    }
    
    let purchaseButton = document.getElementsByClassName("btn-purchase")[0];
    purchaseButton.addEventListener("click", purchase);
}

let stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token) {
        let items = [];
        let cartItemContainer = document.getElementsByClassName("cart-items")[0];
        let cartRows = cartItemContainer.getElementsByClassName("cart-row");
        for (let i = 0; i < cartRows.length; i++) {
            cartRow = cartRows[i];
            let quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0];
            let quantity = quantityElement.value;
            let id = cartRow.dataset.itemId;
            items.push({
                id: id,
                quantity: quantity
            })
        }
        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            alert(data.message);
            let cartItems = document.getElementsByClassName("cart-items")[0];
            while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild);
            }
            updateCartTotal();
        }).catch(function(error) {
            console.error(error);
        });
    }
})

function purchase() {
    // let cartItems = document.getElementsByClassName("cart-items")[0];
    // while (cartItems.hasChildNodes()) {
    //     cartItems.removeChild(cartItems.firstChild);
    // }
    // updateCartTotal();
    let priceElement = document.getElementsByClassName("cart-total-price")[0];
    let price = parseFloat(priceElement.innerText.replace("$", "")) * 100;
    stripeHandler.open({
        amount: price

    })
}

function removeCartItem(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal(); 
}

function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    } else {
        updateCartTotal();
    }
}

function addToCartClicked(event) {
    let button = event.target;
    let shopItem = button.parentElement.parentElement;
    let itemImageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
    let itemTitle = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
    let itemPrice = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
    let itemId = shopItem.dataset.itemId;
    addItemToCart(itemTitle, itemPrice, itemImageSrc, itemId);
    updateCartTotal();
}

function addItemToCart(title, price, imageSrc, itemId) {
    let cartItems = document.getElementsByClassName("cart-items")[0];
    cartItemNames = cartItems.getElementsByClassName("cart-item-title");
    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert("This item is already added to the cart");
            return;
        }
    }
    let cartRow = document.createElement("div");
    cartRow.classList.add("cart-row")
    cartRow.dataset.itemId = itemId;

    cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" role="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    cartRow.getElementsByClassName("btn-danger")[0].addEventListener("click", removeCartItem);
    cartRow.getElementsByClassName("cart-quantity-input")[0].addEventListener("change", quantityChanged);

}

function updateCartTotal() {
    let newTotal = 0;
    let cartRowsContainer = document.getElementsByClassName("cart-items")[0];
    let cartRows = cartRowsContainer.getElementsByClassName("cart-row");
    for (let i = 0; i < cartRows.length; i++) {
        let rowPrice = cartRows[i].getElementsByClassName("cart-price")[0].innerText.replace("$", "");
        let rowQuantity = cartRows[i].getElementsByClassName("cart-quantity-input")[0].value;
        newTotal += parseFloat(rowPrice) * rowQuantity; 
    }
    let cartTotalContainer = document.getElementsByClassName("cart-total-price")[0];
    cartTotalContainer.innerText = "$" + newTotal.toFixed(2);
}
