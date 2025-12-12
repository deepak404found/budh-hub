# SMTP Email Configuration

## Gmail Setup (Recommended for Development)

1. **Enable 2-Step Verification** on your Google Account
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character App Password

3. **Update `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password  # NOT your regular password!
   SMTP_FROM=your-email@gmail.com
   ```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=noreply@yourdomain.com
```

## Common Errors

### "Username and Password not accepted" (Gmail)
- **Solution**: Use an App Password, not your regular Gmail password
- Make sure 2-Step Verification is enabled
- The App Password is 16 characters (no spaces)

### "Connection timeout"
- Check your firewall/network settings
- Verify SMTP_PORT (587 for TLS, 465 for SSL)
- Some networks block SMTP ports

### "Authentication failed"
- Double-check SMTP_USER matches the email you're sending from
- Verify SMTP_PASSWORD is correct (for Gmail, use App Password)
- Ensure SMTP_FROM matches SMTP_USER for Gmail

