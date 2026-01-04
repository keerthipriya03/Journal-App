const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json()); // ✅ parse incoming JSON
app.use(express.urlencoded({ extended: true })); // ✅ parse incoming URL-encoded(form) data

const connection = mysql.createConnection({
    host: 'localhost', //db host
    user: 'root', //db username
    password: 'Priyareddy@22', //db password
    database: 'myPost' //db name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.get('/', (req, res) => {
    // console.log(req);
    res.status(200).json({message:'Success'});
});

app.post('/register', async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        // Here, you would typically store the email and hashedPassword in your database
        // console.log(`Registered user: `,{
        //     email, hashedPassword}
        // );
        console.log("Hashed Password: ", hashedPassword)
        connection.query(`insert into Users(EmailID,HashedPassword) values('${email}','${hashedPassword}')`, (err, results) => {
            if (err) {
                res.status(500).send('Error registering user in database');
            }
            res.status(200).send('User registered successfully in database');
        });
        // res.status(200).send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
    }
    // res.status(200).json({message:'User Registered'});
});

app.post('/login', async (req, res) => {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;
    // Here, you would typically retrieve the hashed password from your database
    // let dummyHashedPassword= '$2b$10$T2tm53jJnaMzZbC/RVhiv.QyO1/SXPdnfoGfdEh7drEA1oTWnJ2HK'; // bcrypt hash for 'password'
    let hashedPassword = "";
    let userID = "";
    connection.query(`select ID,HashedPassword from Users where EmailID='${email}'`, async (err, result) => {
        if (err) {
            res.status(500);
            return
        }
        // console.log(result);
        hashedPassword = result[0].HashedPassword;
        console.log(hashedPassword)
        userID = result[0].ID;
        let response = await bcrypt.compare(password, hashedPassword);
        // console.log(`Is login successful: ${response}`);
        if (response) {
            res.status(200).json({userID: userID});
            return
        } else {
            res.status(500)
            return
        }
    })  
})


app.post('/createpost', (req, res) => {
    const { postTitle, postDescription, userID } = req.body;

    const query = `INSERT INTO Posts (UserID, postTitle, postDescription) VALUES (?, ?, ?)`;

    connection.query(query, [userID, postTitle, postDescription], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error saving post");
        }
        res.status(200).send("Post created successfully");
    });
});



app.get('/getMyPosts', (req, res) => {
    const userID = req.query.userID;

    const query = `SELECT * FROM Posts WHERE UserID = ?`;

    connection.query(query, [userID], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching posts");
        }
        res.status(200).json(result);
    });
});

app.get('/getPostById', (req, res) => {
    const postID = req.query.postID;

    const query = `SELECT * FROM Posts WHERE ID = ?`;

    connection.query(query, [postID], (err, result) => {
        if (err) return res.status(500).send("Error fetching post");
        res.status(200).json(result[0]);
    });
});

app.delete('/deletePost', (req, res) => {
    const { postID, userID } = req.body;

    const query = `DELETE FROM Posts WHERE ID = ? AND UserID = ?`;
    connection.query(query, [postID, userID], (err) => {
        if (err) return res.status(500).send("Error deleting post");
        res.status(200).send("Post deleted");
    });
});

app.put('/editPost', (req, res) => {
    const { postID, postTitle, postDescription, userID } = req.body;

    const query = `
        UPDATE Posts 
        SET postTitle = ?, postDescription = ?
        WHERE ID = ? AND UserID = ?
    `;

    connection.query(query, [postTitle, postDescription, postID, userID], (err) => {
        if (err) return res.status(500).send("Error updating post");
        res.status(200).send("Post updated successfully");
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});