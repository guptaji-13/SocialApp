const mongoose = require('mongoose');
const config = require('config');
var db = `mongodb+srv://guptaji13:${config.get(
    'mongoPassword'
)}@socialapp.zl4fv.mongodb.net/<dbname>?retryWrites=true&w=majority`;

async function connectDB() {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.log(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;
