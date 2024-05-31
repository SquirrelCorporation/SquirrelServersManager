import SSMUser from '../data/database/model/User';

declare global {
  namespace Express {
    interface User extends SSMUser {}
  }
}
