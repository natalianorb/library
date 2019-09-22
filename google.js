var GoogleAuth;
var GOOGLE_O_AUTH_SCOPE = 'https://www.googleapis.com/auth/books';

function setSigninStatus() {
  const user = GoogleAuth.currentUser.get();
  const isAuthorized = user.hasGrantedScopes(GOOGLE_O_AUTH_SCOPE);
  if (!isAuthorized) {
    GoogleAuth.signIn();
  }
}

function updateSigninStatus(isSignedIn) {
  setSigninStatus(isSignedIn);
}

gapi.load('client', () => {
  gapi.client.init({
    apiKey: 'AIzaSyAYqnQuRmbz4Cs5gdGpx_pr4tKd5y8WOTk',
    discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
    // clientId and scope are optional if auth is not required.
    clientId: '590093712344-tn2ah5ofcoeh8tvgrmn0t8jfs1rgacvh.apps.googleusercontent.com',
    scope: GOOGLE_O_AUTH_SCOPE,
  }).then(() => {
    GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.signIn();
    GoogleAuth.isSignedIn.listen(updateSigninStatus);
  })
    .catch((reason) => {
      console.error(reason);
      setSigninStatus();
    });
});
