import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  //total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "INR",
      });
    } catch (error) {
      console.log(error);
    }
  };
  //detele item
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  
 // const PaymentButton = ({ cart, auth }) => {
   
  
    const handlepayment = async (cart) => {
      try {
        // Set the loading state to indicate processing
        setLoading(true);
        //    console.log("HEy");
        // Create the order on the server
        let buyerid=auth.user._id
       console.log(buyerid)
        const response = await axios.post(`${process.env.REACT_APP_API}/api/v1/product/create-order`, {
          cart 
        });
  
        const { orderId } = response.data;
        let total = 0;
cart.map((i) => {
  total += i.price;
});

        // Call the Razorpay checkout function to initiate payment
        const options = {
          key: 'rzp_test_pV4PbUj2Rgjt17',
          amount: total,
          currency: 'INR',
         // name: 'My Store',
          description: 'Order payment',
          order_id: orderId,
          handler: function (response) {
            // Handle the payment success response
            handlePaymentSuccess(orderId,response.razorpay_payment_id, response.razorpay_signature,buyerid,cart);
          },
          prefill: {
            email: auth?.user.email,
          },
        };
  
        const rzp = new window.Razorpay(options);
        rzp.open();
  
        // Reset the loading state
        setLoading(false);
      
      } catch (error) {
        console.error('Error handling payment:', error);
        // Reset the loading state
        setLoading(false);
      }
    };
  
    const handlePaymentSuccess = async (orderId,paymentId, signature,buyerid,cart) => {
      try {
        // Send the payment success details to the server
        await axios.post(`${process.env.REACT_APP_API}/api/v1/product/verify`, {orderId, paymentId, signature,buyerid,cart });
  
        // Handle the successful payment on the frontend (e.g., display success message, update UI)
        console.log('Payment success');
  
        // Reset the cart
        localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
        // Implement the logic to reset the cart state
      } catch (error) {
        console.error('Error handling payment success:', error);
      }
    };



  return (
    <Layout>
      <div className=" cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello  ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      auth?.token ? "" : "please login to checkout !"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container " >
          <div className="row ">
            <div className="col-md-7  p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top object-fit-contain border rounded"
                      alt={p.name}
                      width="100%"
                      height={"150px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    
                    <p>Price : {p.price}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary ">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total : {totalPrice()} </h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Current Address</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Plase Login to order
                    </button>
                  )}
                </div>
              )}
               <div className="mb-3">
              <button
                       className="btn btn-primary"
                       onClick={() => handlepayment(cart)}
                       disabled={!auth?.user?.address || loading}
                     >
                       {loading ? 'Processing ....' : 'Place Order'}
                    
                    </button></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;



