const pg = require('pg');
const express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/films/',express.static(__dirname + '/public'));
app.use('/films/:option/',express.static(__dirname + '/public'));
app.use('/film/',express.static(__dirname + '/public'));
app.use('/user/:do',express.static(__dirname + '/public'));
app.use(cookieParser());

function compare(A, B) {
    return A.review_id - B.review_id;
}

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const config = {
    user: 'postgres',
    database: 'Kinopoiskovik',
    password: '5380018111g',
    port: 5432
};

app.get('/', function (req, res) {
    var obj ={
        login: req.cookies.login
    };
    res.render('main', {obj: obj});
});

app.get('/user/:do', function (req, res) {
    var obj ={
        do: req.params.do,
        text: '',
        email: req.cookies.email,
        login: req.cookies.login
    };
    // console.log(obj);
    if ((obj.do == 'sign') || (obj.do == 'sign_err')){
        obj.text = 'Зарегистрироваться';
    }
    else if((obj.do == 'login') || (obj.do == 'login_err')){
        obj.text = 'Войти';
    }
    else if((obj.do == 'edit') || (obj.do == 'edit_err')){
        obj.text = 'Сохранить изменения';
    }
    res.render('form', {obj: obj});
});

const pool = new pg.Pool(config);
app.get('/films', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }
        client.query('select count(product_id) from product', function (err, result) {
            var count = result.rows[0].count;
            client.query('select * from product', function (err, result) {
                var product = result.rows;
                client.query('select * from producer', function (err, result) {
                    var producer = result.rows;
                    client.query('select * from country', function (err, result) {
                        var country = result.rows;
                        client.query('select * from category', function (err, result) {
                            var category = result.rows;
                            client.query('select * from product_producer', function (err, result) {
                                var product_producer = result.rows;
                                client.query('select * from product_country', function (err, result) {
                                    var product_country = result.rows;
                                    client.query('select * from product_category', function (err, result) {
                                        var product_category = result.rows;

                                        var films = [];

                                        for (var k=0;k<count;k++) {

                                            var obj = {
                                                id: product[k].product_id,
                                                product_id: product[k].product_id,
                                                name: product[k].name,
                                                year: product[k].year,
                                                country: '',
                                                producer: '',
                                                filmscript: '',
                                                operator: '',
                                                composer: '',
                                                painter: '',
                                                installation: '',
                                                genre: '',
                                                url_poster: product[k].url_poster,
                                                time: product[k].time,
                                                url_treiler: product[k].url_treiler,
                                                in_role: '',
                                            };

                                            product_country.forEach(function (item, i, product_country) {
                                                if (product_country[i].product_id == k+1) {
                                                    country.forEach(function (item, j, country) {
                                                        if (product_country[i].country_id == country[j].country_id) {
                                                            obj.country = obj.country + country[j].name.trim() + ', ';
                                                        }
                                                    });
                                                }
                                            });
                                            obj.country = obj.country.slice(0,-2);

                                            product_producer.forEach(function (item, i, product_producer) {
                                                if (product_producer[i].product_id == k+1) {
                                                    producer.forEach(function (item, j, producer) {
                                                        if (product_producer[i].producer_id == producer[j].producer_id) {
                                                            obj.producer = obj.producer + producer[j].name.trim() + ', ';
                                                        }
                                                    });
                                                }
                                            });
                                            obj.producer = obj.producer.slice(0,-2);

                                            product_category.forEach(function (item, i, product_category) {
                                                if (product_category[i].product_id == k+1) {
                                                    category.forEach(function (item, j, category) {
                                                        if (product_category[i].category_id == category[j].category_id) {
                                                            obj.genre = obj.genre + category[j].name.trim() + ', ';
                                                        }
                                                    });
                                                }
                                            });
                                            obj.genre = obj.genre.slice(0,-2);

                                            films[k]=obj;
                                        }
                                        done();
                                        res.render('films', {obj: films, login:req.cookies.login});
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/films/:option/:name', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }

        var sql = 'select '+ req.params.option + '_id from ' + req.params.option +' where ' + req.params.option + '.name = $1';
        client.query(sql, [req.params.name], function (err, result) {
            sql = req.params.option + '_id';
            // console.log(req.params.option);
            // console.log(req.params.name.trim());
            // console.log(result.rows);
            // console.log(result.rows[0][sql]);
            var category_id = result.rows[0][sql];
            sql = 'select product_id from product_' + req.params.option +' where product_' + req.params.option + '.' + req.params.option + '_id = $1';
            client.query(sql,[category_id], function (err, result) {
                var count = [];
                for(iter = 0; iter < result.rows.length; iter++){
                    count[iter] = result.rows[iter].product_id;
                }
                client.query('select * from product', function (err, result) {
                    var product = result.rows;
                    client.query('select * from producer', function (err, result) {
                        var producer = result.rows;
                        client.query('select * from country', function (err, result) {
                            var country = result.rows;
                            client.query('select * from category', function (err, result) {
                                var category = result.rows;
                                client.query('select * from product_producer', function (err, result) {
                                    var product_producer = result.rows;
                                    client.query('select * from product_country', function (err, result) {
                                        var product_country = result.rows;
                                        client.query('select * from product_category', function (err, result) {
                                            var product_category = result.rows;

                                            var films = [];
                                            count.forEach(function (item, iter, count) {

                                                var obj = {
                                                    id: iter + 1,
                                                    product_id: count[iter],
                                                    name: product[count[iter] - 1].name,
                                                    year: product[count[iter] - 1].year,
                                                    country: '',
                                                    producer: '',
                                                    filmscript: '',
                                                    operator: '',
                                                    composer: '',
                                                    painter: '',
                                                    installation: '',
                                                    genre: '',
                                                    url_poster: product[count[iter] - 1].url_poster,
                                                    time: product[count[iter] - 1].time,
                                                    url_treiler: product[count[iter] - 1].url_treiler,
                                                    in_role: '',
                                                };

                                                product_country.forEach(function (item, i, product_country) {
                                                    if (product_country[i].product_id == count[iter]) {
                                                        country.forEach(function (item, j, country) {
                                                            if (product_country[i].country_id == country[j].country_id) {
                                                                obj.country = obj.country + country[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.country = obj.country.slice(0, -2);

                                                product_producer.forEach(function (item, i, product_producer) {
                                                    if (product_producer[i].product_id == count[iter]) {
                                                        producer.forEach(function (item, j, producer) {
                                                            if (product_producer[i].producer_id == producer[j].producer_id) {
                                                                obj.producer = obj.producer + producer[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.producer = obj.producer.slice(0, -2);

                                                product_category.forEach(function (item, i, product_category) {
                                                    if (product_category[i].product_id == count[iter]) {
                                                        category.forEach(function (item, j, category) {
                                                            if (product_category[i].category_id == category[j].category_id) {
                                                                obj.genre = obj.genre + category[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.genre = obj.genre.slice(0, -2);

                                                films[iter] = obj;
                                            });
                                            done();
                                            res.render('films', {obj: films, login: req.cookies.login});
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/film/:id', (req, res ) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }
        client.query('SELECT * FROM product WHERE product.product_id = $1',[req.params.id], function (err, result) {
            var product = result.rows[0];
            client.query('select name\n' +
                'from actor,\n' +
                '(select actor_id\n' +
                'from product_actor\n' +
                'where product_actor.product_id = $1) t\n' +
                'where actor.actor_id = t.actor_id', [req.params.id], function (err, result) {
                var actor = result.rows;
                client.query('select name\n' +
                    'from category,\n' +
                    '(select category_id\n' +
                    'from product_category\n' +
                    'where product_category.product_id = $1) t\n' +
                    'where category.category_id = t.category_id', [req.params.id], function (err, result) {
                    var category = result.rows;
                    client.query('select name\n' +
                        'from composer,\n' +
                        '(select composer_id\n' +
                        'from product_composer\n' +
                        'where product_composer.product_id = $1) t\n' +
                        'where composer.composer_id = t.composer_id', [req.params.id], function (err, result) {
                        var composer = result.rows;
                        client.query('select name\n' +
                            'from country,\n' +
                            '(select country_id\n' +
                            'from product_country\n' +
                            'where product_country.product_id = $1) t\n' +
                            'where country.country_id = t.country_id', [req.params.id], function (err, result) {
                            var country = result.rows;
                            client.query('select name\n' +
                                'from filmscript,\n' +
                                '(select filmscript_id\n' +
                                'from product_filmscript\n' +
                                'where product_filmscript.product_id = $1) t\n' +
                                'where filmscript.filmscript_id = t.filmscript_id', [req.params.id], function (err, result) {
                                var filmscript = result.rows;
                                client.query('select name\n' +
                                    'from installation,\n' +
                                    '(select installation_id\n' +
                                    'from product_installation\n' +
                                    'where product_installation.product_id = $1) t\n' +
                                    'where installation.installation_id = t.installation_id', [req.params.id], function (err, result) {
                                    var installation = result.rows;
                                    client.query('select name\n' +
                                        'from operator,\n' +
                                        '(select operator_id\n' +
                                        'from product_operator\n' +
                                        'where product_operator.product_id = $1) t\n' +
                                        'where operator.operator_id = t.operator_id', [req.params.id], function (err, result) {
                                        var operator = result.rows;
                                        client.query('select name\n' +
                                            'from painter,\n' +
                                            '(select painter_id\n' +
                                            'from product_painter\n' +
                                            'where product_painter.product_id = $1) t\n' +
                                            'where painter.painter_id = t.painter_id', [req.params.id], function (err, result) {
                                            var painter = result.rows;
                                            client.query('select name\n' +
                                                'from producer,\n' +
                                                '(select producer_id\n' +
                                                'from product_producer\n' +
                                                'where product_producer.product_id = $1) t\n' +
                                                'where producer.producer_id = t.producer_id', [req.params.id], function (err, result) {
                                                var producer = result.rows;
                                                var obj = {
                                                    id: req.params.id,
                                                    name: product.name,
                                                    year: product.year,
                                                    country: '',
                                                    producer: '',
                                                    filmscript: '',
                                                    operator: '',
                                                    composer: '',
                                                    painter: '',
                                                    installation: '',
                                                    genre: '',
                                                    url_poster: product.url_poster,
                                                    time: product.time,
                                                    url_treiler: product.url_treiler,
                                                    in_role: '',
                                                    login: req.cookies.login,
                                                    favorite: 0,
                                                    reviews: []
                                                };

                                                obj.producer = producer.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.producer = obj.producer.slice(0,-2);

                                                obj.country = country.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.country = obj.country.slice(0,-2);

                                                obj.filmscript = filmscript.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.filmscript = obj.filmscript.slice(0,-2);

                                                obj.operator = operator.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.operator = obj.operator.slice(0,-2);

                                                obj.composer = composer.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.composer = obj.composer.slice(0,-2);

                                                obj.painter = painter.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.painter= obj.painter.slice(0,-2);

                                                obj.installation = installation.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.installation= obj.installation.slice(0,-2);

                                                obj.genre = category.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.genre= obj.genre.slice(0,-2);

                                                obj.in_role = actor.reduce(function(sum, current) {
                                                    return sum + current.name.trim() + ', ';
                                                }, '');
                                                obj.in_role= obj.in_role.slice(0,-2);
                                                client.query('select product_id from favorite_product,(select client_id from client where client.login = $1) t where favorite_product.product_id = $2 and favorite_product.client_id = t.client_id', [req.cookies.login,req.params.id], function (err, result) {
                                                    if(result.rows.length != 0){
                                                        obj.favorite = 1;
                                                    }
                                                    client.query('select * from reviews where reviews.product_id = $1', [req.params.id], function (err, result) {
                                                        obj.reviews = result.rows.sort(compare);
                                                        done();
                                                        res.render('film', {obj: obj});
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/favorite_films', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }
        client.query('select client_id from client where client.login =$1', [req.cookies.login], function (err, result) {
            client_id = result.rows[0].client_id;
            client.query('select product_id from favorite_product where client_id = $1' ,[client_id], function (err, result) {
                var count = [];
                for(iter = 0; iter < result.rows.length; iter++){
                    count[iter] = result.rows[iter].product_id;
                }
                client.query('select * from product', function (err, result) {
                    var product = result.rows;
                    client.query('select * from producer', function (err, result) {
                        var producer = result.rows;
                        client.query('select * from country', function (err, result) {
                            var country = result.rows;
                            client.query('select * from category', function (err, result) {
                                var category = result.rows;
                                client.query('select * from product_producer', function (err, result) {
                                    var product_producer = result.rows;
                                    client.query('select * from product_country', function (err, result) {
                                        var product_country = result.rows;
                                        client.query('select * from product_category', function (err, result) {
                                            var product_category = result.rows;

                                            var films = [];
                                            count.forEach(function (item, iter, count) {

                                                var obj = {
                                                    id: iter + 1,
                                                    product_id: count[iter],
                                                    name: product[count[iter] - 1].name,
                                                    year: product[count[iter] - 1].year,
                                                    country: '',
                                                    producer: '',
                                                    filmscript: '',
                                                    operator: '',
                                                    composer: '',
                                                    painter: '',
                                                    installation: '',
                                                    genre: '',
                                                    url_poster: product[count[iter] - 1].url_poster,
                                                    time: product[count[iter] - 1].time,
                                                    url_treiler: product[count[iter] - 1].url_treiler,
                                                    in_role: '',
                                                };

                                                product_country.forEach(function (item, i, product_country) {
                                                    if (product_country[i].product_id == count[iter]) {
                                                        country.forEach(function (item, j, country) {
                                                            if (product_country[i].country_id == country[j].country_id) {
                                                                obj.country = obj.country + country[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.country = obj.country.slice(0, -2);

                                                product_producer.forEach(function (item, i, product_producer) {
                                                    if (product_producer[i].product_id == count[iter]) {
                                                        producer.forEach(function (item, j, producer) {
                                                            if (product_producer[i].producer_id == producer[j].producer_id) {
                                                                obj.producer = obj.producer + producer[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.producer = obj.producer.slice(0, -2);

                                                product_category.forEach(function (item, i, product_category) {
                                                    if (product_category[i].product_id == count[iter]) {
                                                        category.forEach(function (item, j, category) {
                                                            if (product_category[i].category_id == category[j].category_id) {
                                                                obj.genre = obj.genre + category[j].name.trim() + ', ';
                                                            }
                                                        });
                                                    }
                                                });
                                                obj.genre = obj.genre.slice(0, -2);

                                                films[iter] = obj;
                                            });
                                            done();
                                            res.render('films', {obj: films, login:req.cookies.login});
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.post('/user/:do', urlencodedParser, function (req, res) {
    if (req.params.do == 'logout'){
        res.clearCookie('login');
        res.clearCookie('email');
        res.redirect('/');
    }
    else if ((req.params.do == 'sign') || (req.params.do == 'sign_err')){
        if ((req.body.login != '') && (req.body.email != '') && (req.body.password != '') && (req.body.login.length < 21)) {
            pool.connect(function (err, client, done) {
                client.query('select client_id from client where client.login = $1 or client.email = $2', [req.body.login,req.body.email], function (err, result) {
                    if (result.rows.length == 0) {
                        client.query('insert into client(password,email,login) values($1,$2,$3);', [req.body.password,req.body.email,req.body.login], function (err, result) {
                            res.cookie('login', req.body.login, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                            res.cookie('email', req.body.email, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                            done();
                            res.redirect('/');
                        });
                    }
                    else {
                        done();
                        res.redirect('/user/sign_err');
                    }
                });
            });
        }
        else {
            res.redirect('/user/sign_err');
        }
    }
    else if ((req.params.do == 'login') || (req.params.do == 'login_err')) {
        pool.connect(function (err, client, done) {
            client.query('select * from client where client.email = $1', [req.body.email], function (err, result) {
                if (result.rows.length != 0) {
                    if (req.body.password == result.rows[0].password) {
                        res.cookie('login', result.rows[0].login, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                        res.cookie('email', req.body.email, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                        res.redirect('/');
                    }
                    else {
                        done();
                        res.redirect('/user/login_err');
                    }
                }
                else {
                    done();
                    res.redirect('/user/login_err');
                }
            });
        });
    }
    else if ((req.params.do == 'edit') || (req.params.do == 'edit_err')) {
        pool.connect(function (err, client, done) {
            client.query('select client_id from client where client.login = $1 or client.email = $2', [req.body.login,req.body.email], function (err, result) {
                if ((result.rows.length == 0) && (req.body.login.length < 21)) {
                    client.query('select * from client where client.email = $1', [req.cookies.email], function (err, result) {
                        var user_id = result.rows[0].client_id;
                        var login, email, password;
                        if (req.body.login != ''){
                            login = req.body.login;
                        }
                        else {
                            login = result.rows[0].login;
                        }

                        if (req.body.email != ''){
                            email = req.body.email;
                        }
                        else {
                            email = result.rows[0].email;
                        }

                        if (req.body.password != ''){
                            password = req.body.password;
                        }
                        else{
                            password = result.rows[0].password;
                        }
                        client.query('update reviews set login =$1 where reviews.login = $2', [login,req.cookies.login], function (err, result) {
                            client.query('update client set login =$1 where client.client_id = $2', [login, user_id], function (err, result) {
                                res.cookie('login', login, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                                client.query('update client set email =$1 where client.client_id = $2', [email, user_id], function (err, result) {
                                    res.cookie('email', email, {expires: new Date(Date.now() + 3000000), httpOnly: true});
                                    client.query('update client set password =$1 where client.client_id = $2', [password, user_id], function (err, result) {
                                        done();
                                        res.redirect('/');
                                    });
                                });
                            });
                        });
                    });
                }
                else{
                    done();
                    res.redirect('/user/edit_err');
                }
            });
        });
    }
    if (req.params.do == 'delete'){
        pool.connect(function (err, client, done) {
            client.query('delete from client * where client.login = $1;', [req.cookies.login], function (err, result) {
                res.clearCookie('login');
                res.clearCookie('email');
                done();
                res.redirect('/');
            });
        });
    }
});

app.post('/favorite/:favorite/:id', urlencodedParser, function (req, res) {
    pool.connect(function (err, client, done) {
        client.query('select client_id from client where client.login = $1;', [req.cookies.login], function (err, result) {
            var client_id = result.rows[0].client_id;
            if (req.params.favorite == 0) {
                client.query('insert into favorite_product(client_id,product_id) values($1,$2);', [client_id, req.params.id], function (err, result) {
                    done();
                    res.redirect('/film/' + req.params.id);
                });
            }
            else if (req.params.favorite == 1) {
                client.query('delete from favorite_product where client_id = $1 and product_id = $2;', [client_id,req.params.id], function (err, result) {
                    done();
                    res.redirect('/film/' + req.params.id);
                });
            }
        });
    });
});

app.post('/film/:id/review', urlencodedParser, function (req, res) {
    pool.connect(function (err, client, done) {
        client.query('insert into reviews(product_id,login,review) values($1,$2,$3);', [req.params.id,req.cookies.login,req.body.review], function (err, result) {
            done();
            res.redirect('/film/' + req.params.id);
        });
    });
});

app.listen(app.get( 'port' ), function () {
    console.log('Server is running.. on Port 3000');
});
