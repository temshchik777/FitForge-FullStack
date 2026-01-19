const express = require("express");
const router = express.Router();
const passport = require("passport");

//Import controllers
const {
  createUser,
  loginUser,
  getUserById,
  editUserInfo,
  updatePassword,
  addAwardToUser,
  deleteAwardFromUser,
  getUsersFilterParams,
  addUserToFollowers,
  deleteUserFromFollowers,
} = require("../controllers/users");

const {
  savePost,
  unsavePost,
  getSavedPosts,
} = require("../controllers/savedPosts");

// @route   GET /api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  },
);

// @route   POST /api/users
// @desc    Register user
// @access  Public
router.post("/", createUser);

// @route   POST /api/users/login
// @desc    Login user / Returning JWT Token
// @access  Public
router.post("/login", loginUser);

// @route   PUT /api/users
// @desc    Return current user
// @access  Private
router.put("/", passport.authenticate("jwt", { session: false }), editUserInfo);

// @route   POST /api/users/update-password
// @desc    Return current user and success or error message
// @access  Private
router.put(
  "/update-password",
  passport.authenticate("jwt", { session: false }),
  updatePassword,
);

// @route   GET /api/users/saved
// @desc    Get all saved posts
// @access  Private
router.get(
  "/saved",
  passport.authenticate("jwt", { session: false }),
  getSavedPosts,
);

// @route   GET /api/users/:id
// @desc    GET existing user
// @access  Public
router.get("/:id", getUserById);

// @route   PUT /api/users/awards/:awardId
// @desc    Add award to user
// @access  Private
router.put(
  "/awards/:awardId",
  passport.authenticate("jwt", { session: false }),
  addAwardToUser,
);

// @route   DELETE /api/users/awards/:awardId
// @desc    Delete award from user
// @access  Private
router.delete(
  "/awards/:awardId",
  passport.authenticate("jwt", { session: false }),
  deleteAwardFromUser,
);

// @route   PUT /api/users/followers/:userId
// @desc    Add user to follower list
// @access  Private
router.put(
    "/followers/:userId",
    passport.authenticate("jwt", { session: false }),
    addUserToFollowers,
);

// @route   DELETE /api/users/followers/:userId
// @desc    Delete user from follower list
// @access  Private
router.delete(
    "/followers/:userId",
    passport.authenticate("jwt", { session: false }),
    deleteUserFromFollowers,
);

// @route   POST /api/users/saved/:postId
// @desc    Save post to user's saved posts
// @access  Private
router.post(
  "/saved/:postId",
  passport.authenticate("jwt", { session: false }),
  savePost,
);

// @route   DELETE /api/users/saved/:postId
// @desc    Remove post from user's saved posts
// @access  Private
router.delete(
  "/saved/:postId",
  passport.authenticate("jwt", { session: false }),
  unsavePost,
);

// @route   GET api/users
// @desc    GET appropriate filtered users
// @access  Public
router.get("/", getUsersFilterParams);

module.exports = router;
