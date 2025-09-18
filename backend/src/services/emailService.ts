import nodemailer from 'nodemailer';
import { config } from '../config';

export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }
  
  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
      
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Verify Your Email - AI Image App',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Welcome to AI Image App!</h2>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p><em>This link will expire in 24 hours.</em></p>
          </div>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }
  
  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    try {
      const name = firstName ? ` ${firstName}` : '';
      
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Welcome to AI Image App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Welcome${name}!</h2>
            <p>Your email has been verified successfully. You can now start using AI Image App!</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666;">
                <li>You have 5 free credits to start with</li>
                <li>Upload your model and product images</li>
                <li>Let our AI optimize your images</li>
                <li>Download your results</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.frontendUrl}/login" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Using the App
              </a>
            </div>
          </div>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}
