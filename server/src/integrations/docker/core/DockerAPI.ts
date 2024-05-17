export function getDockerApiAuth() {
  const auth = {
    username: 'XXXX',
    password: 'XXX',
    email: 'XXXX',
    serveraddress: 'https://index.docker.io/v1',
  };
  return {
    authconfig: auth,
  };
}
