import app from '../../App';

app.setupRoutes();

const expressAppForTest = app.getExpressApp();
export default expressAppForTest;
