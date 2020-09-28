require('dotenv').config();

const fs = require('fs');

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');

var users = {};

var messagesToSend = {};

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/register', (req, res) => {
  const uuidHandler = uuid();

  let base64Image =
    '/9j/4AAQSkZJRgABAQAAAQABAAD//gAfQ29tcHJlc3NlZCBieSBqcGVnLXJlY29tcHJlc3P/2wCEAAQEBAQEBAQEBAQGBgUGBggHBwcHCAwJCQkJCQwTDA4MDA4MExEUEA8QFBEeFxUVFx4iHRsdIiolJSo0MjRERFwBBAQEBAQEBAQEBAYGBQYGCAcHBwcIDAkJCQkJDBMMDgwMDgwTERQQDxAUER4XFRUXHiIdGx0iKiUlKjQyNEREXP/CABEIAgACAAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcBAgUDBAj/2gAIAQEAAAAA/RQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG/S+rPy87yAAAAAAAAA6Mwk/15GPCMw/kgAAAAAAAOhYnfyAMcytuQAAAAAAAEysHIABC4BgAAAAAADNkSsAAHDqvzAAAAAABZkoAAAcWp9QAAAAABNLAAAAEPrsAAAAAA6Fx5AAAGKo4YAAAAAC1JAAAADn02AAAAAB0biyAAABVXAAAAAABYE0AAAARyrgAAAAAXR9gAAADFGAAAAABveGQAAACneaAAAAAOrb4AAAArCNAAAAADv2qAAAAK7h4AAAAAkFqAAAACvIcAAAAAOvboAAAArKMAAAAAD1u7IAAABUHKAAAAAC7PoAAAAa0fqAAAAAFjS4AAABwapAAAAAB1rdyAAABWEaAAAAAAuDqAAAA+eldQAAAAAOvboAAAKvjYAAAAABYE0AAAEcq4AAAAAAZtfuAAAOZUfkAAAAAAHpa3aAABzam+YAAAAAADawpfkAAjlZ+QAAAAAAAkFpbAA1raLAAAAAAAD7J3KtwAGsUgnxgAAAAAA9p9L8gAAxEYB4gAAAAAEhs32AAAGKtjwAAAAAE9m2QAAAYhkAwAAAAAbWbJQAAABHav1AAAAA2tTvAAAAA4tT6gAAAAtOQgAAAAI7VoAAAATmdgAAAACEQIAAAAkFp5AAAAAGKtjwAAAHvdPoAAAAADWlPAAAAFkysAAAAABFq0AAADq2+AAAAAAKg5QAAAtntgAAAAADiVMAAAdS38gAAAAADFQcsAABZUqAAAAAABF6zAAA9buyAAAAAABSHkAACV2SAAAAAAAraKAAAtOQgAAAAAAI7VoAAZvHYAAAAAABrR2AAB1reAAAAAAAFQ8kAATGwwAAAAAABXkOAAFlykAAAAAAARatAABb3WAAAAAAAHJqEAAXV9QAAAAAAA+SlgABeWwAAAAAAAxRgD//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAECEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/EAD4QAAIBAwAGBgYIBgIDAAAAAAECAwQFEQAGITFAUBITIkFRYRQzQlJxgSMwMmJyobHBFUOCkZLRINKQouL/2gAIAQEAAT8A/wDG6kUkp6McbOfBQTolivEn2bbUD8SFf10XVe/OoYUBwfGRAf7E6HVa/KCTQHAHdJGf0bR7DeUGTbZ/6V6X6aSwTwErPDJGc4w6lf15xQWqvuTEUlMzgb23KPmdKLUcnovX1eNxKRD+4ydKXVyzUgXoUSOw9qXtkn57NFVVAVVAHgP+JAIIIyDpVWG0VnSM1DGGPtIOg3x7ONKzUeJstQ1bL92UZG7xGlfY7nbR0qmmIj99e0v9xzO32uuuchSjgL4+0x2KvxOls1UoqFVkrAKio8/Vr8BoqqoCqoA8B9WQCCCMg6XXVi3XFXeOMQVBBw6bAT94aXOyV9qbNTFmLOBKm1TzCy6qyVIWquYaKnIyse53/wBDSKGGnjWKCJUQblUYH17okilHUMp3gjIOl81RI6VVaVyNpeD8+x/rQqVJVgQwOCDvB5YFLEKoJYnAA3k6WHVhaRUrbkmZ85SI7kHi3nwd/wBW4riklVTYSrAz4K/kfPz0mhlp5XhmjKSIcMrbweV6ravCmVLlWoevPqkO5Afa+PC6yWBLnCaqnXFZGuzH8xfA6MrIzIwwykgjwI5TqnY/S5RcqlAaeJuwp9tx+w4fW6xhw12pFGwDr1Hf9/lFrt8lzroKNDjpnLN7qjedIYo6eGKCJcIihVHkOHIBBBGQdNYLUbTXtEmTDIOnEfInd8uT6qWxKGiFZIp9JqFz+GPuHz38TfrQlyt8iKmaiIF4j4t3j56EEEgjBHJbVQNcq+mpAcB2yx8FG06KoVVVRgAYHFay27+HXSZV9VN9KnwY7R8jyXUiiyaqvYbsRISvzODxeulF11virFXtwPgkDJ6Dcl1cpRSWaiTo4Z061vMvt/Ti66lFZQ1VKy+siZR5Hu0IIJBGCORxIZZI4l3uwUfM6KoVVVRgAYHGXiEQXW4RAYAncgeRORyOxJ1l4tq+FQjf4nPG63J0b5UN76Rn+y9H9uR6rqr36gDDIzIfmEJHG67Kq3eIgbWpUJ+PSYcj1WIW/UBYgDMg/vG3G67kG7QAEEilQHy7bcjsLhLzbSe+dV/y2cbre4e9zjH2I41/LPI4JTBPDOpIMciuMeKnOgIIBByDxl8m9Iu9xkzkdeyg+SdkfpySw1RrLTQzF8sIwjfFOzt4uqnWnpqipYgJFGz/ABwNGZnZnY5ZiST4k8k1Hq+lFV0LewwlXduOw8XrjWdRa/RxkNUOF7vsrtPJbHXi23OmqW9Xnov+Fth0BBAIOQeK1quC110ZIyDHTjqgR3kHaeTasXRbjb443kHpEACOO8gbm4m73CO00E1QWHWkFYlPe50ZmdmdjlmJJPiTyayXM2q4RVJyYj2JQO9DojrIiuhyrAEHxB4jWa6rcq7q4CfRqfKJ5t3tyjVG+YK2mqbYfUOT/wCm38uH1svnocJt1M308q9tgdqIfh3nlIYqQykhgcgjeDpq3f0uUXo1U4FWg7/bUd48xwt6vENnpc9IGrkH0Ufh94+Wk00lRLJPM5aR2LMTyqGaWnlSaGQpIhyrLvB0sGskNzRaeqKx1g2Y3LJ5jg7veqazRNkiSrI7EXhnvby0rKyor6iSqqZC8jn5AeA8uWKzIwZGKsNxBwRpZNbg/RpbuwGzCz+P49AQQCDkHgL5rZDR9KmtxWWfaGfeid3zOk00tRK808jPIxJLMcnl9lvV0oJBBSKZ0cj6Agt5dnG7SjmkqKdJpaZ4HbfG+Mj62eUwwySrE8hVSQiDLMfAaXvWK6VbyUjxtSRBtsQyHOPePL6OgrLhJ1VJA0h7yNw+J0t2pUSqHucxdiPVxHAHxOlPSUlGgSmp0jAHsjb8z9fVUlJVoyVMCSKQPtDbpcdSomUvbJijAerlOQfgdKy31lvkMVXA0Z7idx+B5XT009VKsFNE0krblUZOlq1OjRRPdiWYH1KHs/M6RQw08axQRKiDcqjA4OWGGojaKeJXQ71YZGl21NRlM1qJVyfUudnyOlRTT0srQVMTRyrvVhg8os2rtXdmEh+ipgdsh7/JRpRWyitsQhpIgo9pztdvieHuFro7nEYquEHdhxsdceB0vOrtXaWMg+lpidkg7vJhyUAkgAZJ0smquxau6oR7kB/V/wDWgAAAAwBxJAIIIyDpfdU+j0qq1KSN7wAfmn+tCCCQRgjkSI8jqiKWZjgAaav6ux0AStrVDVJGUU7Qnn8eN1h1ajrusrKJQtSBl0G6T/60dHjdkdSrKcEHkCI8jqiKWZjgAaav2KO2RLUzYasddrd0YPsr5+J4/WPV+O5RNVQALWIu/GyQD2T5+B0dHjdkdSrKcEHjgCSABknTVrV0UKLXVq5qXAKoR6sf9uQ6zauitjauo1xUoCXQD1g/7aEEEgjBHG6r2MOFudWmV/koe/7x5HrXYRGGulGmFJ+nRckA+8PLx4zV6zG61XSlytLFgyN4+CjRVVFCqAFAwANgAHI2VXUqwBUjBB2gg6aw2ZrTV5jy1LKSY28PFT5jiqanlq54aaEZkkYKulsoIbbQw0yDAUZf7zneeS3WghuNBNSyjeMoRs6LjcdKmmlpKiamnGJImKsPMcTqhazTQPdJ1HTmXowjwTvPz5PrjaWnhS5wqOnCuJh4p3H5cRZrY92ro6YHCDtSNjco0RFjRUQYVQAB4AcndFkRkcZVgQR4g6Xm2Paa6SmJyh7UbY3qeH1StnoVv9JkXE1ThvMJ3DlOtts9Nt/pMa5mpst5lO8cNZaH+I3KlpmUlC3Skx7i7ToAAAAMAcpIBBBGQdL1Q/w65VVMqkIG6UefcbaOF1No/R6SevkTDzHoRk96LyvXWgMtLBXomWhbouR7jf6PCQQvPNFBGpLuwUADJydKWnjo6aCmT7ESBR545XVU6VdNPTSfYkQofnpPC8E0sEikOjFSCMHI4PU+jFTdROwBWnQvvx2jsHLdcKMU11MygBahA+/PaGw8HqfTGntTVDbDUSFv6V7I5brfRma0rUqMmCQN/S3ZPBAFiFG8nA0o4RR0VNTgY6uJVx5gbeW1lOKuiqacjPWRMoHxGzQgqSp3g4PA2Gm9Lu9DCVyvWBmHknaPL79TeiXeuhC4XrCyjyftDgdSYBJc5pz/ACoTj4sccv12gEdzhnH82EZ+KnHA6jRFKOuqCMB5VXP4Bn9+X68xF6OhqAMhJWXP4xn9uB1RiMVkgYj1jyP+fR/bl+t0Rlsk7AereN/z6P78DY16iy25ejgmFW3+92uX32Hp2a5L0c4hZv8AHtcDRL1VDRps7MEa7N2xeX1sfToayPZ2oJF2+a/U/wD/xAAUEQEAAAAAAAAAAAAAAAAAAACg/9oACAECAQE/AAAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAoP/aAAgBAwEBPwAAH//Z';

  fs.writeFile(
    'public/avatar/' + uuidHandler + '.jpg',
    base64Image,
    { encoding: 'base64' },
    (error) => {
      if (error) {
        res.status(500).json({ ok: false });
        return;
      }
    }
  );

  res.status(200).json({ id: uuidHandler });
});

app.post('/uploadavatar', (req, res) => {
  let base64Image = req.body.base64.split(';base64,').pop();

  fs.writeFile(
    'public/avatar/' + req.body.id + '.jpg',
    base64Image,
    { encoding: 'base64' },
    (error) => {
      if (error) {
        res.status(500).json({ ok: false });
        return;
      }
    }
  );

  res.status(200).json({ ok: true });
});

io.sockets.on('connection', (socket) => {
  socket.on('setup', (user) => {
    console.log(user);
    let id = user['id'];

    users[id] = {
      socketId: socket.id,
    };

    if (messagesToSend[id] !== undefined) {
      socket.emit('chat', messagesToSend[id]);

      delete messagesToSend[id];
    }
  });

  socket.on('chat', (chat) => {
    let from;

    if (users[chat.to]['socketId'] === socket.id) return;

    Object.keys(users).forEach((key) => {
      if (users[key]['socketId'] === socket.id) {
        from = key;
        return;
      }
    });

    if (users[chat.to]['socketId'] === null) {
      let id = chat.to;

      delete chat.to;

      messagesToSend[id] = {
        from,
        content: chat.content,
      };

      return;
    }
    console.log({
      from,
      content: chat.content,
    });

    io.to(users[chat.to]['socketId']).emit('chat', {
      from,
      content: chat.content,
    });
  });

  socket.on('disconnect', () => {
    Object.keys(users).forEach((key) => {
      if (users[key]['socketId'] === socket.id) {
        users[key]['socketId'] = null;
      }
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log('Funcionou');
});
