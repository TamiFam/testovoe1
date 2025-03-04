const express = require('express');
const mongodb = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = 3001;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
}));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test.trd6k.mongodb.net/?retryWrites=true&w=majority&appName=test`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("test");
        const Requests = database.collection("requests");

        // Создать обращение
        app.post('/requests', async (req, res) => {
            const request = req.body;
            const result = await Requests.insertOne(request);
            res.send(result);
        });

        // Взять обращение в работу
        app.patch('/requests/:id/take', async (req, res) => {
            const id = req.params.id;
            const result = await Requests.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'В работе' } }
            );
            res.send(result);
        });

        // Завершить обработку обращения
        app.patch('/requests/:id/complete', async (req, res) => {
            const id = req.params.id;
            const { solution } = req.body;
            const result = await Requests.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'Завершено',solution } }
            );
            res.send(result);
        });

        // Отмена обращения
        app.patch('/requests/:id/cancel', async (req, res) => {
            const id = req.params.id;
            const { solution } = req.body;
            const result = await Requests.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'Отменено',solution } }
            );
            res.send(result);
        });

        // Получить список обращений с фильтрацией
        app.get('/requests', async (req, res) => {
            const { startDate, endDate } = req.query; // Параметры для фильтрации по диапазону дат
          
            let query = {};
          
            // Фильтр по диапазону дат
            if (startDate && endDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0); // Начало дня для startDate
          
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // Конец дня для endDate
          
              query.createdAt = {
                $gte: start.toISOString(), 
                $lte: end.toISOString(),   
              };
            } else if (startDate) {
              // Если указана только startDate, фильтруем от startDate до текущей даты
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
          
              query.createdAt = {
                $gte: start.toISOString(),
              };
            } else if (endDate) {
              // Если указана только endDate, фильтруем до endDate
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
          
              query.createdAt = {
                $lte: end.toISOString(),
              };
            }
          
            try {
              const requests = await Requests.find(query).toArray();
              res.send(requests);
            } catch (error) {
              console.error('Ошибка при получении обращений:', error);
              res.status(500).send('Ошибка при получении обращений');
            }
          });
        // Отмена всех обращений в статусе "В работе"
        app.patch('/requests/cancel-all-in-progress', async (req, res) => {
            const result = await Requests.updateMany(
                { status: 'В работе' },
                { $set: { status: 'Отменено' } }
            );
            res.send(result);
        });

        app.get('/', (req, res) => {
            res.send('Welcome');
        });

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });

    } finally {
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
}

run().catch(console.dir);