// import React, { Component } from "react";
// import {
//   AppBar,
//   Backdrop,
//   CircularProgress,
//   Container,
//   CssBaseline,
//   Grid,
//   IconButton,
//   List,
//   TextField,
//   Toolbar,
//   Typography,
//   Button,
// } from "@material-ui/core";
// import { Send } from "@material-ui/icons";
// import axios from "axios";
// import ChatItem from "./ChatItem";
// const Chat = require("twilio-chat");

// class ChatScreen extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       text: "",               // Holds the message text.
//       messages: [],           // Stores chat messages.
//       loading: false,         // Indicates loading state.
//       channel: null,          // Represents the chat channel.
//       currentMode: "chat",    // Current mode (chat or SMS).
//       userLogin: {}, // Add this state for user login information

//     };

//     this.scrollDiv = React.createRef();  // A reference to the message list container.
//   }

//   getToken = async (email) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/token/${email}`);
//       return response.data.token;
//     } catch (error) {
//       console.error("Unable to get token:", error);
//       throw new Error("Unable to get token, please reload this page");
//     }
//   };

//   async componentDidMount() {
//     const { location, history } = this.props;
//     const { state } = location || {};
//     const { email, room } = state || {};
//     let token = "";

//     if (!email || !room) {
//       history.replace("/");
//       return;
//     }

//     this.setState({ loading: true });

//     // Check if user login info is stored in localStorage
//     const storedUserLogin = localStorage.getItem('userLogin');
//     const userLogin = storedUserLogin ? JSON.parse(storedUserLogin) : { via: "email" };

//     this.setState({ loading: true, userLogin });

//     try {
//       token = await this.getToken(email);  // Fetches the user's Twilio token.
//     } catch (error) {
//       console.error(error);
//       return;
//     }

//     const client = await Chat.Client.create(token);

//     client.on("tokenAboutToExpire", async () => {
//       const newToken = await this.getToken(email);
//       client.updateToken(newToken);
//     });

//     // ... (Token management)

//     let channel;

//     try {
//       channel = await client.getChannelByUniqueName(room);  // Tries to get an existing channel.
//       if (!channel) {
//         throw new Error("Channel not found");
//       }
//     } catch (error) {
//       try {
//         channel = await client.createChannel({
//           uniqueName: room,
//           friendlyName: room,
//         });
//       } catch (createError) {
//         console.error("Unable to create channel:", createError);
//         throw ("Unable to create channel, please reload this page");
//       }
//     }

//     await this.joinChannel(channel);  // Joins the chat channel.
//     this.setState({ channel, loading: false });
//   }

//   joinChannel = async (channel) => {
//     if (channel.channelState.status !== "joined") {
//       await channel.join();  // Joins the chat channel if not already joined.
//     }
//     channel.on("messageAdded", this.handleMessageAdded);
//   };

//   handleMessageAdded = (message) => {
//     const { messages } = this.state;
//     this.setState(
//       {
//         messages: messages.concat(message),  // Appends a new message to the chat.
//       },
//       this.scrollToBottom
//     );
//   };

//   scrollToBottom = () => {
//     const { current } = this.scrollDiv;
//     if (current) {
//       // Scrolls to the bottom of the message list, ensuring the latest message is visible.
//       current.scrollTop = current.scrollHeight - current.clientHeight;
//     }
//   };

//   sendMessage = () => {
//     const { text, channel } = this.state;
//     if (text && text.trim()) {
//       this.setState({ loading: true });
//       channel && channel.sendMessage(text);  // Sends a chat message.
//       this.setState({ text: "", loading: false });
//     }
//   };

//   switchToSMS = () => {
//     const confirmSwitch = window.confirm("Switch to SMS section?");
//     if (confirmSwitch) {
//       localStorage.setItem('userLogin', JSON.stringify({ via: "sms" }));

//       this.setState({ currentMode: "sms", userLogin: { via: "sms" } });
//       this.props.history.push("/sms");  // Navigates to the SMS route.
//     }
//   };

//   switchToChat = () => {
//     this.setState({ currentMode: "chat" });  // Switches back to chat mode.
//     this.props.history.push("/chat");  // Navigates back to the chat route.
//   };

//   render() {
//     const { loading, text, messages, channel, currentMode, userLogin } = this.state;
//     const { location } = this.props;
//     const { state } = location || {};
//     const { email, room } = state || {};

//     return (
//       <Container component="main" maxWidth="md">
//         <Backdrop open={loading} style={{ zIndex: 99999 }}>
//           <CircularProgress style={{ color: "white" }} />
//         </Backdrop>
//         <AppBar elevation={10}>
//           <Toolbar>
//             <Typography variant="h6">
//               {`Room: ${room}, User: ${userLogin.email}`}
//             </Typography>
//             {currentMode === "chat" ? (
//               <Button onClick={this.switchToSMS}> SMS</Button>
//             ) : (
//               <Button onClick={this.switchToChat}>Switch to Chat</Button>
//             )}
//           </Toolbar>
//         </AppBar>
//         <CssBaseline />
//         <Grid container direction="column" style={styles.mainGrid}>
//   <Grid item style={styles.gridItemChatList} ref={this.scrollDiv}>
//     <List dense={true}>
//       {messages &&
//         messages.map((message, index) => (
//           <ChatItem key={index} message={message} email={email} />
//         ))}
//     </List>
//   </Grid>
//   <Grid item style={styles.gridItemMessage}>
//     <Grid
//       container
//       direction="row"
//       justify="center"
//       alignItems="center"
//     >
//       {currentMode === "chat" ? (
//         <Grid item style={styles.textFieldContainer}>
//           <TextField
//             required
//             style={styles.textField}
//             placeholder="Enter message"
//             variant="outlined"
//             multiline
//             rows={2}
//             value={text}
//             disabled={!channel}
//             onChange={(event) =>
//               this.setState({ text: event.target.value })
//             }
//           />
//         </Grid>
//       ) : (
//         <TextField
//           required
//           style={styles.textField}
//           placeholder="Enter SMS"
//           variant="outlined"
//           multiline
//           rows={2}
//           value={text}
//           disabled={!channel}
//           onChange={(event) =>
//             this.setState({ text: event.target.value })
//           }
//         />
//       )}
//       {currentMode === "chat" && (
//         <Grid item>
//           <IconButton
//             style={styles.sendButton}
//             onClick={this.sendMessage}
//             disabled={!channel || !text}
//           >
//             <Send style={styles.sendIcon} />
//           </IconButton>
//         </Grid>
//       )}
//     </Grid>
//     <Grid container justify="flex-end">
//       {currentMode === "chat" && (
//         <Button onClick={this.switchToSMS}> SMS</Button>
//       )}
//     </Grid>
//   </Grid>
// </Grid>

//       </Container>
//     );
//   }
// }

// const styles = {
//   textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
//   textFieldContainer: { flex: 1, marginRight: 12 },
//   gridItemChatList: { overflow: "auto", height: "70vh" },
//   gridItemMessage: { marginTop: 12, marginBottom: 12 },
//   sendButton: { backgroundColor: "#3f51b5" },
//   sendIcon: { color: "white" },
//   mainGrid: { paddingTop: 100, borderWidth: 1 },
// };

// export default ChatScreen;





import React, { Component } from "react";
import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  TextField,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import axios from "axios";
import ChatItem from "./ChatItem";
const Chat = require("twilio-chat");

class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",               
      messages: [],           
      loading: false,         
      channel: null,         
      currentMode: "chat",   
      userLogin: {},

    };

    this.scrollDiv = React.createRef();  // A reference to the message list container.
  }

  getEmailToken = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/emailToken/${email}`
      );
      return response.data.token;
    } catch (error) {
      console.error("Unable to get email token:", error);
      throw new Error("Unable to get email token, please reload this page");
    }
  };

  getPhoneToken = async (phoneNumber) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/phoneToken/${phoneNumber}`
      );
      return response.data.token;
    } catch (error) {
      console.error("Unable to get phone number token:", error);
      throw new Error("Unable to get phone number token, please reload this page");
    }
  };


  async componentDidMount() {
    const { location, history } = this.props;
    const { state } = location || {};
    const { identity, room, loginType } = state || {};
    let token = "";

    if (!identity || !room || !loginType) {
      history.replace("/");
      return;
    }

    this.setState({ loading: true });

    const storedUserLogin = localStorage.getItem("userLogin");
    const userLogin = storedUserLogin
      ? JSON.parse(storedUserLogin)
      : { loginType: "email" };

  this.setState({ loading: true, userLogin });

    try {
      if (loginType === "email") {
        token = await this.getEmailToken(identity);
      } else if (loginType === "sms") {
        token = await this.getPhoneToken(identity);
      } else {
        throw new Error("Invalid login type");
      }
    } catch (error) {
      console.error(error);
      return;
    }

    const client = await Chat.Client.create(token);

    client.on("tokenAboutToExpire", async () => {
      const newToken = await this.getToken(email);
      client.updateToken(newToken);
    });

    

    // ... (Token management)

    let channel;

    try {
      channel = await client.getChannelByUniqueName(room);  // Tries to get an existing channel.
      if (!channel) {
        throw new Error("Channel not found");
      }
    } catch (error) {
      try {
        channel = await client.createChannel({
          uniqueName: room,
          friendlyName: room,
        });
      } catch (createError) {
        console.error("Unable to create channel:", createError);
        throw ("Unable to create channel, please reload this page");
      }
    }

    await this.joinChannel(channel);  // Joins the chat channel.
    this.setState({ channel, loading: false });
  }

  joinChannel = async (channel) => {
    if (channel.channelState.status !== "joined") {
      await channel.join();  // Joins the chat channel if not already joined.
    }
    channel.on("messageAdded", this.handleMessageAdded);
  };

  handleMessageAdded = (message) => {
    const { messages } = this.state;
    this.setState(
      {
        messages: messages.concat(message),  // Appends a new message to the chat.
      },
      this.scrollToBottom
    );
  };

  scrollToBottom = () => {
    const { current } = this.scrollDiv;
    if (current) {
      // Scrolls to the bottom of the message list, ensuring the latest message is visible.
      current.scrollTop = current.scrollHeight - current.clientHeight;
    }
  };

  sendMessage = () => {
    const { text, channel } = this.state;
    if (text && text.trim()) {
      this.setState({ loading: true });
      channel && channel.sendMessage(text);  // Sends a chat message.
      this.setState({ text: "", loading: false });
    }
  };

  switchToSMS = () => {
    const confirmSwitch = window.confirm("Switch to SMS section?");
    if (confirmSwitch) {
      localStorage.setItem('userLogin', JSON.stringify({ via: "sms" }));

      this.setState({ currentMode: "sms", userLogin: { via: "sms" } });
      this.props.history.push("/sms");  // Navigates to the SMS route.
    }
  };

  

  switchToChat = () => {
    this.setState({ currentMode: "chat" });  // Switches back to chat mode.
    this.props.history.push("/chat");  // Navigates back to the chat route.
  };

  render() {
    const { loading, text, messages, channel, currentMode, userLogin } = this.state;
    const { location } = this.props;
    const { state } = location || {};
    const { email, room } = state || {};

    return (
      <Container component="main" maxWidth="md">
        <Backdrop open={loading} style={{ zIndex: 99999 }}>
          <CircularProgress style={{ color: "white" }} />
        </Backdrop>
        <AppBar elevation={10}>
          <Toolbar>
            <Typography variant="h6">
              {`Room: ${room}, User: ${userLogin.email}`}
            </Typography>
            {currentMode === "chat" ? (
              <Button onClick={this.switchToSMS}>Switch to SMS</Button>
            ) : (
              <Button onClick={this.switchToChat}>Switch to Chat</Button>
            )}
          </Toolbar>
        </AppBar>
        <CssBaseline />
        <Grid container direction="column" style={styles.mainGrid}>
          <Grid item style={styles.gridItemChatList} ref={this.scrollDiv}>
            <List dense={true}>
              {messages &&
                messages.map((message, index) => (
                  <ChatItem key={index} message={message} email={email} />
                ))}
            </List>
          </Grid>
          <Grid item style={styles.gridItemMessage}>
            {currentMode === "chat" ? (
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item style={styles.textFieldContainer}>
                  <TextField
                    required
                    style={styles.textField}
                    placeholder="Enter message"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={text}
                    disabled={!channel}
                    onChange={(event) =>
                      this.setState({ text: event.target.value })
                    }
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    style={styles.sendButton}
                    onClick={this.sendMessage}
                    disabled={!channel || !text}
                  >
                    <Send style={styles.sendIcon} />
                  </IconButton>
                </Grid>
              </Grid>
            ) : (
              // Render the SMS input when the current mode is "sms"
              <TextField
                required
                style={styles.textField}
                placeholder="Enter SMS"
                variant="outlined"
                multiline
                rows={2}
                value={text}
                disabled={!channel}
                onChange={(event) =>
                  this.setState({ text: event.target.value })
                }
              />
            )}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

const styles = {
  textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
  textFieldContainer: { flex: 1, marginRight: 12 },
  gridItemChatList: { overflow: "auto", height: "70vh" },
  gridItemMessage: { marginTop: 12, marginBottom: 12 },
  sendButton: { backgroundColor: "#3f51b5" },
  sendIcon: { color: "white" },
  mainGrid: { paddingTop: 100, borderWidth: 1 },
};

export default ChatScreen;




HI Anjali, this is not in line with what we need for the platform as far as switching between sms and in platform chat. Our users should be able to seamlessly switch between sms and in-platform messages from the same chat room all within the same messages UI in our platform. In our case, the phone numbers will already be predefined and pulled from our user information, and thus users will not need to enter this information manually













Great, integrating Twilio for sending and receiving messages in a React and Node.js application involves several steps. I'll guide you through the process. Here's a high-level overview of the steps:

1. **Sign up for Twilio**: If you haven't already, sign up for a Twilio account at [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio). Once you're signed up and logged in, you can access your account SID and authentication token from the Twilio console.

2. **Buy a Phone Number**: In the Twilio console, navigate to the "Phone Numbers" section and buy a phone number that you want to use for sending and receiving messages.

3. **Set up Node.js Server**:
   - Create a new Node.js project or use your existing one.
   - Install the `twilio` library using npm or yarn: `npm install twilio` or `yarn add twilio`.

4. **Node.js Server for Receiving Messages**:
   - Create an Express.js server or use your existing Node.js server.
   - Configure the Twilio client with your Twilio Account SID and Auth Token.
   - Set up a route that can receive incoming messages (webhooks).
   - When a message is received at the webhook, process it as needed.

Here's a simple example of the Node.js code to set up a webhook for receiving messages:

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", (req, res) => {
  const { Body, From } = req.body;
  // Handle the incoming message (e.g., save it to a database, reply, etc.).
  // For demonstration purposes, we'll just log the message to the console.
  console.log(`Received a message from ${From}: ${Body}`);
  res.send("Message received.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

5. **Integrate Twilio in React App**:
   - In your React application, install the `twilio-client` library: `npm install twilio-client` or `yarn add twilio-client`.
   - Create a component or a function to send messages.
   - Use the Twilio client to send messages.

Here's a simplified example of sending a message from a React component:

```javascript
import React, { useState } from "react";
import Twilio from "twilio-client";

const App = () => {
  const [message, setMessage] = useState("");
  const sendMessage = async () => {
    const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await twilioClient.messages.create({
      body: message,
      from: YOUR_TWILIO_PHONE_NUMBER,
      to: RECIPIENT_PHONE_NUMBER,
    });
    setMessage("");
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
```

6. **Testing**: Test sending and receiving messages between your React app and the Node.js server.

7. **Secure Your Application**:
   - Make sure to secure your Node.js server and your Twilio credentials.
   - You should use environment variables for storing sensitive data like your Twilio Account SID and Auth Token.

8. **Production Deployment**: Deploy your Node.js server and React app to a hosting service like Heroku, AWS, or any other of your choice.

9. **Scaling**: If you expect heavy traffic, you might need to scale your application, and this might involve load balancing and other considerations.

Remember to replace placeholders like `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `YOUR_TWILIO_PHONE_NUMBER`, and `RECIPIENT_PHONE_NUMBER` with your actual Twilio credentials and phone numbers.

Please note that this is a simplified example to get you started. You may need to add error handling, user authentication, and other features depending on your project requirements.





In a Twilio trial account, you have certain limitations, including the ability to send SMS messages only to verified phone numbers. However, you should be able to buy a phone number during your trial and use it for testing. Here's how to buy a phone number using your trial account:

1. **Log in to your Twilio account**: If you aren't already logged in, sign in to your Twilio account at [https://www.twilio.com/console](https://www.twilio.com/console).

2. **Access the Phone Numbers section**: In the Twilio Console, navigate to the "Phone Numbers" section, which is usually located in the left-hand menu.

3. **Buy a Phone Number**:
   - Click on the "Phone Numbers" option.
   - Then click the "Buy a Number" button.
   - You can search for numbers by area code or other criteria.
   - Once you find a number you'd like to use, you can select it and add it to your account.

Keep in mind that during your trial period, you'll have certain limitations. You can send SMS messages only to verified phone numbers, and your phone number may be subject to some usage restrictions. Make sure to read and understand the limitations of the trial account, especially regarding the use of phone numbers and sending messages.

If you have any questions or need assistance during the process, you can reach out to Twilio's support team for guidance.




+1 877 855 2057