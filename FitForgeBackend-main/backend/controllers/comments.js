const Comment = require("../models/Comment");
const Post = require("../models/Post");
const queryCreator = require("../commonHelpers/queryCreator");
const _ = require("lodash");

exports.addComment = async (req, res, next) => {
  try {
    const commentData = _.cloneDeep(req.body);
    commentData.user = req.user._id;
    const newComment = new Comment(queryCreator(commentData));

    await newComment.save();
    await newComment.populate("user", "firstName lastName email avatarUrl");

    res.json(newComment);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });

    if (!comment) {
      return res.status(404).json({
        message: `Comment with id "${req.params.id}" is not found.`,
      });
    }

    if (!(req.user.isAdmin || req.user._id.toString() === comment.user.toString())) {
      return res.status(403).json({
        message: `You don't have permission to perform this action.`,
      });
    }

    const commentData = _.cloneDeep(req.body);
    const updatedComment = queryCreator(commentData);

    const result = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedComment },
      { new: true },
    ).populate("user", "firstName lastName email avatarUrl");

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id });

    if (!comment) {
      return res.status(404).json({
        message: `Comment with id "${req.params.id}" is not found.`,
      });
    }

    if (!(req.user.isAdmin || req.user._id.toString() === comment.user.toString())) {
      return res.status(403).json({
        message: `You don't have permission to perform this action.`,
      });
    }

    await Comment.deleteOne({ _id: req.params.id });

    res.status(200).json({
      message: `Comment is successfully deleted from DB.`,
    });
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};

exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find()
      .populate("user", "firstName lastName email avatarUrl");

    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};

exports.getUserComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ user: req.params.userId })
      .populate("user", "firstName lastName email avatarUrl");

    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};

exports.getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "firstName lastName email avatarUrl");

    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err.message}"`,
    });
  }
};