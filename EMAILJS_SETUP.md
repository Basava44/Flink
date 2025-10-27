# EmailJS Setup Guide

## Overview
EmailJS has been integrated into the Help & Support page to send emails directly without relying on browser mailto links.

## Setup Instructions

### 1. Create an EmailJS Account
1. Go to https://www.emailjs.com
2. Sign up for a free account
3. Confirm your email address

### 2. Add Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Follow the instructions to connect your email
5. **Copy your Service ID** (you'll need this)

### 3. Create Email Template
1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Set up your template with these variables:
   - `{{from_name}}` - User's name
   - `{{from_email}}` - User's email
   - `{{to_email}}` - Your support email
   - `{{subject}}` - Email subject
   - `{{priority}}` - Priority level
   - `{{message}}` - User's message

4. Template Example:
```
Subject: {{subject}}

From: {{from_name}} ({{from_email}})
Priority: {{priority}}

Message:
{{message}}

---
This email was sent from your app's Help & Support page.
```

5. **Copy your Template ID** (you'll need this)

### 4. Get Your Public Key
1. Go to **Account** > **General** in EmailJS dashboard
2. Find **Public Key** in the API Keys section
3. **Copy your Public Key** (you'll need this)

### 5. Update the Code
Replace the placeholder values in `src/pages/HelpSupportPage.jsx`:

```javascript
const EMAILJS_SERVICE_ID = 'service_xxxxxxxx'; // Replace with your service ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxxx'; // Replace with your template ID  
const EMAILJS_PUBLIC_KEY = 'your_public_key_here'; // Replace with your public key
```

### 6. Test It
1. Run your app: `npm run dev`
2. Go to Help & Support page
3. Fill out the form and submit
4. Check your email inbox - you should receive the support request!

## Troubleshooting

### Email not received?
- Check spam folder
- Verify EmailJS service is connected properly
- Check browser console for error messages
- Verify all IDs and keys are correct

### Rate Limits
- Free tier: 200 emails/month
- This should be plenty for a support form
- Consider upgrading if you expect high volume

### Security
- The Public Key is safe to use in client-side code
- EmailJS automatically sanitizes inputs
- No server-side code needed

## Alternative Solutions

If you don't want to use EmailJS, here are other options:

### Option 1: Supabase Edge Functions
Create a serverless function to send emails directly.

### Option 2: SendGrid
Professional email service with better deliverability.

### Option 3: Mailgun
Reliable email API service.

### Option 4: Custom Backend
Build your own email service using Node.js + Nodemailer.

## Need Help?
Contact EmailJS support at https://www.emailjs.com or check their documentation.

