const Award = require("../models/Award");

const queryCreator = require("../commonHelpers/queryCreator");
const _ = require("lodash");

exports.addAward = (req, res, next) => {
  const awardData = _.cloneDeep(req.body);
  const newAward = new Award(queryCreator(awardData));

  newAward
    .save()
    .then((award) => res.json(award))
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on : "${err}" `,
      }),
    );
};

exports.updateAward = (req, res, next) => {
  Award.findOne({ _id: req.params.id })
    .then((award) => {
      if (!award) {
        return res.status(404).json({
          message: `Award with id "${req.params.id}" is not found.`,
        });
      } else {
        const awardData = _.cloneDeep(req.body);

        const updatedAward = queryCreator(awardData);

        Award.findOneAndUpdate(
          { _id: req.params.id },
          { $set: updatedAward },
          { new: true },
        )
          .then((award) => res.json(award))
          .catch((err) =>
            res.status(400).json({
              message: `Error happened on : "${err}" `,
            }),
          );
      }
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on : "${err}" `,
      }),
    );
};

exports.deleteAward = (req, res, next) => {
  Award.findOne({ _id: req.params.id }).then(async (award) => {
    if (!award) {
      return res.status(404).json({
        message: `Award with id "${req.params.id}" is not found.`,
      });
    }

    Award.deleteOne({ _id: req.params.id })
      .then((deletedCount) =>
        res.status(200).json({
          message: `Award is successfully deleted from DB.`,
        }),
      )
      .catch((err) =>
        res.status(400).json({
          message: `Error happened on : "${err}" `,
        }),
      );
  });
};

exports.getAwards = (req, res, next) => {
  console.log('[DEBUG] getAwards called');
  Award.find()
    .then((awards) => {
      console.log('[DEBUG] Found awards:', awards.length);
      res.json(awards);
    })
    .catch((err) => {
      console.error('[ERROR] getAwards failed:', err);
      res.status(400).json({
        message: `Error happened on : "${err}" `,
      });
    });
};

exports.getAwardById = (req, res, next) => {
  Award.findOne({
    _id: req.params.id,
  })
    .then((award) => {
      if (!award) {
        res.status(404).json({
          message: `Award with id "${req.params.id}" is not found.`,
        });
      } else {
        res.json(award);
      }
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on : "${err}" `,
      }),
    );
};
