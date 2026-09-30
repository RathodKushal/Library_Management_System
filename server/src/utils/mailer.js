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

  const mailOptions = {
    from: '"Library System" <noreply@library.com>',
    to: studentEmail,
    subject: `Book Issued: ${bookTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">LJKU Library</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Book Issue Confirmation</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; color: #333; margin-top: 0;">Hi <strong>${studentName}</strong>,</p>
          <p style="font-size: 16px; color: #555; line-height: 1.5;">Great news! We have successfully issued a book to your account (Enrollment: ${enrollmentNo || 'N/A'}). Here are the details of your transaction:</p>
          
          <div style="margin: 30px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb; width: 35%; font-weight: 600; color: #475569;">Book Title</td>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #1e293b; font-weight: 500;">${bookTitle}</td>
              </tr>
              <tr>
                <td style="padding: 15px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #475569;">Issue Date</td>
                <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; color: #1e293b;">${new Date(issueDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 15px; background-color: #f8fafc; font-weight: 600; color: #475569;">Due Date</td>
                <td style="padding: 15px; color: #ef4444; font-weight: 700;">${new Date(dueDate).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Please Note:</strong> Ensure the book is returned on or before the due date to avoid any late fine charges.</p>
          </div>
          
          <p style="font-size: 16px; color: #555; margin-bottom: 0;">Happy Reading!<br><br>Best Regards,<br><strong>The Library Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} LJKU Library Management System. All rights reserved.</p>
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
