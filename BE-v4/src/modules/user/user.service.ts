import User from './user.model';
import bcrypt from 'bcrypt';

export const createUser = async (userData: any) => {
  // ❌ NO PASSWORD HASHING HERE
  return await User.create(userData);
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const validatePassword = async (
  enteredPassword: string,
  storedPassword: string
) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};