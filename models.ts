import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const SliderSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  orderIndex: { type: Number, default: 0 },
});

const TickerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now },
});

const GallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const StatSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '' },
});

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const OfficerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  imageUrl: { type: String, required: true },
  orderIndex: { type: Number, default: 0 },
});

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const ResultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
});

export const User = mongoose.model('User', UserSchema);
export const Slider = mongoose.model('Slider', SliderSchema);
export const Ticker = mongoose.model('Ticker', TickerSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const Gallery = mongoose.model('Gallery', GallerySchema);
export const Stat = mongoose.model('Stat', StatSchema);
export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export const Officer = mongoose.model('Officer', OfficerSchema);
export const Message = mongoose.model('Message', MessageSchema);
export const Page = mongoose.model('Page', PageSchema);
export const Result = mongoose.model('Result', ResultSchema);
export const Setting = mongoose.model('Setting', SettingSchema);
