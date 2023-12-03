const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "candidate need first name"] },
    lastName: { type: String, required: [true, "candidate need lastName"] },
    birthday: { type: Date, required: [true, "must be provided a Date."] },
    height: { type: Number, required: [true, "a height must be  provided"] },
    gender: { type: String, required: [true, "gender need to be provided"] },
    phone: String,
    nationality: {
      type: String,
      required: [true, "nationality need to be provided"],
    },
    cin: { type: Number },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: [
        "chorist",
        "admin",
        "chef_pupitre",
        "chef_choeur",
        "manager_choeur",
      ],
    },

    address: { type: String, required: [true, "address need to be provided"] },
    musical_kbowledge: [{ type: String }],
    deleted: { type: Boolean, default: false },
    musical_instrument: String,
    nb_absence: { type: Number, default: 0 },
    status_elimination: {
      type: String,
      enum: ["absence", "disciplinary"],
    },
    group_pupitre: {
      type: String,
      enum: ["first", "second", "third", "fourth"],
    },
    status: [{ statuts: String, date: Date }],
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
