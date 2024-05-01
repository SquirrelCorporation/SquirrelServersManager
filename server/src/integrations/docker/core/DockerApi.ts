import Dockerode from 'dockerode';

let dockerApi: Dockerode | undefined = undefined;

export function getDockerApiAuth() {
  const auth = {
    username: 'facos86',
    password: '300186Manu!',
    email: 'facos86@gmail.com',
    serveraddress: 'https://index.docker.io/v1',
  };
  return {
    authconfig: auth,
  };
}

export function getDockerApi(): Dockerode {
  if (!dockerApi) {
    dockerApi = new Dockerode();
  }
  return dockerApi;
}
