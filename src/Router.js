import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";
import ChatScreen from "./ChatScreen";
import SMSScreen from "./SMSScreen";


function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/chat" component={ChatScreen} />
        <Route exact path="/sms" component={SMSScreen} />
        <Route path="/" component={WelcomeScreen} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
