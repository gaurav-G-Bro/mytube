import { app } from './app.js';
import { DB_CONNECT } from './db/db.connection.js';

DB_CONNECT()
  .then(() => {
    app.listen(process.env.PORT);
    console.log(`Server is running on port ${process.env.PORT}`);
  })
  .catch((err) => console.log('Server connection error: ', err));

//All Route's imports are here
import userRoute from './routes/user.route.js';
import subscriptionRoute from './routes/subscription.route.js';
import videoRoute from './routes/video.route.js';
import likeRoute from './routes/like.route.js';
import commentRoute from './routes/comment.route.js';
import tweetRoute from './routes/tweet.route.js';
import playlistRoute from './routes/playlist.route.js';

//declared routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/subscriptions', subscriptionRoute);
app.use('/api/v1/videos', videoRoute);
app.use('/api/v1/likes', likeRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/tweets', tweetRoute);
app.use('/api/v1/playlists', playlistRoute);
