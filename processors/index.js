const Queue = require('bull')
const path = require('path')
const { REDIS_PORT, REDIS_URI } = require('../config/RedisCredentials')

const billQueue = new Queue('billQueue',{
    redis:{
        port:REDIS_PORT,
        host:REDIS_URI,
    }
})

billQueue.process(path.join(__dirname,"billQueueProcessor.js"))
billQueue.on("completed",(job)=>{
    console.log(`complete #${job.id} jobs`);
})