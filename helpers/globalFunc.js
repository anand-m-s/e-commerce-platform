// globalFunc.js
function setGlobalMessage(req, type, message) {
    req.session.messages = req.session.messages || [];
    req.session.messages.push({ type, message });

    setTimeout(() => {
        req.session.messages = req.session.messages.filter(msg => msg.message !== message);
    }, 3000);
}

function getAndClearGlobalMessages(req) {
    const messages = req.session.messages || [];
    req.session.messages = [];
    return messages;
}

module.exports = { setGlobalMessage, getAndClearGlobalMessages };
