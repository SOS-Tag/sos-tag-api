import { setConfirmationToken, setForgotPasswordToken } from '@utils/token';
import fs from 'fs';
import { google } from 'googleapis';
import hogan from 'hogan.js';
import inlineCss from 'inline-css';
import nodemailer from 'nodemailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import path from 'path';

const changePasswordUrl = process.env.WEB_APP_CHANGE_PASSWORD_URL;
const confirmationUrl = process.env.WEB_APP_CONFIRMATION_URL;

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

OAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_CLIENT_REFRESH_TOKEN });

const createConfirmationUrl = async (userId: string) => {
  const token = await setConfirmationToken(userId);
  return `${confirmationUrl}/${token}`;
};

const createForgotPasswordUrl = async (userId: string) => {
  const token = await setForgotPasswordToken(userId);
  return `${changePasswordUrl}/${token}`;
};

enum emailAim {
  changePassword = 'changePassword',
  confirmUser = 'confirmUser',
}

interface EmailGenerationOptions {
  aim: emailAim;
  user: {
    name: string;
    email: string;
  };
  url: string;
}

const emailContents = {
  confirmUser: {
    subject: 'Confirm your email address',
    body: 'Thanks for creating an account. Please verify your email address by clicking on the button below.',
    link: 'Verify email address',
  },
  changePassword: {
    subject: 'Change your password',
    body: 'In order to update your password, please follow the link by clicking on the button below.',
    link: 'Change password',
  },
};

const generateEmailContent = ({ aim, user, url }: EmailGenerationOptions) => {
  const options = {
    from: `"SOS-Tag" <${process.env.GOOGLE_CLIENT_USER}>`,
    to: user.email,
    subject: `[SOS-Tag] ${emailContents[aim].subject}`,
  };

  const content = {
    greetings: `Hi ${user.name}`,
    body: emailContents[aim].body,
    link: emailContents[aim].link,
    signature: 'SOS-Tag team',
    url,
  };

  return { options, content };
};

const sendEmail = async ({ options, content }): Promise<void> => {
  const accessToken = OAuth2Client.getAccessToken();

  const auth: SMTPConnection.AuthenticationTypeOAuth2 = {
    type: 'OAuth2',
    user: process.env.GOOGLE_CLIENT_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_CLIENT_REFRESH_TOKEN,
    accessToken: accessToken as unknown as string,
  };

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth,
  });

  const templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/basic-email.html'));
  const styledTemplate = await inlineCss(templateFile.toString(), { url: 'file://' + __dirname + '/../templates/' });
  const compiledTemplate = hogan.compile(styledTemplate);
  const renderedTemplate = compiledTemplate.render({
    greetings: content.greetings,
    body: content.body,
    link: content.link,
    signature: content.signature,
    url: content.url,
  });

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: renderedTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export { createConfirmationUrl, createForgotPasswordUrl, emailAim, generateEmailContent, sendEmail };
