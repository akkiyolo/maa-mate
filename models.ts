import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── USER MODEL ────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  babyName: string;
  babyDob: string;
  avatarUrl?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  babyName: { type: String, default: '' },
  babyDob: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);

// ─── LOG MODEL ─────────────────────────────────────────────────────────

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'feeding' | 'sleep' | 'medicine' | 'diaper';
  details: string;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['feeding', 'sleep', 'medicine', 'diaper'], required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

export const Log = mongoose.model<ILog>('Log', LogSchema);

// ─── REMINDER MODEL ───────────────────────────────────────────────────

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  category: string;
  time: string;
  done: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  category: { type: String, default: 'general' },
  time: { type: String, default: 'Soon' },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);

// ─── ALERT MODEL ──────────────────────────────────────────────────────

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const AlertSchema = new Schema<IAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  timestamp: { type: Date, default: Date.now },
});

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);

// ─── CONVERSATION MODEL ───────────────────────────────────────────────

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  timestamp: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  intent: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
