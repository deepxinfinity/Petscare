import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    order_id:{
      type: String,
    },
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    
    payment: {type: String,
      },
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
