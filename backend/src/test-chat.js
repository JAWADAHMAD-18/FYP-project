import { handleChat } from "./controllers/chat.controller.js";

const fakeReq = {
  body: {
  "message": "Hi, suggest me a travel place",
  "sessionId": "abc123"
}

};

const fakeRes = {
  json: (data) => console.log("RESPONSE:", data),
  status: function (code) {
    this.code = code;
    return this;
  }
};

handleChat(fakeReq, fakeRes);
