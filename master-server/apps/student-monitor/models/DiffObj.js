module.exports = {
  deletions: Number,
  additions: Number,
  total: Number,
  files: [{
    new: Boolean,
    index: String,
    mode: Number,
    from: String,
    to: String,
    deletions: Number,
    additions: Number,
    total: Number,
    parts: [{
      before:{
        start:Number,
        length:Number
      },
      after:{
        start:Number,
        length:Number
      },
      deletions: Number,
      additions: Number,
      total: Number,
    }]
  }]
};
