import kafka from "../config/kafka.config";


const producer = kafka.producer()

export async function connectKafkaProducer(){
     await producer.connect()



    console.log("producer connected sucessfully")
}

export async function sendMessageToKafka(topic:string,message:unknown){
    await producer.send({
        topic,
        messages:[
            {
                value:JSON.stringify(message)
            }
        ]
    })

}


// send the robot telementary data 

export async function getRotStatus(data:any){
   await sendMessageToKafka("statusData",data)
   console.log("dummy data is sent to the getRObotStatus")
}