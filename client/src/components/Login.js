import RSA from 'react-simple-auth';
import {untappdProvider} from '../providers/untappd';

import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'

class Login extends Component {
  constructor() {
    super();
    this.state = { session: RSA.restoreSession(untappdProvider) };
    this.handleClick = this.handleClick.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
  }

  async doLogin() {
    // Open login window and wait for user to sign in
    try {
      const untappdSession = await RSA.acquireTokenAsync(untappdProvider);
      this.setState({session: untappdSession});
    } catch (error) {
      throw error;
    }
  }

  doLogout() {
    this.setState({session: null});
    RSA.invalidateSession();

  }

  handleClick() {
    return this.state.session ? this.doLogout() : this.doLogin();
  }

  render(){
    return(
      <Button onClick={this.handleClick} className="login_button">
        {this.state.session ? 'Logg ut' : 'Logg inn med Untappd'}
      </Button>
    )
  }
}


export default Login;
