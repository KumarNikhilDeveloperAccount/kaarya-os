import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, otp, secret, html } = await request.json();

    // Very simple protection so only our backend can call this
    if (secret !== 'kaarya_internal_proxy_secret_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'kaarya.support@gmail.com',
        pass: 'xfktjajuckvsmkvg',
      },
    });

    const mailOptions = {
      from: '"Kaarya OS" <kaarya.support@gmail.com>',
      to,
      subject: 'Your Kaarya OS Verification Code',
      html: html,
    };


    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
