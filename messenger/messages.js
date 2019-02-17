
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
var FACEBOOK_ACCESS_TOKEN = ""

var sendTextMessage = (recipientId, text)=>{
    request({
        url:'https://graph.facebook.com/v2.6/me/messages',
        qs:{access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json:{
            recipient: { id:recipientId },
            message: { text }
        }
    })
}

var processMessage = (event) => {
    var senderId = event.sender.id
    var message = event.message.text
    sendTextMessage(senderId, message)
}

module.exports = message