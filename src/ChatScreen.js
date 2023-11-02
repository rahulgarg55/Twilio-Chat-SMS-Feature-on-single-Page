import React, { Component } from "react";
import Axios from "axios";
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
  Link
} from "@material-ui/core";
import { Send, ThreeDRotation } from "@material-ui/icons";
import axios from "axios";
import ChatItem from "./ChatItem";
const Chat = require("twilio-chat");

class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",               // Holds the message text.
      smsText: "",            // Holds the SMS text.
      messages: [],           // Stores chat messages.
      loading: false,         // Indicates loading state.
      channel: null,          // Represents the chat channel.
      currentMode: "chat",    // Current mode (chat or SMS).
      userLogin: {},          // User login information.
    };

    this.scrollDiv = React.createRef();  // A reference to the message list container.
  }

  getToken = async (email) => {
    try {
      const response = await axios.get(`http://localhost:5000/token/${email}`);

      return response.data.token;
    } catch (error) {
      console.error("Unable to get token:", error);
      throw new Error("Unable to get token, please reload this page");
    }
  }
  // function sendsmsmessage(){
  //   client.messages.create({
  //     body:'hii rahulll',
  //     to:'+916284671170',
  //     from:'+18778552057',
  //   }).then(message=>console.log(message))
  //   .catch(error=>console.log(error))
  // }

  async componentDidMount() {
    const { location, history } = this.props;
    const { state } = location || {};
    const { email, room } = state || {};
    let token = "";

    if (!email || !room) {
      history.replace("/");
      return;
    }

    this.setState({ loading: true });

    // Check if user login info is stored in localStorage
    const storedUserLogin = localStorage.getItem('userLogin');
    const userLogin = storedUserLogin ? JSON.parse(storedUserLogin) : { via: "email" };

    this.setState({ loading: true, userLogin });

    try {
      token = await this.getToken(email);  // Fetches the user's Twilio token.
    } catch (error) {
      console.error(error);
      return;
    }

    const client = await Chat.Client.create(token);

    client.on("tokenAboutToExpire", async () => {
      const newToken = await this.getToken(email);
      client.updateToken(newToken);
    });

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
  }

  handleMessageAdded = (message) => {
    const { messages } = this.state;
    this.setState(
      {
        messages: messages.concat(message),  // Appends a new message to the chat.
      },
      this.scrollToBottom
    );
  }

  scrollToBottom = () => {
    const { current } = this.scrollDiv;
    if (current) {
      // Scrolls to the bottom of the message list, ensuring the latest message is visible.
      current.scrollTop = current.scrollHeight - current.clientHeight;
    }
  }

  sendMessage = () => {
    const { text, smsText, channel } = this.state;
    if (this.state.currentMode === "chat" && text && text.trim()) {
      this.setState({ loading: true });
      channel && channel.sendMessage(text);  
      this.setState({ text: "", loading: false });
    } else if (this.state.currentMode === "sms" && smsText && smsText.trim()) {
      Axios.post("http://localhost:5000/send-sms/", { smsText })
        .then((response) => {
          if (response.status === 200) {
            const smsMessage  = response.data.message;
            console.log(smsMessage, "smsMessage"); 
          } else {
            throw new Error("Failed to send SMS");
          }
        })
        .catch((error) => {
          console.error("Error sending SMS:", error);
        });
    }
  }

  switchToSMS = () => {
    this.setState({ currentMode: "sms" });
  }

  

  switchToChat = () => {
    this.setState({ currentMode: "chat" });
  }

  render() {
    const { loading, text, smsText, messages, channel, currentMode, userLogin } = this.state;
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
            <Grid container direction="row" alignItems="center">
              <Button
                onClick={this.switchToChat}
                variant={currentMode === "chat" ? "contained" : "outlined"}
                color="primary"
              >
                Chat
              </Button>
              <Link to="/sms" style={{ textDecoration: "none" }}>

                <Button
                  onClick={this.switchToSMS}
                  variant={currentMode === "sms" ? "contained" : "outlined"}
                  color="primary"
                >
                  SMS
                </Button>
              </Link>
              {currentMode === "chat" ? (
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
              ) : (
                <Grid item style={styles.textFieldContainer}>
                  <TextField
                    required
                    style={styles.textField}
                    placeholder="Enter SMS"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={smsText}
                    disabled={!channel}
                    onChange={(event) =>
                      this.setState({ smsText: event.target.value })
                    }
                  />
                </Grid>
              )}
              <Grid item>
                <IconButton
                  style={styles.sendButton}
                  onClick={this.sendMessage}
                  disabled={!channel || ((currentMode === "chat" && !text) || (currentMode ===

                    "sms" && !smsText))}
                >
                  <Send style={styles.sendIcon} />
                </IconButton>
              </Grid>
            </Grid>
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