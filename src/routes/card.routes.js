import { Router } from "express";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { createCard, updateCard, deleteCard, getAllPublicCard, getMyCard } from "../controllers/card.controller.js";

const router =Router();

router.use(verifyJWT);

//all secured routes
router.route('/create-card').post(createCard);
router.route('/update-card').post(updateCard);
router.route('/delete-card').post(deleteCard);
router.route('/get-all-public-card').get(getAllPublicCard);
router.route('/get-my-card').get(getMyCard);

export default router;