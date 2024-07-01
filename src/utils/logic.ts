import { getNewTokenDetail } from "./axiosRequest";
import EventSource from 'eventsource';

export const SSE_Capcha = () => {
    const accounts = [
        process.env.FEE_ADDRESS!,
        process.env.FACTORY_ADDRESS!        
    ]
    const eventSourceUrl = `https://tonapi.io/v2/sse/accounts/traces?accounts=${accounts.join(',')}`

    const eventSource = new EventSource(eventSourceUrl);

    eventSource.addEventListener('heartbeat', (event: MessageEvent) => {

    })
    eventSource.addEventListener('message', (event: MessageEvent) => {
        const res = JSON.parse(event.data);
        console.log(res);

        getNewTokenDetail(res.hash);
    })
}