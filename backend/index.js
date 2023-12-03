require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { Op } = require('sequelize')
const sequelize = require('./src/db.js');
const axios = require('axios')
const Price = require('./src/models/price.js')
const dayjs = require('dayjs');
const jsonPrice = require('./updatedPrice.json')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


app.get('/', async(req, res) => {
    const btcPrice = await Price.findAll({
        order: [
            ['id', 'ASC']
        ]
    })
    res.status(200).json(btcPrice)
});

app.get('/:period', async (req, res) => {
    const { period } = req.params
    let startDate;
    let endDate;
    switch (period) {
        case 'day':
            startDate = new Date()
            startDate.setDate(startDate.getDate() - 1)
            endDate = new Date();
            break;
        case 'week':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
            break;
        case 'month':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            endDate = new Date();
            break;
        case 'year':
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDate = new Date();
            break;
        case 'hour':
            startDate = new Date();
            startDate.setHours(startDate.getHours() - 1);
            endDate = new Date();
            break;
        case 'custom':
            const { startDate: customStartDate, endDate: customEndDate, startHour, endHour } = req.query;
            if (customStartDate && customEndDate) {
                startDate = dayjs(customStartDate);
                endDate = dayjs(customEndDate);
                if (startHour && endHour) {
                    const [startHourPart, startMinutePart] = startHour.split(':');
                    const [endHourPart, endMinutePart] = endHour.split(':');
                    startDate = startDate.set('hour', parseInt(startHourPart)).set('minute', parseInt(startMinutePart));
                    endDate = endDate.set('hour', parseInt(endHourPart)).set('minute', parseInt(endMinutePart));
                } else {
                    startDate = startDate.set('hour', 0).set('minute', 0);
                    endDate = endDate.set('hour', 23).set('minute', 59);
                }
            } else {
                startDate = dayjs();
                endDate = dayjs();
            }
            break;
            
        default:
            startDate = req.query.startDate ? new Date(req.query.startDate) : new Date()
            break;
    }
    try {
        const btcData = await Price.findAll({
            where: {
                updated: {
                    [Op.gte]: startDate.toISOString(),
                    [Op.lt]: endDate.toISOString(),
                }
            },
            order: [['updated', 'ASC']],
        })
        res.json(btcData);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

async function fetchData() {
    try {
        const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
        const currencies = ['USD', 'GBP', 'EUR'];
        const promises = currencies.map(async(currency) => {
            const bitcoinData = response.data.bpi[currency];
            const newBitcoinPrice = {
                code: bitcoinData.code,
                rate: bitcoinData.rate,
                description: bitcoinData.description,
                rateFloat: bitcoinData.rate_float,
                updatedISO: response.data.time.updatedISO,
            };
            await Price.create(newBitcoinPrice);
        });
        await Promise.all(promises);
    } catch (error) {
        console.error('Ошибка сохранения данных в базу данных:', error.message);
    }
}


async function insertData() {
    try {
        await Price.bulkCreate(jsonPrice)
    } catch (e) {
        console.log(e)
    }
}

// setInterval(fetchData, 60000)
insertData()
    
async function startApp() {
    try {
        await sequelize.sync({ force: false })
            // await sequelize.drop()
        app.listen(PORT, () => console.log('server started on port ' + PORT))
    } catch (e) {
        console.log(e)
    }
};

startApp();