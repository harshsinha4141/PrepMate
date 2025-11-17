import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String, required: true, select: false },
    mobile: { type: String },
    dob: { type: Date },
    skills: { type: [String], default: [] },
    coins: { type: Number, default: 100 },
    interviewsGiven: { type: Number, default: 0 },
    interviewsTaken: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    resumeUrl: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("averageRating").get(function () {
  if (this.interviewsTaken === 0) return 0;
  return (this.ratingSum / this.interviewsTaken).toFixed(2);
});

export default mongoose.model("User", UserSchema);
