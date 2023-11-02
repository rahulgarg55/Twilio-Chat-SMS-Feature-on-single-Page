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

class SMSScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      smsText: "",            // Holds the SMS text.
      loading: false,
               // Indicates loading state.
      // Add SMS-specific state properties here
    };

    this.scrollDiv = React.createRef();  // A reference to the SMS message list container.
  }

  getToken = async (phoneNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/token/${phoneNumber}`);
      return response.data.token;
    } catch (error) {
      console.error("Unable to get token:", error);
      throw new Error("Unable to get token, please reload this page");
    }
  };

  async componentDidMount() {
    const { location, history } = this.props;
    const { state } = location || {};
    const { phoneNumber, room } = state || {};
    let token = "";

    if (!phoneNumber || !room) {
      history.replace("/");
      return;
    }

    this.setState({ loading: true });

    // Implement SMS-specific user login logic
    const userLogin = {
      via: "sms",
      // Add other SMS-related user info here
    };

    this.setState({ loading: true, userLogin });

    try {
      token = await this.getToken(phoneNumber);  // Fetches the user's Twilio token.
    } catch (error) {
      console.error(error);
      return;
    }

    // Implement SMS-specific Twilio client and channel logic
    // Example: You can adapt similar logic as in ChatScreen

    // Create a Twilio client, join a channel, and set up event listeners
    // Ensure to handle SMS-specific channel logic

    // Sample code:
    // const client = await Twilio.Chat.Client.create(token);
    // const channel = await client.getChannelByUniqueName(room);
    // ...

    this.setState({ loading: false });
  }

  // Implement SMS-specific functionality
  // Add methods and state for SMS-related functionality

  sendMessage = () => {
    const { smsText, channel } = this.state;
    if (smsText && smsText.trim()) {
      this.setState({ loading: true });

      // Implement the code to send SMS using Twilio or your chosen service
      // Example: You can use the Twilio Chat SDK to send SMS
      // Example: channel.sendMessage(smsText);

      // Ensure to handle success and error scenarios appropriately

      // After sending SMS, you can update the state and handle success/error
      // Example: this.setState({ smsText: '', loading: false });

      // Implement the SMS sending logic
    }
  };

  render() {
    const { loading, smsText } = this.state;
    const { location } = this.props;
    const { state } = location || {};
    const { phoneNumber, room } = state || {};

    return (
      <Container component="main" maxWidth="md">
        <Backdrop open={loading} style={{ zIndex: 99999 }}>
          <CircularProgress style={{ color: "white" }} />
        </Backdrop>
        <AppBar elevation={10}>
          <Toolbar>
            <Typography variant="h6">
              {`Room: ${room}, User: ${phoneNumber}`}
            </Typography>
          </Toolbar>
        </AppBar>
        <CssBaseline />
        <Grid container direction="column" style={styles.mainGrid}>
          <Grid item style={styles.gridItemChatList} ref={this.scrollDiv}>
            <List dense={true}>
              {/* Implement SMS message list here */}
              {/* Example: You can display sent SMS messages here */}
            </List>
          </Grid>
          <Grid item style={styles.gridItemMessage}>
            <Grid container direction="row" alignItems="center">
              <Grid item style={styles.textFieldContainer}>
                <TextField
                  required
                  style={styles.textField}
                  placeholder="Enter SMS"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={smsText}
                  onChange={(event) => this.setState({ smsText: event.target.value })}
                />
              </Grid>
              <Grid item>
                <IconButton
                  style={styles.sendButton}
                  onClick={this.sendMessage}
                  disabled={!smsText}
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

export default SMSScreen;
