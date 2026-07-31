import express, { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController";
// import { authMiddleware } from "../middleware/authMiddleware"; // Authentication middleware 

const router: Router = express.Router();

router.post("/create-order", createOrder); 
router.post("/verify", verifyPayment);

export default router;