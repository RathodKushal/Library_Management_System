import nodemailer from 'nodemailer';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;
  
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log('Generating Ethereal test email account for testing...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
}

export const sendIssueEmail = async (studentEmail, data) => {
  if (!studentEmail) {
    console.warn('Cannot send email: Student has no email address.');
    return;
  }

  const { studentName, enrollmentNo, bookTitle, issueDate, dueDate } = data;

  const due = new Date(dueDate);
  const formattedDate = due.toISOString().split('T')[0].replace(/-/g, '');
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Return+Book:+${encodeURIComponent(bookTitle)}&dates=${formattedDate}/${formattedDate}&details=Please+return+this+book+to+LJKU+Library+to+avoid+late+fines.`;

  const mailOptions = {
    from: '"Library System" <noreply@library.com>',
    to: studentEmail,
    subject: `Book Issued: ${bookTitle}`,
    html: `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a1330; padding: 40px 20px; border-radius: 12px; color: #f6f2e8;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; color: #c8a45c; letter-spacing: 1px;">LJKU Library</h1>
          <p style="margin: 8px 0 0 0; color: #a9b6d4; font-size: 15px; text-transform: uppercase; letter-spacing: 2px;">Book Issue Confirmation</p>
        </div>
        
        <!-- Main Content Box -->
        <div style="background-color: #12264f; padding: 35px; border-radius: 16px; border: 1px solid rgba(200, 164, 92, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          
          <p style="font-size: 17px; margin-top: 0; color: #f6f2e8;">Dear <strong style="color: #e3cb96;">${studentName}</strong>,</p>
          <p style="font-size: 15px; color: #a9b6d4; line-height: 1.6;">Your book has been successfully issued to your account (Enrollment: ${enrollmentNo || 'N/A'}). Below are the details of your transaction:</p>
          
          <!-- Details Table -->
          <div style="margin: 30px 0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; background: rgba(10, 19, 48, 0.5);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); width: 35%; font-weight: 600; color: #a9b6d4; font-size: 14px;">Title</td>
                <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f6f2e8; font-weight: 500; font-size: 15px;">${bookTitle}</td>
              </tr>
              <tr>
                <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: 600; color: #a9b6d4; font-size: 14px;">Issue Date</td>
                <td style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f6f2e8; font-size: 15px;">${new Date(issueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 16px; font-weight: 600; color: #a9b6d4; font-size: 14px;">Due Date</td>
                <td style="padding: 16px; color: #ff4d6d; font-weight: 700; font-size: 16px;">${new Date(dueDate).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <!-- Warning Note -->
          <div style="background-color: rgba(255, 77, 109, 0.1); border-left: 4px solid #ff4d6d; padding: 16px; margin-bottom: 25px; border-radius: 4px 8px 8px 4px;">
            <p style="margin: 0; color: #ff8fa3; font-size: 14px; line-height: 1.5;"><strong>Important:</strong> Please ensure the book is returned on or before the due date to avoid late fines.</p>
          </div>
          
          <!-- Calendar CTA -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${calendarUrl}" target="_blank" style="display: inline-block; background-color: #c8a45c; color: #0a1330; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 10px rgba(200, 164, 92, 0.3);">
              📅 Add to Google Calendar
            </a>
          </div>
          
          <p style="font-size: 15px; color: #a9b6d4; margin-bottom: 0; line-height: 1.6;">Happy Reading!<br><br><span style="color: #f6f2e8;">Best Regards,</span><br><strong style="color: #c8a45c;">The Library Team</strong></p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #56638a; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} LJKU Library Management System.</p>
          <p style="margin: 4px 0 0 0;">Designed with elegance.</p>
        </div>
      </div>
    `,
  };

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail(mailOptions);
    console.log('Issue email sent: %s', info.messageId);
    if (info.messageId && !process.env.SMTP_USER) {
      console.log('--- TEST EMAIL GENERATED ---');
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('----------------------------');
    }
  } catch (error) {
    console.error('Error sending issue email:', error.message);
  }
};
