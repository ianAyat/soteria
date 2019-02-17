
var message = (req,res) => {
    if(req.body.object === 'page'){
        req.body.entry.forEach(entry=> {
            entry.messaging.forEach(event=>{
                if(event.message && event.message.text){
                    processMessage(event)
                }
            })
        })
        res.status(200).end()
    }
}
var FACEBOOK_ACCESS_TOKEN = "EAAcoHLg5gKIBALlTnIKMSr2LKrkgV8H4okZAK9iZCZCkOTu0JBDxXHZBo5crLQm9nd0XBHaWirdsiBhr8Gt4JzH0nFfhr8VHqC0GB0037wU35UX81XPRDg7eWsrmoA1k45HLJDajBp0HssNtV7EbWqTESLIrtAxdJSxDZCKZCs9QZDZD"

var sendTextMessage = (recipientId, text)=>{
    request({
        url:'https://graph.facebook.com/v2.6/me/messages?access_token=' + FACEBOOK_ACCESS_TOKEN,
        // qs:{access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json:{
            "messaging_type": "MESSAGE_TAG",
// "tag": "TRANSPORTATION_UPDATE",
            "recipient": { "id":""+recipientId },
            "message": { "text": text }
        }
    })
}

var processMessage = (event) => {
    var senderId = event.sender.id
    var message = event.message.text
    sendTextMessage(senderId, message)
}

module.exports = message
