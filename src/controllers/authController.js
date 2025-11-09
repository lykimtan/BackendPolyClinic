import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from './userController.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing idToken',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;
    if (!email || !email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email not available or not verified by Google',
      });
    }
    //find existing user by email
    let user = await User.findOne({ email });
    if (user) {
      //if user existing but no google Id, link to account
      if (!user.googleId) {
        //set googleId and provider
        user.googleId = googleId;
        user.provider = 'google';
        await user.save();
      } else if (user.googleId !== googleId) {
        //google id not match
        return res.status(401).json({
          success: false,
          message: 'Google Id do not match',
        });
      }
    } else {
      //create new usser
      user = await User.create({
        email,
        lastName: family_name || '',
        firstName: given_name || '',
        googleId,
        provider: 'google',
        avatar: picture || '',
        role: 'patient',
      });
    }
    //generate token with existing generateToken function
    const token = generateToken(user);
    //set cookie same as loginUser does
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/', //7 days
    });
    return res.status(200).json({
      success: true,
      message: 'Login with Google successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          fullName: user.fullName,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
        },
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google login: ' + error.message,
    });
  }
};
