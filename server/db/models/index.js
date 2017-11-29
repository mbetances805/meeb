const User = require('./user');
const Drawing = require('./drawing');
const Stroke = require('./stroke');
const Whiteboard = require('./whiteboard');
const Note = require('./note')
const Message = require('./message')
const Attendees = require('./attendees')
const Branch = require('./branch')


Drawing.hasMany(Stroke);
Drawing.belongsTo(User);
Note.belongsTo(User);
Whiteboard.belongsToMany(User, { through: Attendees });
User.belongsToMany(Whiteboard, { through: Attendees });
Whiteboard.belongsTo(User);
Whiteboard.hasMany(Note);
Whiteboard.hasMany(Drawing);
Message.belongsTo(User);
Message.belongsTo(Whiteboard);

Note.belongsToMany(Note, { as: 'endNotes', through: Branch })
Branch.belongsTo(Whiteboard)


module.exports = {
  User, Drawing, Stroke, Whiteboard, Note, Message, Attendees, Branch
}
