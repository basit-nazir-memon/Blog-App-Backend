const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: 'User' },
    following: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;