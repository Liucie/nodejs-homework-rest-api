import sgMail from '@sendgrid/mail'

  class SenderSendgrid{
      async send(msg){
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        return await sgMail.send({...msg, from: process.env.SENDER_SENDGRID})
      }

  }
  export {SenderSendgrid}