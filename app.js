const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const {sqlconnect} = require('./modules/sql')
const {checkPassword} = require('./modules/check-password');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash'); 
const varMiddleware = require('./middleware/variables');
const auth = require('./middleware/auth');
const fs = require('fs');
const multer  = require('multer');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(flash());

const sessions_options = {
    host: "localhost",
    user: "root",
    database: "sessions",
    password: ""
};


const sessionStore = new MySQLStore(sessions_options);

//подключаем сессию
app.use(
    session({
        secret: 'fdFNK234F&^ef==wefdfh',
        store: sessionStore,
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false
    })
)
app.use(varMiddleware);

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('index');
});


app.get('/support', (req, res) => {
    res.render('support');
});


app.get('/contacts', (req, res) => {
    res.render('contacts');
});


app.get('/profile', auth, async (req, res) => {
    try {
        const connection = sqlconnect();
        const email = req.session.email;

        const query = 'SELECT * FROM users WHERE `users`.`email` =?';
        connection.query(query, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Внутренняя ошибка сервера');
            }
            if (result.length > 0) {
                const { name, last_name, city, trash_count, balance, avatar } = result[0];
                const data = {
                    username: name,
                    last_name: last_name,
                    email: email,
                    city: city,
                    trash_count: trash_count,
                    balance: balance,
                    avatar: avatar
                  };
                return res.render('profile', {
                    data
                });
            }
            return res.status(404).send('Пользователь не найден');
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});


app.get('/registration', async (req, res) => {
    res.render('auntefication/registration', {
        error: req.flash('error'),
        error_link: req.flash('error_link')
    });
});


app.post('/registration', async (req, res) => {
    try {
        let error_code = 0;
        const {email, name, last_name, city, pass, repass} = req.body;
        error_code = checkPassword(pass, repass, error_code);

        if(!city) {
            req.flash('error', 'Вы не выбрали город!');
            return res.redirect('/registration');
        }

        if (error_code != 0) {
            switch (error_code) {
                case 1:
                    req.flash('error', 'Пароль должен содержать только латинские символы, хотя бы одну заглавную букву, 2 цифры и хотя бы один специальный символ!');
                    res.redirect('/registration');
                    break;
                case 2:
                    req.flash('error', 'Пароли не совпадают');
                    res.redirect('/registration');
                    break;
            }
        } else {
            const hashPassword = await bcrypt.hash(pass, 10);
            let query = 'SELECT EXISTS(SELECT email FROM users WHERE email =?) AS emailExists';
            const connection = sqlconnect();
        
            connection.query(query, [email], (err, result) => {
                
                if (result[0].emailExists === 1) {
                    req.flash('error', 'Пользователь с таким email уже зарегистрирован!');
                    req.flash('error_link', 'Авторизоваться.');
                    res.redirect('/registration');
                } else {
                    let insert = 'INSERT INTO users (email, name, last_name, city, password) VALUES (?,?,?,?,?)';
                    connection.query(insert, [email, name, last_name, city, hashPassword]);
                    req.session.email = email;
                    req.session.name = name;
                    req.session.last_name = last_name;
                    res.redirect('/auth');;
                }
            });
        }
    } catch (e) {
        console.log(e);
    }   
});


app.get('/auth', (req, res) => {
    res.render('auntefication/auth', {
        error: req.flash('error'),
        error_link: req.flash('error_link')
    });
});


app.post('/auth', async (req, res) => {
    const {email, pass} = req.body;
    

    let query = 'SELECT EXISTS(SELECT email FROM users WHERE email =?) AS emailExists';
    const connection = sqlconnect();

    connection.query(query, [email], async (err, result) => {
        if (result[0].emailExists === 1) {
            const passCheck = `SELECT password FROM users WHERE email =?;`

            let passChecked = null;
            try {
                const passResult = await new Promise((resolve, reject) => {
                    connection.query(passCheck, [email], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
                passChecked = passResult[0].password;
                bcrypt.compare(pass, passChecked, (err, result) => {
                    if (err) {
                        // Обработка ошибки
                        console.error(err);
                        req.flash('error', 'Произошла ошибка при сравнении паролей');
                        res.redirect('/auth');
                    } else {
                        if (result) {
                            // Если пароли совпадают, устанавливаем сессию и перенаправляем на страницу профиля
                            req.session.isAuthenticated = true;
                            req.session.email = email;
                            req.session.save(err => {
                                if (err) {
                                    console.error(err);
                                }
                                res.redirect('/profile');
                            });
                        } else {
                            // Если пароли не совпадают, выводим ошибку и перенаправляем на страницу авторизации
                            req.flash('error', 'Вы ввели неверный пароль! Забыли пароль?');
                            res.redirect('/auth');
                        }
                    }
                });
            } catch (err) {
                console.error(err);
                req.flash('error', 'Произошла ошибка при выполнении запроса');
                res.redirect('/auth');
            }
        } else {
            // Если email не существует, выводим ошибку и перенаправляем на страницу авторизации
            req.flash('error', `Пользователя с таким email не существует!`);
            req.flash('error_link', `Зарегистрироваться.`);
            res.redirect('/auth');
        }
    });
});


app.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth')
    })
})


app.get('/words', (req, res) => {
    fs.readFile('txt-cities-russia.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            res.status(500).send('Ошибка чтения файла');
        } else {
            const words = data.split(/\s+/);
            res.json({ words });
        }
    });
});


app.get('/sort_waste', (req, res) => {
    try {
        const connection = sqlconnect();
        const email = req.session.email;

        const query = 'SELECT balance FROM users WHERE `users`.`email` =?';
        connection.query(query, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Внутренняя ошибка сервера');
            }
            if (result.length > 0) {
                const { balance } = result[0];
                return res.render('sort_waste', {
                    balance: balance
                });
            }
            return res.status(404).send('Пользователь не найден');
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Внутренняя ошибка сервера');
    }

});


app.get('/header', auth, (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated
    });
});


app.post('/sort_waste_submit', (req, res) => {
    try {
        const {sum_value, trash_weight } = req.body;
        const connection = sqlconnect();
        const email = req.session.email;
        let query = 'SELECT `balance`, `trash_count` FROM users WHERE `users`.`email` =?'
        connection.query(query, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Внутренняя ошибка сервера');
            }
            const { balance, trash_count} = result[0];
            
            let trash_weight_sum = trash_count + parseInt(trash_weight);
            let sum = parseInt(balance) + parseInt(sum_value);
            query = 'UPDATE users SET balance =?, trash_count =? WHERE email =?';
            connection.query(query, [sum, trash_weight_sum, email], (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    return res.redirect('/sort_waste');
                }
            })
        })
    } catch {

    }
});

const uploadDir = path.join(__dirname, 'public/images/uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        //Функция для создания рандомной строки
        function generateRandomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; // Латинские буквы
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        //Создаем рандомную строку для создания названия изображения
        const randomString = generateRandomString(6);
        cb(null, randomString + '-' + Date.now() + path.extname(file.originalname));
    }
});
  
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const mimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/tiff', 'image/webp'];
        if (mimetypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только файлы с расширениями jpeg, jpg, png, gif, bmp, tiff, webp'));
        }
    },
    limits: {
        // Ограничить размер файла до 5MB
        fileSize: 5 * 1024 * 1024
    }
});


app.post('/avatar', (req, res) => {
    const connection = sqlconnect();
    const email = req.session.email;
    let query = 'SELECT `avatar` FROM users WHERE `users`.`email` =?';

    connection.query(query, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Внутренняя ошибка сервера');
        }
    
        const avatar = result[0].avatar;

        return res.json({ avatar: avatar });
    });
  });

  
// Обрабатываем POST запрос для загрузки аватара
app.post('/upload', upload.single('avatar'), function (req, res, next) {
    const email = req.session.email;
    const filePath = req.file.path;
    const relativePath = path.relative(__dirname, filePath);
    const connection = sqlconnect();
    let query = "UPDATE users SET avatar =? WHERE email =?";

    connection.query(query, [relativePath, email], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            return res.redirect('/profile');
        }
    })
});



const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})