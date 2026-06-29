const axios = require("axios");

(async () => {
  try {
    const res = await axios.post("http://127.0.0.1:11434/api/chat", {
      model: "qwen3:1.7b",
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ],
      stream: false
    });

    console.log("SUCCESS");
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
})();